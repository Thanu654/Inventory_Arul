import React, { useState, useEffect } from "react";

const ContactButtons = ({
  phone = "+9475350101",
  waMessage = "Hello! I'm interested in your products. Can you help me?",
  locationUrl = "https://maps.google.com/?q=Arul+Electrical+Earlalai"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const phoneDigits = phone.replace(/\D/g, "");

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Animation on mount
    setTimeout(() => setIsVisible(true), 300);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, "_blank");
  };

  const handleCallClick = () => {
    window.location.href = `tel:${phone}`;
  };

  const handleLocationClick = () => {
    window.open(locationUrl, "_blank");
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Desktop version (floating buttons on right)
  if (!isMobile) {
    return (
      <div className={`fixed right-6 bottom-6 flex flex-col gap-4 z-50 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* WhatsApp Button with glow effect */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-green-500 rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
          <button
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
            onClick={handleWhatsAppClick}
            title="WhatsApp"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform duration-300">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.71.46 3.31 1.24 4.71L2 22l5.29-1.24C8.69 21.54 10.29 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-green-600 text-xs font-bold rounded-full flex items-center justify-center border-2 border-green-600">
              WA
            </span>
          </button>
        </div>

        {/* Call Button with ring animation */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-blue-500 rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
          <button
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
            onClick={handleCallClick}
            title="Call Now"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform duration-300">
              <path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6-.3-.1-.6 0-.8.2l-2.2 2.2c-2.8-1.5-5.2-3.9-6.7-6.7l2.2-2.2c.2-.2.3-.5.2-.8-.4-1.1-.6-2.4-.6-3.6C8.5 3.5 8 3 7.5 3H4c-.5 0-1 .5-1 1 0 9.4 7.6 17 17 17 .5 0 1-.5 1-1v-3.5c0-.5-.5-1-1-1z" />
            </svg>
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20"></div>
          </button>
        </div>

        {/* Location Button with map pin effect */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-orange-500 rounded-full blur opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
          <button
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 group"
            onClick={handleLocationClick}
            title="Location"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform duration-300">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
            </svg>
            <span className="absolute -bottom-1 w-4 h-1 bg-white rounded-full"></span>
          </button>
        </div>
      </div>
    );
  }

  // Mobile version (fab menu that doesn't interfere with bottom nav)
  return (
    <>
      {/* Main Floating Action Button */}
      <button
        className={`fixed right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 text-white flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-500 ${isMenuOpen ? 'bottom-28 rotate-45' : 'bottom-24'} ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        onClick={handleMenuToggle}
        title="Contact Options"
      >
        <div className="relative">
          <div className={`absolute inset-0 rounded-full bg-white/20 animate-ping ${isMenuOpen ? 'opacity-20' : 'opacity-0'} transition-opacity duration-300`}></div>
          <svg 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className={`transition-transform duration-500 ${isMenuOpen ? 'rotate-180' : ''}`}
          >
            {isMenuOpen ? (
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            ) : (
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            )}
          </svg>
        </div>
      </button>

      {/* Floating Menu Items */}
      <div className={`fixed right-6 z-40 flex flex-col gap-3 transition-all duration-500 ${isMenuOpen ? 'bottom-48 opacity-100' : 'bottom-24 opacity-0 pointer-events-none'}`}>
        
        {/* WhatsApp Button */}
        <div className={`relative transition-all duration-300 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`} style={{ transitionDelay: isMenuOpen ? '100ms' : '0ms' }}>
          <div className="absolute -inset-1 bg-green-500 rounded-full blur opacity-20"></div>
          <button
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
            onClick={handleWhatsAppClick}
            title="WhatsApp"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 1.71.46 3.31 1.24 4.71L2 22l5.29-1.24C8.69 21.54 10.29 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
          </button>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            WhatsApp
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        </div>

        {/* Call Button */}
        <div className={`relative transition-all duration-300 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`} style={{ transitionDelay: isMenuOpen ? '200ms' : '0ms' }}>
          <div className="absolute -inset-1 bg-blue-500 rounded-full blur opacity-20"></div>
          <button
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
            onClick={handleCallClick}
            title="Call Now"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6-.3-.1-.6 0-.8.2l-2.2 2.2c-2.8-1.5-5.2-3.9-6.7-6.7l2.2-2.2c.2-.2.3-.5.2-.8-.4-1.1-.6-2.4-.6-3.6C8.5 3.5 8 3 7.5 3H4c-.5 0-1 .5-1 1 0 9.4 7.6 17 17 17 .5 0 1-.5 1-1v-3.5c0-.5-.5-1-1-1z" />
            </svg>
          </button>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Call Now
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        </div>

        {/* Location Button */}
        <div className={`relative transition-all duration-300 ${isMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`} style={{ transitionDelay: isMenuOpen ? '300ms' : '0ms' }}>
          <div className="absolute -inset-1 bg-orange-500 rounded-full blur opacity-20"></div>
          <button
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
            onClick={handleLocationClick}
            title="Location"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
            </svg>
          </button>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Location
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        </div>

      </div>

      {/* Backdrop when menu is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={handleMenuToggle}
        ></div>
      )}
    </>
  );
};

export default ContactButtons;