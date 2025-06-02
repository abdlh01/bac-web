
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Trophy, BookOpen, Timer, GraduationCap } from "lucide-react";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "الرئيسية" },
    { path: "/ranking", icon: Trophy, label: "التصنيف" },
    { path: "/quiz", icon: BookOpen, label: "كويز" },
    { path: "/counter", icon: Timer, label: "العداد" },
    { path: "/subjects", icon: GraduationCap, label: "البكالوريات" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bottom-navigation fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-white/20 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? "text-purple-600 bg-purple-100/50 scale-105" 
                  : "text-gray-600 hover:text-purple-500 hover:bg-purple-50/30"
              }`}
              style={{
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
                touchAction: 'manipulation',
                pointerEvents: 'auto'
              }}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
