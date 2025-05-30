-- إنشاء جدول المستخدمين
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  task_points INTEGER DEFAULT 0,
  quiz_points INTEGER DEFAULT 0,
  counter_points INTEGER DEFAULT 0,
  study_hours DECIMAL DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المهام
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  channel_url TEXT NOT NULL,
  points INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول إنجاز المهام
CREATE TABLE user_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- إنشاء جدول أسئلة الكويز
CREATE TABLE quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL, -- 'english' or 'french'
  question TEXT NOT NULL,
  options TEXT[] NOT NULL, -- مصفوفة من 4 خيارات
  correct_answer INTEGER NOT NULL, -- الفهرس الصحيح (0-3)
  difficulty_level INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول نتائج الكويز
CREATE TABLE quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  points_earned INTEGER NOT NULL,
  time_taken INTEGER, -- بالثواني
  answers JSONB, -- تخزين الإجابات
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول جلسات العداد
CREATE TABLE counter_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- بالثواني
  points_earned INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- إنشاء جدول الترتيب (مطلق)
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER,
  total_points INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج المهام الأساسية
INSERT INTO tasks (title, description, channel_url, points) VALUES
('اشترك في قناة Askeladd', 'قناة شخصية تحتوي على محتوى تعليمي ومفيد', 'https://t.me/Askeladd_Channel', 50),
('اشترك في قناة البكالوريا', 'قناة مخصصة لطلاب البكالوريا مع نصائح ومراجعات', 'https://t.me/bac4youu', 50),
('اشترك في قناة التقنية', 'قناة تقنية تحتوي على آخر الأخبار والتطورات', 'https://t.me/xx_4you', 50);

-- إدراج أسئلة الإنجليزية
INSERT INTO quiz_questions (subject, question, options, correct_answer) VALUES
('english', 'What does ''corruption'' mean?', ARRAY['الفساد', 'العدالة', 'النزاهة', 'الشفافية'], 0),
('english', 'What is ''embezzlement''?', ARRAY['التبرع', 'الاختلاس', 'الاستثمار', 'التوفير'], 1),
('english', 'What does ''child labor'' mean?', ARRAY['رعاية الأطفال', 'تعليم الأطفال', 'تشغيل الأطفال', 'حماية الأطفال'], 2),
('english', 'What is ''obesity''?', ARRAY['النحافة', 'السمنة', 'الصحة', 'اللياقة'], 1),
('english', 'What does ''junk food'' mean?', ARRAY['الطعام الصحي', 'الطعام الطازج', 'الطعام غير الصحي', 'الطعام المطبوخ'], 2),
('english', 'What is the ''moon''?', ARRAY['الشمس', 'القمر', 'النجم', 'الكوكب'], 1),
('english', 'What does ''Earth'' mean?', ARRAY['المريخ', 'الزهرة', 'الأرض', 'زحل'], 2),
('english', 'What is ''bribery''?', ARRAY['الرشوة', 'الهدية', 'المكافأة', 'الجائزة'], 0),
('english', 'What does ''fraud'' mean?', ARRAY['الصدق', 'الأمانة', 'الاحتيال', 'الثقة'], 2),
('english', 'What is ''diabetes''?', ARRAY['ضغط الدم', 'السكري', 'القلب', 'الكوليسترول'], 1);

-- إدراج أسئلة الفرنسية
INSERT INTO quiz_questions (subject, question, options, correct_answer) VALUES
('french', 'Que signifie ''guerre''?', ARRAY['السلام', 'الحرب', 'المحبة', 'الوئام'], 1),
('french', 'Que veut dire ''révolution''?', ARRAY['الاستقرار', 'الثورة', 'الهدوء', 'التطور'], 1),
('french', 'Que signifie ''bataille''?', ARRAY['المعركة', 'السلام', 'الهدنة', 'التفاوض'], 0),
('french', 'Que veut dire ''soldat''?', ARRAY['المدني', 'الجندي', 'القائد', 'الطبيب'], 1),
('french', 'Que signifie ''victoire''?', ARRAY['الهزيمة', 'النصر', 'التعادل', 'الانسحاب'], 1),
('french', 'Que veut dire ''liberté''?', ARRAY['العبودية', 'الحرية', 'القيد', 'السجن'], 1),
('french', 'Que signifie ''résistance''?', ARRAY['الاستسلام', 'المقاومة', 'الخضوع', 'القبول'], 1),
('french', 'Que veut dire ''indépendance''?', ARRAY['التبعية', 'الاستقلال', 'الخضوع', 'الاحتلال'], 1),
('french', 'Que signifie ''patrie''?', ARRAY['الغربة', 'الوطن', 'المنفى', 'السفر'], 1),
('french', 'Que veut dire ''héros''?', ARRAY['الجبان', 'البطل', 'الخائف', 'الضعيف'], 1);

-- إنشاء دوال للتحديث التلقائي للترتيب
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  -- حساب إجمالي النقاط
  NEW.total_points = NEW.task_points + NEW.quiz_points + NEW.counter_points;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إنشاء محفز للتحديث التلقائي
CREATE TRIGGER trigger_update_user_points
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_points();

-- إنشاء دالة لتحديث الترتيب
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS VOID AS $$
BEGIN
  DELETE FROM leaderboard;
  
  INSERT INTO leaderboard (user_id, rank, total_points)
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY total_points DESC, created_at ASC),
    total_points
  FROM users
  WHERE total_points > 0
  ORDER BY total_points DESC, created_at ASC;
  
END;
$$ LANGUAGE plpgsql;

-- إنشاء فهارس للأداء
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_total_points ON users(total_points DESC);
CREATE INDEX idx_quiz_questions_subject ON quiz_questions(subject);
CREATE INDEX idx_quiz_results_user_subject ON quiz_results(user_id, subject);
CREATE INDEX idx_counter_sessions_user_active ON counter_sessions(user_id, is_active);

-- إعداد RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE counter_sessions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان الأساسية (يمكن تخصيصها حسب الحاجة)
CREATE POLICY "Users can view their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view public leaderboard" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can view quiz questions" ON quiz_questions
  FOR SELECT USING (is_active = true);
