
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Calculator, Atom, Globe, History, Languages, Palette, Music, Dumbbell, Briefcase } from "lucide-react";

const Subjects = () => {
  const navigate = useNavigate();

  const subjects = [
    { name: "الرياضيات", icon: Calculator, color: "bg-blue-600", available: false },
    { name: "الفيزياء", icon: Atom, color: "bg-purple-600", available: false },
    { name: "العلوم الطبيعية", icon: Globe, color: "bg-emerald-600", available: false },
    { name: "التاريخ", icon: History, color: "bg-amber-600", available: false },
    { name: "الجغرافيا", icon: Globe, color: "bg-cyan-600", available: false },
    { name: "اللغة العربية", icon: BookOpen, color: "bg-red-600", available: false },
    { name: "اللغة الإنجليزية", icon: Languages, color: "bg-indigo-600", available: true, path: "/quiz/english" },
    { name: "اللغة الفرنسية", icon: Languages, color: "bg-pink-600", available: true, path: "/quiz/french" },
    { name: "الشريعة", icon: BookOpen, color: "bg-teal-600", available: false },
    { name: "الفلسفة", icon: BookOpen, color: "bg-violet-600", available: false },
    
  ];

  return (
    <div className="min-h-screen p-6 pt-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">مواد البكالوريا</h1>
        <p className="text-white/80">اختر المادة التي تريد دراستها</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {subjects.map((subject, index) => {
          const IconComponent = subject.icon;
          return (
            <div key={index} className="glass rounded-2xl p-4">
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl ${subject.color} mb-3`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{subject.name}</h3>
                {subject.available ? (
                  <Button
                    onClick={() => navigate(subject.path!)}
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                  >
                    متاح
                  </Button>
                ) : (
                  <Button
                    disabled
                    size="sm"
                    className="w-full bg-gray-500 text-white text-xs opacity-50"
                  >
                    قريباً
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl p-6 text-center">
        <h3 className="text-lg font-bold text-white mb-2">المواد المتاحة حالياً</h3>
        <div className="text-white/80 text-sm space-y-1">
          <p>• اللغة الإنجليزية - 40 سؤال متاح</p>
          <p>• اللغة الفرنسية - 40 سؤال متاح</p>
          <p>• باقي المواد قيد التطوير</p>
          <p className="text-green-400 font-medium mt-3">سيتم إضافة باقي المواد قريباً!</p>
        </div>
      </div>
    </div>
  );
};

export default Subjects;
