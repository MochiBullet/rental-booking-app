import React, { useState, useEffect } from 'react';
import { siteSettingsManager, initialSiteSettings } from '../data/siteSettings';
import { siteSettingsAPI } from '../services/siteSettingsAPI';

const SiteSettingsManagement = ({ onSettingsUpdate, activeSection: propActiveSection }) => {
  // CACHE BUSTING v3.0.2 - Dashboard Overview完全削除 (2025-09-06 15:46)
  const [settings, setSettings] = useState(initialSiteSettings);
  const [activeSection, setActiveSection] = useState(propActiveSection || 'tile-edit');
  const [forceRender, setForceRender] = useState(Date.now() + 1000); // Aggressive cache clear

  // 画像圧縮関数 - API Gateway制限に対応（超小さく圧縮）
  const compressImage = (file, maxSizeKB = 200) => { // 200KBに大幅削減
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 最大解像度をさらに制限 (400x400px)
        let { width, height } = img;
        const maxDimension = 400; // 800から400に削減
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);
        
        // より厳しい圧縮品質調整
        let quality = 0.7; // 0.9から0.7に削減
        let compressedDataURL;
        let iterations = 0;
        const maxIterations = 10;
        
        do {
          compressedDataURL = canvas.toDataURL('image/jpeg', quality);
          const sizeKB = compressedDataURL.length * 0.75 / 1024; // Base64のサイズ推定
          
          console.log(`🔄 圧縮試行 ${iterations + 1}: ${Math.round(sizeKB)}KB (品質: ${Math.round(quality * 100)}%)`);
          
          if (sizeKB <= maxSizeKB) {
            console.log(`✅ 目標サイズ達成: ${Math.round(sizeKB)}KB`);
            break;
          }
          
          quality -= 0.05; // より細かい調整
          iterations++;
        } while (quality > 0.1 && iterations < maxIterations);
        
        // 最終確認
        const finalSizeKB = compressedDataURL.length * 0.75 / 1024;
        console.log(`📸 最終圧縮結果: ${Math.round(finalSizeKB)}KB (解像度: ${width}x${height}, 品質: ${Math.round(quality * 100)}%)`);
        
        resolve(compressedDataURL);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    loadSettings();
    // お知らせ管理は AdminDashboard.js に移行済み
  }, []);
  
  useEffect(() => {
    if (propActiveSection) {
      setActiveSection(propActiveSection);
    }
  }, [propActiveSection]);

  const loadSettings = async () => {
    try {
      console.log('🔄 DB設定読み込み開始...');
      
      const dynamoSettings = await siteSettingsAPI.getAllSettings();
      console.log('📊 DB応答:', dynamoSettings);
      
      if (dynamoSettings && dynamoSettings.siteSettings) {
        console.log('✅ DB設定読み込み完了');
        const dbSettings = dynamoSettings.siteSettings;
        
        console.log('🔍 DB設定詳細:', dbSettings);
        console.log('🔍 タイル設定:', dbSettings.tiles);
        
        setSettings(dbSettings);
        
        // LocalStorageに確実に保存
        console.log('💾 LocalStorage保存実行中...');
        siteSettingsManager.saveSettings(dbSettings);
        
        // 保存後確認
        setTimeout(() => {
          const saved = siteSettingsManager.getSettings();
          console.log('✅ LocalStorage保存確認:', Object.keys(saved));
        }, 100);
      } else if (Object.keys(dynamoSettings).length > 0) {
        // 旧形式対応
        console.log('✅ DB設定読み込み完了（直接形式）');
        setSettings(dynamoSettings);
        siteSettingsManager.saveSettings(dynamoSettings);
      } else {
        console.log('⚠️ DBに設定なし - 初期設定使用');
        setSettings(initialSiteSettings);
        await siteSettingsAPI.saveSetting('siteSettings', initialSiteSettings);
      }
      
    } catch (error) {
      console.error('❌ DB読み込みエラー:', error);
      const localSettings = siteSettingsManager.getSettings();
      setSettings(localSettings);
    }
  };

  const handleSave = async () => {
    try {
      console.log('🔄 Saving settings to DynamoDB...');
      await siteSettingsAPI.saveSetting('siteSettings', settings);
      
      // LocalStorageにもバックアップ保存
      siteSettingsManager.saveSettings(settings);
      
      if (onSettingsUpdate) {
        onSettingsUpdate(settings);
      }
      
      alert('✅ サイト設定がDynamoDBに保存されました');
      console.log('✅ Settings saved successfully');
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      
      // フォールバック: LocalStorageにのみ保存
      siteSettingsManager.saveSettings(settings);
      if (onSettingsUpdate) {
        onSettingsUpdate(settings);
      }
      
      alert('⚠️ サイト設定がLocalStorageに保存されました (DynamoDB接続エラー)');
    }
  };

  const handleReset = () => {
    if (window.confirm('全ての設定を初期値に戻しますか？')) {
      const resetSettings = siteSettingsManager.resetSettings();
      setSettings(resetSettings);
      if (onSettingsUpdate) {
        onSettingsUpdate(resetSettings);
      }
      alert('設定を初期値に戻しました');
    }
  };


  const updateContactSettings = (field, value) => {
    if (field === 'weekday' || field === 'weekend') {
      setSettings(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          businessHours: {
            ...prev.contact.businessHours,
            [field]: value
          }
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value
        }
      }));
    }
  };

  const updateService = (index, value) => {
    setSettings(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? value : service
      )
    }));
  };

  const updateTermsSettings = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };





  // タイル設定の更新
  const updateTileSettings = (field, value) => {
    setSettings(prev => ({
      ...prev,
      tiles: {
        ...prev.tiles,
        [field]: value
      }
    }));
  };


  // タイル画像をデフォルトに戻す
  const resetTilesToDefault = () => {
    updateTileSettings('carImage', null);
    updateTileSettings('bikeImage', null);
    updateTileSettings('useDefaultImages', true);
    
    // リアルタイム更新の実行
    if (onSettingsUpdate) {
      const updatedSettings = {
        ...settings,
        tiles: {
          carImage: null,
          bikeImage: null,
          useDefaultImages: true
        }
      };
      onSettingsUpdate(updatedSettings);
    }
  };

  // 完璧なDB管理タイル画像アップロード処理
  const handleTileImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（最大3MB）
    if (file.size > 3 * 1024 * 1024) {
      alert('ファイルサイズは3MB以下にしてください。');
      return;
    }

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    try {
      console.log(`🔄 ${type}タイル画像アップロード開始`);
      alert('🔄 画像を処理中です...');
      
      // 画像圧縮
      const compressedDataURL = await compressImage(file);
      const sizeKB = Math.round(compressedDataURL.length * 0.75 / 1024);
      console.log(`📸 画像圧縮完了: ${sizeKB}KB`);
      
      // 設定オブジェクト作成
      const imageKey = `${type}Image`;
      console.log(`🔑 保存キー: "${imageKey}"`);
      console.log(`📊 現在のsettings.tiles:`, settings.tiles);
      
      const updatedSettings = {
        ...settings,
        tiles: {
          ...settings.tiles,
          [imageKey]: compressedDataURL,
          useDefaultImages: false
        }
      };
      
      console.log(`💾 保存予定データ:`, {
        imageKey,
        hasImage: !!compressedDataURL,
        imageSize: compressedDataURL.length,
        useDefaultImages: updatedSettings.tiles.useDefaultImages,
        tilesKeys: Object.keys(updatedSettings.tiles)
      });

      console.log(`🔄 DB保存開始: ${type}Image`);
      
      try {
        // DB保存 - tilesキーで個別保存
        const response = await siteSettingsAPI.saveSetting('tiles', updatedSettings.tiles);
        console.log(`✅ DB保存成功: ${type}Image (${sizeKB}KB)`, response);
        
        // 成功後の処理 - 即座に画面更新
        setSettings(updatedSettings);
        siteSettingsManager.saveSettings(updatedSettings); // バックアップ
        
        // リアルタイム更新
        if (onSettingsUpdate) {
          onSettingsUpdate(updatedSettings);
        }
        
        // イベント発行でホームページ更新
        window.dispatchEvent(new CustomEvent('siteSettingsUpdate', {
          detail: updatedSettings
        }));
        
        // 強制再レンダー（確実な表示更新）
        setForceRender(Date.now());
        
        // 管理画面プレビューを即座更新
        setTimeout(() => {
          const previewImages = document.querySelectorAll('.tile-preview img');
          previewImages.forEach(img => {
            if (img.alt.includes(type === 'car' ? 'カスタム車画像' : 'カスタムバイク画像')) {
              img.src = compressedDataURL;
              console.log(`🖼️ プレビュー画像更新: ${type}`);
            }
          });
        }, 100);
        
        alert(`✅ ${type === 'car' ? '車' : 'バイク'}のタイル画像をDBに保存しました！\n\n保存完了: ${sizeKB}KB\n\n🔄 プレビューを即座更新中...`);
        
        // 保存後にDB確認
        setTimeout(async () => {
          try {
            const checkSettings = await siteSettingsAPI.getAllSettings();
            console.log('🔍 保存後DB確認:', checkSettings);
          } catch (error) {
            console.error('⚠️ 保存後確認エラー:', error);
          }
        }, 1000);
        
      } catch (dbError) {
        console.error('❌ DB保存エラー:', dbError);
        
        // DB保存失敗でもLocalStorageとUI更新は実行
        setSettings(updatedSettings);
        siteSettingsManager.saveSettings(updatedSettings);
        
        if (onSettingsUpdate) {
          onSettingsUpdate(updatedSettings);
        }
        
        window.dispatchEvent(new CustomEvent('siteSettingsUpdate', {
          detail: updatedSettings
        }));
        
        alert(`⚠️ ${type === 'car' ? '車' : 'バイク'}画像をLocalStorageに保存しました\n\nDB保存エラー: ${dbError.message}\n\n一時的にローカルで表示されます。`);
      }
      
    } catch (error) {
      console.error('❌ タイル画像処理エラー:', error);
      alert(`❌ ${type === 'car' ? '車' : 'バイク'}のタイル画像処理に失敗しました。\n\nエラー: ${error.message}`);
    }
  };

  // 個別タイル画像リセット
  const resetTileImage = async (type) => {
    const imageKey = `${type}Image`;
    const otherImageKey = type === 'car' ? 'bikeImage' : 'carImage';
    
    const updatedTiles = {
      ...settings.tiles,
      [imageKey]: null
    };
    
    // 両方の画像がnullの場合のみデフォルトフラグを設定
    if (!updatedTiles.carImage && !updatedTiles.bikeImage) {
      updatedTiles.useDefaultImages = true;
    }
    
    const updatedSettings = {
      ...settings,
      tiles: updatedTiles
    };

    // 状態を更新
    setSettings(updatedSettings);
    
    // DB（siteSettingsAPI）に保存
    try {
      await siteSettingsAPI.saveSetting('siteSettings', updatedSettings);
      console.log(`✅ タイル${type}画像リセットをDBに保存完了`);
      
      // LocalStorageにもバックアップ保存
      siteSettingsManager.saveSettings(updatedSettings);
      
      // リアルタイム更新の実行
      if (onSettingsUpdate) {
        onSettingsUpdate(updatedSettings);
      }
      
      // カスタムイベントでホームページに通知
      window.dispatchEvent(new CustomEvent('siteSettingsUpdate', {
        detail: updatedSettings
      }));
      
      alert(`✅ ${type === 'car' ? '車' : 'バイク'}画像をリセットしました`);
      
    } catch (error) {
      console.error(`❌ タイル${type}画像リセットのDB保存エラー:`, error);
      
      // エラー時もLocalStorageに保存
      siteSettingsManager.saveSettings(updatedSettings);
      
      // リアルタイム更新は実行
      if (onSettingsUpdate) {
        onSettingsUpdate(updatedSettings);
      }
      
      alert(`⚠️ ${type === 'car' ? '車' : 'バイク'}画像をリセットしました（DB接続エラーのためローカル保存）`);
    }
  };

  // タイルテキスト更新関数
  const updateTileText = (type, field, value) => {
    const textKey = `${type}Text`;
    const updatedSettings = {
      ...settings,
      tiles: {
        ...settings.tiles,
        [textKey]: {
          ...settings.tiles?.[textKey],
          [field]: value
        }
      }
    };
    
    setSettings(updatedSettings);
    
    // DB（siteSettingsAPI）に保存
    const saveToAPI = async () => {
      try {
        await siteSettingsAPI.saveSetting('siteSettings', updatedSettings);
        console.log(`✅ タイル${type}テキスト「${field}」をDBに保存: ${value}`);
        
        // DB保存成功後にイベントを発生
        console.log('🔄 タイル設定更新イベント発生中...', updatedSettings.tiles);
        
        // リアルタイム更新の実行
        if (onSettingsUpdate) {
          console.log('📤 onSettingsUpdate コールバック実行');
          onSettingsUpdate(updatedSettings);
        }
        
        // カスタムイベントでホームページに通知
        window.dispatchEvent(new CustomEvent('siteSettingsUpdate', {
          detail: updatedSettings
        }));
        console.log('📡 siteSettingsUpdate イベント発生完了');
        
      } catch (error) {
        console.error(`❌ タイル${type}テキスト保存エラー:`, error);
      }
    };
    
    saveToAPI();
  };

  // タイル特徴（features）更新関数
  const updateTileFeatures = (type, features) => {
    const textKey = `${type}Text`;
    const updatedSettings = {
      ...settings,
      tiles: {
        ...settings.tiles,
        [textKey]: {
          ...settings.tiles?.[textKey],
          features: features
        }
      }
    };
    
    setSettings(updatedSettings);
    
    // DB（siteSettingsAPI）に保存
    const saveToAPI = async () => {
      try {
        await siteSettingsAPI.saveSetting('siteSettings', updatedSettings);
        console.log(`✅ タイル${type}特徴をDBに保存:`, features);
        
        // DB保存成功後にイベントを発生
        console.log('🔄 タイル特徴更新イベント発生中...', updatedSettings.tiles);
        
        // リアルタイム更新の実行
        if (onSettingsUpdate) {
          console.log('📤 onSettingsUpdate コールバック実行');
          onSettingsUpdate(updatedSettings);
        }
        
        // カスタムイベントでホームページに通知
        window.dispatchEvent(new CustomEvent('siteSettingsUpdate', {
          detail: updatedSettings
        }));
        console.log('📡 siteSettingsUpdate イベント発生完了');
        
      } catch (error) {
        console.error(`❌ タイル${type}特徴保存エラー:`, error);
      }
    };
    
    saveToAPI();
  };

  // 背景画像アップロード処理
  const handleBackgroundImageUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    // ファイルサイズチェック（最大3MB）
    if (file.size > 3 * 1024 * 1024) {
      alert('ファイルサイズは3MB以下にしてください。');
      return;
    }

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    try {
      alert('🔄 背景画像を圧縮中です。しばらくお待ちください...');
      
      // 背景画像用により大きいサイズで圧縮 (横長画像対応)
      const compressedDataURL = await compressBackgroundImage(file);
      const sizeKB = Math.round(compressedDataURL.length * 0.75 / 1024);
      
      console.log(`📸 背景画像圧縮完了 (位置${index}): 約${sizeKB}KB`);
      
      // 背景画像配列を更新
      const newBackgroundImages = [...(settings.hero?.backgroundImages || [])];
      while (newBackgroundImages.length <= index) {
        newBackgroundImages.push(null);
      }
      newBackgroundImages[index] = compressedDataURL;
      
      const updatedSettings = {
        ...settings,
        hero: {
          ...settings.hero,
          backgroundImages: newBackgroundImages,
          useDefaultImages: false
        }
      };

      setSettings(updatedSettings);
      
      try {
        await siteSettingsAPI.saveSetting('siteSettings', updatedSettings);
        console.log(`✅ 背景画像${index + 1}をDBに保存完了 (${sizeKB}KB)`);
        
        // LocalStorageにもバックアップ保存
        siteSettingsManager.saveSettings(updatedSettings);
        
        // リアルタイム更新
        if (onSettingsUpdate) {
          onSettingsUpdate(updatedSettings);
        }
        
        window.dispatchEvent(new CustomEvent('siteSettingsUpdate', {
          detail: updatedSettings
        }));
        
        alert(`✅ 背景画像${index + 1}をアップロードしました (${sizeKB}KB)`);
        
      } catch (error) {
        console.error(`❌ 背景画像${index + 1}のDB保存エラー:`, error);
        alert(`⚠️ 背景画像${index + 1}をアップロードしました（DB接続エラーのためローカル保存）`);
      }
    } catch (error) {
      console.error('❌ 背景画像圧縮エラー:', error);
      alert('⚠️ 背景画像の圧縮に失敗しました。別の画像をお試しください。');
    }
  };

  // 背景画像専用圧縮関数（横長に最適化）
  const compressBackgroundImage = (file, maxSizeKB = 300) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 背景画像用の解像度設定 (横長フォーマット)
        let { width, height } = img;
        const maxWidth = 1200;
        const maxHeight = 600;
        
        // アスペクト比を維持しつつリサイズ
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio);
          
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // 圧縮品質調整
        let quality = 0.8;
        let compressedDataURL;
        let iterations = 0;
        const maxIterations = 10;
        
        do {
          compressedDataURL = canvas.toDataURL('image/jpeg', quality);
          const sizeKB = compressedDataURL.length * 0.75 / 1024;
          
          console.log(`🔄 背景画像圧縮試行 ${iterations + 1}: ${Math.round(sizeKB)}KB (品質: ${Math.round(quality * 100)}%)`);
          
          if (sizeKB <= maxSizeKB) {
            console.log(`✅ 背景画像目標サイズ達成: ${Math.round(sizeKB)}KB`);
            break;
          }
          
          quality -= 0.05;
          iterations++;
        } while (quality > 0.1 && iterations < maxIterations);
        
        const finalSizeKB = compressedDataURL.length * 0.75 / 1024;
        console.log(`📸 背景画像最終圧縮結果: ${Math.round(finalSizeKB)}KB (解像度: ${width}x${height})`);
        
        resolve(compressedDataURL);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // 背景画像リセット
  const resetBackgroundImage = async (index) => {
    const newBackgroundImages = [...(settings.hero?.backgroundImages || [])];
    newBackgroundImages[index] = null;
    
    const updatedSettings = {
      ...settings,
      hero: {
        ...settings.hero,
        backgroundImages: newBackgroundImages,
        useDefaultImages: newBackgroundImages.every(img => img === null)
      }
    };
    
    setSettings(updatedSettings);
    
    try {
      await siteSettingsAPI.saveSetting('siteSettings', updatedSettings);
      siteSettingsManager.saveSettings(updatedSettings);
      
      if (onSettingsUpdate) {
        onSettingsUpdate(updatedSettings);
      }
      
      window.dispatchEvent(new CustomEvent('siteSettingsUpdate', {
        detail: updatedSettings
      }));
      
      alert(`✅ 背景画像${index + 1}をリセットしました`);
      
    } catch (error) {
      console.error(`❌ 背景画像${index + 1}リセットエラー:`, error);
      alert(`⚠️ 背景画像${index + 1}をリセットしました（DB接続エラー）`);
    }
  };

  // 全背景画像をデフォルトに戻す
  const resetAllBackgroundImages = async () => {
    const updatedSettings = {
      ...settings,
      hero: {
        ...settings.hero,
        backgroundImages: [],
        useDefaultImages: true
      }
    };
    
    setSettings(updatedSettings);
    
    try {
      await siteSettingsAPI.saveSetting('siteSettings', updatedSettings);
      siteSettingsManager.saveSettings(updatedSettings);
      
      if (onSettingsUpdate) {
        onSettingsUpdate(updatedSettings);
      }
      
      window.dispatchEvent(new CustomEvent('siteSettingsUpdate', {
        detail: updatedSettings
      }));
      
      alert('✅ 全背景画像をデフォルトに戻しました');
      
    } catch (error) {
      console.error('❌ 背景画像一括リセットエラー:', error);
      alert('⚠️ 全背景画像をデフォルトに戻しました（DB接続エラー）');
    }
  };

  // お知らせ関連の関数は管理者ダッシュボードに移行済み

  return (
    <div className="site-settings-management">
      <div className="settings-header">
        <h2>📝 サイト設定管理</h2>
        <div className="settings-actions">
          <button onClick={handleSave} className="save-button">
            💾 設定を保存
          </button>
          <button onClick={handleReset} className="reset-button">
            🔄 初期値に戻す
          </button>
        </div>
      </div>

      {!propActiveSection && (
        <div className="settings-tabs">
          {[
            { key: 'branding', label: '🏢 ブランディング' },
            { key: 'tile-edit', label: '🎨 タイル編集' },
            { key: 'background-edit', label: '🌄 背景画像編集' },
            { key: 'contact', label: 'お問い合わせ情報' },
            { key: 'googleforms', label: '📝 Google Forms連携' },
            { key: 'terms', label: '📋 利用規約' },
            { key: 'privacy', label: '🔒 プライバシーポリシー' },
            { key: 'rental-terms', label: '🚗 レンタカー約款' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`tab-button ${activeSection === tab.key ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="settings-content">

        {activeSection === 'branding' && (
          <div className="section">
            <h3>🏢 ブランディング設定</h3>
            <div className="form-group">
              <label>サイト名</label>
              <input
                type="text"
                value={settings.branding?.siteName || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  branding: { ...prev.branding, siteName: e.target.value }
                }))}
                placeholder="M's BASE Rental"
              />
            </div>
            <div className="form-group">
              <label>サイトサブタイトル</label>
              <input
                type="text"
                value={settings.branding?.siteSubtitle || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  branding: { ...prev.branding, siteSubtitle: e.target.value }
                }))}
                placeholder="車・バイクレンタル"
              />
            </div>
            <div className="form-group">
              <label>ヒーロータイトル（トップページ）</label>
              <input
                type="text"
                value={settings.hero?.title || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  hero: { ...prev.hero, title: e.target.value }
                }))}
                placeholder="M's BASE Rental"
              />
            </div>
            <div className="form-group">
              <label>ヒーローサブタイトル（トップページ）</label>
              <input
                type="text"
                value={settings.hero?.subtitle || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  hero: { ...prev.hero, subtitle: e.target.value }
                }))}
                placeholder="安心・安全・快適なレンタルサービス"
              />
            </div>
            <div className="form-group">
              <label>コピーライト年</label>
              <input
                type="text"
                value={settings.branding?.copyrightYear || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  branding: { ...prev.branding, copyrightYear: e.target.value }
                }))}
                placeholder="2024"
              />
            </div>
          </div>
        )}

        {activeSection === 'tile-edit' && (
          <div className="section">
            <h3>🎨 タイル編集（画像・テキスト統合管理）</h3>
            
            {/* DB初期化ボタン */}
            <div className="form-group" style={{ marginBottom: '20px', padding: '15px', border: '2px solid #ff4444', borderRadius: '8px', backgroundColor: '#fff5f5' }}>
              <label style={{ color: '#ff4444', fontWeight: 'bold' }}>⚠️ データベース修復</label>
              <div style={{ margin: '10px 0' }}>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  タイル画像が保存されない場合は、古いデータ（campSpaceSettings）が原因の可能性があります。<br/>
                  下のボタンでデータベースを正しい状態に初期化できます。
                </p>
                <button 
                  onClick={async () => {
                    if (window.confirm('データベースを初期化しますか？\n（注意：既存の設定がリセットされます）')) {
                      const success = await siteSettingsAPI.initializeDatabase();
                      if (success) {
                        alert('✅ データベース初期化完了！ページをリロードして確認してください。');
                        window.location.reload();
                      } else {
                        alert('❌ データベース初期化に失敗しました。');
                      }
                    }
                  }}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#ff4444', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🔧 データベース初期化
                </button>
              </div>
            </div>
            
            {/* タイル画像セクション */}
            <div className="form-group">
              <label>🖼️ タイル画像設定</label>
              <div className="tile-image-management">
                <div className="tile-previews">
                  <div className="tile-preview-section">
                    <h4>車タイル画像</h4>
                    <div className="tile-preview">
                      {!settings.tiles?.useDefaultImages && settings.tiles?.carImage ? (
                        <img 
                          key={`car-${forceRender}-${settings.tiles.carImage?.slice(-20)}`}
                          src={settings.tiles.carImage} 
                          alt="カスタム車画像"
                          style={{ 
                            width: '200px', 
                            height: '150px', 
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ) : (
                        <div 
                          key={`car-default-${forceRender}`}
                          style={{ 
                            width: '200px', 
                            height: '150px',
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            border: '2px dashed #ccc'
                          }}
                        >
                          デフォルト車画像
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="tile-preview-section">
                    <h4>バイクタイル画像</h4>
                    <div className="tile-preview">
                      {!settings.tiles?.useDefaultImages && settings.tiles?.bikeImage ? (
                        <img 
                          key={`bike-${forceRender}-${settings.tiles.bikeImage?.slice(-20)}`}
                          src={settings.tiles.bikeImage} 
                          alt="カスタムバイク画像"
                          style={{ 
                            width: '200px', 
                            height: '150px', 
                            objectFit: 'cover',
                            borderRadius: '8px'
                          }}
                        />
                      ) : (
                        <div 
                          key={`bike-default-${forceRender}`}
                          style={{ 
                            width: '200px', 
                            height: '150px',
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            border: '2px dashed #ccc'
                          }}
                        >
                          デフォルトバイク画像
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="tile-upload-controls">
                  <div className="upload-section">
                    <h4>車タイル画像をアップロード</h4>
                    <input
                      type="file"
                      id="carImageUpload"
                      accept="image/*"
                      onChange={(e) => handleTileImageUpload(e, 'car')}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="carImageUpload" className="upload-button">
                      📷 車画像を選択
                    </label>
                    {settings.tiles?.carImage && (
                      <button 
                        type="button" 
                        onClick={() => resetTileImage('car')}
                        className="reset-icon-button"
                      >
                        🔄 車画像をリセット
                      </button>
                    )}
                  </div>

                  <div className="upload-section">
                    <h4>バイクタイル画像をアップロード</h4>
                    <input
                      type="file"
                      id="bikeImageUpload"
                      accept="image/*"
                      onChange={(e) => handleTileImageUpload(e, 'bike')}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="bikeImageUpload" className="upload-button">
                      🏍️ バイク画像を選択
                    </label>
                    {settings.tiles?.bikeImage && (
                      <button 
                        type="button" 
                        onClick={() => resetTileImage('bike')}
                        className="reset-icon-button"
                      >
                        🔄 バイク画像をリセット
                      </button>
                    )}
                  </div>

                  <p className="upload-info">
                    • 推奨サイズ: 600x400px 以上<br/>
                    • 対応形式: PNG, JPG, WEBP<br/>
                    • 最大サイズ: 3MB<br/>
                    • 車やバイクがはっきり見える写真を推奨
                  </p>
                </div>
              </div>
            </div>

            {/* タイルテキストセクション */}
            <div className="form-group" style={{marginTop: '2rem'}}>
              <label>📝 タイルテキスト設定</label>
              <div className="tile-text-section">
                <h4>🚗 車両タイルテキスト設定</h4>
                <div className="tile-text-grid">
                  <div className="form-group">
                    <label>短縮タイトル（ホームページ表示用）</label>
                    <input
                      type="text"
                      value={settings.tiles?.carText?.shortTitle || ''}
                      onChange={(e) => updateTileText('car', 'shortTitle', e.target.value)}
                      placeholder="車"
                    />
                    <small style={{color: '#666', fontSize: '0.8em'}}>ホームページのタイルに表示される短いタイトル</small>
                  </div>
                  <div className="form-group">
                    <label>タイトル（詳細ページ用）</label>
                    <input
                      type="text"
                      value={settings.tiles?.carText?.title || ''}
                      onChange={(e) => updateTileText('car', 'title', e.target.value)}
                      placeholder="車"
                    />
                    <small style={{color: '#666', fontSize: '0.8em'}}>車両リストページなどで使用される詳細タイトル</small>
                  </div>
                  <div className="form-group">
                    <label>サブタイトル</label>
                    <input
                      type="text"
                      value={settings.tiles?.carText?.subtitle || ''}
                      onChange={(e) => updateTileText('car', 'subtitle', e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div className="form-group">
                    <label>説明文1</label>
                    <input
                      type="text"
                      value={settings.tiles?.carText?.description || ''}
                      onChange={(e) => updateTileText('car', 'description', e.target.value)}
                      placeholder="ビジネス用まで"
                    />
                  </div>
                  <div className="form-group">
                    <label>説明文2</label>
                    <input
                      type="text"
                      value={settings.tiles?.carText?.details || ''}
                      onChange={(e) => updateTileText('car', 'details', e.target.value)}
                      placeholder="幅広いラインナップ"
                    />
                  </div>
                  <div className="form-group">
                    <label>特徴（カンマ区切り）</label>
                    <input
                      type="text"
                      value={settings.tiles?.carText?.features?.join(', ') || ''}
                      onChange={(e) => updateTileFeatures('car', e.target.value.split(', ').filter(f => f.trim()))}
                      placeholder="最新モデル, 保険完備, 24時間サポート"
                    />
                  </div>
                </div>

                <h4>🏍️ バイクタイルテキスト設定</h4>
                <div className="tile-text-grid">
                  <div className="form-group">
                    <label>短縮タイトル（ホームページ表示用）</label>
                    <input
                      type="text"
                      value={settings.tiles?.bikeText?.shortTitle || ''}
                      onChange={(e) => updateTileText('bike', 'shortTitle', e.target.value)}
                      placeholder="バイク"
                    />
                    <small style={{color: '#666', fontSize: '0.8em'}}>ホームページのタイルに表示される短いタイトル</small>
                  </div>
                  <div className="form-group">
                    <label>タイトル（詳細ページ用）</label>
                    <input
                      type="text"
                      value={settings.tiles?.bikeText?.title || ''}
                      onChange={(e) => updateTileText('bike', 'title', e.target.value)}
                      placeholder="バイクレンタル"
                    />
                    <small style={{color: '#666', fontSize: '0.8em'}}>車両リストページなどで使用される詳細タイトル</small>
                  </div>
                  <div className="form-group">
                    <label>サブタイトル</label>
                    <input
                      type="text"
                      value={settings.tiles?.bikeText?.subtitle || ''}
                      onChange={(e) => updateTileText('bike', 'subtitle', e.target.value)}
                      placeholder="原付から大型まで"
                    />
                  </div>
                  <div className="form-group">
                    <label>説明文1</label>
                    <input
                      type="text"
                      value={settings.tiles?.bikeText?.description || ''}
                      onChange={(e) => updateTileText('bike', 'description', e.target.value)}
                      placeholder="多様なバイクを"
                    />
                  </div>
                  <div className="form-group">
                    <label>説明文2</label>
                    <input
                      type="text"
                      value={settings.tiles?.bikeText?.details || ''}
                      onChange={(e) => updateTileText('bike', 'details', e.target.value)}
                      placeholder="お手頃価格で提供"
                    />
                  </div>
                  <div className="form-group">
                    <label>特徴（カンマ区切り）</label>
                    <input
                      type="text"
                      value={settings.tiles?.bikeText?.features?.join(', ') || ''}
                      onChange={(e) => updateTileFeatures('bike', e.target.value.split(', ').filter(f => f.trim()))}
                      placeholder="ヘルメット付, 整備済み, ロードサービス"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'page-edit' && (
          <div className="section">
            <h3>📄 カード内ページ編集</h3>
            <p>車両リストページのヘッダー情報を編集できます</p>
            
            <div className="page-content-form">
              <h4>🚗 車両リストページ</h4>
              <div className="form-group">
                <label>ページタイトル</label>
                <input
                  type="text"
                  value={settings.pageContent?.carTitle || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    pageContent: { ...prev.pageContent, carTitle: e.target.value }
                  }))}
                  placeholder="車のレンタル"
                />
              </div>
              <div className="form-group">
                <label>ページ説明文</label>
                <textarea
                  value={settings.pageContent?.carDescription || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    pageContent: { ...prev.pageContent, carDescription: e.target.value }
                  }))}
                  placeholder=""
                  rows="3"
                />
              </div>
              
              <h4>🏍️ バイクリストページ</h4>
              <div className="form-group">
                <label>ページタイトル</label>
                <input
                  type="text"
                  value={settings.pageContent?.bikeTitle || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    pageContent: { ...prev.pageContent, bikeTitle: e.target.value }
                  }))}
                  placeholder="バイクのレンタル"
                />
              </div>
              <div className="form-group">
                <label>ページ説明文</label>
                <textarea
                  value={settings.pageContent?.bikeDescription || ''}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    pageContent: { ...prev.pageContent, bikeDescription: e.target.value }
                  }))}
                  placeholder=""
                  rows="3"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'background-edit' && (
          <div className="section">
            <h3>🌄 Hero背景画像編集</h3>
            <div className="background-info">
              <p>ホームページのヒーローセクションで流れる背景画像を管理できます。</p>
              <p>推奨サイズ: 横1200px × 縦600px以下 | 自動圧縮: 300KB以下</p>
            </div>
            
            {/* 背景画像管理セクション */}
            <div className="form-group">
              <label>🖼️ 背景画像設定</label>
              <div className="background-image-management">
                
                {/* 現在の状態表示 */}
                <div className="background-status">
                  {settings.hero?.useDefaultImages ? (
                    <div className="status-info default">
                      <span>📷 現在: デフォルト画像を使用中</span>
                    </div>
                  ) : (
                    <div className="status-info custom">
                      <span>🎨 現在: カスタム画像を使用中</span>
                    </div>
                  )}
                </div>

                {/* 5つの背景画像スロット */}
                <div className="background-slots">
                  {[0, 1, 2, 3, 4].map(index => {
                    const backgroundImage = settings.hero?.backgroundImages?.[index];
                    const hasCustomImage = backgroundImage && !settings.hero?.useDefaultImages;
                    
                    return (
                      <div key={index} className="background-slot">
                        <h4>背景画像 {index + 1}</h4>
                        
                        {/* プレビュー */}
                        <div className="background-preview">
                          {hasCustomImage ? (
                            <img 
                              src={backgroundImage} 
                              alt={`背景画像${index + 1}`}
                              style={{ 
                                width: '300px', 
                                height: '150px', 
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #4CAF50'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '300px', 
                              height: '150px',
                              backgroundColor: '#f5f5f5',
                              border: '2px dashed #ccc',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#666',
                              fontSize: '14px'
                            }}>
                              デフォルト画像または未設定
                            </div>
                          )}
                        </div>

                        {/* アップロードボタン */}
                        <div className="background-controls">
                          <input
                            type="file"
                            accept="image/*"
                            id={`backgroundUpload${index}`}
                            onChange={(e) => handleBackgroundImageUpload(e, index)}
                            style={{ display: 'none' }}
                          />
                          <label htmlFor={`backgroundUpload${index}`} className="upload-button">
                            📷 画像を選択
                          </label>
                          
                          {hasCustomImage && (
                            <button 
                              type="button" 
                              onClick={() => resetBackgroundImage(index)}
                              className="reset-button"
                            >
                              🔄 リセット
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 一括操作 */}
                <div className="background-bulk-actions">
                  <button 
                    type="button" 
                    onClick={resetAllBackgroundImages}
                    className="bulk-reset-button"
                    disabled={settings.hero?.useDefaultImages}
                  >
                    🔄 全背景画像をデフォルトに戻す
                  </button>
                </div>

                {/* 使用方法の説明 */}
                <div className="background-usage-info">
                  <h4>📖 使用方法</h4>
                  <ul>
                    <li>各スロットに横長の画像をアップロードできます</li>
                    <li>画像は自動でリサイズ・圧縮されます（1200×600px以下、300KB以下）</li>
                    <li>設定した画像は自動でスライドします</li>
                    <li>未設定のスロットはデフォルト画像が使用されます</li>
                    <li>全てリセットするとUnsplashのデフォルト画像に戻ります</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'contact' && (
          <div className="section">
            <h3>お問い合わせ情報設定</h3>
            <div className="form-group">
              <label>電話番号</label>
              <input
                type="text"
                value={settings.contact.phone}
                onChange={(e) => updateContactSettings('phone', e.target.value)}
                placeholder="03-1234-5678"
              />
            </div>
            <div className="form-group">
              <label>メールアドレス</label>
              <input
                type="email"
                value={settings.contact.email}
                onChange={(e) => updateContactSettings('email', e.target.value)}
                placeholder="info@rentaleasy.com"
              />
            </div>
            <div className="form-group">
              <label>住所</label>
              <input
                type="text"
                value={settings.contact.address}
                onChange={(e) => updateContactSettings('address', e.target.value)}
                placeholder="東京都渋谷区xxx-xxx"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>平日営業時間</label>
                <input
                  type="text"
                  value={settings.contact.businessHours.weekday}
                  onChange={(e) => updateContactSettings('weekday', e.target.value)}
                  placeholder="平日: 9:00 - 18:00"
                />
              </div>
              <div className="form-group">
                <label>土日祝営業時間</label>
                <input
                  type="text"
                  value={settings.contact.businessHours.weekend}
                  onChange={(e) => updateContactSettings('weekend', e.target.value)}
                  placeholder="土日祝: 9:00 - 17:00"
                />
              </div>
            </div>
          </div>
        )}

        {/* SERVICES SECTION REMOVED - SIMPLIFIED SITE SETTINGS */}
        {false && activeSection === 'services' && (
          <div className="section">
            <h3>サービス内容設定</h3>
            {settings.services.map((service, index) => (
              <div key={index} className="form-group">
                <label>サービス {index + 1}</label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => updateService(index, e.target.value)}
                  placeholder="・カーレンタル"
                />
              </div>
            ))}
          </div>
        )}

        {activeSection === 'terms' && (
          <div className="section">
            <h3>📋 レンタルサービス利用規約設定</h3>
            <p className="section-description">車両・バイクレンタルに関する利用規約を管理します。法的に重要な文書のため慎重に編集してください。</p>
            <div className="form-group">
              <label>タイトル</label>
              <input
                type="text"
                value={settings.terms?.title || ''}
                onChange={(e) => updateTermsSettings('terms', 'title', e.target.value)}
                placeholder="利用規約"
              />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea
                value={settings.terms?.content || ''}
                onChange={(e) => updateTermsSettings('terms', 'content', e.target.value)}
                placeholder="利用規約の内容を入力してください..."
                rows={15}
                className="terms-textarea"
              />
            </div>
            <div className="form-group">
              <label>最終更新日</label>
              <input
                type="text"
                value={settings.terms?.lastUpdated || ''}
                onChange={(e) => updateTermsSettings('terms', 'lastUpdated', e.target.value)}
                placeholder="2024年12月1日"
              />
            </div>
          </div>
        )}

        {/* お知らせ管理は管理者ダッシュボードに完全移行済み */}

        {activeSection === 'googleforms' && (
          <div className="section">
            <h3>📝 Google Forms連携設定</h3>
            <p className="section-description">
              セキュリティ強化のため、個人情報をGoogle Formsで管理します。<br/>
              フォーム送信先: <a href="https://docs.google.com/forms/d/e/1FAIpQLSdM1hGazWWkJJFFbMJBAzl-lEXE20XMtwfO_h-o7hEol8-bpw/viewform" target="_blank" rel="noopener noreferrer">M's BASE レンタル予約フォーム</a>
            </p>
            
            <div className="form-group">
              <label>Google Forms連携を有効化</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.googleForms?.enabled || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    googleForms: {
                      ...prev.googleForms,
                      enabled: e.target.checked
                    }
                  }))}
                />
                <span className="slider round"></span>
              </label>
              <small>有効にすると、予約時に個人情報がGoogle Formsに送信されます</small>
            </div>

            <div className="form-group">
              <label>フォームURL（送信先）</label>
              <input
                type="text"
                value={settings.googleForms?.formUrl || 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdM1hGazWWkJJFFbMJBAzl-lEXE20XMtwfO_h-o7hEol8-bpw/formResponse'}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  googleForms: {
                    ...prev.googleForms,
                    formUrl: e.target.value
                  }
                }))}
                placeholder="https://docs.google.com/forms/u/0/d/e/.../formResponse"
              />
              <small>フォームのaction URLを入力（末尾は/formResponse）</small>
            </div>

            <div className="form-group">
              <label>埋め込みフォーム表示</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.googleForms?.showEmbedded || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    googleForms: {
                      ...prev.googleForms,
                      showEmbedded: e.target.checked
                    }
                  }))}
                />
                <span className="slider round"></span>
              </label>
              <small>予約ページにGoogle Formを埋め込み表示します</small>
            </div>

            {settings.googleForms?.showEmbedded && (
              <div className="form-group">
                <label>埋め込みフォームの高さ（px）</label>
                <input
                  type="number"
                  value={settings.googleForms?.embedHeight || 800}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    googleForms: {
                      ...prev.googleForms,
                      embedHeight: parseInt(e.target.value)
                    }
                  }))}
                  placeholder="800"
                  min="400"
                  max="2000"
                />
              </div>
            )}

            <div className="alert-info" style={{marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px'}}>
              <strong>🔐 セキュリティ向上のポイント：</strong>
              <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
                <li>個人情報はGoogleの安全なサーバーに保存されます</li>
                <li>SSL/TLS暗号化により通信が保護されます</li>
                <li>Google Formsの自動バックアップ機能</li>
                <li>管理者はGoogleスプレッドシートで一元管理可能</li>
              </ul>
            </div>

            <div className="alert-warning" style={{marginTop: '15px', padding: '15px', backgroundColor: '#fff3e0', borderRadius: '5px'}}>
              <strong>⚠️ 設定時の注意：</strong>
              <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
                <li>Google Formの共有設定を「リンクを知っている全員」に設定してください</li>
                <li>フォームの編集権限は管理者のみに制限してください</li>
                <li>定期的にGoogle Formsの回答をバックアップしてください</li>
              </ul>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="section">
            <h3>🔒 レンタルサービス プライバシーポリシー設定</h3>
            <p className="section-description">個人情報の取り扱いに関するプライバシーポリシーを管理します。GDPR・個人情報保護法に準拠した内容にしてください。</p>
            <div className="form-group">
              <label>タイトル</label>
              <input
                type="text"
                value={settings.privacy?.title || ''}
                onChange={(e) => updateTermsSettings('privacy', 'title', e.target.value)}
                placeholder="プライバシーポリシー"
              />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea
                value={settings.privacy?.content || ''}
                onChange={(e) => updateTermsSettings('privacy', 'content', e.target.value)}
                placeholder="プライバシーポリシーの内容を入力してください..."
                rows={15}
                className="terms-textarea"
              />
            </div>
            <div className="form-group">
              <label>最終更新日</label>
              <input
                type="text"
                value={settings.privacy?.lastUpdated || ''}
                onChange={(e) => updateTermsSettings('privacy', 'lastUpdated', e.target.value)}
                placeholder="2024年12月1日"
              />
            </div>
          </div>
        )}

        {activeSection === 'rental-terms' && (
          <div className="section">
            <h3>レンタカー約款設定</h3>
            <div className="form-group">
              <label>タイトル</label>
              <input
                type="text"
                value={settings.rentalTerms?.title || ''}
                onChange={(e) => updateTermsSettings('rentalTerms', 'title', e.target.value)}
                placeholder="レンタカー約款"
              />
            </div>
            <div className="form-group">
              <label>内容</label>
              <textarea
                value={settings.rentalTerms?.content || ''}
                onChange={(e) => updateTermsSettings('rentalTerms', 'content', e.target.value)}
                placeholder="レンタカー約款の内容を入力してください..."
                rows={15}
                className="terms-textarea"
              />
            </div>
            <div className="form-group">
              <label>最終更新日</label>
              <input
                type="text"
                value={settings.rentalTerms?.lastUpdated || ''}
                onChange={(e) => updateTermsSettings('rentalTerms', 'lastUpdated', e.target.value)}
                placeholder="2024年12月1日"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteSettingsManagement;