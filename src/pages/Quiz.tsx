
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Quiz = () => {
  const navigate = useNavigate();

  const subjects = [
    { name: "اللغة الإنجليزية", path: "/quiz/english" },
    { name: "اللغة الفرنسية", path: "/quiz/french" }
  ];

  return (
    <div className="min-h-screen p-6 pt-12">
      <h1 className="text-2xl font-bold text-white text-center mb-8">الكويز</h1>

      <div className="space-y-4 mb-8">
        {subjects.map((subject) => (
          <Button
            key={subject.name}
            onClick={() => navigate(subject.path)}
            className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-2xl"
          >
            {subject.name}
          </Button>
        ))}
      </div>

      <div className="text-center text-white/80 text-sm">
        سيتم إضافة باقي المواد قريباً
      </div>
    </div>
  );
};

export default Quiz;
