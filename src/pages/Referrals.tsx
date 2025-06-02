
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, Users, Gift, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";
import { useToast } from "@/hooks/use-toast";

interface ReferralData {
  referralCode: string;
  referredUsers: number;
  totalPoints: number;
  referrals: Array<{
    id: string;
    first_name: string;
    last_name?: string;
    created_at: string;
    points_earned: number;
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
  }, [user]);

  const fetchReferralData = async () => {
    if (!user?.id) return;

    try {
      // البحث عن المستخدم وكود الإحالة
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, referral_code, referral_points')
        .eq('telegram_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('User not found:', userError);
        return;
      }

      // البحث عن المستخدمين المدعوين
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          points_awarded,
          created_at,
          referred:users!referrals_referred_id_fkey(
            first_name,
            last_name,
            created_at
          )
        `)
        .eq('referrer_id', userData.id);

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        return;
      }

      const processedReferrals = (referrals || []).map(ref => ({
        id: ref.id,
        first_name: ref.referred?.first_name || 'مستخدم',
        last_name: ref.referred?.last_name,
        created_at: ref.created_at,
        points_earned: ref.points_awarded
      }));

      setReferralData({
        referralCode: userData.referral_code || '',
        referredUsers: processedReferrals.length,
        totalPoints: userData.referral_points || 0,
        referrals: processedReferrals
      });

    } catch (error) {
      console.error('Unexpected error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = () => {
    if (!referralData?.referralCode) return '';
    
    // إنشاء رابط الإحالة
    const botUsername = 'MyBACPlus_bot'; // استبدل بـ username البوت الحقيقي
    return `https://t.me/${botUsername}?start=${referralData.referralCode}`;
  };

  const copyReferralLink = async () => {
    const link = generateReferralLink();
    
    if (!link) {
      toast({
        title: "خطأ",
        description: "لا يمكن إنشاء رابط الإحالة",
        variant: "destructive"
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "تم النسخ!",
        description: "تم نسخ رابط الإحالة إلى الحافظة",
      });
    } catch (error) {
      // fallback للمتصفحات التي لا تدعم clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "تم النسخ!",
        description: "تم نسخ رابط الإحالة",
      });
    }
  };

  const shareReferralLink = () => {
    const link = generateReferralLink();
    const message = `انضم إلى تطبيق الدراسة واحصل على نقاط مجانية! استخدم رابطي الخاص: ${link}`;
    
    // التحقق من وجود Telegram Web App
    if (window.Telegram?.WebApp) {
      // استخدام Telegram share إذا كان متاحاً
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
      window.open(shareUrl, '_blank');
    } else {
      // نسخ النص كبديل
      copyReferralLink();
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
          <h1 className="text-2xl font-bold text-white">الإحالات</h1>
        </div>

        {/* مقدمة نظام الإحالة */}
        <div className="glass rounded-2xl p-6 mb-6 text-center">
          <Users className="w-16 h-16 text-white mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">ادعُ أصدقاءك</h2>
          <p className="text-white/80 mb-4">
            احصل على 1000 نقطة لكل صديق تدعوه للانضمام إلى التطبيق
          </p>
          <div className="text-white/60 text-sm">
            شارك رابطك مع الأصدقاء واحصل على النقاط فور انضمامهم
          </div>
        </div>

        {/* إحصائيات الإحالة */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-xl p-4 text-center">
            <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{referralData?.totalPoints || 0}</div>
            <div className="text-white/80 text-sm">نقاط الإحالة</div>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{referralData?.referredUsers || 0}</div>
            <div className="text-white/80 text-sm">أصدقاء مدعوين</div>
          </div>
        </div>

        {/* كود الإحالة وأزرار المشاركة */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">رابط الإحالة الخاص بك</h3>
          
          <div className="bg-white/10 rounded-lg p-3 mb-4">
            <div className="text-white/80 text-sm mb-1">كود الإحالة</div>
            <div className="text-white font-mono text-lg">{referralData?.referralCode}</div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={copyReferralLink}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Copy className="w-4 h-4 ml-2" />
              نسخ الرابط
            </Button>
            
            <Button
              onClick={shareReferralLink}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة الرابط
            </Button>
          </div>
        </div>

        {/* قائمة الأصدقاء المدعوين */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">الأصدقاء المدعوين</h3>
          
          {referralData?.referrals && referralData.referrals.length > 0 ? (
            <div className="space-y-3">
              {referralData.referrals.map((referral) => (
                <div key={referral.id} className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">
                        {referral.first_name} {referral.last_name || ''}
                      </div>
                      <div className="text-white/60 text-sm">
                        انضم في {new Date(referral.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                    <div className="text-green-400 font-bold">
                      +{referral.points_earned}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/60 py-8">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لم تدعُ أي أصدقاء بعد</p>
              <p className="text-sm">ابدأ بمشاركة رابطك واحصل على النقاط!</p>
            </div>
          )}
        </div>

        {/* شرح نظام الإحالة */}
        <div className="mt-6 glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">كيف يعمل نظام الإحالة؟</h3>
          <div className="text-white/80 text-sm space-y-2">
            <p>• انسخ رابط الإحالة الخاص بك</p>
            <p>• شارك الرابط مع أصدقائك</p>
            <p>• عندما ينضم صديق جديد عبر رابطك، تحصل على 1000 نقطة</p>
            <p>• يجب أن يكون الصديق جديداً على التطبيق</p>
            <p>• النقاط تُضاف تلقائياً إلى حسابك</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
