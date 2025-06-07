
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// إضافة دعم Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
          query_id?: string;
          auth_date?: number;
          hash?: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        version: string;
        platform: string;
        colorScheme: string;
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
      };
    };
  }
}

// تهيئة Telegram WebApp
const initTelegramWebApp = () => {
  console.log('Checking for Telegram WebApp...');
  
  if (window.Telegram?.WebApp) {
    console.log('Telegram WebApp detected!');
    console.log('WebApp version:', window.Telegram.WebApp.version);
    console.log('Platform:', window.Telegram.WebApp.platform);
    console.log('Init data length:', window.Telegram.WebApp.initData?.length || 0);
    
    // تهيئة التطبيق
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    
    // إزالة الشريط الأبيض وجعل التطبيق يتكامل مع تلغرام
    window.Telegram.WebApp.setHeaderColor('#667eea');
    window.Telegram.WebApp.setBackgroundColor('#667eea');
    
    // طباعة معلومات المستخدم إن وجدت
    if (window.Telegram.WebApp.initDataUnsafe?.user) {
      console.log('User found in Telegram WebApp:', window.Telegram.WebApp.initDataUnsafe.user);
    } else {
      console.log('No user data in Telegram WebApp');
    }
  } else {
    console.log('Telegram WebApp not found - running in browser/development mode');
  }
};

// تشغيل التهيئة
initTelegramWebApp();

createRoot(document.getElementById("root")!).render(<App />);
