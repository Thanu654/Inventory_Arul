import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Package, Tag, Truck, Info, Menu, Phone } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/products", label: "Products", icon: Package },
    { to: "/offers", label: "Offers", icon: Tag },
    { to: "/parcel", label: "Parcel Service", icon: Truck },
    { to: "/about", label: "About", icon: Info },
    { to: "/contact", label: "Contact", icon: Phone },
  ];

  // Check if current path matches link
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Header - Top Navigation */}
      <header className="hidden lg:block sticky top-0 z-50 bg-gradient-to-br from-gray-900 to-black text-white shadow-xl shadow-gray-900/30">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <h1 className="relative text-3xl font-bold tracking-tighter">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Arul Electronic
                  </span>
                </h1>
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent"></div>
              <div className="text-sm text-gray-400 font-medium">
                Premium Electronics Store
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group relative px-5 py-3 rounded-xl transition-all duration-300 ${
                    isActive(link.to)
                      ? "bg-gradient-to-br from-blue-900/30 to-purple-900/30"
                      : "hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <link.icon
                      size={18}
                      className={`transition-colors duration-300 ${
                        isActive(link.to)
                          ? "text-blue-400"
                          : "text-gray-400 group-hover:text-white"
                      }`}
                    />
                    <span className="font-medium relative">
                      {link.label}
                      <span
                        className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full ${
                          isActive(link.to) ? "w-full" : ""
                        }`}
                      ></span>
                    </span>
                  </div>
                  {isActive(link.to) && (
                    <div className="absolute top-0 right-0 w-2 h-2">
                      <div className="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-75"></div>
                      <div className="relative w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Header - Top Bar with Hamburger */}
      <header className="lg:hidden sticky top-0 z-50 bg-gradient-to-br from-gray-900 to-black text-white shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Mobile Logo */}
            <div className="flex items-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-20"></div>
                <h1 className="relative text-xl font-bold">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Arul Electronic
                  </span>
                </h1>
              </div>
            </div>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isMenuOpen
                  ? "bg-gradient-to-br from-blue-900/50 to-purple-900/50"
                  : "bg-gray-800/50 hover:bg-gray-700/50"
              }`}
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    isMenuOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                  }`}
                  size={24}
                />
                <div
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"
                  }`}
                >
                  <div className="w-5 h-0.5 bg-white rotate-45 translate-y-0.5"></div>
                  <div className="w-5 h-0.5 bg-white -rotate-45 -translate-y-0.5"></div>
                </div>
              </div>
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
              isMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="space-y-2 border-t border-gray-800 pt-4">
              {navLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                    isActive(link.to)
                      ? "bg-gradient-to-r from-blue-900/30 to-purple-900/30"
                      : "hover:bg-gray-800/50"
                  }`}
                  style={{
                    animationDelay: isMenuOpen ? `${index * 50}ms` : "0ms",
                    animation: isMenuOpen
                      ? "slideInDown 0.3s ease-out forwards"
                      : "none",
                  }}
                >
                  <div className={`p-2 rounded-lg ${isActive(link.to) ? 'bg-blue-900/30' : 'bg-gray-800'}`}>
                    <link.icon
                      size={20}
                      className={isActive(link.to) ? "text-blue-400" : "text-gray-400"}
                    />
                  </div>
                  <span className="font-medium text-lg">{link.label}</span>
                  {isActive(link.to) && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Button Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-gray-900 to-black border-t border-gray-800 shadow-2xl">
        <div className="container mx-auto px-2">
          <div className="flex items-center justify-around py-3">
            {navLinks.slice(0, 6).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
                  isActive(link.to)
                    ? "bg-gradient-to-b from-blue-600/20 to-purple-600/20 transform -translate-y-2"
                    : "hover:bg-gray-800/50"
                }`}
              >
                <div
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isActive(link.to)
                      ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25"
                      : "bg-gray-800"
                  }`}
                >
                  <link.icon
                    size={20}
                    className={
                      isActive(link.to) ? "text-white" : "text-gray-400"
                    }
                  />
                </div>
                <span
                  className={`text-xs mt-1 font-medium transition-all duration-300 ${
                    isActive(link.to)
                      ? "text-white scale-110"
                      : "text-gray-400"
                  }`}
                >
                  {link.label}
                </span>
                {isActive(link.to) && (
                  <div className="absolute -top-1 w-6 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Add padding to content for mobile bottom nav */}
      <div className="lg:hidden pb-20"></div>

      <style jsx>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideOutUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
};

export default Header;