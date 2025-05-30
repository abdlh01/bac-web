
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && !isFinished && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isStarted, isFinished]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('subject', 'english')
        .eq('is_active', true)
        .limit(10);

      if (data && !error) {
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, selectedAnswer ?? -1];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (finalAnswers[index] === question.correct_answer) {
        correctCount++;
      }
    });

    const finalScore = correctCount;
    const pointsEarned = correctCount * 5;
    setScore(finalScore);
    setIsFinished(true);

    // حفظ النتيجة في قاعدة البيانات
    if (user) {
      try {
        await supabase
          .from('quiz_results')
          .insert({
            user_id: user.id.toString(),
            subject: 'english',
            score: finalScore,
            total_questions: questions.length,
            points_earned: pointsEarned,
            answers: finalAnswers,
            time_taken: (questions.length * 30) - timeLeft,
          });

        // تحديث نقاط المستخدم
        const { data: userData } = await supabase
          .from('users')
          .select('quiz_points')
          .eq('telegram_id', user.id)
          .single();

        if (userData) {
          await supabase
            .from('users')
            .update({
              quiz_points: (userData.quiz_points || 0) + pointsEarned,
            })
            .eq('telegram_id', user.id);
        }
      } catch (error) {
        console.error('Error saving quiz result:', error);
      }
    }
  };

  const startQuiz = () => {
    setIsStarted(true);
    setTimeLeft(30);
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
          <h2 className="text-xl mb-4">لا توجد أسئلة متاحة حالياً</h2>
          <Button onClick={() => navigate('/quiz')} className="bg-white/20 hover:bg-white/30">
            العودة
          </Button>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="text-center text-white max-w-md">
          <h1 className="text-2xl font-bold mb-4">كويز اللغة الإنجليزية</h1>
          <p className="mb-6">
            سيتم طرح 10 أسئلة عليك. لديك 30 ثانية للإجابة على كل سؤال.
            كل إجابة صحيحة تحصل على 5 نقاط.
          </p>
          <Button onClick={startQuiz} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
            بدء الكويز
          </Button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="text-center text-white max-w-md">
          <h1 className="text-2xl font-bold mb-4">انتهى الكويز!</h1>
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="text-3xl font-bold mb-2">{score}/{questions.length}</div>
            <div className="text-lg mb-2">النقاط المكتسبة: {score * 5}</div>
          </div>
          
          <div className="text-right mb-6">
            <h3 className="text-lg font-bold mb-4">مراجعة الأخطاء:</h3>
            {questions.map((question, index) => (
              answers[index] !== question.correct_answer && (
                <div key={question.id} className="glass rounded-xl p-4 mb-3 text-right">
                  <p className="font-medium mb-2">{question.question}</p>
                  <p className="text-red-300">إجابتك: {question.options[answers[index]] || "لم تجب"}</p>
                  <p className="text-green-300">الإجابة الصحيحة: {question.options[question.correct_answer]}</p>
                </div>
              )
            ))}
          </div>

          <Button onClick={() => navigate('/quiz')} className="bg-blue-600 hover:bg-blue-700 text-white">
            العودة للكويز
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen gradient-bg p-6 pt-12">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <span className="text-white">السؤال {currentQuestion + 1}/{questions.length}</span>
          <span className="text-white font-bold text-xl">{timeLeft}s</span>
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-white text-lg font-medium mb-6 text-right">
            {currentQ.question}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full p-4 rounded-xl text-right transition-all ${
                  selectedAnswer === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
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
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white"
        >
          {currentQuestion < questions.length - 1 ? 'السؤال التالي' : 'إنهاء الكويز'}
        </Button>
      </div>
    </div>
  );
};

export default EnglishQuiz;
