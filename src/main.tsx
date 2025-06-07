
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
    
    // إضافة ستايل أقوى لإخفاء جميع عناصر واجهة تليجرام
    const style = document.createElement('style');
    style.textContent = `
      /* إخفاء جميع عناصر واجهة تليجرام بقوة */
      .tgme_widget_message_user, 
      .tgme_widget_message_author,
      .tg_head_peer_title,
      .tg_head_peer_status,
      .tg_head_btn_back,
      .tg_head_btn_menu,
      .tgme_widget_message_bubble,
      .tgme_widget_message_wrap,
      .tgme_widget_message_text,
      .tgme_widget_message_from_author,
      .tgme_widget_message_forwarded_from,
      .tgme_widget_message_via_bot,
      .tg_head_split_title,
      .tg_head_peer_title_wrap,
      .tgico-premium_lock,
      .tgico-lock_badge,
      .tg_bot_username,
      .tg_bot_description,
      .tg-spoiler,
      .tgme_widget_message_bubble_tail,
      [class*="tg_head"],
      [class*="tgme_widget"],
      [class*="tg_bot"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        z-index: -1 !important;
      }
      
      /* تصغير أزرار الخروج والتصغير وجعلها شبه شفافة */
      .tg_head_btn_close,
      .tg_head_btn_minimize,
      .tg_head_close_btn,
      .tg_head_minimize_btn {
        width: 6px !important;
        height: 6px !important;
        opacity: 0.05 !important;
        transform: scale(0.2) !important;
        background: transparent !important;
        border: none !important;
        color: rgba(255,255,255,0.1) !important;
        font-size: 0 !important;
        pointer-events: auto !important;
        position: fixed !important;
        top: 2px !important;
        right: 2px !important;
      }
      
      /* إخفاء منطقة الهيدر بالكامل */
      .tg_head,
      .tg_head_wrap,
      .tgme_widget_message_header,
      .tg_head_peer_wrap {
        background: transparent !important;
        border: none !important;
        height: 0px !important;
        min-height: 0px !important;
        max-height: 0px !important;
        padding: 0 !important;
        margin: 0 !important;
        opacity: 0 !important;
        overflow: hidden !important;
      }

      /* التأكد من التكامل الكامل */
      body, html {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      #root {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        min-height: 100vh !important;
        min-height: 100dvh !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    // تطبيق الستايل مباشرة على العناصر الموجودة
    setTimeout(() => {
      const elementsToHide = document.querySelectorAll(`
        .tgme_widget_message_user, 
        .tgme_widget_message_author,
        .tg_head_peer_title,
        .tg_head_peer_status,
        .tg_head_btn_back,
        .tg_head_btn_menu,
        .tg_head,
        .tg_head_wrap,
        [class*="tg_head"],
        [class*="tgme_widget"],
        [class*="tg_bot"]
      `);
      
      elementsToHide.forEach(el => {
        (el as HTMLElement).style.display = 'none';
        (el as HTMLElement).style.visibility = 'hidden';
        (el as HTMLElement).style.opacity = '0';
        (el as HTMLElement).style.height = '0';
        (el as HTMLElement).style.width = '0';
      });

      const closeButtons = document.querySelectorAll(`
        .tg_head_btn_close,
        .tg_head_btn_minimize,
        .tg_head_close_btn,
        .tg_head_minimize_btn
      `);
      
      closeButtons.forEach(btn => {
        (btn as HTMLElement).style.width = '6px';
        (btn as HTMLElement).style.height = '6px';
        (btn as HTMLElement).style.opacity = '0.05';
        (btn as HTMLElement).style.transform = 'scale(0.2)';
        (btn as HTMLElement).style.background = 'transparent';
        (btn as HTMLElement).style.color = 'rgba(255,255,255,0.1)';
      });
    }, 500);
    
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
