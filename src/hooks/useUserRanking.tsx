
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserRanking = (telegramId?: number) => {
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    const fetchUserRank = async () => {
      try {
        console.log('Fetching user rank for telegram_id:', telegramId);
        
        // جلب ترتيب المستخدم من قاعدة البيانات
        const { data, error } = await supabase
          .from('users')
          .select('total_points')
          .order('total_points', { ascending: false });

        if (error) {
          console.error('Error fetching rankings:', error);
          setRank(null);
          return;
        }

        if (data) {
          // العثور على ترتيب المستخدم الحالي
          const userIndex = data.findIndex(user => user.total_points > 0);
          const currentUserData = await supabase
            .from('users')
            .select('total_points')
            .eq('telegram_id', telegramId)
            .single();

          if (currentUserData.data) {
            const userPoints = currentUserData.data.total_points;
            const betterUsers = data.filter(user => user.total_points > userPoints);
            setRank(betterUsers.length + 1);
          } else {
            setRank(null);
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching user rank:', error);
        setRank(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRank();
  }, [telegramId]);

  return { rank, loading };
};
