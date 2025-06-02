
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Loading from "./pages/Loading";
import Introduction from "./components/Introduction";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Counter from "./pages/Counter";
import Ranking from "./pages/Ranking";
import Quiz from "./pages/Quiz";
import Subjects from "./pages/Subjects";
import Tasks from "./pages/Tasks";
import Referrals from "./pages/Referrals";
import EnglishQuiz from "./pages/EnglishQuiz";
import FrenchQuiz from "./pages/FrenchQuiz";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // محاكاة تحميل التطبيق
    const timer = setTimeout(() => {
      setIsLoading(false);
      // فحص إذا كانت أول مرة للمستخدم
      const hasVisited = localStorage.getItem('hasVisited');
      if (!hasVisited) {
        setShowIntro(true);
        localStorage.setItem('hasVisited', 'true');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (showIntro) {
    return <Introduction onComplete={handleIntroComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="counter" element={<Counter />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="subjects" element={<Subjects />} />
            </Route>
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="/quiz/english" element={<EnglishQuiz />} />
            <Route path="/quiz/french" element={<FrenchQuiz />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
