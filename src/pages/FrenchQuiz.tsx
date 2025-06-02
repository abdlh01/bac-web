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

const FrenchQuiz = () => {
  const navigate = useNavigate();
  const { user } = useTelegramUser();
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('subject', 'french')
        .eq('is_active', true)
        .limit(40);

      if (error) {
        console.error('Error fetching French questions:', error);
        setFallbackQuestions();
        return;
      }

      if (data && data.length > 0) {
        // خلط الأسئلة عشوائياً واختيار 40 سؤال
        const shuffled = data.sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, 40));
      } else {
        console.log('No French questions found in database, using fallback data');
        setFallbackQuestions();
      }
    } catch (error) {
      console.error('Error:', error);
      setFallbackQuestions();
    } finally {
      setLoading(false);
    }
  };

  const setFallbackQuestions = () => {
    // ... keep existing code (fallback questions from frenchQuestions)
    const fallbackQuestions = [
      {
        id: "1",
        question: "Que signifie 'bonjour'?",
        options: ["مساء الخير", "صباح الخير", "تصبح على خير", "مع السلامة"],
        correct_answer: 1
      },
      {
        id: "2",
        question: "Comment dit-on 'merci' en arabe?",
        options: ["شكراً", "عفواً", "آسف", "من فضلك"],
        correct_answer: 0
      }
    ];
    setQuestions(fallbackQuestions);
  };

  useEffect(() => {
    if (!showInstructions && !quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !quizCompleted) {
      handleNextQuestion();
    }
  }, [timeLeft, showInstructions, quizCompleted]);

  const startQuiz = () => {
    setShowInstructions(false);
    setTimeLeft(30);
  };

  const handleAnswerSelect = (answerIndex: number) => {
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
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = async (finalAnswers: number[]) => {
    let correctCount = 0;
    finalAnswers.forEach((answer, index) => {
      if (answer === questions[index].correct_answer) {
        correctCount++;
      }
    });
    const finalScore = correctCount * 5;
    setScore(correctCount);
    setQuizCompleted(true);

    if (user?.id) {
      await saveQuizResult(finalAnswers, finalScore);
    }
  };

  const saveQuizResult = async (finalAnswers: number[], finalScore: number) => {
    if (!user?.id) {
      console.log('No user ID available for saving quiz result');
      return;
    }

    try {
      console.log('=== STARTING FRENCH QUIZ SAVE ===');

      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id, telegram_id, quiz_points, total_points')
        .eq('telegram_id', user.id)
        .single();

      if (userCheckError || !existingUser) {
        console.error('User not found in database:', userCheckError);
        return;
      }

      const { data: quizResult, error: quizError } = await supabase
        .from('quiz_results')
        .insert({
          user_id: existingUser.id,
          subject: 'french',
          score: finalScore,
          total_questions: questions.length,
          points_earned: finalScore,
          answers: finalAnswers,
        })
        .select()
        .single();

      if (quizError) {
        console.error('Error saving French quiz result:', quizError);
        return;
      }

      const newQuizPoints = (existingUser.quiz_points || 0) + finalScore;
      const newTotalPoints = (existingUser.total_points || 0) + finalScore;

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          quiz_points: newQuizPoints,
          total_points: newTotalPoints,
        })
        .eq('telegram_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user points:', updateError);
      } else {
        console.log('French quiz completed successfully!', updatedUser);
        console.log('=== FRENCH QUIZ SAVE FINISHED ===');
      }

    } catch (error) {
      console.error('Error saving French quiz result:', error);
    }
  };

  const getWrongAnswers = () => {
    return questions.map((question, index) => ({
      question,
      userAnswer: answers[index],
      isCorrect: answers[index] === question.correct_answer,
      correctAnswer: question.correct_answer
    })).filter(item => !item.isCorrect);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-lg">جاري تحميل الأسئلة...</div>
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen gradient-bg p-6 flex items-center justify-center">
        <div className="glass rounded-2xl p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">كويز اللغة الفرنسية</h1>
          <div className="text-white/80 text-sm space-y-3 mb-6">
            <p>سيتم طرح {questions.length} سؤال عليك</p>
            <p>مدة كل سؤال 30 ثانية</p>
            <p>كل إجابة صحيحة = 5 نقاط</p>
            <p>إجمالي النقاط المحتملة: {questions.length * 5} نقطة</p>
          </div>
          <Button onClick={startQuiz} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            ابدأ الكويز
          </Button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="pt-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-4">نتائج الكويز</h1>
            <div className="glass rounded-2xl p-6 mb-4">
              <div className="text-3xl font-bold text-white mb-2">{score}/{questions.length}</div>
              <div className="text-white/80">النتيجة النهائية</div>
              <div className="text-yellow-300 font-bold mt-2">{score * 5} نقطة</div>
            </div>
          </div>

          {/* عرض الأخطاء */}
          {getWrongAnswers().length > 0 && (
            <div className="glass rounded-2xl p-4 mb-6">
              <h3 className="font-bold text-white mb-4">الأخطاء ({getWrongAnswers().length}):</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {getWrongAnswers().map((mistake, index) => (
                  <div key={index} className="bg-red-500/20 rounded-xl p-3">
                    <p className="text-white font-medium mb-2 text-sm">{mistake.question.question}</p>
                    <p className="text-red-300 text-xs">
                      إجابتك: {mistake.userAnswer >= 0 ? mistake.question.options[mistake.userAnswer] : 'لم تجب'}
                    </p>
                    <p className="text-green-300 text-xs">
                      الإجابة الصحيحة: {mistake.question.options[mistake.correctAnswer]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => navigate('/quiz')}
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
            variant="outline"
          >
            العودة للكويزات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6 flex flex-col">
      <div className="pt-8 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex items-center text-white">
            <Clock className="w-4 h-4 ml-1" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 flex-1 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white/80 text-sm">السؤال {currentQuestion + 1} من {questions.length}</span>
            <div className="text-yellow-300 text-sm font-bold">5 نقاط</div>
          </div>

          <h2 className="text-xl font-bold text-white mb-6">
            {questions[currentQuestion]?.question}
          </h2>

          <div className="space-y-3 mb-6">
            {questions[currentQuestion]?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-right rounded-xl transition-all ${
                  selectedAnswer === index
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {option}
              </button>
            ))}
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
    </div>
  );
};

export default FrenchQuiz;
