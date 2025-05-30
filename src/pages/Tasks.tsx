
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Check } from "lucide-react";

const Tasks = () => {
  const navigate = useNavigate();
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  const tasks = [
    {
      id: 1,
      title: "اشترك في قناة Askeladd",
      description: "قناة شخصية تحتوي على محتوى تعليمي ومفيد",
      url: "https://t.me/Askeladd_Channel",
      points: 50
    },
    {
      id: 2,
      title: "اشترك في قناة البكالوريا",
      description: "قناة مخصصة لطلاب البكالوريا مع نصائح ومراجعات",
      url: "https://t.me/bac4youu",
      points: 50
    },
    {
      id: 3,
      title: "اشترك في قناة التقنية",
      description: "قناة تقنية تحتوي على آخر الأخبار والتطورات",
      url: "https://t.me/xx_4you",
      points: 50
    }
  ];

  const handleTaskComplete = (taskId: number) => {
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks([...completedTasks, taskId]);
      // هنا يمكن إضافة النقاط للمستخدم
    }
  };

  const openChannel = (url: string, taskId: number) => {
    window.open(url, '_blank');
    handleTaskComplete(taskId);
  };

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
          <h1 className="text-2xl font-bold text-white">المهام</h1>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="glass rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{task.title}</h3>
                  <p className="text-white/80 text-sm mb-2">{task.description}</p>
                  <div className="flex items-center text-yellow-300 text-sm">
                    <span className="ml-1">+{task.points}</span>
                    <span>نقطة</span>
                  </div>
                </div>
                {completedTasks.includes(task.id) ? (
                  <div className="bg-green-500 p-2 rounded-full">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <Button
                    onClick={() => openChannel(task.url, task.id)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4 ml-1" />
                    انتقال
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 glass rounded-2xl p-4 text-center">
          <h3 className="font-bold text-white mb-2">إجمالي النقاط المحتملة</h3>
          <div className="text-2xl font-bold text-yellow-300">
            {tasks.reduce((total, task) => total + task.points, 0)} نقطة
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
