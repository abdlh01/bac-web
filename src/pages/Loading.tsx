
import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

const Loading = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 2;
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center text-white">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full glass flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">تطبيقكم للبكالوريا</h1>
          <p className="text-lg opacity-80">تنافس واجمع أكبر عدد من النقاط</p>
        </div>
        
        <div className="w-64 mx-auto">
          <div className="glass rounded-full h-2 mb-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm opacity-70">جاري التحميل... {progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
