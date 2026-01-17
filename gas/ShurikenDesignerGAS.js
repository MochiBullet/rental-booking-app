/**
 * Shuriken Designer - Google Apps Script
 *
 * このスクリプトをGoogle Apps Scriptにコピーして使用してください。
 *
 * 設定手順:
 * 1. Google Drive に新しいフォルダを作成（例: "ShurikenDesigns"）
 * 2. Google Spreadsheet を作成
 * 3. script.google.com で新しいプロジェクトを作成
 * 4. このコードをコピー＆ペースト
 * 5. FOLDER_ID と SPREADSHEET_ID を設定
 * 6. デプロイ → 新しいデプロイ → ウェブアプリ
 * 7. アクセス: 全員 に設定
 * 8. デプロイして URL を取得
 */

// ===== 設定 =====
const FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // Google DriveのフォルダID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // スプレッドシートのID

/**
 * POSTリクエストを処理
 */
function doPost(e) {
  try {
    // フォーム送信とJSON送信の両方に対応
    let data;
    if (e.parameter && e.parameter.data) {
      // hidden form からの送信（e.parameter.data）
      data = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      // fetch API からの送信（e.postData.contents）
      data = JSON.parse(e.postData.contents);
    } else {
      throw new Error('データが見つかりません');
    }

    // 日付フォルダを取得または作成
    const dateFolder = getOrCreateDateFolder();

    // 画像を保存
    const savedImages = saveImages(dateFolder, data);

    // スプレッドシートに記録
    logToSpreadsheet(data, savedImages);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '保存が完了しました',
        images: savedImages
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * CORSプリフライトリクエストを処理
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'Shuriken Designer API' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 日付フォルダを取得または作成
 */
function getOrCreateDateFolder() {
  const parentFolder = DriveApp.getFolderById(FOLDER_ID);
  const today = new Date();
  const dateString = Utilities.formatDate(today, 'Asia/Tokyo', 'yyyy-MM-dd');

  // 既存のフォルダを検索
  const folders = parentFolder.getFoldersByName(dateString);

  if (folders.hasNext()) {
    return folders.next();
  }

  // 新しいフォルダを作成
  return parentFolder.createFolder(dateString);
}

/**
 * 画像をGoogle Driveに保存
 */
function saveImages(folder, data) {
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'HHmmss');
  const savedImages = {};

  // 各画像を保存
  const imageTypes = [
    { key: 'frontPreview', name: '表面_プレビュー' },
    { key: 'frontPrint', name: '表面_印刷用' },
    { key: 'backPreview', name: '裏面_プレビュー' },
    { key: 'backPrint', name: '裏面_印刷用' }
  ];

  imageTypes.forEach(type => {
    if (data.images && data.images[type.key]) {
      const base64Data = data.images[type.key].replace(/^data:image\/\w+;base64,/, '');
      const blob = Utilities.newBlob(
        Utilities.base64Decode(base64Data),
        'image/png',
        `${timestamp}_${type.name}.png`
      );

      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      savedImages[type.key] = {
        id: file.getId(),
        url: file.getUrl(),
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`
      };
    }
  });

  return savedImages;
}

/**
 * スプレッドシートに記録
 */
function logToSpreadsheet(data, savedImages) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('デザイン履歴');

  // ヘッダー行の定義
  const headerRow = [
    '受付日時',
    'お名前',
    'メールアドレス',
    'カード色',
    '印刷タイプ',
    '裏面印刷',
    '合計金額',
    '表面プレビュー',
    '表面印刷用',
    '裏面プレビュー',
    '裏面印刷用',
    'フォルダリンク'
  ];

  // シートがなければ作成
  if (!sheet) {
    sheet = ss.insertSheet('デザイン履歴');
  }

  // 1行目をチェックしてヘッダーがなければ追加
  const firstRowValue = sheet.getRange(1, 1).getValue();
  if (firstRowValue !== '受付日時') {
    // 1行目にヘッダーを挿入
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
    // ヘッダー行のスタイル
    sheet.getRange(1, 1, 1, headerRow.length).setBackground('#4a4a4a').setFontColor('#ffffff').setFontWeight('bold');
  }

  const now = new Date();
  const timestamp = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');

  // フォルダリンクを取得
  const dateString = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy-MM-dd');
  const parentFolder = DriveApp.getFolderById(FOLDER_ID);
  const folders = parentFolder.getFoldersByName(dateString);
  let folderUrl = '';
  if (folders.hasNext()) {
    folderUrl = folders.next().getUrl();
  }

  // データ行を追加（お客様情報含む）
  sheet.appendRow([
    timestamp,
    data.customerInfo?.name || '',
    data.customerInfo?.email || '',
    data.designData?.cardColor || '',
    data.designData?.printType || '',
    data.designData?.hasBackPrint ? 'あり' : 'なし',
    data.designData?.totalPrice || 0,
    savedImages.frontPreview?.url || '',
    savedImages.frontPrint?.url || '',
    savedImages.backPreview?.url || '',
    savedImages.backPrint?.url || '',
    folderUrl
  ]);
}

/**
 * テスト用関数（postData形式）
 */
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        customerInfo: {
          name: 'テスト太郎',
          email: 'test@example.com'
        },
        images: {
          frontPreview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          frontPrint: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        },
        designData: {
          cardColor: 'white',
          printType: 'color',
          hasBackPrint: true,
          totalPrice: 7500
        }
      })
    }
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}

/**
 * テスト用関数（parameter形式 - hidden formからの送信）
 */
function testDoPostParameter() {
  const testData = {
    parameter: {
      data: JSON.stringify({
        customerInfo: {
          name: 'フォームテスト',
          email: 'form@example.com'
        },
        images: {
          frontPreview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          frontPrint: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        },
        designData: {
          cardColor: 'black',
          printType: 'gold',
          hasBackPrint: false,
          totalPrice: 5000
        }
      })
    }
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}
