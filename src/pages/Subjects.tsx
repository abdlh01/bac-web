
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen } from "lucide-react";

const Subjects = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 pt-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">اختر المادة</h1>
        <p className="text-white/80">اختبر معلوماتك واجمع النقاط</p>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <BookOpen className="w-8 h-8 text-blue-400 ml-3" />
            <div>
              <h3 className="text-xl font-bold text-white">اللغة الإنجليزية</h3>
              <p className="text-white/80 text-sm">اختبر مفرداتك الإنجليزية</p>
            </div>
          </div>
          <div className="text-white/60 text-sm mb-4">
            15 سؤال | 10 نقاط لكل إجابة صحيحة | 5 دقائق
          </div>
          <Button
            onClick={() => navigate('/quiz/english')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            ابدأ الكويز
          </Button>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <GraduationCap className="w-8 h-8 text-red-400 ml-3" />
            <div>
              <h3 className="text-xl font-bold text-white">اللغة الفرنسية</h3>
              <p className="text-white/80 text-sm">اختبر مفرداتك الفرنسية</p>
            </div>
          </div>
          <div className="text-white/60 text-sm mb-4">
            15 سؤال | 10 نقاط لكل إجابة صحيحة | 5 دقائق
          </div>
          <Button
            onClick={() => navigate('/quiz/french')}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            ابدأ الكويز
          </Button>
        </div>
      </div>

      <div className="mt-8 glass rounded-2xl p-6 text-center">
        <h3 className="text-lg font-bold text-white mb-2">نصائح للحصول على أفضل النتائج</h3>
        <div className="text-white/80 text-sm space-y-1">
          <p>• اقرأ السؤال بعناية قبل الإجابة</p>
          <p>• لديك 5 دقائق لإكمال الكويز</p>
          <p>• ستحصل على 10 نقاط لكل إجابة صحيحة</p>
          <p>• يمكنك إعادة الكويز في أي وقت</p>
        </div>
      </div>
    </div>
  );
};

export default Subjects;
