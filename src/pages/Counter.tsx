
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";

const Counter = () => {
  const { user } = useTelegramUser();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const continueTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // التعامل مع مغادرة الصفحة
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isRunning) {
        // إيقاف العداد مؤقتاً
        setIsRunning(false);
        
        // جدولة استكمال العداد لمدة 10 ثوانٍ
        continueTimeoutRef.current = setTimeout(() => {
          handleStop();
        }, 10000);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        // الصفحة أصبحت مخفية
        setIsRunning(false);
        continueTimeoutRef.current = setTimeout(() => {
          handleStop();
        }, 10000);
      } else if (!document.hidden && continueTimeoutRef.current) {
        // العودة للصفحة خلال 10 ثوانٍ
        clearTimeout(continueTimeoutRef.current);
        continueTimeoutRef.current = null;
        setIsRunning(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (continueTimeoutRef.current) {
        clearTimeout(continueTimeoutRef.current);
      }
    };
  }, [isRunning]);

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

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    if (sessionId) {
      setIsRunning(true);
    }
  };

  const handleStop = async () => {
    if (!sessionId || !user?.id) return;

    setIsRunning(false);

    try {
      const pointsEarned = Math.floor(time / 60); // نقطة واحدة لكل دقيقة
      const hoursStudied = time / 3600; // تحويل الثواني إلى ساعات

      // تحديث الجلسة
      const { error: sessionError } = await supabase
        .from('counter_sessions')
        .update({
          end_time: new Date().toISOString(),
          duration: time,
          points_earned: pointsEarned,
          is_active: false
        })
        .eq('id', sessionId);

      if (sessionError) {
        console.error('Error updating session:', sessionError);
        return;
      }

      // تحديث نقاط المستخدم
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('counter_points, total_points, study_hours')
        .eq('telegram_id', user.id)
        .single();

      if (userFetchError || !userData) {
        console.error('Error fetching user data:', userFetchError);
        return;
      }

      const newCounterPoints = (userData.counter_points || 0) + pointsEarned;
      const newTotalPoints = (userData.total_points || 0) + pointsEarned;
      const newStudyHours = (userData.study_hours || 0) + hoursStudied;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          counter_points: newCounterPoints,
          total_points: newTotalPoints,
          study_hours: newStudyHours
        })
        .eq('telegram_id', user.id);

      if (updateError) {
        console.error('Error updating user points:', updateError);
      } else {
        console.log(`Session completed: ${pointsEarned} points earned`);
      }

    } catch (error) {
      console.error('Unexpected error stopping session:', error);
    } finally {
      setTime(0);
      setSessionId(null);
      if (continueTimeoutRef.current) {
        clearTimeout(continueTimeoutRef.current);
        continueTimeoutRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPoints = () => Math.floor(time / 60);

  return (
    <div className="min-h-screen p-6 pt-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">عداد الدراسة</h1>
        <p className="text-white/80">اجمع نقطة واحدة لكل دقيقة دراسة</p>
      </div>

      <div className="glass rounded-3xl p-8 mb-8 text-center">
        <div className="text-6xl font-mono text-white mb-6">
          {formatTime(time)}
        </div>
        
        <div className="text-lg text-white/80 mb-2">
          النقاط المحتملة: {getPoints()}
        </div>
        
        <div className="text-sm text-white/60">
          نقطة واحدة لكل دقيقة
        </div>
      </div>

      <div className="flex justify-center space-x-4 rtl:space-x-reverse">
        {!sessionId ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
          >
            <Play className="w-6 h-6 ml-2" />
            بدء الدراسة
          </Button>
        ) : (
          <>
            {isRunning ? (
              <Button
                onClick={handlePause}
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 text-lg"
              >
                <Pause className="w-6 h-6 ml-2" />
                إيقاف مؤقت
              </Button>
            ) : (
              <Button
                onClick={handleResume}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              >
                <Play className="w-6 h-6 ml-2" />
                متابعة
              </Button>
            )}
            <Button
              onClick={handleStop}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
            >
              <Square className="w-6 h-6 ml-2" />
              إنهاء
            </Button>
          </>
        )}
      </div>

      <div className="mt-8 glass rounded-2xl p-6 text-center">
        <h3 className="text-lg font-bold text-white mb-2">كيف يعمل العداد؟</h3>
        <div className="text-white/80 text-sm space-y-2">
          <p>• اضغط "بدء الدراسة" لتشغيل العداد</p>
          <p>• ستحصل على نقطة واحدة لكل دقيقة</p>
          <p>• يمكنك إيقاف العداد مؤقتاً والمتابعة لاحقاً</p>
          <p>• العداد يستمر لمدة 10 ثوانٍ عند مغادرة الصفحة</p>
          <p>• اضغط "إنهاء" لحفظ النقاط</p>
        </div>
      </div>
    </div>
  );
};

export default Counter;
