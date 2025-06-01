import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

  const topTen = rankings.slice(0, 10);
  const pointsNeeded = topTen.length > 0 && currentUserRank 
    ? Math.max(0, topTen[topTen.length - 1].points - currentUserRank.points + 1)
    : 0;

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500";
    if (rank === 2) return "bg-gray-400";
    if (rank === 3) return "bg-orange-500";
    return "bg-blue-500";
  };

  return (
    <div className="min-h-screen gradient-bg p-6 pt-12">
      <h1 className="text-2xl font-bold text-white text-center mb-8">التصنيف</h1>

      {/* العشرة الأوائل */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4 text-center">العشرة الأوائل</h2>
        <div className="space-y-3">
          {topTen.map((userRank) => (
            <div key={userRank.rank} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Badge className={`${getRankBadgeColor(userRank.rank)} text-white font-bold w-8 h-8 rounded-full flex items-center justify-center`}>
                  {userRank.rank}
                </Badge>
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={userRank.avatar || `https://images.unsplash.com/photo-${userRank.rank % 2 === 0 ? '1494790108755-2616b612b647' : '1507003211169-0a1dd7228f2d'}?w=100&h=100&fit=crop&crop=face`} 
                    alt={userRank.name} 
                  />
                  <AvatarFallback className="bg-gray-500 text-white">
                    {userRank.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white font-medium">{userRank.name}</div>
                  <div className="text-white/60 text-sm">{userRank.points} نقطة</div>
                </div>
              </div>
              {userRank.rank <= 3 && (
                <div className="text-2xl">
                  {userRank.rank === 1 ? '🥇' : userRank.rank === 2 ? '🥈' : '🥉'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ترتيب المستخدم الحالي */}
      {currentUserRank && currentUserRank.rank > 10 && (
        <div className="glass rounded-2xl p-4 mb-4">
          <h3 className="text-lg font-bold text-white mb-3 text-center">ترتيبك الحالي</h3>
          <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-xl">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Badge className="bg-blue-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">
                {currentUserRank.rank}
              </Badge>
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={currentUserRank.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"} 
                  alt={currentUserRank.name} 
                />
                <AvatarFallback className="bg-gray-500 text-white">
                  {currentUserRank.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white font-bold">أنت ({currentUserRank.name})</div>
                <div className="text-white/60 text-sm">{currentUserRank.points} نقطة</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* رسالة التحفيز */}
      {pointsNeeded > 0 && (
        <div className="text-center text-white/80 text-sm">
          تحتاج إلى <span className="text-yellow-300 font-bold">{pointsNeeded}</span> نقطة للدخول مع الـ10 الأوائل
        </div>
      )}
    </div>
  );
};

export default Ranking;
