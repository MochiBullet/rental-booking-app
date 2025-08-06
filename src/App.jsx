import React, { useState, useEffect } from 'react';
import { vehicleData } from './data/vehicleData';
import { initialMembers } from './data/memberData';
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
      status: 'confirmed'
    };
    setReservations(prev => [...prev, newReservation]);
    
    alert('予約が完了しました！ご利用ありがとうございます。');
    
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
    setCurrentView('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
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
    const newMember = {
      ...memberData,
      id: Date.now(),
      membershipInfo: {
        memberNumber: `M${String(Date.now()).slice(-6)}`,
        joinDate: new Date().toISOString().split('T')[0],
        membershipType: 'regular',
        points: 1000 // 登録ボーナス
      },
      reservationHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    
    setMembers(prev => [...prev, newMember]);
    alert('会員登録が完了しました！ログインしてご利用ください。');
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
          <>
            <Hero onViewChange={handleViewChange} />
            <section id="vehicles" className="vehicles-section">
              <div className="container">
                <h2>車両一覧</h2>
                <VehicleList 
                  vehicles={vehicles} 
                  onVehicleSelect={handleVehicleSelect}
                  initialFilter={vehicleFilter}
                />
              </div>
            </section>
          </>
        )}
        
        {currentView === 'vehicles' && (
          <section className="vehicles-section">
            <div className="container">
              <h2>車両一覧</h2>
              <VehicleList 
                vehicles={vehicles} 
                onVehicleSelect={handleVehicleSelect}
                initialFilter={vehicleFilter}
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
                onSubmit={handleReservationSubmit}
                onCancel={() => handleViewChange('vehicles')}
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
      </main>
      
      <footer style={{background: '#333', color: 'white', padding: '1rem', textAlign: 'center'}}>
        <p>&copy; 2024 RentalEasy. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;