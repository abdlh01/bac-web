
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";

const Counter = () => {
  const { user } = useTelegramUser();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pointsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // التحقق من وجود جلسة نشطة عند تحميل الصفحة
  useEffect(() => {
    if (user?.id) {
      checkActiveSession();
    }
  }, [user?.id]);

  const checkActiveSession = async () => {
    if (!user?.id) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('User not found:', userError);
        return;
      }

      const { data: activeSession, error: sessionError } = await supabase
        .from('counter_sessions')
        .select('*')
        .eq('user_id', userData.id)
        .eq('is_active', true)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (sessionError) {
        console.log('No active session found');
        return;
      }

      if (activeSession) {
        console.log('Found active session:', activeSession);
        
        // حساب الوقت المنقضي منذ بداية الجلسة
        const startTime = new Date(activeSession.start_time).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        
        setSessionId(activeSession.id);
        setTime(elapsedSeconds);
        setIsRunning(true);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  useEffect(() => {
    if (isRunning) {
      // عداد الوقت - كل ثانية
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);

      // عداد النقاط - كل 5 ثوانٍ
      pointsIntervalRef.current = setInterval(() => {
        addPointsToUser();
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (pointsIntervalRef.current) {
        clearInterval(pointsIntervalRef.current);
        pointsIntervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (pointsIntervalRef.current) {
        clearInterval(pointsIntervalRef.current);
      }
    };
  }, [isRunning]);

  // التعامل مع مغادرة الصفحة فقط (وليس إخفاءها)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isRunning) {
        // حفظ وقت المغادرة في localStorage
        localStorage.setItem('counterExitTime', new Date().toISOString());
        localStorage.setItem('counterSessionId', sessionId || '');
        
        // إيقاف العداد بعد 5 دقائق (300 ثانية) من مغادرة الصفحة
        stopTimeoutRef.current = setTimeout(() => {
          handleStop();
        }, 300000);
      }
    };

    const handlePageShow = () => {
      // إلغاء التوقف التلقائي عند العودة للصفحة
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }

      // التحقق من الوقت المنقضي أثناء الغياب
      const exitTime = localStorage.getItem('counterExitTime');
      const savedSessionId = localStorage.getItem('counterSessionId');
      
      if (exitTime && savedSessionId && isRunning && sessionId === savedSessionId) {
        const exitTimestamp = new Date(exitTime).getTime();
        const returnTimestamp = new Date().getTime();
        const awayTime = Math.floor((returnTimestamp - exitTimestamp) / 1000);
        
        // إضافة الوقت المنقضي أثناء الغياب (حتى 5 دقائق كحد أقصى)
        const maxAwayTime = 300; // 5 دقائق
        const actualAwayTime = Math.min(awayTime, maxAwayTime);
        
        setTime(prevTime => prevTime + actualAwayTime);
        
        // تنظيف البيانات المحفوظة
        localStorage.removeItem('counterExitTime');
        localStorage.removeItem('counterSessionId');
        
        // إذا تجاوز الوقت 5 دقائق، أوقف العداد
        if (awayTime >= maxAwayTime) {
          handleStop();
        }
      }
    };

    // استخدام beforeunload للتعامل مع مغادرة الصفحة فقط
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
    };
  }, [isRunning, sessionId]);

  const addPointsToUser = async () => {
    if (!user?.id) return;

    try {
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('counter_points, total_points, study_hours')
        .eq('telegram_id', user.id)
        .single();

      if (userFetchError || !userData) {
        console.error('Error fetching user data:', userFetchError);
        return;
      }

      const newCounterPoints = (userData.counter_points || 0) + 1;
      const newTotalPoints = (userData.total_points || 0) + 1;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          counter_points: newCounterPoints,
          total_points: newTotalPoints
        })
        .eq('telegram_id', user.id);

      if (updateError) {
        console.error('Error updating user points:', updateError);
      }

    } catch (error) {
      console.error('Unexpected error adding points:', error);
    }
  };

  const handleStart = async () => {
    if (!user?.id) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('User not found:', userError);
        return;
      }

      const { data, error } = await supabase
        .from('counter_sessions')
        .insert({
          user_id: userData.id,
          start_time: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting session:', error);
        return;
      }

      setSessionId(data.id);
      setIsRunning(true);
    } catch (error) {
      console.error('Unexpected error starting session:', error);
    }
  };

  const handleStop = async () => {
    if (!sessionId || !user?.id) return;

    setIsRunning(false);

    try {
      const finalPoints = Math.floor(time / 5); // نقطة كل 5 ثوانٍ
      const hoursStudied = time / 3600;

      // تحديث الجلسة
      const { error: sessionError } = await supabase
        .from('counter_sessions')
        .update({
          end_time: new Date().toISOString(),
          duration: time,
          points_earned: finalPoints,
          is_active: false
        })
        .eq('id', sessionId);

      if (sessionError) {
        console.error('Error updating session:', sessionError);
      }

      // تحديث ساعات الدراسة
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('study_hours')
        .eq('telegram_id', user.id)
        .single();

      if (!userFetchError && userData) {
        const newStudyHours = (userData.study_hours || 0) + hoursStudied;

        const { error: updateError } = await supabase
          .from('users')
          .update({
            study_hours: newStudyHours
          })
          .eq('telegram_id', user.id);

        if (updateError) {
          console.error('Error updating study hours:', updateError);
        }
      }

    } catch (error) {
      console.error('Unexpected error stopping session:', error);
    } finally {
      setTime(0);
      setSessionId(null);
      // تنظيف البيانات المحفوظة
      localStorage.removeItem('counterExitTime');
      localStorage.removeItem('counterSessionId');
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPoints = () => Math.floor(time / 5);

  return (
    <div className="min-h-screen p-6 pt-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">عداد الدراسة</h1>
        <p className="text-white/80">اجمع نقطة واحدة كل 5 ثوانٍ</p>
      </div>

      <div className="glass rounded-3xl p-8 mb-8 flex flex-col items-center justify-center min-h-[200px]">
        <div className="text-6xl font-mono text-white mb-6 text-center">
          {formatTime(time)}
        </div>
        
        <div className="text-lg text-white/80 mb-2 text-center">
          النقاط المحتملة: {getPoints()}
        </div>
        
        <div className="text-sm text-white/60 text-center">
          نقطة واحدة كل 5 ثوانٍ
        </div>
      </div>

      <div className="flex justify-center">
        {!isRunning ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
          >
            <Play className="w-6 h-6 ml-2" />
            بدء الدراسة
          </Button>
        ) : (
          <div className="text-center">
            <div className="text-white mb-4">العداد يعمل الآن...</div>
            <div className="text-white/60 text-sm">سيتوقف تلقائياً بعد 5 دقائق من مغادرة الصفحة</div>
          </div>
        )}
      </div>

      <div className="mt-8 glass rounded-2xl p-6 text-center">
        <h3 className="text-lg font-bold text-white mb-2">كيف يعمل العداد؟</h3>
        <div className="text-white/80 text-sm space-y-2">
          <p>• اضغط "بدء الدراسة" لتشغيل العداد</p>
          <p>• ستحصل على نقطة واحدة كل 5 ثوانٍ</p>
          <p>• العداد يستمر لمدة 5 دقائق عند مغادرة الصفحة</p>
          <p>• العداد يتوقف تلقائياً إذا لم تعد للصفحة</p>
        </div>
      </div>
    </div>
  );
};

export default Counter;
