import React from "react";
import "./Offer.css";

const Offer = () => {
  return (
    <div className="electro-offer-section">
      <div className="electro-offer-banner">
        <div className="electro-offer-content">
          <h2 className="electro-offer-title">Summer Sale!</h2>
          <p className="electro-offer-subtitle">Up to 50% Off on Electronics</p>
          <p className="electro-offer-desc">
            Limited time offer on smartphones, laptops, and accessories
          </p>
          <button className="electro-offer-button">Shop Sale</button>
        </div>
        <div className="electro-offer-timer">
          <div className="electro-timer-box">
            <span className="electro-timer-number">02</span>
            <span className="electro-timer-label">Days</span>
          </div>
          <div className="electro-timer-box">
            <span className="electro-timer-number">12</span>
            <span className="electro-timer-label">Hours</span>
          </div>
          <div className="electro-timer-box">
            <span className="electro-timer-number">45</span>
            <span className="electro-timer-label">Minutes</span>
          </div>
          <div className="electro-timer-box">
            <span className="electro-timer-number">30</span>
            <span className="electro-timer-label">Seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;