
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPoints {
  total_points: number;
  task_points: number;
  quiz_points: number;
  counter_points: number;
  study_hours: number;
}

export const useUserPoints = (telegramId?: number) => {
  const [points, setPoints] = useState<UserPoints>({
    total_points: 0,
    task_points: 0,
    quiz_points: 0,
    counter_points: 0,
    study_hours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!telegramId) return;

    const fetchUserPoints = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('total_points, task_points, quiz_points, counter_points, study_hours')
          .eq('telegram_id', telegramId)
          .single();

        if (data && !error) {
          setPoints(data);
        }
      } catch (error) {
        console.error('Error fetching user points:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPoints();
  }, [telegramId]);

  return { points, loading, refetch: () => {} };
};
