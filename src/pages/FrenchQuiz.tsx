
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const FrenchQuiz = () => {
  const navigate = useNavigate();
  const { user } = useTelegramUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleQuizComplete();
    }
  }, [timeLeft, quizCompleted]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('subject', 'french')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }

      if (data && data.length > 0) {
        // خلط الأسئلة واختيار 15 سؤال عشوائي من 40
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffled.slice(0, 15);
        setQuestions(selectedQuestions);
      }
    } catch (error) {
      console.error('Unexpected error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correct_answer;
    
    // حفظ نتيجة السؤال
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
    
    if (!user?.id) return;

    const pointsEarned = score * 10;

    try {
      // البحث عن المستخدم في قاعدة البيانات
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, quiz_points, total_points')
        .eq('telegram_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('User not found:', userError);
        return;
      }

      // حفظ نتيجة الكويز
      const { error: resultError } = await supabase
        .from('quiz_results')
        .insert({
          user_id: userData.id,
          subject: 'french',
          score: score,
          total_questions: questions.length,
          points_earned: pointsEarned,
          time_taken: 300 - timeLeft,
          answers: JSON.stringify(quizResults)
        });

      if (resultError) {
        console.error('Error saving quiz result:', resultError);
        return;
      }

      // تحديث نقاط المستخدم
      const newQuizPoints = (userData.quiz_points || 0) + pointsEarned;
      const newTotalPoints = (userData.total_points || 0) + pointsEarned;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          quiz_points: newQuizPoints,
          total_points: newTotalPoints
        })
        .eq('telegram_id', user.id);

      if (updateError) {
        console.error('Error updating user points:', updateError);
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

  if (quizCompleted) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="pt-8">
          <div className="flex items-center mb-6">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              className="text-white ml-2"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">نتيجة الكويز</h1>
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
            <div className="text-sm text-white/80">
              الوقت المستغرق: {formatTime(300 - timeLeft)}
            </div>
          </div>

          {/* عرض الأخطاء */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">مراجعة الإجابات</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {quizResults.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-white font-medium">السؤال {index + 1}</span>
                    {result.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="text-white/90 text-sm mb-2">{result.question}</div>
                  {!result.isCorrect && (
                    <div className="space-y-1">
                      <div className="text-red-300 text-sm">إجابتك: {result.selectedAnswerText}</div>
                      <div className="text-green-300 text-sm">الإجابة الصحيحة: {result.correctAnswer}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => navigate('/quiz')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            العودة للمواد
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-lg">لا توجد أسئلة متاحة</div>
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
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              className="text-white ml-2"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">كويز اللغة الفرنسية</h1>
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
          {currentQuestion < questions.length - 1 ? 'السؤال التالي' : 'إنهاء الكويز'}
        </Button>
      </div>
    </div>
  );
};

export default FrenchQuiz;
