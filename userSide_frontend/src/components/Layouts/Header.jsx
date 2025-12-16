import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-gray-900 to-black text-white shadow-lg shadow-gray-900/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-4">
          {/* Logo */}
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Arul Electronic</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-4 lg:gap-8 mb-4 lg:mb-0">
            <Link 
              to="/" 
              className="relative px-3 py-2 text-sm lg:text-base font-medium transition-all duration-300 hover:text-gray-200 hover:scale-105"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/products" 
              className="relative px-3 py-2 text-sm lg:text-base font-medium transition-all duration-300 hover:text-gray-200 hover:scale-105"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/categories" 
              className="relative px-3 py-2 text-sm lg:text-base font-medium transition-all duration-300 hover:text-gray-200 hover:scale-105"
            >
              Categories
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/parcel" 
              className="relative px-3 py-2 text-sm lg:text-base font-medium transition-all duration-300 hover:text-gray-200 hover:scale-105"
            >
              ParcelService
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/about" 
              className="relative px-3 py-2 text-sm lg:text-base font-medium transition-all duration-300 hover:text-gray-200 hover:scale-105"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex gap-2 lg:gap-4">
            <button 
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:-translate-y-0.5"
              title="Search"
            >
              🔍
            </button>
            <button 
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 relative"
              title="Wishlist"
            >
              ❤️
            </button>
            <button 
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:-translate-y-0.5 relative"
              title="Cart"
            >
              🛒
              {/* Cart Count Badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </button>
            <button 
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center hover:scale-110 hover:-translate-y-0.5"
              title="Account"
            >
              👤
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;