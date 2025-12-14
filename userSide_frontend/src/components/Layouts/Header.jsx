import React from "react";
import { Link } from "react-router-dom";
import "./Header.css"

const Header = () => {
  return (
    <header className="electro-header">
      <div className="electro-navbar">
        <div className="electro-logo">
          <h1>Arul Electronic</h1>
        </div>
        <nav className="electro-nav">
          <Link to="/" className="electro-nav-link">Home</Link>
          <Link to="/products" className="electro-nav-link">Products</Link>
          <Link to="/categories" className="electro-nav-link">Categories</Link>
          <Link to="/parcel" className="electro-nav-link">ParcelService</Link>
          <Link to="/about" className="electro-nav-link">About</Link>
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