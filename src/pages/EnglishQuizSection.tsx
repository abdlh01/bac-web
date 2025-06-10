
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

interface QuizResult {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  question: string;
  correctAnswer: string;
  selectedAnswerText: string;
}

const EnglishQuizSection = () => {
  const navigate = useNavigate();
  const { sectionNumber } = useParams();
  const { user } = useTelegramUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [userDbId, setUserDbId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      initializeQuiz();
    }
  }, [user, sectionNumber]);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && questions.length > 0) {
      handleQuizComplete();
    }
  }, [timeLeft, quizCompleted, questions.length]);

  const initializeQuiz = async () => {
    if (!user?.id || !sectionNumber) return;

    try {
      console.log('Initializing quiz for section:', sectionNumber, 'User ID:', user.id);
      
      // التأكد من وجود المستخدم في قاعدة البيانات
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user:', userError);
        setLoading(false);
        return;
      }

      // إنشاء المستخدم إذا لم يكن موجوداً
      if (!userData) {
        console.log('User not found, creating new user...');
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            telegram_id: user.id,
            first_name: user.first_name || 'مستخدم',
            last_name: user.last_name || '',
            username: user.username || null,
            avatar_url: user.photo_url || null,
            total_points: 0,
            task_points: 0,
            quiz_points: 0,
            counter_points: 0,
            referral_points: 0,
            study_hours: 0,
            last_active: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          setLoading(false);
          return;
        }
        userData = newUser;
      }

      if (!userData?.id) {
        console.error('No user data available');
        setLoading(false);
        return;
      }

      setUserDbId(userData.id);
      console.log('User DB ID:', userData.id);

      // جلب الأسئلة المجابة بشكل صحيح لهذا القسم
      const { data: answeredQuestions, error: answeredError } = await supabase
        .from('user_answered_questions')
        .select('question_id')
        .eq('user_id', userData.id)
        .eq('is_correct', true);

      if (answeredError) {
        console.error('Error fetching answered questions:', answeredError);
      }

      const answeredQuestionIds = answeredQuestions?.map(q => q.question_id) || [];
      console.log('Answered question IDs:', answeredQuestionIds);

      // جلب جميع الأسئلة من القسم المحدد
      let questionsQuery = supabase
        .from('quiz_questions')
        .select('*')
        .eq('subject', 'english')
        .eq('section_number', parseInt(sectionNumber))
        .eq('is_active', true);

      // استبعاد الأسئلة المجابة بشكل صحيح إذا كان هناك أي منها
      if (answeredQuestionIds.length > 0) {
        questionsQuery = questionsQuery.not('id', 'in', `(${answeredQuestionIds.join(',')})`);
      }

      const { data: questionsData, error: questionsError } = await questionsQuery;

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        setLoading(false);
        return;
      }

      console.log('Questions fetched:', questionsData?.length || 0);

      if (!questionsData || questionsData.length === 0) {
        console.log('No questions left, section completed');
        setQuizCompleted(true);
        setLoading(false);
        return;
      }

      // خلط الأسئلة
      const shuffled = [...questionsData].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      console.log('Questions set:', shuffled.length);
      setLoading(false);
    } catch (error) {
      console.error('Unexpected error initializing quiz:', error);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedAnswer === null || !userDbId) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct_answer;
    
    // حفظ نتيجة السؤال في قاعدة البيانات
    try {
      console.log('Saving answer for question:', currentQ.id, 'User:', userDbId, 'Correct:', isCorrect);
      
      const { error } = await supabase
        .from('user_answered_questions')
        .upsert({
          user_id: userDbId,
          question_id: currentQ.id,
          is_correct: isCorrect
        });

      if (error) {
        console.error('Error saving answer:', error);
      } else {
        console.log('Answer saved successfully');
      }
    } catch (error) {
      console.error('Error saving answer:', error);
    }

    // حفظ نتيجة السؤال محلياً
    const result: QuizResult = {
      questionIndex: currentQuestion,
      selectedAnswer,
      isCorrect,
      question: currentQ.question,
      correctAnswer: currentQ.options[currentQ.correct_answer],
      selectedAnswerText: currentQ.options[selectedAnswer]
    };
    
    setQuizResults(prev => [...prev, result]);

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    setQuizCompleted(true);
    
    if (!user?.id || !userDbId || !sectionNumber) return;

    const pointsEarned = score * 10;

    try {
      console.log('Completing quiz. Score:', score, 'Points earned:', pointsEarned);

      // حساب جميع الأسئلة المجابة بشكل صحيح في هذا القسم بعد إضافة الإجابات الجديدة
      const { data: allCorrectAnswers, error: correctAnswersError } = await supabase
        .from('user_answered_questions')
        .select(`
          question_id,
          quiz_questions!inner(section_number, subject)
        `)
        .eq('user_id', userDbId)
        .eq('is_correct', true)
        .eq('quiz_questions.subject', 'english')
        .eq('quiz_questions.section_number', parseInt(sectionNumber));

      if (correctAnswersError) {
        console.error('Error fetching correct answers:', correctAnswersError);
      }

      const correctAnswersCount = allCorrectAnswers?.length || 0;
      console.log('Total correct answers in section:', correctAnswersCount);

      // الحصول على العدد الإجمالي للأسئلة في هذا القسم
      const { data: allQuestionsData, error: allQuestionsError } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('subject', 'english')
        .eq('section_number', parseInt(sectionNumber))
        .eq('is_active', true);

      if (allQuestionsError) {
        console.error('Error fetching all questions:', allQuestionsError);
      }

      const totalQuestions = allQuestionsData?.length || 15;
      console.log('Total questions in section:', totalQuestions);
      
      const isCompleted = correctAnswersCount >= totalQuestions;
      console.log('Section completed:', isCompleted);

      // تحديث أو إنشاء تقدم المستخدم
      const { error: progressError } = await supabase
        .from('user_quiz_progress')
        .upsert({
          user_id: userDbId,
          subject: 'english',
          section_number: parseInt(sectionNumber),
          completed_questions: correctAnswersCount,
          is_completed: isCompleted
        });

      if (progressError) {
        console.error('Error updating progress:', progressError);
      } else {
        console.log('Progress updated successfully');
      }

      // حفظ نتيجة الكويز
      const { error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userDbId,
          subject: 'english',
          score: score,
          total_questions: questions.length,
          points_earned: pointsEarned,
          time_taken: 300 - timeLeft,
          answers: JSON.stringify(quizResults)
        });

      if (resultError) {
        console.error('Error saving quiz result:', resultError);
      } else {
        console.log('Quiz result saved successfully');
      }

      // تحديث نقاط المستخدم
      const { data: currentUserData, error: fetchUserError } = await supabase
        .from('users')
        .select('quiz_points, total_points')
        .eq('telegram_id', user.id)
        .single();

      if (!fetchUserError && currentUserData) {
        const newQuizPoints = (currentUserData.quiz_points || 0) + pointsEarned;
        const newTotalPoints = (currentUserData.total_points || 0) + pointsEarned;

        const { error: updateError } = await supabase
          .from('users')
          .update({
            quiz_points: newQuizPoints,
            total_points: newTotalPoints
          })
          .eq('telegram_id', user.id);

        if (updateError) {
          console.error('Error updating user points:', updateError);
        } else {
          console.log('User points updated successfully');
        }
      }

    } catch (error) {
      console.error('Unexpected error completing quiz:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (quizCompleted || questions.length === 0) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="pt-8">
          <div className="flex items-center mb-6">
            <Button
              onClick={() => navigate('/quiz/english')}
              variant="ghost"
              size="icon"
              className="text-white ml-2"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">نتيجة القسم {sectionNumber}</h1>
          </div>

          <div className="glass rounded-2xl p-6 mb-6 text-center">
            <div className="text-6xl mb-4">
              {score >= questions.length * 0.8 ? '🎉' : score >= questions.length * 0.6 ? '👍' : '📚'}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {score >= questions.length * 0.8 ? 'ممتاز!' : score >= questions.length * 0.6 ? 'جيد!' : 'تحتاج للمراجعة'}
            </h2>
            <div className="text-lg text-white mb-2">
              النتيجة: {score} من {questions.length}
            </div>
            <div className="text-lg text-white mb-4">
              النقاط المكتسبة: {score * 10}
            </div>
            <div className="text-green-400 font-bold">
              🔓 تم إكمال القسم وفتح القسم التالي!
            </div>
          </div>

          <Button
            onClick={() => navigate('/quiz/english')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            العودة للأقسام
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              onClick={() => navigate('/quiz/english')}
              variant="ghost"
              size="icon"
              className="text-white ml-2"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">القسم {sectionNumber}</h1>
          </div>
          <div className="flex items-center text-white">
            <Clock className="w-4 h-4 ml-1" />
            <span className="text-sm">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>السؤال {currentQuestion + 1} من {questions.length}</span>
            <span>النقاط: {score * 10}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">{currentQ.question}</h2>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-right rounded-xl border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-purple-400 bg-purple-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-white hover:border-white/40'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
        >
          {currentQuestion < questions.length - 1 ? 'السؤال التالي' : 'إنهاء القسم'}
        </Button>
      </div>
    </div>
  );
};

export default EnglishQuizSection;
