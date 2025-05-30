
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
        // محاولة الحصول على بيانات المستخدم من Telegram WebApp
        if (window.Telegram?.WebApp) {
          const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
          if (tgUser) {
            setUser(tgUser);
            
            // حفظ أو تحديث بيانات المستخدم في Supabase
            const { data, error } = await supabase
              .from('users')
              .upsert({
                telegram_id: tgUser.id,
                first_name: tgUser.first_name,
                last_name: tgUser.last_name,
                username: tgUser.username,
                avatar_url: tgUser.photo_url,
                last_active: new Date().toISOString(),
              })
              .select()
              .single();

            if (error) {
              console.error('Error saving user:', error);
            }
          } else {
            // بيانات تجريبية للتطوير
            setUser({
              id: 123456789,
              first_name: "أحمد",
              last_name: "محمد",
              photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
            });
          }
        } else {
          // بيانات تجريبية للتطوير
          setUser({
            id: 123456789,
            first_name: "أحمد",
            last_name: "محمد",
            photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
          });
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initTelegramUser();
  }, []);

  return { user, loading };
};
