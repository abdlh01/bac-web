
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
      console.log('No telegram ID provided for points fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching points for telegram_id:', telegramId);
      
      // البحث عن المستخدم أولاً
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_points, task_points, quiz_points, counter_points, study_hours')
        .eq('telegram_id', telegramId)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user points:', userError);
        // إنشاء مستخدم جديد إذا لم يكن موجوداً
        if (userError.code === 'PGRST116') {
          console.log('User not found, creating new user...');
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              telegram_id: telegramId,
              total_points: 0,
              task_points: 0,
              quiz_points: 0,
              counter_points: 0,
              study_hours: 0,
            })
            .select('total_points, task_points, quiz_points, counter_points, study_hours')
            .single();

          if (createError) {
            console.error('Error creating new user:', createError);
          } else {
            console.log('New user created:', newUser);
            if (newUser) {
              setPoints({
                total_points: newUser.total_points || 0,
                task_points: newUser.task_points || 0,
                quiz_points: newUser.quiz_points || 0,
                counter_points: newUser.counter_points || 0,
                study_hours: newUser.study_hours || 0,
              });
            }
          }
        }
      } else if (userData) {
        console.log('User points fetched successfully:', userData);
        setPoints({
          total_points: userData.total_points || 0,
          task_points: userData.task_points || 0,
          quiz_points: userData.quiz_points || 0,
          counter_points: userData.counter_points || 0,
          study_hours: userData.study_hours || 0,
        });
      } else {
        console.log('No user data found');
      }
    } catch (error) {
      console.error('Unexpected error fetching user points:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPoints();
  }, [telegramId]);

  return { points, loading, refetch: fetchUserPoints };
};
