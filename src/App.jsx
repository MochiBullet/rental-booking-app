import React, { useState } from 'react';
import { vehicleData } from './data/vehicleData';
import Header from './components/Header';
import Hero from './components/Hero';
import VehicleList from './components/VehicleList';
import ReservationForm from './components/ReservationForm';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [reservations, setReservations] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleFilter, setVehicleFilter] = useState('all');

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

  return (
    <div className="App">
      <Header 
        currentView={currentView} 
        onViewChange={handleViewChange}
        reservationCount={reservations.length}
      />
      
      <main>
        {currentView === 'home' && (
          <>
            <Hero onViewChange={handleViewChange} />
            <section id="vehicles" className="vehicles-section">
              <div className="container">
                <h2>車両一覧</h2>
                <VehicleList 
                  vehicles={vehicleData} 
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
                vehicles={vehicleData} 
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
        
        {currentView === 'contact' && (
          <section className="contact-section">
            <div className="container">
              <h2>お問い合わせ</h2>
              <div className="contact-info">
                <div className="contact-card">
                  <h3>営業時間</h3>
                  <p>平日: 9:00 - 18:00</p>
                  <p>土日祝: 9:00 - 17:00</p>
                </div>
                <div className="contact-card">
                  <h3>連絡先</h3>
                  <p>📞 電話: 03-1234-5678</p>
                  <p>📧 メール: info@rentaleasy.com</p>
                  <p>📍 住所: 東京都渋谷区xxx-xxx</p>
                </div>
                <div className="contact-card">
                  <h3>サービス内容</h3>
                  <p>・車両レンタル</p>
                  <p>・バイクレンタル</p>
                  <p>・配車サービス</p>
                  <p>・24時間サポート</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <footer style={{background: '#333', color: 'white', padding: '1rem', textAlign: 'center'}}>
        <p>&copy; 2024 RentalEasy. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;