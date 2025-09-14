import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingWheel from './LoadingWheel';
import { siteSettingsAPI } from '../services/siteSettingsAPI';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [policyContent, setPolicyContent] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrivacyPolicy();
  }, []);

  const loadPrivacyPolicy = async () => {
    try {
      // DBからプライバシーポリシー内容を取得
      const allSettings = await siteSettingsAPI.getAllSettings();
      console.log('📋 プライバシーポリシー設定取得:', allSettings);
      
      setSettings(allSettings); // 設定を保存
      
      if (allSettings?.privacy && allSettings.privacy.content) {
        // DB設定からプライバシーポリシー内容を使用
        const dbPolicy = {
          title: allSettings.privacy.title || 'M\'s BASE Rental プライバシーポリシー',
          lastUpdated: allSettings.privacy.lastUpdated || new Date().toLocaleDateString('ja-JP'),
          content: allSettings.privacy.content
        };
        setPolicyContent(dbPolicy);
        console.log('✅ DBプライバシーポリシーを使用');
      } else {
        // デフォルトプライバシーポリシーを設定
        const defaultPolicy = {
          title: 'M\'s BASE Rental プライバシーポリシー',
          lastUpdated: new Date().toLocaleDateString('ja-JP'),
          content: 'プライバシーポリシーが設定されていません。管理画面から設定してください。'
        };
        setPolicyContent(defaultPolicy);
        console.log('⚠️ デフォルトプライバシーポリシーを使用');
      }
    } catch (error) {
      console.error('❌ プライバシーポリシー取得エラー:', error);
      // エラー時はデフォルトプライバシーポリシー
      const fallbackPolicy = {
        title: 'M\'s BASE Rental プライバシーポリシー',
        lastUpdated: new Date().toLocaleDateString('ja-JP'),
        content: 'プライバシーポリシーの読み込みに失敗しました。しばらく後に再度お試しください。',
        sections: [
          {
            id: 1,
            title: '第1条（個人情報の定義）',
            content: '本プライバシーポリシーにおいて、「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個個人を識別できる情報（個人識別情報）を指します。'
          },
          {
            id: 2,
            title: '第2条（個人情報の収集方法）',
            content: '当社は、ユーザーが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレス、銀行口座番号、クレジットカード番号、運転免許証番号などの個人情報をお尋ねすることがあります。また、ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を、当社の提携先（情報提供元、広告主、広告配信先などを含みます。以下、「提携先」といいます。）などから収集することがあります。'
          },
          {
            id: 3,
            title: '第3条（個人情報を収集・利用する目的）',
            content: '当社が個人情報を収集・利用する目的は、以下のとおりです。\\n\\n(1) 当社サービスの提供・運営のため\\n(2) ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）\\n(3) ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため\\n(4) メンテナンス、重要なお知らせなど必要に応じたご連絡のため\\n(5) 利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため\\n(6) ユーザーにご自身の登録情報の閲覧・変更・削除・ご利用状況の閲覧を行っていただくため\\n(7) 有料サービスにおいて、ユーザーに利用料金を請求するため\\n(8) 上記の利用目的に付随する目的'
          },
          {
            id: 4,
            title: '第4条（利用目的の変更）',
            content: '当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。\\n利用目的の変更を行った場合には、変更後の目的について、当社所定の方法により、ユーザーに通知し、または本ウェブサイト上に公表するものとします。'
          },
          {
            id: 5,
            title: '第5条（個人情報の第三者提供）',
            content: '当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。\\n\\n(1) 人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき\\n(2) 公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき\\n(3) 国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることによって当該事務の遂行に支障を及ぼすおそれがあるとき\\n(4) 予め次の事項を告知あるいは公表し、かつ当社が個人情報保護委員会に届出をしたとき\\na. 利用目的に第三者への提供を含むこと\\nb. 第三者に提供されるデータの項目\\nc. 第三者への提供の手段または方法\\nd. 本人の求めに応じて個人情報の第三者への提供を停止すること\\ne. 本人の求めを受け付ける方法'
          },
          {
            id: 6,
            title: '第6条（個人情報の開示）',
            content: '当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。なお、個人情報の開示に際しては、1件あたり1,000円の手数料を申し受けます。\\n\\n(1) 本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合\\n(2) 当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合\\n(3) その他法令に違反することとなる場合'
          },
          {
            id: 7,
            title: '第7条（個人情報の訂正および削除）',
            content: 'ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、当社に対して個人情報の訂正、追加または削除（以下、「訂正等」といいます。）を請求することができます。\\n当社は、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。\\n当社は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは遅滞なく、これをユーザーに通知します。'
          },
          {
            id: 8,
            title: '第8条（個人情報の利用停止等）',
            content: '当社は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下、「利用停止等」といいます。）を求められた場合には、遅滞なく必要な調査を行います。\\n前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。\\n当社は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、遅滞なく、これをユーザーに通知します。\\n前2項にかかわらず、利用停止等に多額の費用を要する場合その他利用停止等を行うことが困難な場合であって、ユーザーの権利利益を保護するために必要なこれに代わるべき措置をとれる場合は、この代替策を講じるものとします。'
          },
          {
            id: 9,
            title: '第9条（プライバシーポリシーの変更）',
            content: '本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。\\n当社が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。'
          },
          {
            id: 10,
            title: '第10条（お問い合わせ窓口）',
            content: '本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。\\n\\n住所：東京都渋谷区道玄坂1-2-3 M\'s BASE ビル 5階\\n社名：M\'s BASE Rental\\nEメールアドレス：privacy@msbase-rental.com\\n担当部署：個人情報保護担当'
          }
        ]
      };
      setPolicyContent(fallbackPolicy);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="privacy-container">
        <LoadingWheel size={80} message="プライバシーポリシーを読み込み中..." />
      </div>
    );
  }

  return (
    <div className="privacy-container">
      <div className="privacy-header">
        <h1>{policyContent.title}</h1>
        <p className="last-updated">
          最終更新日: {policyContent.lastUpdated}
        </p>
        <button 
          className="back-btn"
          onClick={() => navigate('/')}
        >
          ← ホームに戻る
        </button>
      </div>

      <div className="privacy-content">
        <div className="privacy-intro">
          <p>
            M's BASE Rental（以下、「当社」といいます。）は、本ウェブサイト上で提供するサービス（以下、「本サービス」といいます。）における、
            ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
          </p>
        </div>

        <div className="privacy-sections">
          {policyContent.sections ? (
            policyContent.sections.map((section) => (
              <div key={section.id} className="privacy-section">
                <h2>{section.title}</h2>
                <div className="privacy-text">
                  {section.content.split('\\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="privacy-text">
              {policyContent.content && policyContent.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          )}
        </div>

        {/* お問い合わせセクション */}
        <div className="contact-section" style={{marginTop: '40px', padding: '30px', backgroundColor: '#f5f5f5', borderRadius: '10px'}}>
          <h3 style={{fontSize: '24px', marginBottom: '20px', textAlign: 'center'}}>お問い合わせ</h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px'}}>
            <div className="info-card" style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer'}} 
                 onClick={() => window.open(`tel:${settings?.contact?.phone || '03-1234-5678'}`, '_self')}>
              <div style={{fontSize: '30px', marginBottom: '10px'}}>📞</div>
              <h4 style={{fontSize: '18px', marginBottom: '10px'}}>お電話でのお問い合わせ</h4>
              <p style={{fontSize: '20px', fontWeight: 'bold', color: '#2e7d32'}}>{settings?.contact?.phone || '03-1234-5678'}</p>
              <p style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>
                {settings?.contact?.businessHours?.weekday || '平日 9:00-18:00'}<br/>
                {settings?.contact?.businessHours?.weekend || '土日祝 10:00-17:00'}
              </p>
            </div>
            
            <div className="info-card" style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
              <div style={{fontSize: '30px', marginBottom: '10px'}}>📍</div>
              <h4 style={{fontSize: '18px', marginBottom: '10px'}}>所在地</h4>
              <p style={{fontSize: '16px', lineHeight: '1.6'}}>{settings?.contact?.address || '岐阜県岐阜市光町1-67'}</p>
              <div style={{marginTop: '15px', display: 'flex', gap: '10px'}}>
                <button 
                  style={{padding: '8px 16px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                  onClick={(e) => {
                    e.stopPropagation();
                    const address = encodeURIComponent(settings?.contact?.address || '岐阜県岐阜市光町1-67');
                    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                  }}
                >
                  🗺️ 地図で見る
                </button>
                <button 
                  style={{padding: '8px 16px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
                  onClick={(e) => {
                    e.stopPropagation();
                    const address = encodeURIComponent(settings?.contact?.address || '岐阜県岐阜市光町1-67');
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
                  }}
                >
                  🚗 ルート検索
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="privacy-footer">
          <div className="privacy-actions">
            <button
              className="btn-secondary"
              onClick={() => window.print()}
            >
              印刷する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;