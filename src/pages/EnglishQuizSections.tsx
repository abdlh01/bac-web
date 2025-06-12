
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

  // إضافة listener للتحديثات الفورية
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('quiz-progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_quiz_progress'
        },
        (payload) => {
          console.log('Quiz progress updated:', payload);
          // إعادة جلب البيانات عند التحديث
          fetchSections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchSections = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching sections for user:', user.id);
      
      // البحث عن المستخدم في قاعدة البيانات
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', user.id)
        .maybeSingle();

      if (userError) {
        console.error('User error:', userError);
        setLoading(false);
        return;
      }

      if (!userData) {
        console.log('User not found in database');
        setLoading(false);
        return;
      }

      console.log('User found with ID:', userData.id);

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

      console.log('Sections found:', sectionsData?.length);

      // جلب تقدم المستخدم لكل قسم
      const { data: progressData, error: progressError } = await supabase
        .from('user_quiz_progress')
        .select('*')
        .eq('user_id', userData.id)
        .eq('subject', 'english');

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      }

      console.log('Progress data:', progressData);

      // جلب الأسئلة المجابة بشكل صحيح لكل قسم
      const { data: answeredQuestionsData, error: answeredError } = await supabase
        .from('user_answered_questions')
        .select(`
          question_id,
          is_correct,
          quiz_questions!inner(section_number, subject)
        `)
        .eq('user_id', userData.id)
        .eq('is_correct', true)
        .eq('quiz_questions.subject', 'english');

      if (answeredError) {
        console.error('Error fetching answered questions:', answeredError);
      }

      // تجميع الأسئلة المجابة بشكل صحيح حسب القسم
      const answeredBySection: { [key: number]: number } = {};
      answeredQuestionsData?.forEach((answer: any) => {
        const sectionNumber = answer.quiz_questions.section_number;
        if (!answeredBySection[sectionNumber]) {
          answeredBySection[sectionNumber] = 0;
        }
        answeredBySection[sectionNumber]++;
      });

      console.log('Answered questions by section:', answeredBySection);

      // دمج البيانات مع حساب دقيق للتقدم
      const sectionsWithProgress = sectionsData.map(section => {
        const progress = progressData?.find(p => p.section_number === section.section_number);
        const answeredCount = answeredBySection[section.section_number] || 0;
        const isCompleted = answeredCount >= section.total_questions;
        
        console.log(`Section ${section.section_number}: ${answeredCount}/${section.total_questions} questions, completed: ${isCompleted}`);
        
        return {
          ...section,
          completed_questions: answeredCount,
          is_completed: isCompleted,
        };
      });

      // تحديد الأقسام المفتوحة بناءً على التقدم الفعلي
      const updatedSections = sectionsWithProgress.map((section, index) => {
        if (index === 0) {
          // القسم الأول مفتوح دائماً
          return { ...section, is_unlocked: true };
        }
        
        const previousSection = sectionsWithProgress[index - 1];
        const isUnlocked = previousSection.is_completed;
        
        console.log(`Section ${section.section_number} unlocked: ${isUnlocked} (previous section completed: ${previousSection.is_completed})`);
        
        return { ...section, is_unlocked: isUnlocked };
      });

      console.log('Final sections:', updatedSections);
      setSections(updatedSections);
    } catch (error) {
      console.error('Unexpected error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionClick = (section: Section) => {
    if (!section.is_unlocked) {
      console.log('Section is locked');
      return;
    }
    
    console.log('Navigating to section:', section.section_number);
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
                      {section.completed_questions} / {section.total_questions} سؤال صحيح
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {section.is_completed && (
                    <div className="text-green-400 text-sm font-medium">مكتمل ✅</div>
                  )}
                  {!section.is_unlocked && (
                    <div className="text-gray-400 text-sm">مقفل 🔒</div>
                  )}
                  {section.is_unlocked && !section.is_completed && (
                    <div className="text-blue-400 text-sm">متاح 🔓</div>
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

        {/* زر إعادة تحديث البيانات */}
        <div className="mt-6">
          <Button
            onClick={fetchSections}
            variant="outline"
            className="w-full text-white border-white/20 hover:bg-white/10"
          >
            تحديث البيانات 🔄
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnglishQuizSections;
