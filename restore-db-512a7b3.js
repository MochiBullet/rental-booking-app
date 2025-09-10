#!/usr/bin/env node

// DynamoDBを直接操作してCommit 512a7b3時点の状態に完全復元
// AWS SDK v3を使用

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ 
  region: 'ap-southeast-2',
  // credentials: { 
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
  // }
});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'SiteSettings'; // テーブル名を確認要

// Commit 512a7b3時点の正確なデータ
const correctData = {
  siteSettings: {
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
    announcements: [
      {
        id: 1,
        date: '2024-12-10',
        title: 'サービス開始のお知らせ',
        content: 'M\'s BASE Rentalのサービスを開始しました。お客様に安心で快適なレンタルサービスを提供いたします。',
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
    services: [
      "・カーレンタル",
      "・バイクレンタル", 
      "・配車サービス",
      "・24時間サポート"
    ],
    terms: {
      title: "利用規約",
      content: `第1条（適用）
本規約は、M's BASE Rentalが提供するレンタカー・レンタバイクサービス（以下「本サービス」という）の利用に関して適用されます。

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
当社は、利用者に通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによって利用者に生じた損害について一切の責任を負いません。`,
      lastUpdated: "2024年12月1日"
    },
    privacy: {
      title: "プライバシーポリシー",
      content: `M's BASE Rental（以下「当社」という）は、本ウェブサイト上で提供するサービスにおける、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」という）を定めます。

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
当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。`,
      lastUpdated: "2024年12月1日"
    },
    rentalTerms: {
      title: "レンタカー約款",
      content: `M's BASE Rental レンタカー・レンタバイク約款

第1条（総則）
この約款は、M's BASE Rental（以下「当社」という）が行うレンタカー・レンタバイク事業について定めるものです。

第2条（定義）
1. 「レンタカー」とは、当社が賃貸する自動車をいう。
2. 「レンタバイク」とは、当社が賃貸する自動二輪車及び原動機付自転車をいう。
3. 「借受人」とは、当社からレンタカー又はレンタバイクを借り受ける者をいう。
4. 「運転者」とは、借受人の指定により実際に運転する者をいう。

第3条（賃貸借契約の成立）
賃貸借契約は、借受人の予約申込みに対して当社が承諾の意思表示をしたときに成立するものとします。

第4条（借受人の要件）
1. 借受人は、次の各号に掲げる要件を満たす者でなければなりません。
   - レンタカーの場合：有効な運転免許証を有する満18歳以上の者
   - レンタバイクの場合：該当する運転免許証を有する満16歳以上の者
2. 当社は、借受人が次の各号のいずれかに該当するときは、賃貸を拒むことができます。
   - 運転免許の停止処分中の者
   - 酒気を帯びている者
   - 当社の車両を損傷させたことのある者

第5条（賃貸料金）
1. 借受人は、当社の定める賃貸料金を支払うものとします。
2. 料金の支払いは、原則として賃貸借契約成立時に行うものとします。

第6条（車両の引渡し・返還）
1. 車両の引渡し及び返還は、当社の営業所において行うものとします。
2. 借受人は、約定返還日時までに車両を返還しなければなりません。

第7条（禁止事項）
借受人及び運転者は、次の各号に掲げる行為を行ってはなりません。
- 又貸し、転貸その他賃借権の譲渡
- 改造、改装等の車両への変更を加える行為
- 法令に違反する使用
- 競技、試験、曲技等の危険な運転

第8条（事故処理）
1. 事故が発生した場合、借受人は直ちに当社及び警察に届け出なければなりません。
2. 借受人は、事故により発生した損害について責任を負うものとします。

第9条（免責事項）
当社は、天災その他の不可抗力による損害について責任を負いません。

第10条（管轄裁判所）
本約款に関する紛争は、当社本店所在地を管轄する裁判所を専属管轄裁判所とします。

附則
本約款は、2024年12月1日から施行いたします。`,
      lastUpdated: "2024年12月1日"
    }
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
  }
};

async function restoreDatabase() {
  console.log('🔄 DynamoDB復元開始...');
  
  try {
    // 1. 既存のデータをすべてクリア
    console.log('🗑️ 既存データクリア中...');
    const scanResult = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));
    
    for (const item of scanResult.Items || []) {
      await docClient.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { settingKey: item.settingKey }
      }));
      console.log(`❌ 削除: ${item.settingKey}`);
    }
    
    // 2. Commit 512a7b3の正確なデータを投入
    console.log('📥 Commit 512a7b3データ投入中...');
    
    for (const [key, value] of Object.entries(correctData)) {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          settingKey: key,
          settingValue: value,
          lastModified: new Date().toISOString()
        }
      }));
      console.log(`✅ 投入: ${key}`);
    }
    
    console.log('✅ DynamoDB復元完了！');
    
  } catch (error) {
    console.error('❌ 復元エラー:', error);
    console.log('💡 AWS認証情報を確認してください');
    console.log('💡 テーブル名が正しいか確認してください:', TABLE_NAME);
  }
}

if (require.main === module) {
  restoreDatabase();
}

module.exports = { restoreDatabase, correctData };