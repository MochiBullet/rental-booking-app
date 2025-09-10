// API経由でクリーンデータを復元
const API_BASE_URL = 'https://kgkjjv0rik.execute-api.ap-southeast-2.amazonaws.com/prod';

// Commit 512a7b3時点の完全にクリーンなデータ
const cleanData = {
  branding: {
    siteName: "M's BASE Rental"
  },
  hero: {
    title: "車・バイクレンタル M's BASE Rental",
    subtitle: "お手軽価格で快適な移動体験を - AWS CDK自動デプロイ対応",
    description: "最新の車両とバイクを、お客様のニーズに合わせてご提供。短時間から長期まで、柔軟なレンタルプランをご用意しています。",
    backgroundImages: [],
    useDefaultImages: true
  },
  contact: {
    phone: "03-1234-5678",
    email: "info@rentaleasy.com",
    address: "東京都渋谷区xxx-xxx",
    businessHours: {
      weekday: "平日: 9:00 - 18:00",
      weekend: "土日祝: 9:00 - 17:00"
    }
  },
  googleForms: {
    enabled: true,
    formUrl: 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdM1hGazWWkJJFFbMJBAzl-lEXE20XMtwfO_h-o7hEol8-bpw/formResponse',
    showEmbedded: true,
    embedHeight: 800
  },
  tiles: {
    carImage: null,
    bikeImage: null,
    useDefaultImages: true,
    carText: {
      title: "車",
      subtitle: "",
      description: "",
      details: ""
    },
    bikeText: {
      title: "バイクレンタル",
      subtitle: "原付から大型まで",
      description: "多様なバイクを",
      details: "お手頃価格で提供"
    }
  },
  announcements: [
    {
      id: 1,
      date: '2024-12-10',
      title: 'サービス開始のお知らせ',
      content: "M's BASE Rentalのサービスを開始しました。お客様に安心で快適なレンタルサービスを提供いたします。",
      published: true
    },
    {
      id: 2,
      date: '2024-12-08',
      title: '新車種の追加のお知らせ',
      content: '人気のコンパクトカーとSUVタイプを新たに追加しました。より幅広い選択肢でお客様のニーズにお応えします。',
      published: true
    },
    {
      id: 3,
      date: '2024-12-05',
      title: 'キャンペーン情報',
      content: '新規会員登録キャンペーン実施中！初回利用で20%オフの特典がございます。この機会にぜひご利用ください。',
      published: true
    }
  ],
  services: [
    "・カーレンタル",
    "・バイクレンタル",
    "・配車サービス",
    "・24時間サポート"
  ]
};

async function restoreCleanData() {
  console.log('🔄 クリーンデータ復元開始...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/site-settings/siteSettings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        settingKey: 'siteSettings',
        settingValue: cleanData,
        value: cleanData
      })
    });

    const result = await response.json();
    console.log('📊 API応答:', result);
    
    if (result.settingValue && Object.keys(result.settingValue).length > 0) {
      console.log('✅ クリーンデータ復元成功！');
      console.log('✅ campSpaceSettings汚染は完全に除去されました');
    } else {
      console.log('⚠️ API応答がemptyです。LocalStorage経由で対応します。');
    }
    
  } catch (error) {
    console.error('❌ 復元エラー:', error);
  }
  
  console.log('\n📋 LocalStorageもクリアしてください:');
  console.log('1. ブラウザで http://localhost:3000/clear-localstorage.html を開く');
  console.log('2. "LocalStorage完全クリア"ボタンをクリック');
  console.log('3. ページをリロード');
}

// 実行
restoreCleanData();