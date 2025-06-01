
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Brain, Clock } from "lucide-react";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useUserPoints } from "@/hooks/useUserPoints";
import { useUserRanking } from "@/hooks/useUserRanking";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useTelegramUser();
  const { points, loading: pointsLoading } = useUserPoints(user?.id);
  const { rank, loading: rankLoading } = useUserRanking(user?.id);

  console.log('Home page - User data:', user);
  console.log('Home page - Points data:', points);
  console.log('Home page - Rank data:', rank);

  if (userLoading || pointsLoading || rankLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-lg">جاري التحميل...</div>
      </div>
    );
  }

  const userName = user ? `${user.first_name} ${user.last_name || ''}`.trim() : "مستخدم";
  const userAvatar = user?.photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face";

  return (
    <div className="min-h-screen p-6 pt-12">
      {/* معلومات المستخدم */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <img
            src={userAvatar}
            alt={userName}
            className="w-24 h-24 rounded-full border-4 border-white/30 fade-in-out"
            onError={(e) => {
              console.log('Error loading user avatar, using fallback');
              e.currentTarget.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face";
            }}
          />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{userName}</h1>
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="text-3xl font-bold text-white mb-1">{points.total_points}</div>
          <div className="text-white/80 text-sm">إجمالي النقاط</div>
        </div>
      </div>

      {/* ترتيب المستخدم */}
      <div className="glass rounded-2xl p-4 mb-6 text-center">
        <div className="flex items-center justify-center text-white mb-2">
          <Trophy className="w-5 h-5 ml-2" />
          <span>ترتيبك الحالي</span>
        </div>
        <div className="text-2xl font-bold text-white">
          {rank ? `#${rank}` : 'غير مصنف'}
        </div>
      </div>

      {/* إحصائيات النقاط */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-xl p-3 text-center">
          <Target className="w-6 h-6 text-white mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{points.task_points}</div>
          <div className="text-white/80 text-xs">نقاط المهام</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Brain className="w-6 h-6 text-white mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{points.quiz_points}</div>
          <div className="text-white/80 text-xs">نقاط الكويز</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Clock className="w-6 h-6 text-white mx-auto mb-2" />
          <div className="text-lg font-bold text-white">{points.counter_points}</div>
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

      {/* معلومات التطوير للتشخيص */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-black/20 rounded-lg text-white text-xs">
          <p>معلومات التشخيص:</p>
          <p>معرف المستخدم: {user?.id}</p>
          <p>اسم المستخدم: {user?.first_name} {user?.last_name}</p>
          <p>صورة المستخدم: {user?.photo_url ? 'متوفرة' : 'غير متوفرة'}</p>
          <p>إجمالي النقاط: {points.total_points}</p>
          <p>الترتيب: {rank || 'غير محدد'}</p>
        </div>
      )}
    </div>
  );
};

export default Home;
