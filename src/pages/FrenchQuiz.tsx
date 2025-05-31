import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { frenchQuestions } from "@/data/quizData";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";

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
    
    if (currentQuestion < frenchQuestions.length - 1) {
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
      if (answer === frenchQuestions[index].correctAnswer) {
        correctCount++;
      }
    });
    const finalScore = correctCount * 5; // 5 نقاط لكل إجابة صحيحة
    setScore(correctCount);
    setQuizCompleted(true);

    // حفظ النتائج في قاعدة البيانات
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
      console.log('Saving French quiz result - Score:', finalScore, 'User ID:', user.id);

      // حفظ نتيجة الكويز
      const { error: quizError } = await supabase
        .from('quiz_results')
        .insert({
          user_id: user.id.toString(),
          subject: 'french',
          score: finalScore,
          total_questions: frenchQuestions.length,
          points_earned: finalScore,
          answers: finalAnswers,
        });

      if (quizError) {
        console.error('Error saving French quiz result:', quizError);
        return;
      }

      // الحصول على النقاط الحالية للمستخدم
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('quiz_points, total_points')
        .eq('telegram_id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching current user:', userError);
        return;
      }

      // تحديث نقاط المستخدم
      const newQuizPoints = (currentUser?.quiz_points || 0) + finalScore;
      const newTotalPoints = (currentUser?.total_points || 0) + finalScore;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          quiz_points: newQuizPoints,
          total_points: newTotalPoints,
        })
        .eq('telegram_id', user.id);

      if (updateError) {
        console.error('Error updating user points:', updateError);
      } else {
        console.log('French quiz completed successfully! Total points:', newTotalPoints);
      }

    } catch (error) {
      console.error('Error saving French quiz result:', error);
    }
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen gradient-bg p-6 flex items-center justify-center">
        <div className="glass rounded-2xl p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-white mb-4">كويز اللغة الفرنسية</h1>
          <div className="text-white/80 text-sm space-y-3 mb-6">
            <p>سيتم طرح 10 أسئلة عليك</p>
            <p>مدة كل سؤال 30 ثانية</p>
            <p>كل إجابة صحيحة = 5 نقاط</p>
            <p>إجمالي النقاط المحتملة: 50 نقطة</p>
          </div>
          <Button onClick={startQuiz} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
            ابدأ الكويز
          </Button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const mistakes = answers.map((answer, index) => ({
      question: frenchQuestions[index],
      userAnswer: answer,
      isCorrect: answer === frenchQuestions[index].correctAnswer
    })).filter(item => !item.isCorrect);

    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="pt-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-4">نتائج الكويز</h1>
            <div className="glass rounded-2xl p-6 mb-4">
              <div className="text-3xl font-bold text-white mb-2">{score}/10</div>
              <div className="text-white/80">النتيجة النهائية</div>
              <div className="text-yellow-300 font-bold mt-2">{score * 5} نقطة</div>
            </div>
          </div>

          {mistakes.length > 0 && (
            <div className="glass rounded-2xl p-4 mb-6">
              <h3 className="font-bold text-white mb-4">الأخطاء:</h3>
              {mistakes.map((mistake, index) => (
                <div key={index} className="mb-4 p-3 bg-red-500/20 rounded-xl">
                  <p className="text-white font-medium mb-2">{mistake.question.question}</p>
                  <p className="text-red-300 text-sm">إجابتك: {mistake.userAnswer >= 0 ? mistake.question.options[mistake.userAnswer] : 'لم تجب'}</p>
                  <p className="text-green-300 text-sm">الإجابة الصحيحة: {mistake.question.options[mistake.question.correctAnswer]}</p>
                </div>
              ))}
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
    <div className="min-h-screen gradient-bg p-6">
      <div className="pt-8">
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

        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white/80 text-sm">السؤال {currentQuestion + 1} من {frenchQuestions.length}</span>
            <div className="text-yellow-300 text-sm font-bold">5 نقاط</div>
          </div>

          <h2 className="text-xl font-bold text-white mb-6">
            {frenchQuestions[currentQuestion].question}
          </h2>

          <div className="space-y-3 mb-6">
            {frenchQuestions[currentQuestion].options.map((option, index) => (
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
            {currentQuestion < frenchQuestions.length - 1 ? 'السؤال التالي' : 'إنهاء الكويز'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FrenchQuiz;
