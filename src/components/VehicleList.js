import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './VehicleList.css';

const VehicleList = ({ user }) => {
  const { type } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('daily');
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [insuranceOptions, setInsuranceOptions] = useState({
    basic: true,
    collision: false,
    comprehensive: false,
    personal: false
  });
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Vehicle images mapping
  const vehicleImages = {
    // Cars
    'Toyota Camry': 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=250&fit=crop',
    'Honda Civic': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400&h=250&fit=crop',
    'Ford Explorer': 'https://images.unsplash.com/photo-1519641766812-1cfa1137dc16?w=400&h=250&fit=crop',
    'Chevrolet Tahoe': 'https://images.unsplash.com/photo-1563720223809-b9a3d1694e2a?w=400&h=250&fit=crop',
    'Honda Odyssey': 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=250&fit=crop',
    'Toyota Sienna': 'https://images.unsplash.com/photo-1533473359331-0135ef1f614e?w=400&h=250&fit=crop',
    'Mercedes S-Class': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=400&h=250&fit=crop',
    'BMW 7 Series': 'https://images.unsplash.com/photo-1555215858-9f41d89c0e7f?w=400&h=250&fit=crop',
    'Nissan Altima': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=250&fit=crop',
    'Tesla Model 3': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=250&fit=crop',
    // Bikes
    'Honda PCX': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    'Yamaha MT-07': 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=400&h=250&fit=crop',
    'Kawasaki Ninja 400': 'https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=400&h=250&fit=crop',
    'Honda CB400': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    'Suzuki Burgman': 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=250&fit=crop',
    'Harley-Davidson Iron 883': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    'BMW R1250GS': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&h=250&fit=crop',
    'Ducati Monster': 'https://images.unsplash.com/photo-1580341289255-5b47c98a59dd?w=400&h=250&fit=crop',
    'Vespa Primavera': 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=250&fit=crop',
    'Triumph Street Triple': 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=400&h=250&fit=crop',
    'Default': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=250&fit=crop'
  };

  const plans = {
    daily: { label: 'Daily Plan', multiplier: 1, unit: 'day' },
    weekly: { label: 'Weekly Plan', multiplier: 0.85, unit: 'week', discount: '15% OFF' },
    monthly: { label: 'Monthly Plan', multiplier: 0.7, unit: 'month', discount: '30% OFF' },
    purchase: { label: 'Purchase Option', multiplier: 365, unit: 'purchase', discount: 'Best Value' }
  };

  const insurancePrices = {
    basic: 0,
    collision: 2000,
    comprehensive: 3500,
    personal: 1500
  };

  useEffect(() => {
    const storedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    let filteredVehicles = storedVehicles;
    
    if (type && type !== 'all') {
      filteredVehicles = storedVehicles.filter(v => 
        v.type.toLowerCase() === type.toLowerCase()
      );
    }
    
    if (filteredVehicles.length === 0) {
      const defaultVehicles = generateDefaultVehicles(type);
      setVehicles(defaultVehicles);
      localStorage.setItem('vehicles', JSON.stringify(defaultVehicles));
    } else {
      setVehicles(filteredVehicles);
    }
  }, [type]);

  useEffect(() => {
    calculateTotalPrice();
  }, [selectedVehicle, selectedPlan, selectedDuration, insuranceOptions]);

  const generateDefaultVehicles = (vehicleType) => {
    const carVehicles = [
      { id: 1, name: 'Toyota Camry', type: 'car', price: 8000, passengers: 5, features: 'GPS, Bluetooth, Backup Camera', available: true },
      { id: 2, name: 'Honda Civic', type: 'car', price: 7000, passengers: 5, features: 'Apple CarPlay, Lane Assist', available: true },
      { id: 3, name: 'Ford Explorer', type: 'car', price: 12000, passengers: 7, features: '4WD, Navigation, Leather Seats', available: true },
      { id: 4, name: 'Chevrolet Tahoe', type: 'car', price: 15000, passengers: 8, features: 'Premium Audio, Sunroof, DVD Player', available: true },
      { id: 5, name: 'Honda Odyssey', type: 'car', price: 11000, passengers: 8, features: 'Sliding Doors, Entertainment System', available: true },
      { id: 6, name: 'Toyota Sienna', type: 'car', price: 12000, passengers: 8, features: 'All-Wheel Drive, Spacious Interior', available: true },
      { id: 7, name: 'Mercedes S-Class', type: 'car', price: 25000, passengers: 5, features: 'Massage Seats, Premium Sound, Autopilot', available: true },
      { id: 8, name: 'BMW 7 Series', type: 'car', price: 23000, passengers: 5, features: 'Night Vision, Gesture Control, Wi-Fi', available: true },
      { id: 9, name: 'Nissan Altima', type: 'car', price: 7500, passengers: 5, features: 'ProPILOT Assist, Remote Start', available: true },
      { id: 10, name: 'Tesla Model 3', type: 'car', price: 18000, passengers: 5, features: 'Autopilot, Electric, Supercharging', available: true }
    ];

    const bikeVehicles = [
      { id: 11, name: 'Honda PCX', type: 'bike', price: 3000, passengers: 2, features: 'Automatic, Storage Box, Fuel Efficient', available: true },
      { id: 12, name: 'Yamaha MT-07', type: 'bike', price: 5000, passengers: 2, features: 'Sport Naked, ABS, LED Lights', available: true },
      { id: 13, name: 'Kawasaki Ninja 400', type: 'bike', price: 5500, passengers: 2, features: 'Sport Bike, Slipper Clutch, Digital Display', available: true },
      { id: 14, name: 'Honda CB400', type: 'bike', price: 4500, passengers: 2, features: 'Classic Style, VTEC Engine, Comfortable', available: true },
      { id: 15, name: 'Suzuki Burgman', type: 'bike', price: 4000, passengers: 2, features: 'Maxi Scooter, Large Storage, Windshield', available: true },
      { id: 16, name: 'Harley-Davidson Iron 883', type: 'bike', price: 8000, passengers: 2, features: 'Cruiser, V-Twin Engine, Classic Style', available: true },
      { id: 17, name: 'BMW R1250GS', type: 'bike', price: 9500, passengers: 2, features: 'Adventure, Boxer Engine, Electronic Suspension', available: true },
      { id: 18, name: 'Ducati Monster', type: 'bike', price: 7000, passengers: 2, features: 'Naked Sport, L-Twin Engine, Trellis Frame', available: true },
      { id: 19, name: 'Vespa Primavera', type: 'bike', price: 2500, passengers: 2, features: 'Classic Scooter, Retro Style, City Friendly', available: true },
      { id: 20, name: 'Triumph Street Triple', type: 'bike', price: 6500, passengers: 2, features: 'Street Fighter, Triple Engine, Quick Shifter', available: true }
    ];

    const allVehicles = [...carVehicles, ...bikeVehicles];

    if (vehicleType === 'car') {
      return carVehicles;
    } else if (vehicleType === 'bike') {
      return bikeVehicles;
    } else if (vehicleType && vehicleType !== 'all') {
      return allVehicles.filter(v => v.type.toLowerCase() === vehicleType.toLowerCase());
    }
    return allVehicles;
  };

  const calculateTotalPrice = () => {
    if (!selectedVehicle) return;

    let basePrice = selectedVehicle.price;
    const plan = plans[selectedPlan];
    let duration = selectedDuration;

    // Calculate base rental price
    let rentalPrice = basePrice * plan.multiplier * duration;
    
    // Add insurance costs
    let insuranceTotal = 0;
    Object.keys(insuranceOptions).forEach(key => {
      if (insuranceOptions[key]) {
        insuranceTotal += insurancePrices[key] * duration;
      }
    });

    const total = rentalPrice + insuranceTotal;
    setTotalPrice(total);
  };

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
    // Adjust duration defaults based on plan
    if (plan === 'weekly') setSelectedDuration(1);
    else if (plan === 'monthly') setSelectedDuration(1);
    else if (plan === 'purchase') setSelectedDuration(1);
    else setSelectedDuration(1);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    // Auto-calculate end date based on plan
    if (date) {
      const startDate = new Date(date);
      let endDate = new Date(date);
      
      if (selectedPlan === 'daily') {
        endDate.setDate(startDate.getDate() + selectedDuration);
      } else if (selectedPlan === 'weekly') {
        endDate.setDate(startDate.getDate() + (selectedDuration * 7));
      } else if (selectedPlan === 'monthly') {
        endDate.setMonth(startDate.getMonth() + selectedDuration);
      }
      
      setSelectedEndDate(endDate.toISOString().split('T')[0]);
    }
  };

  const handleBookVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowBookingModal(true);
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    handleDateChange(today);
  };

  const confirmBooking = () => {
    if (!selectedDate) {
      alert('Please select a start date');
      return;
    }

    const booking = {
      id: Date.now(),
      vehicleId: selectedVehicle.id,
      vehicleName: selectedVehicle.name,
      userId: user?.id,
      userName: user?.name || 'Guest',
      pickupDate: selectedDate,
      returnDate: selectedEndDate,
      plan: selectedPlan,
      duration: selectedDuration,
      insurance: insuranceOptions,
      totalPrice: totalPrice,
      status: 'confirmed',
      bookingDate: new Date().toISOString()
    };

    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));

    setBookingSuccess(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingSuccess(false);
      setSelectedVehicle(null);
      resetBookingForm();
    }, 2000);
  };

  const resetBookingForm = () => {
    setSelectedPlan('daily');
    setSelectedDuration(1);
    setSelectedDate('');
    setSelectedEndDate('');
    setInsuranceOptions({
      basic: true,
      collision: false,
      comprehensive: false,
      personal: false
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  return (
    <div className="vehicle-list-container">
      <div className="vehicle-list-header">
        <h1>{type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Vehicles` : 'All Vehicles'}</h1>
        <p>Choose from our premium selection of vehicles</p>
      </div>

      <div className="vehicles-grid">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="vehicle-image-container">
              <img 
                src={vehicleImages[vehicle.name] || vehicleImages['Default']} 
                alt={vehicle.name}
                className="vehicle-image"
              />
              <span className="vehicle-badge">{vehicle.type === 'car' ? 'Car' : vehicle.type === 'bike' ? 'Bike' : vehicle.type}</span>
              {vehicle.available && <span className="available-badge">Available</span>}
            </div>
            
            <div className="vehicle-details">
              <h3>{vehicle.name}</h3>
              <div className="vehicle-features">
                <span className="feature-tag">👥 {vehicle.passengers} seats</span>
                {vehicle.features?.split(',').slice(0, 2).map((feature, idx) => (
                  <span key={idx} className="feature-tag">{feature.trim()}</span>
                ))}
              </div>
              
              <div className="vehicle-pricing">
                <div className="price-display">
                  <span className="price-amount">{formatCurrency(vehicle.price)}</span>
                  <span className="price-period">/ day</span>
                </div>
                <button 
                  className="modern-book-btn"
                  onClick={() => handleBookVehicle(vehicle)}
                  disabled={!vehicle.available}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showBookingModal && selectedVehicle && (
        <div className="modern-modal-overlay">
          <div className="modern-modal">
            {bookingSuccess ? (
              <div className="success-animation">
                <div className="success-icon">✓</div>
                <h2>Booking Confirmed!</h2>
                <p>Your {selectedVehicle.name} has been reserved</p>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <h2>Complete Your Booking</h2>
                  <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
                </div>

                <div className="booking-content">
                  <div className="vehicle-summary">
                    <img 
                      src={vehicleImages[selectedVehicle.name] || vehicleImages['Default']} 
                      alt={selectedVehicle.name}
                      className="summary-image"
                    />
                    <div className="summary-details">
                      <h3>{selectedVehicle.name}</h3>
                      <p>{selectedVehicle.type === 'car' ? 'Car' : 'Bike'} • {selectedVehicle.passengers} {selectedVehicle.type === 'bike' ? 'riders' : 'passengers'}</p>
                    </div>
                  </div>

                  <div className="booking-form">
                    <div className="form-section">
                      <h4>Select Your Plan</h4>
                      <div className="plan-options">
                        {Object.entries(plans).map(([key, plan]) => (
                          <div 
                            key={key}
                            className={`plan-card ${selectedPlan === key ? 'selected' : ''}`}
                            onClick={() => handlePlanChange(key)}
                          >
                            <div className="plan-name">{plan.label}</div>
                            {plan.discount && <div className="plan-discount">{plan.discount}</div>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-section">
                      <h4>Select Dates</h4>
                      <div className="date-inputs">
                        <div className="date-input-group">
                          <label>Start Date</label>
                          <input 
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="modern-date-input"
                          />
                        </div>
                        <div className="date-input-group">
                          <label>End Date</label>
                          <input 
                            type="date"
                            value={selectedEndDate}
                            readOnly
                            className="modern-date-input"
                          />
                        </div>
                        <div className="duration-input-group">
                          <label>Duration</label>
                          <div className="duration-selector">
                            <button onClick={() => setSelectedDuration(Math.max(1, selectedDuration - 1))}>-</button>
                            <span>{selectedDuration} {plans[selectedPlan].unit}(s)</span>
                            <button onClick={() => setSelectedDuration(selectedDuration + 1)}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <h4>Insurance Options</h4>
                      <div className="insurance-options">
                        <div className="insurance-item">
                          <label className="toggle-label">
                            <input 
                              type="checkbox"
                              checked={insuranceOptions.basic}
                              disabled
                            />
                            <span className="toggle-slider"></span>
                            <div className="insurance-info">
                              <span className="insurance-name">Basic Coverage</span>
                              <span className="insurance-price">Included</span>
                            </div>
                          </label>
                        </div>
                        
                        <div className="insurance-item">
                          <label className="toggle-label">
                            <input 
                              type="checkbox"
                              checked={insuranceOptions.collision}
                              onChange={(e) => setInsuranceOptions({...insuranceOptions, collision: e.target.checked})}
                            />
                            <span className="toggle-slider"></span>
                            <div className="insurance-info">
                              <span className="insurance-name">Collision Damage Waiver</span>
                              <span className="insurance-price">+{formatCurrency(insurancePrices.collision)}/day</span>
                            </div>
                          </label>
                        </div>

                        <div className="insurance-item">
                          <label className="toggle-label">
                            <input 
                              type="checkbox"
                              checked={insuranceOptions.comprehensive}
                              onChange={(e) => setInsuranceOptions({...insuranceOptions, comprehensive: e.target.checked})}
                            />
                            <span className="toggle-slider"></span>
                            <div className="insurance-info">
                              <span className="insurance-name">Comprehensive Coverage</span>
                              <span className="insurance-price">+{formatCurrency(insurancePrices.comprehensive)}/day</span>
                            </div>
                          </label>
                        </div>

                        <div className="insurance-item">
                          <label className="toggle-label">
                            <input 
                              type="checkbox"
                              checked={insuranceOptions.personal}
                              onChange={(e) => setInsuranceOptions({...insuranceOptions, personal: e.target.checked})}
                            />
                            <span className="toggle-slider"></span>
                            <div className="insurance-info">
                              <span className="insurance-name">Personal Accident Insurance</span>
                              <span className="insurance-price">+{formatCurrency(insurancePrices.personal)}/day</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="price-breakdown">
                      <div className="price-row">
                        <span>Vehicle ({selectedDuration} {plans[selectedPlan].unit}s)</span>
                        <span>{formatCurrency(selectedVehicle.price * plans[selectedPlan].multiplier * selectedDuration)}</span>
                      </div>
                      {Object.entries(insuranceOptions).map(([key, enabled]) => 
                        enabled && key !== 'basic' && (
                          <div key={key} className="price-row">
                            <span>{key.charAt(0).toUpperCase() + key.slice(1)} Insurance</span>
                            <span>{formatCurrency(insurancePrices[key] * selectedDuration)}</span>
                          </div>
                        )
                      )}
                      <div className="price-row total">
                        <span>Total Amount</span>
                        <span className="total-amount">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button className="cancel-btn" onClick={() => setShowBookingModal(false)}>
                        Cancel
                      </button>
                      <button className="confirm-btn" onClick={confirmBooking}>
                        Confirm Booking
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;