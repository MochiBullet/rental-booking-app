import React, { useState, useEffect } from 'react';
import { vehicleData } from './data/vehicleData';
import { initialMembers, memberUtils } from './data/memberData';
import { siteSettingsManager } from './data/siteSettings';
import Header from './components/Header';
import Hero from './components/Hero';
import VehicleList from './components/VehicleList';
import ReservationForm from './components/ReservationForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import MemberLogin from './components/MemberLogin';
import MemberRegistration from './components/MemberRegistration';
import MemberMyPage from './components/MemberMyPage';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [reservations, setReservations] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [vehicles, setVehicles] = useState(vehicleData);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [members, setMembers] = useState(initialMembers);
  const [currentMember, setCurrentMember] = useState(null);
  const [isMemberLoggedIn, setIsMemberLoggedIn] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    setSiteSettings(siteSettingsManager.getSettings());
    // 管理者ログイン状態を復元
    const savedAdminState = sessionStorage.getItem('isAdminLoggedIn');
    if (savedAdminState === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleViewChange = (view, filter = 'all') => {
    setCurrentView(view);
    setVehicleFilter(filter);
    if (view !== 'reservation') {
      setSelectedVehicle(null);
    }
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentView('reservation');
  };

  const handleReservationSubmit = (reservationData) => {
    const newReservation = {
      ...reservationData,
      id: Date.now(),
      createdAt: new Date(),
      status: 'confirmed',
      memberId: currentMember?.id || null
    };
    setReservations(prev => [...prev, newReservation]);
    
    // ログインユーザーの場合、ポイントを計算して付与
    if (isMemberLoggedIn && currentMember) {
      // 保険料を除いたレンタル料金を計算
      const days = Math.ceil(
        (new Date(reservationData.endDate) - new Date(reservationData.startDate)) / 
        (1000 * 60 * 60 * 24)
      ) + 1;
      
      let basePrice = selectedVehicle.price * days;
      
      // プラン割引適用
      if (reservationData.rentalPlan === 'weekly' && days >= 7) {
        basePrice = basePrice * 0.85;
      } else if (reservationData.rentalPlan === 'monthly' && days >= 30) {
        basePrice = basePrice * 0.75;
      }
      
      // ポイント計算（100円につき1ポイント）
      const earnedPoints = Math.floor(basePrice / 100);
      
      // メンバー情報を更新
      const updatedMember = {
        ...currentMember,
        membershipInfo: {
          ...currentMember.membershipInfo,
          points: currentMember.membershipInfo.points + earnedPoints
        },
        reservationHistory: [
          ...(currentMember.reservationHistory || []),
          {
            reservationId: newReservation.id,
            earnedPoints: earnedPoints,
            date: new Date()
          }
        ]
      };
      
      setCurrentMember(updatedMember);
      setMembers(prev => 
        prev.map(member => 
          member.id === updatedMember.id ? updatedMember : member
        )
      );
      
      alert(`予約が完了しました！${earnedPoints}ポイントを獲得しました。\nご利用ありがとうございます。`);
    } else {
      alert('予約が完了しました！ご利用ありがとうございます。');
    }
    
    setSelectedVehicle(null);
    setCurrentView('home');
  };

  const handleVehicleUpdate = (vehicleData) => {
    if (vehicleData.action === 'delete') {
      setVehicles(prev => prev.filter(v => v.id !== vehicleData.id));
    } else {
      setVehicles(prev => {
        const existingIndex = prev.findIndex(v => v.id === vehicleData.id);
        if (existingIndex >= 0) {
          // 更新
          const updated = [...prev];
          updated[existingIndex] = vehicleData;
          return updated;
        } else {
          // 新規追加
          return [...prev, vehicleData];
        }
      });
    }
  };

  const handleReservationUpdate = (updateData) => {
    setReservations(prev => 
      prev.map(reservation => 
        reservation.id === updateData.id 
          ? { ...reservation, ...updateData }
          : reservation
      )
    );
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('isAdminLoggedIn', 'true');
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('isAdminLoggedIn');
    setCurrentView('home');
  };

  const handleMemberLogin = (memberData) => {
    setCurrentMember(memberData);
    setIsMemberLoggedIn(true);
    setCurrentView('mypage');
  };

  const handleMemberLogout = () => {
    setCurrentMember(null);
    setIsMemberLoggedIn(false);
    setCurrentView('home');
  };

  const handleMemberRegister = (memberData) => {
    let initialPoints = 1000; // 基本登録ボーナス
    let invitedByMemberId = null;
    
    // 招待コードの処理
    if (memberData.inviteCode) {
      const inviter = members.find(m => 
        m.membershipInfo?.inviteCode === memberData.inviteCode
      );
      
      if (inviter) {
        initialPoints += 500; // 招待された側に500ポイント追加
        invitedByMemberId = inviter.id;
        
        // 招待した側にも500ポイント追加
        const updatedInviter = {
          ...inviter,
          membershipInfo: {
            ...inviter.membershipInfo,
            points: inviter.membershipInfo.points + 500,
            invitedUsers: [
              ...(inviter.membershipInfo.invitedUsers || []),
              {
                name: memberData.profile.name,
                date: new Date(),
                memberId: Date.now()
              }
            ]
          }
        };
        
        setMembers(prev => 
          prev.map(m => m.id === inviter.id ? updatedInviter : m)
        );
      }
    }
    
    const newMemberId = Date.now();
    const newMember = {
      ...memberData,
      id: newMemberId,
      membershipInfo: {
        memberNumber: `M${String(newMemberId).slice(-6)}`,
        joinDate: new Date().toISOString().split('T')[0],
        membershipType: 'regular',
        points: initialPoints,
        inviteCode: memberUtils.generateInviteCode(newMemberId),
        invitedBy: invitedByMemberId,
        invitedUsers: []
      },
      reservationHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    
    setMembers(prev => [...prev, newMember]);
    
    if (memberData.inviteCode && invitedByMemberId) {
      alert(`会員登録が完了しました！\n招待特典として500ポイントが追加され、合計${initialPoints}ポイントを獲得しました。\nログインしてご利用ください。`);
    } else {
      alert('会員登録が完了しました！ログインしてご利用ください。');
    }
    
    setCurrentView('member-login');
  };

  const handleMemberProfileUpdate = (updatedProfile, updatedPreferences) => {
    const updatedMember = {
      ...currentMember,
      profile: updatedProfile,
      preferences: updatedPreferences,
      updatedAt: new Date()
    };
    
    setCurrentMember(updatedMember);
    setMembers(prev => 
      prev.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      )
    );
    
    alert('プロフィールが更新されました。');
  };

  const handleMemberUpdate = (updatedMemberData) => {
    setMembers(prev => 
      prev.map(member => 
        member.id === updatedMemberData.id 
          ? { ...member, ...updatedMemberData }
          : member
      )
    );
  };

  const handleSiteSettingsUpdate = (newSettings) => {
    setSiteSettings(newSettings);
    // カスタムイベントを発生させて他のコンポーネントに通知
    window.dispatchEvent(new CustomEvent('siteSettingsUpdate'));
  };

  return (
    <div className="App">
      <Header 
        currentView={currentView} 
        onViewChange={handleViewChange}
        reservationCount={reservations.length}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogin={() => setCurrentView('admin-login')}
        isMemberLoggedIn={isMemberLoggedIn}
        currentMember={currentMember}
        onMemberLogin={() => setCurrentView('member-login')}
      />
      
      <main>
        {currentView === 'home' && (
          <Hero onViewChange={handleViewChange} />
        )}
        
        {currentView === 'cars' && (
          <section className="vehicles-section">
            <div className="container">
              <div className="page-header">
                <button className="back-button" onClick={() => handleViewChange('home')}>
                  ← ホームに戻る
                </button>
                <h2>🚗 車両一覧</h2>
              </div>
              <VehicleList 
                vehicles={vehicles} 
                onVehicleSelect={handleVehicleSelect}
                initialFilter="car"
                hideFilters={true}
              />
            </div>
          </section>
        )}
        
        {currentView === 'motorcycles' && (
          <section className="vehicles-section">
            <div className="container">
              <div className="page-header">
                <button className="back-button" onClick={() => handleViewChange('home')}>
                  ← ホームに戻る
                </button>
                <h2>🏍️ バイク一覧</h2>
              </div>
              <VehicleList 
                vehicles={vehicles} 
                onVehicleSelect={handleVehicleSelect}
                initialFilter="motorcycle"
                hideFilters={true}
              />
            </div>
          </section>
        )}
        
        {currentView === 'reservation' && selectedVehicle && (
          <section className="reservation-section">
            <div className="container">
              <h2>予約フォーム</h2>
              <ReservationForm 
                vehicle={selectedVehicle}
                currentMember={currentMember}
                isMemberLoggedIn={isMemberLoggedIn}
                onSubmit={handleReservationSubmit}
                onCancel={() => {
                  const vehicleType = selectedVehicle?.category === 'car' ? 'cars' : 'motorcycles';
                  handleViewChange(vehicleType);
                }}
              />
            </div>
          </section>
        )}
        
        {currentView === 'contact' && siteSettings && (
          <section className="contact-section">
            <div className="container">
              <h2>お問い合わせ</h2>
              <div className="contact-info">
                <div className="contact-card">
                  <h3>営業時間</h3>
                  <p>{siteSettings.contact.businessHours.weekday}</p>
                  <p>{siteSettings.contact.businessHours.weekend}</p>
                </div>
                <div className="contact-card">
                  <h3>連絡先</h3>
                  <p>📞 電話: {siteSettings.contact.phone}</p>
                  <p>📧 メール: <a href={`mailto:${siteSettings.contact.email}`}>{siteSettings.contact.email}</a></p>
                  <p>📍 住所: {siteSettings.contact.address}</p>
                </div>
                <div className="contact-card">
                  <h3>サービス内容</h3>
                  {siteSettings.services.map((service, index) => (
                    <p key={index}>{service}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
        
        {currentView === 'admin-login' && !isAdminLoggedIn && (
          <AdminLogin onLogin={handleAdminLogin} />
        )}
        
        {currentView === 'admin' && isAdminLoggedIn && (
          <AdminDashboard 
            vehicles={vehicles}
            reservations={reservations}
            members={members}
            onVehicleUpdate={handleVehicleUpdate}
            onReservationUpdate={handleReservationUpdate}
            onMemberUpdate={handleMemberUpdate}
            onSiteSettingsUpdate={handleSiteSettingsUpdate}
            onLogout={handleAdminLogout}
          />
        )}
        
        {currentView === 'member-login' && !isMemberLoggedIn && (
          <MemberLogin 
            onLogin={handleMemberLogin}
            onCancel={() => setCurrentView('home')}
            onRegister={() => setCurrentView('member-register')}
          />
        )}
        
        {currentView === 'member-register' && (
          <MemberRegistration 
            onRegister={handleMemberRegister}
            onCancel={() => setCurrentView('home')}
          />
        )}
        
        {currentView === 'mypage' && isMemberLoggedIn && currentMember && (
          <MemberMyPage 
            member={currentMember}
            reservations={reservations}
            onLogout={handleMemberLogout}
            onUpdateProfile={handleMemberProfileUpdate}
          />
        )}
        
        {currentView === 'terms' && (
          <TermsPage onBack={() => setCurrentView('home')} />
        )}
        
        {currentView === 'privacy' && (
          <PrivacyPage onBack={() => setCurrentView('home')} />
        )}
      </main>
      
      <footer className="site-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-links">
              <button 
                className="footer-link" 
                onClick={() => setCurrentView('terms')}
              >
                利用規約
              </button>
              <span className="footer-separator">|</span>
              <button 
                className="footer-link" 
                onClick={() => setCurrentView('privacy')}
              >
                プライバシーポリシー
              </button>
            </div>
            <p className="footer-copyright">&copy; 2024 RentalEasy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;