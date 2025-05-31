
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export const useTelegramUser = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initTelegramUser = async () => {
      try {
        console.log('Initializing Telegram user...');
        console.log('Window Telegram object:', window.Telegram);
        
        // انتظار تحميل Telegram WebApp
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (window.Telegram?.WebApp) {
          console.log('Telegram WebApp found');
          console.log('Init data:', window.Telegram.WebApp.initData);
          console.log('Init data unsafe:', window.Telegram.WebApp.initDataUnsafe);
          
          const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
          
          if (tgUser && tgUser.id) {
            console.log('Telegram User found:', tgUser);
            setUser(tgUser);
            
            try {
              // التحقق من وجود المستخدم أولاً
              const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', tgUser.id)
                .maybeSingle();

              if (fetchError) {
                console.error('Error fetching user:', fetchError);
              }

              if (existingUser) {
                console.log('User already exists, updating last_active:', existingUser);
                // تحديث آخر نشاط فقط
                const { error: updateError } = await supabase
                  .from('users')
                  .update({
                    last_active: new Date().toISOString(),
                    avatar_url: tgUser.photo_url || existingUser.avatar_url,
                    first_name: tgUser.first_name || existingUser.first_name,
                    last_name: tgUser.last_name || existingUser.last_name,
                    username: tgUser.username || existingUser.username,
                  })
                  .eq('telegram_id', tgUser.id);

                if (updateError) {
                  console.error('Error updating user:', updateError);
                } else {
                  console.log('User updated successfully');
                }
              } else {
                console.log('Creating new user...');
                // إنشاء مستخدم جديد
                const { data: newUser, error: insertError } = await supabase
                  .from('users')
                  .insert({
                    telegram_id: tgUser.id,
                    first_name: tgUser.first_name,
                    last_name: tgUser.last_name || null,
                    username: tgUser.username || null,
                    avatar_url: tgUser.photo_url || null,
                    total_points: 0,
                    task_points: 0,
                    quiz_points: 0,
                    counter_points: 0,
                    study_hours: 0,
                    last_active: new Date().toISOString(),
                  })
                  .select()
                  .single();

                if (insertError) {
                  console.error('Error creating new user:', insertError);
                  console.error('Insert error details:', insertError.details);
                  console.error('Insert error hint:', insertError.hint);
                  console.error('Insert error message:', insertError.message);
                } else {
                  console.log('New user created successfully:', newUser);
                }
              }
            } catch (dbError) {
              console.error('Database error:', dbError);
            }
          } else {
            console.log('No Telegram user data found in WebApp');
            console.log('Using demo data for development');
            
            // بيانات تجريبية فقط للتطوير المحلي
            const demoUser = {
              id: 123456789,
              first_name: "مستخدم",
              last_name: "تجريبي",
              photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            };
            
            setUser(demoUser);
            
            try {
              // التحقق من المستخدم التجريبي
              const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', demoUser.id)
                .maybeSingle();

              if (!existingUser) {
                const { data, error } = await supabase
                  .from('users')
                  .insert({
                    telegram_id: demoUser.id,
                    first_name: demoUser.first_name,
                    last_name: demoUser.last_name,
                    avatar_url: demoUser.photo_url,
                    total_points: 0,
                    task_points: 0,
                    quiz_points: 0,
                    counter_points: 0,
                    study_hours: 0,
                    last_active: new Date().toISOString(),
                  })
                  .select()
                  .single();

                if (error) {
                  console.error('Error saving demo user:', error);
                } else {
                  console.log('Demo user saved:', data);
                }
              }
            } catch (dbError) {
              console.error('Demo user database error:', dbError);
            }
          }
        } else {
          console.log('Telegram WebApp not available - using demo user');
          
          // بيانات تجريبية للتطوير المحلي
          const demoUser = {
            id: 123456789,
            first_name: "مطور",
            last_name: "محلي", 
            photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
          };
          
          setUser(demoUser);

          try {
            // التحقق من المستخدم التجريبي
            const { data: existingUser } = await supabase
              .from('users')
              .select('*')
              .eq('telegram_id', demoUser.id)
              .maybeSingle();

            if (!existingUser) {
              const { data, error } = await supabase
                .from('users')
                .insert({
                  telegram_id: demoUser.id,
                  first_name: demoUser.first_name,
                  last_name: demoUser.last_name,
                  avatar_url: demoUser.photo_url,
                  total_points: 0,
                  task_points: 0,
                  quiz_points: 0,
                  counter_points: 0,
                  study_hours: 0,
                  last_active: new Date().toISOString(),
                })
                .select()
                .single();

              if (error) {
                console.error('Error saving demo user:', error);
              } else {
                console.log('Demo user created:', data);
              }
            } else {
              console.log('Demo user already exists:', existingUser);
            }
          } catch (dbError) {
            console.error('Demo user database error:', dbError);
          }
        }
      } catch (error) {
        console.error('Error in initTelegramUser:', error);
        
        // بيانات احتياطية في حالة الخطأ
        setUser({
          id: 999999999,
          first_name: "مستخدم",
          last_name: "افتراضي",
          photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        });
      } finally {
        setLoading(false);
      }
    };

    initTelegramUser();
  }, []);

  return { user, loading };
};
