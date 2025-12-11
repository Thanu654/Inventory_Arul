import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="electro-footer">
      <div className="electro-footer-content">
        <div>
          <h3>Electro Store</h3>
          <p>Premium electronics and gadgets for your everyday needs.</p>
          <div className="electro-social-icons">
            <a href="#" className="electro-social-icon">📘</a>
            <a href="#" className="electro-social-icon">🐦</a>
            <a href="#" className="electro-social-icon">📷</a>
            <a href="#" className="electro-social-icon">🎬</a>
          </div>
        </div>
        
        <div className="electro-footer-section">
          <h4>Quick Links</h4>
          <a href="#">Home</a>
          <a href="#">About Us</a>
          <a href="#">Products</a>
          <a href="#">Contact</a>
        </div>
        
        <div className="electro-footer-section">
          <h4>Customer Service</h4>
          <a href="#">FAQ</a>
          <a href="#">Shipping Policy</a>
          <a href="#">Return Policy</a>
          <a href="#">Privacy Policy</a>
        </div>
        
        <div className="electro-footer-section">
          <h4>Contact Info</h4>
          <p>📧 support@electrostore.com</p>
          <p>📞 +1 (555) 123-4567</p>
          <p>📍 123 Electronics Street, Tech City</p>
        </div>
      </div>
      
      <div className="electro-footer-bottom">
        <p>© {new Date().getFullYear()} Electro Store. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;