
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
              // حفظ أو تحديث بيانات المستخدم في Supabase
              const { data, error } = await supabase
                .from('users')
                .upsert({
                  telegram_id: tgUser.id,
                  first_name: tgUser.first_name,
                  last_name: tgUser.last_name || null,
                  username: tgUser.username || null,
                  avatar_url: tgUser.photo_url || null,
                  last_active: new Date().toISOString(),
                }, {
                  onConflict: 'telegram_id'
                })
                .select()
                .single();

              if (error) {
                console.error('Error saving user to Supabase:', error);
              } else {
                console.log('User saved successfully to Supabase:', data);
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
              // حفظ البيانات التجريبية
              const { data, error } = await supabase
                .from('users')
                .upsert({
                  telegram_id: demoUser.id,
                  first_name: demoUser.first_name,
                  last_name: demoUser.last_name,
                  avatar_url: demoUser.photo_url,
                  last_active: new Date().toISOString(),
                }, {
                  onConflict: 'telegram_id'
                })
                .select()
                .single();

              if (error) {
                console.error('Error saving demo user:', error);
              } else {
                console.log('Demo user saved:', data);
              }
            } catch (dbError) {
              console.error('Demo user database error:', dbError);
            }
          }
        } else {
          console.log('Telegram WebApp not available');
          console.log('This might be because:');
          console.log('1. App is not running inside Telegram');
          console.log('2. Telegram WebApp script not loaded');
          console.log('3. App is in development mode');
          
          // بيانات تجريبية للتطوير المحلي
          const demoUser = {
            id: 123456789,
            first_name: "مطور",
            last_name: "محلي", 
            photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
          };
          
          setUser(demoUser);
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
