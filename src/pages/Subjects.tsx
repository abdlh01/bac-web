
const Subjects = () => {
  const subjects = [
    // سطر 1 (مادتان)
    [
      { name: "الرياضيات", url: "https://t.me/MyBACPlus_bot?start=ade0b2d4c52b45603d2aaa5c5df05241" },
      { name: "الفيزياء", url: "https://t.me/MyBACPlus_bot?start=03583554a0509561721fd7f39e0a3276" }
    ],
    // سطر 2 (مادة واحدة)
    [
      { name: "العلوم الطبيعية والحياة", url: "https://t.me/MyBACPlus_bot?start=937c174a26b2903e46326f4272a10dea" }
    ],
    // سطر 3 (مادتان)
    [
      { name: "اللغة العربية", url: "https://t.me/MyBACPlus_bot?start=996ec67d39262f08c47b98e718f772db" },
      { name: "الشريعة", url: "https://t.me/MyBACPlus_bot?start=bfb988d4360c01ed909d87ffad7f91a6" }
    ],
    // سطر 4 (مادتان)
    [
      { name: "اللغة الإنجليزية", url: "https://t.me/MyBACPlus_bot?start=cd044038285deedab5acd3850ac77d34" },
      { name: "اللغة الفرنسية", url: "https://t.me/MyBACPlus_bot?start=0afc0be82ea23c573b941a33c36a157d" }
    ],
    // سطر 5 (ثلاث مواد)
    [
      { name: "الإيطالية", url: "https://t.me/MyBACPlus_bot?start=e43349cf9bd623b3dc5b35b714c2be71" },
      { name: "الألمانية", url: "https://t.me/MyBACPlus_bot?start=ed06afec88bac8b194f9cd2c05b646f8" },
      { name: "الإسبانية", url: "https://t.me/MyBACPlus_bot?start=bb9ddea96347baa0836948029a81421f" }
    ],
    // سطر 6 (مادتان)
    [
      { name: "الفلسفة", url: "https://t.me/MyBACPlus_bot?start=40bf252f6d90058e18af794e8bedbd12" },
      { name: "الاجتماعيات", url: "https://t.me/MyBACPlus_bot?start=e81a234cdbe94c5dfab425618594bb07" }
    ],
    // سطر 7 (ثلاث مواد)
    [
      { name: "المحاسبة", url: "https://t.me/MyBACPlus_bot?start=c8dad1d6bee5890f84e07586dd199850" },
      { name: "القانون", url: "https://t.me/MyBACPlus_bot?start=5b28c6e5253fc1f6abd957d4218bcb82" },
      { name: "الاقتصاد", url: "https://t.me/MyBACPlus_bot?start=1509b25cb2389643d88636694130b17f" }
    ],
    // سطر 8 (مادتان)
    [
      { name: "الهندسة المدنية", url: "https://t.me/MyBACPlus_bot?start=1ee6098715e7d6d32e0cd3e08cff8edd" },
      { name: "الهندسة الكهربائية", url: "https://t.me/MyBACPlus_bot?start=ecdc8f7f7656edf708298106919229ac" }
    ],
    // سطر 9 (مادتان)
    [
      { name: "هندسة الميكانيكية", url: "https://t.me/MyBACPlus_bot?start=0f7658922b6bcd25f066ffb2a2379d32" },
      { name: "هندسة الطرائق", url: "https://t.me/MyBACPlus_bot?start=ae9d4395cc686298acb5bfbf0fe3d568" }
    ]
  ];

  const openSubject = (url: string) => {
    // فتح الرابط في نفس النافذة لتجنب الروابط المنبثقة
    window.location.href = url;
  };

  return (
    <div className="min-h-screen p-6 pt-12">
      <h1 className="text-2xl font-bold text-white text-center mb-4">البكالوريات السابقة</h1>
      
      <div className="text-center text-white/80 text-sm mb-8 px-4 leading-relaxed">
        إختر أحد المواد و سيتم توجيهك لصفحة مراسلة البوت للحصول على ما تريد
      </div>
      
      <div className="space-y-4">
        {subjects.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`grid gap-3 ${
              row.length === 1 ? 'grid-cols-1' : 
              row.length === 2 ? 'grid-cols-2' : 
              'grid-cols-3'
            }`}
          >
            {row.map((subject) => (
              <button
                key={subject.name}
                onClick={() => openSubject(subject.url)}
                className="glass rounded-xl p-4 text-white font-medium text-sm hover:bg-white/20 transition-colors duration-200"
              >
                {subject.name}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subjects;
