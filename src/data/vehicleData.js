export const vehicleData = [
  {
    id: 1,
    name: "トヨタ プリウス",
    type: "car",
    category: "エコカー",
    price: 8000,
    image: "https://via.placeholder.com/300x200?text=%E3%83%97%E3%83%AA%E3%82%A6%E3%82%B9",
    description: "燃費抜群のハイブリッドカー。街乗りから長距離まで快適。",
    specifications: {
      seats: 5,
      transmission: "AT",
      fuelType: "ハイブリッド",
      cc: 1800
    },
    available: true
  },
  {
    id: 2,
    name: "ホンダ フリード",
    type: "car",
    category: "ミニバン",
    price: 9500,
    image: "https://via.placeholder.com/300x200?text=%E3%83%95%E3%83%AA%E3%83%BC%E3%83%89",
    description: "コンパクトなミニバン。家族での移動に最適。",
    specifications: {
      seats: 6,
      transmission: "AT",
      fuelType: "ガソリン",
      cc: 1500
    },
    available: true
  },
  {
    id: 3,
    name: "日産 軽自動車",
    type: "car",
    category: "軽自動車",
    price: 6000,
    image: "https://via.placeholder.com/300x200?text=%E8%BB%BD%E8%87%AA%E5%8B%95%E8%BB%8A",
    description: "小回りが利いて運転しやすい軽自動車。",
    specifications: {
      seats: 4,
      transmission: "AT",
      fuelType: "ガソリン",
      cc: 660
    },
    available: true
  },
  {
    id: 4,
    name: "BMW X3",
    type: "car",
    category: "SUV",
    price: 15000,
    image: "https://via.placeholder.com/300x200?text=BMW+X3",
    description: "高級SUV。快適な乗り心地と上質な内装。",
    specifications: {
      seats: 5,
      transmission: "AT",
      fuelType: "ガソリン",
      cc: 2000
    },
    available: true
  },
  {
    id: 5,
    name: "ヤマハ MT-07",
    type: "motorcycle",
    category: "スポーツバイク",
    price: 4000,
    image: "https://via.placeholder.com/300x200?text=MT-07",
    description: "扱いやすいスポーツバイク。初心者から上級者まで。",
    specifications: {
      seats: 2,
      transmission: "MT",
      fuelType: "ガソリン",
      cc: 689
    },
    available: true
  },
  {
    id: 6,
    name: "ホンダ PCX160",
    type: "motorcycle",
    category: "スクーター",
    price: 3000,
    image: "https://via.placeholder.com/300x200?text=PCX160",
    description: "通勤や街乗りに最適なスクーター。",
    specifications: {
      seats: 2,
      transmission: "AT",
      fuelType: "ガソリン",
      cc: 157
    },
    available: true
  },
  {
    id: 7,
    name: "カワサキ Ninja 400",
    type: "motorcycle",
    category: "スポーツバイク",
    price: 5000,
    image: "https://via.placeholder.com/300x200?text=Ninja+400",
    description: "本格的なスポーツバイク。爽快な走りを楽しめます。",
    specifications: {
      seats: 2,
      transmission: "MT",
      fuelType: "ガソリン",
      cc: 399
    },
    available: true
  },
  {
    id: 8,
    name: "ハーレーダビッドソン",
    type: "motorcycle",
    category: "クルーザー",
    price: 8000,
    image: "https://via.placeholder.com/300x200?text=%E3%83%8F%E3%83%BC%E3%83%AC%E3%83%BC",
    description: "アメリカンバイクの代表格。独特の乗り味。",
    specifications: {
      seats: 2,
      transmission: "MT",
      fuelType: "ガソリン",
      cc: 883
    },
    available: false
  }
];

export const vehicleCategories = {
  car: ["エコカー", "ミニバン", "軽自動車", "SUV", "セダン", "コンパクト"],
  motorcycle: ["スポーツバイク", "スクーター", "クルーザー", "オフロード", "ツアラー"]
};