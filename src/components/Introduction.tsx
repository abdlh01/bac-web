
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface IntroductionProps {
  onComplete: () => void;
}

const Introduction = ({ onComplete }: IntroductionProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "مرحباً بك في تطبيق البكالوريا",
      content: "تطبيق تنافسي يساعدك على الدراسة وجمع النقاط من خلال المهام والكويزات والعداد الزمني",
      icon: "🎓"
    },
    {
      title: "النسخة الأولى",
      content: "هذه هي النسخة الأولى من التطبيق. نعمل باستمرار على تحسينه وإضافة ميزات جديدة",
      icon: "🚀"
    },
    {
      title: "من تطوير Askeladd",
      content: "تطبيق من تطوير Askeladd مؤسس فروع 4YOU. نتمنى لك تجربة رائعة في التعلم والتنافس",
      icon: "👨‍💻"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center text-white">
        <div className="mb-6">
          <div className="text-6xl mb-4">{steps[currentStep].icon}</div>
          <h2 className="text-xl font-bold mb-4">{steps[currentStep].title}</h2>
          <p className="text-sm opacity-90 leading-relaxed">{steps[currentStep].content}</p>
        </div>

        <div className="flex justify-center space-x-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        <Button 
          onClick={nextStep}
          className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
          variant="outline"
        >
          {currentStep < steps.length - 1 ? 'التالي' : 'ابدأ الآن'}
        </Button>
      </div>
    </div>
  );
};

export default Introduction;
