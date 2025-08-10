// 会員データの初期データと管理機能

export const initialMembers = [
  {
    id: 1,
    memberId: "2025081234", // 西暦+月+免許証番号下4桁
    email: "test@example.com",
    licenseLastFour: "1234",
    registrationDate: new Date("2025-08-01").toISOString(),
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
  },

  // 免許証有効期限チェック関数
  isLicenseExpired: (expiryDate) => {
    if (!expiryDate) return true;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry <= today;
  },

  // 免許証有効期限まで日数計算
  getDaysUntilExpiry: (expiryDate) => {
    if (!expiryDate) return -1;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // 免許証ステータスが予約可能かチェック
  canMakeReservation: (member) => {
    if (!member?.profile?.driverLicense) return false;
    
    const license = member.profile.driverLicense;
    
    // 審査が承認されているかチェック
    if (license.verificationStatus !== 'approved') return false;
    
    // 有効期限チェック
    if (memberUtils.isLicenseExpired(license.expiryDate)) return false;
    
    return true;
  },

  // 招待コード生成
  generateInviteCode: (memberId) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code + memberId;
  }
};