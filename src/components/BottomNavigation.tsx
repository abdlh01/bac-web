
import { NavLink } from "react-router-dom";
import { Home, Clock, Trophy, Brain, GraduationCap } from "lucide-react";

const BottomNavigation = () => {
  const navItems = [
    { path: "/", icon: Home, label: "الرئيسية" },
    { path: "/counter", icon: Clock, label: "العداد" },
    { path: "/ranking", icon: Trophy, label: "التصنيف" },
    { path: "/quiz", icon: Brain, label: "الكويز" },
    { path: "/subjects", icon: GraduationCap, label: "البكالوريات" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass mx-4 mb-4 rounded-2xl p-2">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center p-3 rounded-xl transition-all ${
                  isActive
                    ? "text-white bg-white/20"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
