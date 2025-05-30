
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";

interface UserRank {
  rank: number;
  name: string;
  points: number;
  avatar?: string;
  telegram_id?: number;
}

const Ranking = () => {
  const { user } = useTelegramUser();
  const [rankings, setRankings] = useState<UserRank[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<UserRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, [user]);

  const fetchRankings = async () => {
    try {
      // جلب أفضل المستخدمين مرتبين حسب النقاط
      const { data, error } = await supabase
        .from('users')
        .select('telegram_id, first_name, last_name, avatar_url, total_points')
        .order('total_points', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching rankings:', error);
        // استخدام بيانات وهمية في حالة الخطأ
        setDefaultRankings();
        return;
      }

      if (data && data.length > 0) {
        const rankedUsers = data.map((userData, index) => ({
          rank: index + 1,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'مستخدم',
          points: userData.total_points || 0,
          avatar: userData.avatar_url,
          telegram_id: userData.telegram_id
        }));

        setRankings(rankedUsers);

        // البحث عن ترتيب المستخدم الحالي
        if (user?.id) {
          const userRank = rankedUsers.find(rank => rank.telegram_id === user.id);
          if (userRank) {
            setCurrentUserRank(userRank);
          } else {
            // إذا لم يكن المستخدم في أول 20، نحتاج لحساب ترتيبه
            const { count } = await supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .gt('total_points', 0);
            
            setCurrentUserRank({
              rank: (count || 0) + 1,
              name: `${user.first_name} ${user.last_name || ''}`.trim(),
              points: 0,
              avatar: user.photo_url
            });
          }
        }
      } else {
        setDefaultRankings();
      }
    } catch (error) {
      console.error('Unexpected error fetching rankings:', error);
      setDefaultRankings();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultRankings = () => {
    const defaultData = [
      { rank: 1, name: "فاطمة أحمد", points: 2850, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face" },
      { rank: 2, name: "محمد علي", points: 2640, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
      { rank: 3, name: "سارة حسن", points: 2420, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
      { rank: 4, name: "أمير خالد", points: 2200 },
      { rank: 5, name: "نور الدين", points: 2100 },
      { rank: 6, name: "ليلى مراد", points: 1980 },
      { rank: 7, name: "يوسف محمد", points: 1850 },
      { rank: 8, name: "هدى سالم", points: 1720 },
      { rank: 9, name: "كريم أحمد", points: 1650 },
      { rank: 10, name: "زينب علي", points: 1580 }
    ];
    
    setRankings(defaultData);
    
    if (user) {
      setCurrentUserRank({
        rank: 15,
        name: `${user.first_name} ${user.last_name || ''}`.trim(),
        points: 0,
        avatar: user.photo_url
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-lg">جاري التحميل...</div>
      </div>
    );
  }

  const topThree = rankings.slice(0, 3);
  const otherRanks = rankings.slice(3, 10);
  const pointsNeeded = otherRanks.length > 0 && currentUserRank 
    ? Math.max(0, otherRanks[otherRanks.length - 1].points - currentUserRank.points + 1)
    : 0;

  return (
    <div className="min-h-screen gradient-bg p-6 pt-12">
      <h1 className="text-2xl font-bold text-white text-center mb-8">التصنيف</h1>

      {/* الثلاثة الأوائل - تحسين التصميم */}
      <div className="flex justify-center items-end mb-8 space-x-4 rtl:space-x-reverse">
        {/* المركز الثاني */}
        {topThree[1] && (
          <div className="text-center">
            <div className="glass rounded-xl p-3 mb-2">
              <img 
                src={topThree[1].avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"} 
                alt={topThree[1].name} 
                className="w-16 h-16 rounded-full mx-auto mb-2" 
              />
              <div className="text-white font-bold text-sm">{topThree[1].name}</div>
              <div className="text-yellow-300 text-xs">{topThree[1].points}</div>
            </div>
            <div className="bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto">2</div>
          </div>
        )}

        {/* المركز الأول - في الوسط */}
        {topThree[0] && (
          <div className="text-center -mt-6 mx-4">
            <div className="glass rounded-xl p-4 mb-2">
              <img 
                src={topThree[0].avatar || "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face"} 
                alt={topThree[0].name} 
                className="w-20 h-20 rounded-full mx-auto mb-2" 
              />
              <div className="text-white font-bold">{topThree[0].name}</div>
              <div className="text-yellow-300">{topThree[0].points}</div>
            </div>
            <div className="bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto">1</div>
          </div>
        )}

        {/* المركز الثالث */}
        {topThree[2] && (
          <div className="text-center">
            <div className="glass rounded-xl p-3 mb-2">
              <img 
                src={topThree[2].avatar || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"} 
                alt={topThree[2].name} 
                className="w-16 h-16 rounded-full mx-auto mb-2" 
              />
              <div className="text-white font-bold text-sm">{topThree[2].name}</div>
              <div className="text-yellow-300 text-xs">{topThree[2].points}</div>
            </div>
            <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto">3</div>
          </div>
        )}
      </div>

      {/* الترتيب من 4-10 */}
      {otherRanks.length > 0 && (
        <div className="glass rounded-2xl p-4 mb-6">
          {otherRanks.map((userRank) => (
            <div key={userRank.rank} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm ml-3">
                  {userRank.rank}
                </div>
                <span className="text-white font-medium">{userRank.name}</span>
              </div>
              <div className="text-yellow-300 font-bold">{userRank.points}</div>
            </div>
          ))}
        </div>
      )}

      {/* ترتيب المستخدم الحالي */}
      {currentUserRank && (
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm ml-3">
                {currentUserRank.rank}
              </div>
              <span className="text-white font-bold">أنت ({currentUserRank.name})</span>
            </div>
            <div className="text-yellow-300 font-bold">{currentUserRank.points}</div>
          </div>
        </div>
      )}

      {/* رسالة التحفيز */}
      {pointsNeeded > 0 && (
        <div className="text-center text-white/80 text-sm">
          تحتاج إلى <span className="text-yellow-300 font-bold">{pointsNeeded}</span> نقطة للدخول مع الـ10 الأوائل اجتهد
        </div>
      )}
    </div>
  );
};

export default Ranking;
