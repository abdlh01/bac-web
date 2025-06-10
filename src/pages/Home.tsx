
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Timer, BookOpen, ListTodo, Star, Trophy, Award, Clock } from "lucide-react";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useUserPoints } from "@/hooks/useUserPoints";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useTelegramUser();
  const { points, loading } = useUserPoints(user?.id);

  const quickActions = [
    {
      icon: Timer,
      label: "العداد",
      color: "bg-gradient-to-br from-blue-500 to-blue-700",
      path: "/counter",
      description: "احسب وقت دراستك",
    },
    {
      icon: BookOpen,
      label: "كويز",
      color: "bg-gradient-to-br from-purple-500 to-purple-700",
      path: "/quiz",
      description: "اختبر معلوماتك",
    },
    {
      icon: ListTodo,
      label: "المهام",
      color: "bg-gradient-to-br from-green-500 to-green-700",
      path: "/tasks",
      description: "أكمل المهام",
    },
    {
      icon: Users,
      label: "الإحالة",
      color: "bg-gradient-to-br from-pink-500 to-pink-700",
      disabled: true,
      description: "ادع أصدقائك",
    },
  ];

  // تكوين الاسم الكامل
  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'المستخدم';

  // تحويل الساعات إلى تنسيق HH:MM:SS مع الأيام
  const formatStudyTime = (hours: number) => {
    const totalSeconds = Math.floor(hours * 3600);
    const days = Math.floor(totalSeconds / 86400);
    const remainingSeconds = totalSeconds % 86400;
    const hrs = Math.floor(remainingSeconds / 3600);
    const mins = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;
    
    const timeString = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const daysString = `${days.toString().padStart(2, '0')}d`;
    
    return { timeString, daysString };
  };

  const { timeString, daysString } = formatStudyTime(points.study_hours);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        {/* Profile Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white/20 shadow-2xl">
                <AvatarImage 
                  src={user?.photo_url} 
                  alt={fullName}
                />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
                  {user?.first_name?.[0] || "م"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2">
                <Star className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            {fullName}
          </h1>
          <p className="text-blue-200 text-sm">طالب بكالوريا متميز</p>
        </div>

        {/* Total Points - Main Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center border border-white/20 shadow-2xl">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
            <h2 className="text-xl font-semibold text-white">إجمالي النقاط</h2>
          </div>
          <div className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {loading ? "..." : points.total_points.toLocaleString()}
          </div>
          
          {/* Points Breakdown - Small Format */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <ListTodo className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{points.task_points}</div>
              <div className="text-white/60 text-xs">المهام</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <BookOpen className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{points.quiz_points}</div>
              <div className="text-white/60 text-xs">الكويز</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <Timer className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{points.counter_points}</div>
              <div className="text-white/60 text-xs">العداد</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <Users className="w-4 h-4 text-pink-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{points.referral_points}</div>
              <div className="text-white/60 text-xs">الإحالة</div>
            </div>
          </div>

          {/* Study Time Summary */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <h3 className="text-md font-bold text-white mb-3 flex items-center justify-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              مجموع الوقت الذي درسته
            </h3>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {timeString}
            </div>
            <div className="text-white/70 text-lg">
              {daysString}
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white text-center mb-6">
            يمكنك جمع النقاط من خلال
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card key={index} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-xl">
                  <CardContent className="p-4">
                    <Button
                      onClick={() => action.path && navigate(action.path)}
                      disabled={action.disabled}
                      className={`w-full h-24 ${action.color} hover:opacity-90 transition-all flex flex-col items-center justify-center space-y-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-0`}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                      <span className="text-white text-sm font-bold">
                        {action.label}
                      </span>
                    </Button>
                    <p className="text-white/70 text-xs text-center mt-2">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
