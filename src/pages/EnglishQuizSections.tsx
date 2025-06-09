
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Lock, CheckCircle, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";

interface Section {
  id: string;
  section_number: number;
  total_questions: number;
  is_unlocked: boolean;
  completed_questions: number;
  is_completed: boolean;
}

const EnglishQuizSections = () => {
  const navigate = useNavigate();
  const { user } = useTelegramUser();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, [user]);

  const fetchSections = async () => {
    if (!user?.id) return;

    try {
      // البحث عن المستخدم في قاعدة البيانات
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('User not found:', userError);
        setLoading(false);
        return;
      }

      // جلب جميع الأقسام للإنجليزية
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('quiz_sections')
        .select('*')
        .eq('subject', 'english')
        .order('section_number');

      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        setLoading(false);
        return;
      }

      // جلب تقدم المستخدم لكل قسم
      const { data: progressData, error: progressError } = await supabase
        .from('user_quiz_progress')
        .select('*')
        .eq('user_id', userData.id)
        .eq('subject', 'english');

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

      // دمج البيانات
      const sectionsWithProgress = sectionsData.map(section => {
        const progress = progressData?.find(p => p.section_number === section.section_number);
        return {
          ...section,
          completed_questions: progress?.completed_questions || 0,
          is_completed: progress?.is_completed || false,
        };
      });

      // تحديد الأقسام المفتوحة
      const updatedSections = sectionsWithProgress.map((section, index) => {
        if (index === 0) {
          return { ...section, is_unlocked: true };
        }
        
        const previousSection = sectionsWithProgress[index - 1];
        const isUnlocked = previousSection.is_completed;
        
        return { ...section, is_unlocked: isUnlocked };
      });

      setSections(updatedSections);
    } catch (error) {
      console.error('Unexpected error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (section: Section) => {
    if (!section.is_unlocked) return;
    
    navigate(`/quiz/english/section/${section.section_number}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="pt-8">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate('/quiz')}
            variant="ghost"
            size="icon"
            className="text-white ml-2"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">كويز اللغة الإنجليزية</h1>
        </div>

        <div className="mb-6 glass rounded-2xl p-4">
          <h2 className="text-lg font-bold text-white mb-2">معلومات عامة</h2>
          <div className="text-white/80 text-sm space-y-1">
            <p>• إجمالي الأقسام: {sections.length}</p>
            <p>• الأسئلة لكل قسم: 15 سؤال</p>
            <p>• يجب الإجابة بشكل صحيح على جميع أسئلة القسم لفتح القسم التالي</p>
            <p>• الأسئلة المجابة بشكل صحيح لن تظهر مرة أخرى</p>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`glass rounded-2xl p-4 transition-all ${
                section.is_unlocked 
                  ? 'cursor-pointer hover:bg-white/10' 
                  : 'opacity-50'
              }`}
              onClick={() => handleSectionClick(section)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className={`p-3 rounded-xl ${
                    section.is_completed 
                      ? 'bg-green-600' 
                      : section.is_unlocked 
                        ? 'bg-blue-600' 
                        : 'bg-gray-600'
                  }`}>
                    {section.is_completed ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : section.is_unlocked ? (
                      <Play className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      القسم {section.section_number}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {section.completed_questions} / {section.total_questions} سؤال
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {section.is_completed && (
                    <div className="text-green-400 text-sm font-medium">مكتمل</div>
                  )}
                  {!section.is_unlocked && (
                    <div className="text-gray-400 text-sm">مقفل</div>
                  )}
                  {section.is_unlocked && !section.is_completed && (
                    <div className="text-blue-400 text-sm">متاح</div>
                  )}
                </div>
              </div>

              {section.is_unlocked && (
                <div className="mt-3">
                  <Progress 
                    value={(section.completed_questions / section.total_questions) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnglishQuizSections;
