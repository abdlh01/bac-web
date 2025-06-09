
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Timer, BookOpen, ListTodo, Trash2 } from "lucide-react";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useUserPoints } from "@/hooks/useUserPoints";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useTelegramUser();
  const { points, loading } = useUserPoints(user?.id);
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteProfile = async () => {
    if (!user?.id) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('telegram_id', user.id);

      if (error) {
        console.error('Error deleting profile:', error);
        toast({
          title: "خطأ في حذف الملف الشخصي",
          description: "حدث خطأ أثناء حذف الملف الشخصي",
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم حذف الملف الشخصي",
          description: "تم حذف ملفك الشخصي وجميع بياناتك بنجاح",
        });
        // يمكن إضافة إعادة توجيه أو إعادة تحميل الصفحة هنا
        window.location.reload();
      }
    } catch (error) {
      console.error('Unexpected error deleting profile:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const quickActions = [
    {
      icon: Users,
      label: "الإحالة",
      color: "bg-pink-600",
      disabled: true, // صفحة الإحالة غير متاحة حالياً
    },
    {
      icon: Timer,
      label: "العداد",
      color: "bg-blue-600",
      path: "/counter",
    },
    {
      icon: BookOpen,
      label: "كويز",
      color: "bg-purple-600",
      path: "/quiz",
    },
    {
      icon: ListTodo,
      label: "المهام",
      color: "bg-green-600",
      path: "/tasks",
    },
  ];

  return (
    <div className="min-h-screen p-6 pt-12">
      <div className="max-w-md mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            أهلاً بك في ساحة البكالوريا
          </h1>
          <p className="text-white/80">
            مرحباً {user?.first_name || 'صديقي'} 👋
          </p>
        </div>

        {/* Points Summary */}
        <div className="glass rounded-2xl p-6 text-center">
          <div className="text-4xl font-bold text-white mb-2">
            {loading ? "..." : points.total_points}
          </div>
          <div className="text-white/80 text-sm">إجمالي النقاط</div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{points.task_points}</div>
              <div className="text-white/60 text-xs">المهام</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{points.quiz_points}</div>
              <div className="text-white/60 text-xs">الكويز</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{points.counter_points}</div>
              <div className="text-white/60 text-xs">العداد</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white text-center">
            يمكنك جمع النقاط من خلال
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card key={index} className="glass border-0">
                  <CardContent className="p-4">
                    <Button
                      onClick={() => action.path && navigate(action.path)}
                      disabled={action.disabled}
                      className={`w-full h-20 ${action.color} hover:opacity-80 transition-all flex flex-col items-center justify-center space-y-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                      <span className="text-white text-sm font-medium">
                        {action.label}
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Study Hours */}
        <div className="glass rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-white mb-2">ساعات الدراسة</h3>
          <div className="text-2xl font-bold text-white">
            {points.study_hours.toFixed(1)} ساعة
          </div>
        </div>

        {/* Delete Profile Section */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 text-center">إدارة الحساب</h3>
          <Button
            onClick={handleDeleteProfile}
            disabled={deleting}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 ml-2" />
            {deleting ? "جاري الحذف..." : "حذف الملف الشخصي"}
          </Button>
          <p className="text-white/60 text-xs text-center mt-2">
            تحذير: سيتم حذف جميع بياناتك نهائياً
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
