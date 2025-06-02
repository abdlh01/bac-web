
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Users, Gift, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useToast } from "@/hooks/use-toast";

interface ReferralData {
  referral_code: string;
  referral_points: number;
  total_referrals: number;
  referred_users: Array<{
    first_name: string;
    last_name: string;
    total_points: number;
    created_at: string;
  }>;
}

const Referrals = () => {
  const navigate = useNavigate();
  const { user } = useTelegramUser();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchReferralData();
    }
  }, [user?.id]);

  const fetchReferralData = async () => {
    if (!user?.id) return;

    try {
      // جلب بيانات المستخدم
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('referral_code, referral_points, id')
        .eq('telegram_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        return;
      }

      // جلب المستخدمين المدعوين
      const { data: referredUsers, error: referredError } = await supabase
        .from('users')
        .select('first_name, last_name, total_points, created_at')
        .eq('referred_by', userData.id)
        .order('created_at', { ascending: false });

      if (referredError) {
        console.error('Error fetching referred users:', referredError);
      }

      setReferralData({
        referral_code: userData.referral_code || '',
        referral_points: userData.referral_points || 0,
        total_referrals: referredUsers?.length || 0,
        referred_users: referredUsers || []
      });

    } catch (error) {
      console.error('Unexpected error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!referralData?.referral_code) return;

    const referralLink = `https://t.me/your_bot_username?start=${referralData.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    
    toast({
      title: "تم النسخ!",
      description: "تم نسخ رابط الإحالة بنجاح",
    });
  };

  const shareReferralLink = () => {
    if (!referralData?.referral_code) return;

    const referralLink = `https://t.me/your_bot_username?start=${referralData.referral_code}`;
    const message = `🎯 انضم إلى التطبيق واجمع النقاط!\n\n✨ احصل على نقاط مجانية عند التسجيل\n🎮 العب الكويزات واجمع المزيد\n⏰ استخدم العداد لتتبع وقت الدراسة\n\n👈 انقر على الرابط للانضمام:\n${referralLink}`;

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.switchInlineQuery(message, ['users', 'groups']);
    } else {
      // للتطوير المحلي - نسخ الرسالة
      navigator.clipboard.writeText(message);
      toast({
        title: "تم النسخ!",
        description: "تم نسخ رسالة الإحالة",
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

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="pt-8">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="text-white ml-2"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">ادعُ أصدقاءك</h1>
        </div>

        {/* شرح نظام الإحالة */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="text-center mb-4">
            <Gift className="w-16 h-16 text-yellow-300 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-2">اربح 1000 نقطة لكل إحالة!</h2>
            <p className="text-white/80 text-sm">
              شارك رابطك مع الأصدقاء واحصل على 1000 نقطة عند تسجيل كل صديق جديد
            </p>
          </div>
        </div>

        {/* إحصائيات الإحالة */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-blue-300 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{referralData?.total_referrals || 0}</div>
            <div className="text-white/80 text-sm">الأصدقاء المدعوين</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Gift className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{referralData?.referral_points || 0}</div>
            <div className="text-white/80 text-sm">نقاط الإحالة</div>
          </div>
        </div>

        {/* رابط الإحالة */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">رابط الإحالة الخاص بك</h3>
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <div className="text-white/80 text-sm break-all">
              https://t.me/your_bot_username?start={referralData?.referral_code || 'LOADING'}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={copyReferralLink}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Copy className="w-4 h-4 ml-1" />
              نسخ الرابط
            </Button>
            <Button
              onClick={shareReferralLink}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Share2 className="w-4 h-4 ml-1" />
              مشاركة
            </Button>
          </div>
        </div>

        {/* شرح كيفية الاستخدام */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">كيفية استخدام رابط الإحالة</h3>
          <div className="space-y-3 text-white/80 text-sm">
            <div className="flex items-start">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs ml-3 mt-0.5">1</span>
              <span>انسخ رابط الإحالة الخاص بك</span>
            </div>
            <div className="flex items-start">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs ml-3 mt-0.5">2</span>
              <span>شاركه مع أصدقائك عبر تيليجرام أو أي منصة أخرى</span>
            </div>
            <div className="flex items-start">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs ml-3 mt-0.5">3</span>
              <span>عندما ينقر صديقك على الرابط ويسجل في التطبيق، ستحصل على 1000 نقطة</span>
            </div>
          </div>
        </div>

        {/* قائمة الأصدقاء المدعوين */}
        {referralData && referralData.referred_users.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">الأصدقاء المدعوين</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {referralData.referred_users.map((referredUser, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">
                      {referredUser.first_name} {referredUser.last_name || ''}
                    </div>
                    <div className="text-white/60 text-sm">
                      {referredUser.total_points} نقطة
                    </div>
                  </div>
                  <div className="text-green-400 text-sm">
                    +1000 نقطة
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;
