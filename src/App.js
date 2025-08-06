import React, { useState } from 'react';
import './App.css';

function App() {
  const [vehicles] = useState([
    { id: 1, type: 'car', name: 'Toyota Corolla', price: 5000, image: '🚗' },
    { id: 2, type: 'car', name: 'Honda Civic', price: 5500, image: '🚙' },
    { id: 3, type: 'car', name: 'Nissan Note', price: 4500, image: '🚗' },
    { id: 4, type: 'bike', name: 'Yamaha MT-07', price: 3000, image: '🏍️' },
    { id: 5, type: 'bike', name: 'Honda CB400', price: 3500, image: '🏍️' },
    { id: 6, type: 'bike', name: 'Kawasaki Ninja', price: 2800, image: '🏍️' }
  ]);

  const [filter, setFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    startDate: '',
    endDate: ''
  });

  const filteredVehicles = filter === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.type === filter);

  const handleBooking = (e) => {
    e.preventDefault();
    alert(`予約が完了しました！\n車両: ${selectedVehicle.name}\nお名前: ${bookingForm.name}`);
    setSelectedVehicle(null);
    setBookingForm({ name: '', email: '', startDate: '', endDate: '' });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚗 レンタル予約サービス 🏍️</h1>
        <p>車とバイクのオンライン予約</p>
      </header>

      <main>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            すべて
          </button>
          <button 
            className={filter === 'car' ? 'active' : ''}
            onClick={() => setFilter('car')}
          >
            車
          </button>
          <button 
            className={filter === 'bike' ? 'active' : ''}
            onClick={() => setFilter('bike')}
          >
            バイク
          </button>
        </div>

        <div className="vehicle-grid">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className="vehicle-card">
              <div className="vehicle-icon">{vehicle.image}</div>
              <h3>{vehicle.name}</h3>
              <p className="price">¥{vehicle.price.toLocaleString()}/日</p>
              <button onClick={() => setSelectedVehicle(vehicle)}>
                予約する
              </button>
            </div>
          ))}
        </div>

        {selectedVehicle && (
          <div className="modal">
            <div className="modal-content">
              <h2>{selectedVehicle.name}の予約</h2>
              <form onSubmit={handleBooking}>
                <input
                  type="text"
                  placeholder="お名前"
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                  required
                />
                <input
                  type="date"
                  placeholder="開始日"
                  value={bookingForm.startDate}
                  onChange={(e) => setBookingForm({...bookingForm, startDate: e.target.value})}
                  required
                />
                <input
                  type="date"
                  placeholder="終了日"
                  value={bookingForm.endDate}
                  onChange={(e) => setBookingForm({...bookingForm, endDate: e.target.value})}
                  required
                />
                <div className="modal-buttons">
                  <button type="submit">予約確定</button>
                  <button type="button" onClick={() => setSelectedVehicle(null)}>
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;