
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";

const Counter = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [points, setPoints] = useState(0);
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
      if (document.hidden) {
        setIsRunning(false);
        saveCounterSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const saveCounterSession = async () => {
    if (time > 0 && user) {
      try {
        // حفظ جلسة العداد
        await supabase
          .from('counter_sessions')
          .insert({
            user_id: user.id.toString(),
            duration: time,
            points_earned: points,
            is_active: false,
            end_time: new Date().toISOString(),
          });

        // تحديث نقاط المستخدم
        await supabase
          .from('users')
          .update({
            counter_points: points,
            study_hours: time / 3600,
          })
          .eq('telegram_id', user.id);
      } catch (error) {
        console.error('Error saving counter session:', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="min-h-screen gradient-bg-reverse flex flex-col items-center justify-start pt-16 p-6 overflow-hidden">
      <div className="text-center w-full max-w-sm">
        <p className="text-white/80 text-sm mb-16">كل ثانية تساوي نقطة واحدة</p>
        
        <div className="relative mb-16 flex justify-center">
          <div 
            className={`w-32 h-32 rounded-full glass flex items-center justify-center ${
              isRunning ? 'pulse-ring' : ''
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-1">
                {formatTime(time)}
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 mb-16">
          <div className="text-2xl font-bold text-white mb-1">{points}</div>
          <div className="text-white/80 text-sm">النقاط المجمعة</div>
        </div>

        <button
          onClick={toggleTimer}
          className={`w-20 h-20 rounded-full border-4 border-white/30 text-white font-bold text-lg transition-all ${
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
