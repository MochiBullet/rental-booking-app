import React from 'react';
import './LoadingWheel.css';

const LoadingWheel = ({ size = 200, message = "少々お待ちください" }) => {
  // sizeに応じてクラスを決定
  let sizeClass = '';
  if (size <= 100) {
    sizeClass = 'small';
  } else if (size >= 200) {
    sizeClass = 'large';
  }
  
  return (
    <div className="loading-container">
      <div className={`car-wheel-spinner ${sizeClass}`}></div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoadingWheel;