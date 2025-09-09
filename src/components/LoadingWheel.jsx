import React from 'react';
import './LoadingWheel.css';

const LoadingWheel = ({ size = 60, message = "読み込み中..." }) => {
  return (
    <div className="loading-container">
      <div className="wheel-spinner" style={{width: size, height: size}}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 外側のタイヤ */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="#2C2C2C"
            stroke="#1A1A1A"
            strokeWidth="2"
          />
          
          {/* 内側のホイール */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="#C0C0C0"
            stroke="#808080"
            strokeWidth="1"
          />
          
          {/* ホイールスポーク */}
          <g stroke="#606060" strokeWidth="2" fill="none">
            <line x1="50" y1="15" x2="50" y2="85" />
            <line x1="15" y1="50" x2="85" y2="50" />
            <line x1="25" y1="25" x2="75" y2="75" />
            <line x1="75" y1="25" x2="25" y2="75" />
          </g>
          
          {/* 中央のハブキャップ */}
          <circle
            cx="50"
            cy="50"
            r="15"
            fill="linear-gradient(135deg, #43a047 0%, #66bb6a 100%)"
            stroke="#2e7d32"
            strokeWidth="1"
          />
          
          {/* 中央ロゴ */}
          <text
            x="50"
            y="55"
            textAnchor="middle"
            fontSize="12"
            fill="white"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            M
          </text>
        </svg>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingWheel;