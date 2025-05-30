
import { useState, useEffect, useRef } from "react";

const Counter = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [points, setPoints] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          setPoints(newTime); // كل ثانية = نقطة
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
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
    <div className="min-h-screen gradient-bg-reverse flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="text-center">
        <p className="text-white/80 text-sm mb-8">كل ثانية تساوي نقطة واحدة</p>
        
        <div className="relative mb-8">
          <div 
            className={`w-32 h-32 rounded-full glass flex items-center justify-center ${
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

        <div className="glass rounded-2xl p-6 mb-8">
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
