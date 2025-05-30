
const Ranking = () => {
  const topThree = [
    { rank: 1, name: "فاطمة أحمد", points: 2850, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face" },
    { rank: 2, name: "محمد علي", points: 2640, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    { rank: 3, name: "سارة حسن", points: 2420, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" }
  ];

  const otherRanks = [
    { rank: 4, name: "أمير خالد", points: 2200 },
    { rank: 5, name: "نور الدين", points: 2100 },
    { rank: 6, name: "ليلى مراد", points: 1980 },
    { rank: 7, name: "يوسف محمد", points: 1850 },
    { rank: 8, name: "هدى سالم", points: 1720 },
    { rank: 9, name: "كريم أحمد", points: 1650 },
    { rank: 10, name: "زينب علي", points: 1580 }
  ];

  const currentUser = { rank: 15, name: "أنت", points: 1250 };
  const pointsNeeded = otherRanks[otherRanks.length - 1].points - currentUser.points + 1;

  return (
    <div className="min-h-screen p-6 pt-12">
      <h1 className="text-2xl font-bold text-white text-center mb-8">التصنيف</h1>

      {/* الثلاثة الأوائل */}
      <div className="flex justify-center items-end mb-8 space-x-4">
        {/* المركز الثاني */}
        <div className="text-center">
          <div className="glass rounded-xl p-3 mb-2">
            <img src={topThree[1].avatar} alt={topThree[1].name} className="w-16 h-16 rounded-full mx-auto mb-2" />
            <div className="text-white font-bold text-sm">{topThree[1].name}</div>
            <div className="text-yellow-300 text-xs">{topThree[1].points}</div>
          </div>
          <div className="bg-gray-400 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto">2</div>
        </div>

        {/* المركز الأول */}
        <div className="text-center -mt-4">
          <div className="glass rounded-xl p-4 mb-2">
            <img src={topThree[0].avatar} alt={topThree[0].name} className="w-20 h-20 rounded-full mx-auto mb-2" />
            <div className="text-white font-bold">{topThree[0].name}</div>
            <div className="text-yellow-300">{topThree[0].points}</div>
          </div>
          <div className="bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mx-auto">1</div>
        </div>

        {/* المركز الثالث */}
        <div className="text-center">
          <div className="glass rounded-xl p-3 mb-2">
            <img src={topThree[2].avatar} alt={topThree[2].name} className="w-16 h-16 rounded-full mx-auto mb-2" />
            <div className="text-white font-bold text-sm">{topThree[2].name}</div>
            <div className="text-yellow-300 text-xs">{topThree[2].points}</div>
          </div>
          <div className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto">3</div>
        </div>
      </div>

      {/* الترتيب من 4-10 */}
      <div className="glass rounded-2xl p-4 mb-6">
        {otherRanks.map((user) => (
          <div key={user.rank} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm ml-3">
                {user.rank}
              </div>
              <span className="text-white font-medium">{user.name}</span>
            </div>
            <div className="text-yellow-300 font-bold">{user.points}</div>
          </div>
        ))}
      </div>

      {/* ترتيب المستخدم الحالي */}
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm ml-3">
              {currentUser.rank}
            </div>
            <span className="text-white font-bold">{currentUser.name}</span>
          </div>
          <div className="text-yellow-300 font-bold">{currentUser.points}</div>
        </div>
      </div>

      {/* رسالة التحفيز */}
      <div className="text-center text-white/80 text-sm">
        تحتاج إلى <span className="text-yellow-300 font-bold">{pointsNeeded}</span> نقطة للدخول مع الـ10 الأوائل اجتهد
      </div>
    </div>
  );
};

export default Ranking;
