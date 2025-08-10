// Vercel API Route for icon upload
import AWS from 'aws-sdk';

// AWS S3 設定
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-southeast-2'
});

export default async function handler(req, res) {
  // CORS ヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS リクエスト（CORS プリフライト）への対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Data, fileName } = req.body;

    if (!base64Data || !fileName) {
      return res.status(400).json({ error: 'Missing base64Data or fileName' });
    }

    // Base64データをバイナリに変換
    const base64Image = base64Data.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Image, 'base64');

    // 一意なファイル名を生成
    const timestamp = Date.now();
    const extension = fileName.split('.').pop().toLowerCase();
    const s3FileName = `custom-site-icon-${timestamp}.${extension}`;

    // MIME タイプを決定
    let contentType = 'image/jpeg';
    if (extension === 'png') contentType = 'image/png';
    if (extension === 'gif') contentType = 'image/gif';

    // S3 にアップロード
    const uploadParams = {
      Bucket: 'rental-booking-app-production-276291855506',
      Key: s3FileName,
      Body: imageBuffer,
      ContentType: contentType,
      ACL: 'public-read' // パブリック読み取り可能に設定
    };

    console.log('📤 S3アップロード開始:', s3FileName);
    const result = await s3.upload(uploadParams).promise();

    // CloudFront URL を生成
    const cloudFrontUrl = `https://d1880zvwjdr57t.cloudfront.net/${s3FileName}`;

    console.log('✅ S3アップロード完了:', result.Location);

    res.status(200).json({
      success: true,
      url: cloudFrontUrl,
      s3Url: result.Location
    });

  } catch (error) {
    console.error('❌ S3アップロードエラー:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}