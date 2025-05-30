import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

const EnglishQuiz = () => {
  const navigate = useNavigate();
  const { user } = useTelegramUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('subject', 'english')
        .eq('is_active', true)
        .limit(10);

      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }

      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        console.log('No questions found in database, using fallback data');
        // استخدام بيانات احتياطية
        setQuestions([
          {
            id: "1",
            question: "What does 'corruption' mean?",
            options: ["النزاهة", "الفساد", "العدالة", "الصدق"],
            correct_answer: 1
          },
          {
            id: "2", 
            question: "What is the opposite of 'healthy'?",
            options: ["صحي", "مريض", "قوي", "نشط"],
            correct_answer: 1
          }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizStarted && !quizFinished && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
  }, [timeLeft, quizStarted, quizFinished]);

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(30);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    const currentAnswers = [...answers, selectedAnswer ?? -1];
    setAnswers(currentAnswers);

    if (selectedAnswer === questions[currentQuestion]?.correct_answer) {
      setScore(score + 5);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      setQuizFinished(true);
      await saveQuizResult(currentAnswers);
    }
  };

  const saveQuizResult = async (finalAnswers: number[]) => {
    if (!user) return;

    try {
      const finalScore = finalAnswers.reduce((acc, answer, index) => {
        return answer === questions[index]?.correct_answer ? acc + 5 : acc;
      }, 0);

      // حفظ نتيجة الكويز
      await supabase
        .from('quiz_results')
        .insert({
          user_id: user.id.toString(),
          subject: 'english',
          score: finalScore,
          total_questions: questions.length,
          points_earned: finalScore,
          answers: finalAnswers,
        });

      // تحديث نقاط المستخدم
      const { data: currentUser } = await supabase
        .from('users')
        .select('quiz_points, total_points')
        .eq('telegram_id', user.id)
        .single();

      const newQuizPoints = (currentUser?.quiz_points || 0) + finalScore;
      const newTotalPoints = (currentUser?.total_points || 0) + finalScore;

      await supabase
        .from('users')
        .update({
          quiz_points: newQuizPoints,
          total_points: newTotalPoints,
        })
        .eq('telegram_id', user.id);

    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-lg">جاري تحميل الأسئلة...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-4">لا توجد أسئلة متاحة حالياً</h2>
          <Button onClick={() => navigate('/quiz')} className="bg-white/20 hover:bg-white/30">
            العودة للكويز
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={() => navigate('/quiz')}
          variant="ghost"
          className="text-white hover:bg-white/20 p-2"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-white">اللغة الإنجليزية</h1>
        <div></div>
      </div>

      {!quizStarted ? (
        <div className="text-center max-w-md mx-auto">
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">استعد للكويز!</h2>
            <p className="text-white/80 mb-4">
              سيتم سؤالك {questions.length} أسئلة حول اللغة الإنجليزية
            </p>
            <p className="text-white/80 mb-4">
              لديك 30 ثانية لكل سؤال
            </p>
            <p className="text-white/80 mb-6">
              كل إجابة صحيحة = 5 نقاط
            </p>
          </div>
          
          <Button
            onClick={startQuiz}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3"
          >
            بدء الكويز
          </Button>
        </div>
      ) : quizFinished ? (
        <div className="text-center max-w-md mx-auto">
          <div className="glass rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">انتهى الكويز!</h2>
            <div className="text-4xl font-bold text-yellow-300 mb-2">{score}</div>
            <p className="text-white/80 mb-4">نقطة من {questions.length * 5}</p>
            <p className="text-white/80 mb-6">
              نسبة النجاح: {Math.round((score / (questions.length * 5)) * 100)}%
            </p>
          </div>

          <div className="space-y-2 mb-6">
            {questions.map((question, index) => (
              <div key={question.id} className="glass rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">السؤال {index + 1}</span>
                  <span className={`text-sm ${answers[index] === question.correct_answer ? 'text-green-400' : 'text-red-400'}`}>
                    {answers[index] === question.correct_answer ? '✓ صحيح' : '✗ خطأ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => navigate('/quiz')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
          >
            العودة للكويز
          </Button>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {/* Timer and Progress */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-white">
              <Clock className="w-5 h-5 ml-2" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
            <div className="text-white">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          {/* Question */}
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              {questions[currentQuestion]?.question}
            </h3>

            <div className="space-y-3">
              {questions[currentQuestion]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-white/30 bg-white/10 text-white hover:border-white/50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3"
          >
            {currentQuestion + 1 === questions.length ? 'إنهاء الكويز' : 'السؤال التالي'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnglishQuiz;
