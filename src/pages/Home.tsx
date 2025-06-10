
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Timer, BookOpen, ListTodo, Star, Trophy, Award } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
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
          <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            {fullName}
          </h1>
          <p className="text-purple-200 text-sm">طالب بكالوريا متميز</p>
        </div>

        {/* Points Summary */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 text-center border border-white/20 shadow-2xl">
          <div className="flex items-center justify-center mb-3">
            <Trophy className="w-8 h-8 text-yellow-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">إجمالي النقاط</h2>
          </div>
          <div className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {loading ? "..." : points.total_points.toLocaleString()}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-center mb-2">
                <ListTodo className="w-5 h-5 text-green-400 mr-1" />
              </div>
              <div className="text-2xl font-bold text-white">{points.task_points}</div>
              <div className="text-white/70 text-sm">المهام</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5 text-purple-400 mr-1" />
              </div>
              <div className="text-2xl font-bold text-white">{points.quiz_points}</div>
              <div className="text-white/70 text-sm">الكويز</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-center mb-2">
                <Timer className="w-5 h-5 text-blue-400 mr-1" />
              </div>
              <div className="text-2xl font-bold text-white">{points.counter_points}</div>
              <div className="text-white/70 text-sm">العداد</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-yellow-400 mr-1" />
              </div>
              <div className="text-2xl font-bold text-white">{points.study_hours.toFixed(1)}</div>
              <div className="text-white/70 text-sm">ساعات</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white text-center mb-6">
            🎯 يمكنك جمع النقاط من خلال
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

        {/* Study Progress */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 text-center border border-white/20 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-center">
            <Timer className="w-6 h-6 mr-2 text-blue-400" />
            تقدم الدراسة
          </h3>
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {points.study_hours.toFixed(1)} ساعة
            </div>
            <div className="text-white/70 text-sm">من أصل هدفك اليومي</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
