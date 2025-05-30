
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

  const fetchUserPoints = async () => {
    if (!telegramId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching points for telegram_id:', telegramId);
      const { data, error } = await supabase
        .from('users')
        .select('total_points, task_points, quiz_points, counter_points, study_hours')
        .eq('telegram_id', telegramId)
        .single();

      if (data && !error) {
        console.log('User points fetched:', data);
        setPoints({
          total_points: data.total_points || 0,
          task_points: data.task_points || 0,
          quiz_points: data.quiz_points || 0,
          counter_points: data.counter_points || 0,
          study_hours: data.study_hours || 0,
        });
      } else {
        console.error('Error fetching user points:', error);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPoints();
  }, [telegramId]);

  return { points, loading, refetch: fetchUserPoints };
};
