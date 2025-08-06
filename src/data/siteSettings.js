// サイト設定データ
export const initialSiteSettings = {
  hero: {
    title: "車・バイクレンタル RentalEasy",
    subtitle: "お手軽価格で快適な移動体験を",
    description: "最新の車両とバイクを、お客様のニーズに合わせてご提供。短時間から長期まで、柔軟なレンタルプランをご用意しています。",
  },
  features: [
    {
      title: "🚗 多彩な車両",
      description: "軽自動車からSUVまで"
    },
    {
      title: "🏍️ バイクも充実",
      description: "原付からスポーツバイクまで"
    },
    {
      title: "💰 お手軽価格",
      description: "業界最安水準の料金体系"
    },
    {
      title: "📱 簡単予約",
      description: "オンラインで即座に予約完了"
    }
  ],
  contact: {
    phone: "03-1234-5678",
    email: "info@rentaleasy.com",
    address: "東京都渋谷区xxx-xxx",
    businessHours: {
      weekday: "平日: 9:00 - 18:00",
      weekend: "土日祝: 9:00 - 17:00"
    }
  },
  services: [
    "・車両レンタル",
    "・バイクレンタル",
    "・配車サービス",
    "・24時間サポート"
  ]
};

// サイト設定管理ユーティリティ
export const siteSettingsManager = {
  // 設定を取得
  getSettings: () => {
    const saved = localStorage.getItem('rentalEasySiteSettings');
    return saved ? JSON.parse(saved) : initialSiteSettings;
  },

  // 設定を保存
  saveSettings: (settings) => {
    localStorage.setItem('rentalEasySiteSettings', JSON.stringify(settings));
  },

  // 設定をリセット
  resetSettings: () => {
    localStorage.removeItem('rentalEasySiteSettings');
    return initialSiteSettings;
  }
};