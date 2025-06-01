import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ExternalLink, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTelegramUser } from "@/hooks/useTelegramUser";

const Tasks = () => {
  const navigate = useNavigate();
  const { user } = useTelegramUser();
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
      fetchCompletedTasks();
    }
  }, [user?.id]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching tasks:', error);
        // استخدام المهام الافتراضية إذا فشل الجلب من قاعدة البيانات
        setTasks([
          {
            id: '1',
            title: "اشترك في قناة Askeladd",
            description: "قناة شخصية تحتوي على محتوى تعليمي ومفيد",
            channel_url: "https://t.me/Askeladd_Channel",
            points: 50
          },
          {
            id: '2',
            title: "اشترك في قناة البكالوريا",
            description: "قناة مخصصة لطلاب البكالوريا مع نصائح ومراجعات",
            channel_url: "https://t.me/bac4youu",
            points: 50
          },
          {
            id: '3',
            title: "اشترك في قناة التقنية",
            description: "قناة تقنية تحتوي على آخر الأخبار والتطورات",
            channel_url: "https://t.me/xx_4you",
            points: 50
          }
        ]);
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching tasks:', error);
    }
  };

  const fetchCompletedTasks = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .select('task_id')
        .eq('user_id', user.id.toString());

      if (error) {
        console.error('Error fetching completed tasks:', error);
      } else {
        const completed = data?.map(item => item.task_id) || [];
        setCompletedTasks(completed);
      }
    } catch (error) {
      console.error('Unexpected error fetching completed tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string, points: number) => {
    if (!user?.id || completedTasks.includes(taskId)) {
      console.log('Task already completed or no user');
      return;
    }

    try {
      console.log('=== STARTING TASK COMPLETION ===');
      console.log('Task ID:', taskId);
      console.log('User ID:', user.id);
      console.log('Points to add:', points);

      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id, telegram_id, task_points, total_points')
        .eq('telegram_id', user.id)
        .single();

      if (userCheckError || !existingUser) {
        console.error('User not found in database:', userCheckError);
        return;
      }

      console.log('User found in database:', existingUser);

      const { data: taskCompletion, error: taskError } = await supabase
        .from('user_tasks')
        .insert({
          user_id: existingUser.id,
          task_id: taskId
        })
        .select()
        .single();

      if (taskError) {
        console.error('Error saving task completion:', taskError);
        return;
      }

      console.log('Task completion recorded:', taskCompletion);

      const newTaskPoints = (existingUser.task_points || 0) + points;
      const newTotalPoints = (existingUser.total_points || 0) + points;

      console.log('Updating points...');
      console.log('Old task points:', existingUser.task_points);
      console.log('New task points:', newTaskPoints);
      console.log('Old total points:', existingUser.total_points);
      console.log('New total points:', newTotalPoints);

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          task_points: newTaskPoints,
          total_points: newTotalPoints
        })
        .eq('telegram_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user points:', updateError);
        return;
      }

      console.log('Points updated successfully!', updatedUser);
      console.log('=== TASK COMPLETION FINISHED ===');
      
      // تحديث الواجهة بدون رسائل
      setCompletedTasks([...completedTasks, taskId]);
      
    } catch (error) {
      console.error('Unexpected error completing task:', error);
    }
  };

  const openChannel = (url: string, taskId: string, points: number) => {
    console.log('Opening channel and completing task:', { url, taskId, points });
    window.open(url, '_blank');
    handleTaskComplete(taskId, points);
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
                <div className="bg-green-500 p-2 rounded-full">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
              <Button
                onClick={() => openChannel(task.channel_url, task.id, task.points)}
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <ExternalLink className="w-4 h-4 ml-1" />
                انتقال
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 glass rounded-2xl p-4 text-center">
          <h3 className="font-bold text-white mb-2">إجمالي النقاط المحتملة</h3>
          <div className="text-2xl font-bold text-yellow-300">
            {tasks.reduce((total, task) => total + (task.points || 0), 0)} نقطة
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
