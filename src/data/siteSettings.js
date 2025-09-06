// サイト設定データ
export const initialSiteSettings = {
  branding: {
    siteName: "RentalEasy"
    // siteIcon関連は削除（MBロゴを使用しない）
  },
  hero: {
    title: "車・バイクレンタル RentalEasy",
    subtitle: "お手軽価格で快適な移動体験を - AWS CDK自動デプロイ対応",
    description: "最新の車両とバイクを、お客様のニーズに合わせてご提供。短時間から長期まで、柔軟なレンタルプランをご用意しています。",
    backgroundImages: [], // カスタム背景画像（Base64形式の配列）
    useDefaultImages: true // デフォルト画像を使用するか
  },
  tiles: {
    carImage: null, // カスタム車タイル画像（Base64形式）
    bikeImage: null, // カスタムバイクタイル画像（Base64形式）
    useDefaultImages: true // デフォルト画像を使用するか
  },
  announcements: [
    {
      id: 1,
      date: '2024-12-10',
      title: 'サービス開始のお知らせ',
      content: 'RentalEasyのサービスを開始しました。お客様に安心で快適なレンタルサービスを提供いたします。',
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
      content: '新規会員登録キャンペーン実施中！初回利用で20%オフの特典がございます。この機会にぶひご利用ください。',
      published: true
    }
  ],
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
  ],
  terms: {
    title: "利用規約",
    content: `第1条（適用）
本規約は、RentalEasyが提供するレンタカー・レンタバイクサービス（以下「本サービス」という）の利用に関して適用されます。

第2条（利用登録）
本サービスを利用しようとする方は、本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。

第3条（禁止事項）
利用者は、本サービスの利用にあたり、以下の行為をしてはなりません。
- 法令または公序良俗に違反する行為
- 犯罪行為に関連する行為
- 当社のサーバーやネットワークの機能を破壊したり、妨害したりする行為
- 当社のサービスの運営を妨害するおそれのある行為

第4条（本サービスの提供の停止等）
当社は、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。

第5条（保証の否認および免責事項）
当社は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しておりません。

第6条（サービス内容の変更等）
当社は、利用者に通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによって利用者に生じた損害について一切の責任を負いません。`
  },
  privacy: {
    title: "プライバシーポリシー",
    content: `RentalEasy（以下「当社」という）は、本ウェブサイト上で提供するサービスにおける、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」という）を定めます。

第1条（個人情報）
「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。

第2条（個人情報の収集方法）
当社は、ユーザーが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレス、銀行口座番号、クレジットカード番号、運転免許証番号などの個人情報をお尋ねすることがあります。

第3条（個人情報を収集・利用する目的）
当社が個人情報を収集・利用する目的は、以下のとおりです。
- 当社サービスの提供・運営のため
- ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）
- ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため

第4条（利用目的の変更）
当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。`
  }
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

// IMPORTANT: announcementManager has been completely removed and migrated to DynamoDB API
// All announcements management should use AdminDashboard.js and announcementsAPI
// このファイルにはお知らせ管理機能は含まれていません - キャッシュクリア目的の更新