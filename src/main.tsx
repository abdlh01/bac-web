
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
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
        };
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
    
    const tg = window.Telegram.WebApp;
    
    // تهيئة التطبيق
    tg.ready();
    tg.expand();
    
    // إخفاء أزرار تليجرام الافتراضية
    tg.MainButton.hide();
    tg.BackButton.hide();
    
    // تعطيل تأكيد الإغلاق
    tg.disableClosingConfirmation();
    
    // التكامل الكامل مع تليجرام - إزالة الشريط الأبيض والتكامل الكامل
    tg.setHeaderColor('#667eea');
    tg.setBackgroundColor('#667eea');
    
    // إضافة ستايل لإخفاء عناصر واجهة تليجرام
    const style = document.createElement('style');
    style.textContent = `
      .tgme_widget_message_user, 
      .tgme_widget_message_author,
      .tg_head_peer_title,
      .tg_head_peer_status,
      .tg_head_btn_back,
      .tg_head_btn_menu {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
      
      /* Hide X button and minimize button */
      .tg_head_btn_close,
      .tg_head_btn_minimize {
        width: 12px !important;
        height: 12px !important;
        opacity: 0.3 !important;
        transform: scale(0.6) !important;
      }
    `;
    document.head.appendChild(style);
    
    // طباعة معلومات المستخدم إن وجدت
    if (tg.initDataUnsafe?.user) {
      console.log('User found in Telegram WebApp:', tg.initDataUnsafe.user);
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
