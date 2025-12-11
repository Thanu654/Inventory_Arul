import React from "react";
import "./Header.css"
const Header = () => {
  return (
    <header className="electro-header">
      <div className="electro-navbar">
        <div className="electro-logo">
          <h1>Electro Store</h1>
        </div>
        <nav className="electro-nav">
          <a href="#" className="electro-nav-link">Home</a>
          <a href="#" className="electro-nav-link">Products</a>
          <a href="#" className="electro-nav-link">Categories</a>
          <a href="#" className="electro-nav-link">ParcelService</a>
          <a href="#" className="electro-nav-link">AboutUS</a>
        </nav>
        <div className="electro-nav-icons">
          <button className="electro-icon-btn" title="Search">🔍</button>
          <button className="electro-icon-btn" title="Wishlist">❤️</button>
          <button className="electro-icon-btn" title="Cart">🛒</button>
          <button className="electro-icon-btn" title="Account">👤</button>
        </div>
      </div>
    </header>
  );
};

export default Header;