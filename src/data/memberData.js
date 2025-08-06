// 会員データの初期データと管理機能

export const initialMembers = [
  {
    id: 1,
    email: "test@example.com",
    password: "password123", // 実際のアプリでは暗号化が必要
    profile: {
      name: "テストユーザー",
      nameKana: "テストユーザー",
      phone: "090-1234-5678",
      birthDate: "1990-01-01",
      address: {
        zipCode: "100-0001",
        prefecture: "東京都",
        city: "千代田区",
        street: "丸の内1-1-1"
      },
      emergencyContact: {
        name: "緊急連絡先",
        phone: "090-9876-5432",
        relationship: "家族"
      },
      driverLicense: {
        number: "123456789012",
        expiryDate: "2029-12-31",
        frontImage: null, // Base64 or file URL
        backImage: null,  // Base64 or file URL
        verificationStatus: "pending" // pending, approved, rejected
      }
    },
    preferences: {
      newsletterSubscription: true,
      smsNotification: false
    },
    membershipInfo: {
      memberNumber: "M000001",
      joinDate: "2024-01-01",
      membershipType: "regular", // regular, premium
      points: 1500
    },
    reservationHistory: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    isActive: true
  }
];

// 会員タイプの定義
export const membershipTypes = {
  regular: {
    name: "レギュラー会員",
    benefits: [
      "基本割引5%",
      "誕生日特典",
      "ポイント還元1%"
    ],
    pointMultiplier: 1
  },
  premium: {
    name: "プレミアム会員",
    benefits: [
      "基本割引10%",
      "誕生日特典",
      "ポイント還元2%",
      "優先予約",
      "無料キャンセル"
    ],
    pointMultiplier: 2
  }
};

// 会員ユーティリティ関数
export const memberUtils = {
  // 会員番号生成
  generateMemberNumber: (memberId) => {
    return `M${String(memberId).padStart(6, '0')}`;
  },
  
  // パスワード検証（簡易版）
  validatePassword: (password) => {
    return password.length >= 8;
  },
  
  // メールアドレス検証
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // 年齢計算
  calculateAge: (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },
  
  // ポイント計算
  calculatePoints: (amount, membershipType = 'regular') => {
    const multiplier = membershipTypes[membershipType].pointMultiplier;
    return Math.floor(amount * 0.01 * multiplier);
  },
  
  // 割引率取得
  getDiscountRate: (membershipType = 'regular') => {
    return membershipType === 'premium' ? 0.10 : 0.05;
  }
};