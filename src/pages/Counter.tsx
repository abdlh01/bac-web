
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";

const Counter = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [points, setPoints] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useTelegramUser();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          setPoints(newTime);
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        setIsRunning(false);
        saveCounterSession();
      }
    };

    const handleBeforeUnload = () => {
      if (isRunning) {
        saveCounterSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, time, points, sessionId, user]);

  const startSession = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('counter_sessions')
        .insert({
          user_id: user.id.toString(),
          is_active: true,
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting session:', error);
      } else {
        setSessionId(data.id);
        console.log('Session started:', data.id);
      }
    } catch (error) {
      console.error('Unexpected error starting session:', error);
    }
  };

  const saveCounterSession = async () => {
    if (!user?.id || time === 0) return;

    try {
      console.log('Saving counter session - Time:', time, 'Points:', points);

      // تحديث جلسة العداد
      if (sessionId) {
        await supabase
          .from('counter_sessions')
          .update({
            duration: time,
            points_earned: points,
            is_active: false,
            end_time: new Date().toISOString()
          })
          .eq('id', sessionId);
      }

      // الحصول على النقاط الحالية
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('counter_points, total_points')
        .eq('telegram_id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching current user:', userError);
        return;
      }

      // تحديث نقاط المستخدم
      const newCounterPoints = (currentUser?.counter_points || 0) + points;
      const newTotalPoints = (currentUser?.total_points || 0) + points;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          counter_points: newCounterPoints,
          total_points: newTotalPoints,
          study_hours: time / 3600
        })
        .eq('telegram_id', user.id);

      if (updateError) {
        console.error('Error updating user points:', updateError);
      } else {
        console.log('Points saved successfully! Total points:', newTotalPoints);
      }

      // إعادة تعيين المتغيرات
      setTime(0);
      setPoints(0);
      setSessionId(null);

    } catch (error) {
      console.error('Error saving counter session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = async () => {
    if (!isRunning) {
      // بدء العداد
      await startSession();
      setIsRunning(true);
    } else {
      // إيقاف العداد وحفظ النتائج
      setIsRunning(false);
      await saveCounterSession();
    }
  };

  return (
    <div className="min-h-screen gradient-bg-reverse flex flex-col items-center p-6 pt-20">
      <div className="text-center w-full max-w-sm">
        <p className="text-white/80 text-sm mb-12">كل ثانية تساوي نقطة واحدة</p>
        
        <div className="relative mb-16 flex justify-center">
          <div 
            className={`w-40 h-40 rounded-full glass flex items-center justify-center mx-auto ${
              isRunning ? 'pulse-ring' : ''
            }`}
          >
            <div className="text-center">
              <div className="text-xl font-bold text-white mb-1">
                {formatTime(time)}
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-8 mb-16">
          <div className="text-3xl font-bold text-white mb-2">{points}</div>
          <div className="text-white/80 text-sm">النقاط المجمعة</div>
        </div>

        <button
          onClick={toggleTimer}
          className={`w-24 h-24 rounded-full border-4 border-white/30 text-white font-bold text-lg transition-all ${
            isRunning 
              ? 'bg-red-500/30 hover:bg-red-500/40' 
              : 'bg-green-500/30 hover:bg-green-500/40'
          }`}
        >
          {isRunning ? 'إيقاف' : 'بدء'}
        </button>
      </div>
    </div>
  );
};

export default Counter;
