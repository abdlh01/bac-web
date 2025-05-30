
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Brain, Clock } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [userData] = useState({
    name: "أحمد محمد",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    totalPoints: 1250,
    studyHours: 8.5,
    rank: 15
  });

  const [points] = useState({
    tasks: 450,
    quiz: 600,
    counter: 200
  });

  return (
    <div className="min-h-screen p-6 pt-12">
      {/* معلومات المستخدم */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <img
            src={userData.avatar}
            alt={userData.name}
            className="w-24 h-24 rounded-full border-4 border-white/30 fade-in-out"
          />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{userData.name}</h1>
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="text-3xl font-bold text-white mb-1">{userData.totalPoints}</div>
          <div className="text-white/80 text-sm">إجمالي النقاط</div>
        </div>
        <div className="text-white/80 text-sm mb-4">
          درست {userData.studyHours} ساعات اليوم
        </div>
      </div>

      {/* ترتيب المستخدم */}
      <div className="glass rounded-2xl p-4 mb-6 text-center">
        <div className="flex items-center justify-center text-white mb-2">
          <Trophy className="w-5 h-5 ml-2" />
          <span>ترتيبك الحالي</span>
        </div>
        <div className="text-2xl font-bold text-white">#{userData.rank}</div>
      </div>

      {/* إحصائيات النقاط */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-xl p-3 text-center">
          <Target className="w-6 h-6 text-white mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{points.tasks}</div>
          <div className="text-white/80 text-xs">نقاط المهام</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Brain className="w-6 h-6 text-white mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{points.quiz}</div>
          <div className="text-white/80 text-xs">نقاط الكويز</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Clock className="w-6 h-6 text-white mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{points.counter}</div>
          <div className="text-white/80 text-xs">نقاط العداد</div>
        </div>
      </div>

      {/* المهام */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center text-white mb-3">
          <Target className="w-5 h-5 ml-2" />
          <span className="font-medium">المهام</span>
        </div>
        <p className="text-white/80 text-sm mb-4">يمكنك جمع بعض النقاط من هنا</p>
        <Button
          onClick={() => navigate('/tasks')}
          className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
          variant="outline"
        >
          عرض المهام
        </Button>
      </div>
    </div>
  );
};

export default Home;
