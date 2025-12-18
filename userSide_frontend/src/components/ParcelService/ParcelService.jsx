import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../Layouts/Header';
import Footer from '../Layouts/Footer';
import ContactButtons from '../Shared/ContactButtons';

const ParcelService = () => {
  const [rates, setRates] = useState([]);
  const [displayedRates, setDisplayedRates] = useState([]);
  const [area, setArea] = useState('');
  const [rate, setRate] = useState('');
  const [eta, setEta] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  
  // Refs for animation
  const shuffleInterval = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/delivery');
        const fetchedRates = res.data || [];
        setRates(fetchedRates);
        // Initial shuffle
        setDisplayedRates(shuffleArray([...fetchedRates]));
      } catch (err) {
        console.error('Failed to load delivery rates', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();

    // Start shuffle interval
    shuffleInterval.current = setInterval(() => {
      setIsShuffling(true);
      setTimeout(() => {
        setDisplayedRates(prev => shuffleArray([...prev]));
        setIsShuffling(false);
      }, 800); // Animation duration
    }, 60000); // Shuffle every minute

    return () => {
      if (shuffleInterval.current) {
        clearInterval(shuffleInterval.current);
      }
    };
  }, []);

  // Ensure page scrolls to top when this component mounts
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // fallback for environments without smooth scroll
      window.scrollTo(0, 0);
    }
  }, []);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Manual shuffle button
  const handleManualShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      setDisplayedRates(prev => shuffleArray([...prev]));
      setIsShuffling(false);
    }, 800);
  };

  const addRate = (e) => {
    e.preventDefault();
    if (!area.trim() || !rate.trim()) {
      setMessage('Please provide an area and a rate.');
      return;
    }
    const r = { id: Date.now(), area: area.trim(), rate: parseFloat(rate), eta: eta.trim() };
    setRates(prev => [r, ...prev]);
    setDisplayedRates(prev => [r, ...prev]);
    setArea(''); setRate(''); setEta(''); setMessage('Rate added');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleCall = () => {
    window.location.href = 'tel:+94755350101';
  };

  const handleWhatsApp = () => {
    const message = "Hello! I'm interested in your parcel delivery services from Sri Lanka. Can you provide more information?";
    const url = `https://wa.me/94755350101?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const openDetails = (item) => {
    setDetailsItem(item);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setDetailsItem(null);
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  // Get delivery method icon
  const getDeliveryIcon = (method) => {
    if (!method) return '🚚';
    const methodLower = method.toLowerCase();
    if (methodLower.includes('plan') || methodLower.includes('flight')) return '✈️';
    if (methodLower.includes('ship') || methodLower.includes('sea')) return '🚢';
    if (methodLower.includes('express')) return '⚡';
    return '🚚';
  };

  // Get delivery method color
  const getDeliveryColor = (method) => {
    if (!method) return '#3b82f6';
    const methodLower = method.toLowerCase();
    if (methodLower.includes('plan') || methodLower.includes('flight')) return '#3b82f6';
    if (methodLower.includes('ship') || methodLower.includes('sea')) return '#0ea5e9';
    if (methodLower.includes('express')) return '#8b5cf6';
    return '#10b981';
  };

  // Filter rates based on selection and search
  const filteredRates = displayedRates.filter(rateItem => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      (rateItem.country_name && rateItem.country_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rateItem.area && rateItem.area.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Category filter
    if (activeFilter === 'all') return true;
    if (activeFilter === 'offers') return rateItem.offer_price !== null && rateItem.offer_price !== undefined && rateItem.offer_price > 0;
    if (activeFilter === 'domestic') return !rateItem.country_name || !rateItem.country_name.toLowerCase().includes('international');
    if (activeFilter === 'international') return rateItem.country_name && rateItem.country_name.toLowerCase().includes('international');
    if (activeFilter === 'air') return rateItem.delivery_through && rateItem.delivery_through.toLowerCase().includes('plan');
    if (activeFilter === 'sea') return rateItem.delivery_through && rateItem.delivery_through.toLowerCase().includes('ship');
    return true;
  });

  // Calculate savings percentage
  const calculateSavings = (normalPrice, offerPrice) => {
    if (!offerPrice || offerPrice >= normalPrice) return 0;
    return Math.round(((normalPrice - offerPrice) / normalPrice) * 100);
  };

  // Get flag emoji for country
  const getCountryFlag = (countryName) => {
    if (!countryName) return '🇱🇰';
    const flagMap = {
      'usa': '🇺🇸',
      'uk': '🇬🇧',
      'australia': '🇦🇺',
      'canada': '🇨🇦',
      'india': '🇮🇳',
      'japan': '🇯🇵',
      'china': '🇨🇳',
      'germany': '🇩🇪',
      'france': '🇫🇷',
      'sri lanka': '🇱🇰',
    };
    
    const lowerName = countryName.toLowerCase();
    for (const [key, flag] of Object.entries(flagMap)) {
      if (lowerName.includes(key)) return flag;
    }
    
    return '🌍';
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

      

        {/* Premium Sri Lanka Global Hero Section - Compact */}
<section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl mx-4 md:mx-8 lg:mx-16 my-6 md:my-8 overflow-hidden min-h-[280px] md:min-h-[320px] flex flex-col justify-center transform-gpu transition-all duration-500 hover:scale-[1.005]">
  {/* Animated Gradient Background */}
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-indigo-900/90"></div>
  </div>
  
  {/* Floating Particles - Reduced count */}
  <div className="absolute inset-0">
    {[...Array(8)].map((_, i) => (
      <div 
        key={i}
        className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${10 + Math.random() * 10}s`
        }}
      />
    ))}
  </div>

  {/* Glowing orb effects */}
  <div className="absolute -top-6 -left-6 w-16 h-16 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
  <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-1000"></div>

  <div className="relative z-10 px-6 md:px-8 lg:px-12 py-6">
    {/* Compact Grid Layout */}
    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
      {/* Left Column: Title & Description */}
      <div className="flex-1">
        {/* Hero Title Group */}
        <div className="mb-4 animate-fadeInUp">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl md:text-2xl font-light text-white/90 animate-slideInLeft animation-delay-100">From</span>
            <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Sri Lanka
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-light text-white/90 animate-slideInLeft animation-delay-200">To The</span>
            <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              World
            </span>
          </div>
        </div>
        
        {/* Hero Subtitle */}
        <p className="text-white/85 text-sm md:text-base leading-relaxed max-w-xl mb-4 animate-fadeIn animation-delay-300">
          Premium air & sea freight services connecting Sri Lanka with global destinations.
          Fast, reliable, and secure delivery worldwide.
        </p>
        
        {/* Quick Stats Row */}
        <div className="flex items-center gap-4 mt-4">
          <div className="text-center">
           
           
          </div>
        </div>
      </div>

      {/* Right Column: Compact Globe */}
      <div className="relative h-40 w-40 md:h-48 md:w-48 flex-shrink-0">
        {/* Animated Globe */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl md:text-6xl opacity-30 animate-[spin_20s_linear_infinite]">
          🌍
        </div>
        
        {/* Orbiting Airplane */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-2xl animate-[orbit_10s_linear_infinite]">
            ✈️
          </div>
        </div>
        
        {/* Pulsing Ship */}
        <div className="absolute bottom-1/4 right-1/4 text-2xl animate-pulse-slow">
          🚢
        </div>
        
        {/* Floating Destination Markers - Compact */}
        {displayedRates.slice(0, 4).map((rate, index) => {
          const imageUrl = getImageUrl(rate.image);
          const angle = (index / 4) * Math.PI * 2;
          const radius = 60;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div 
              key={rate.id} 
              className={`absolute animate-float-slow`}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${index * 0.3}s`
              }}
            >
              {imageUrl ? (
                <div className="relative group">
                  <img 
                    src={imageUrl} 
                    alt={rate.country_name || rate.area} 
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-lg object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg md:text-xl border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {getCountryFlag(rate.country_name || rate.area)}
                  </div>
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>

   
  </div>

  {/* Additional Animations */}
  <style jsx>{`
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes orbit {
      0% { transform: rotate(0deg) translateX(40px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
    }
    
    @keyframes pulse-slow {
      0%, 100% { opacity: 0.7; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes float-slow {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      50% { transform: translateY(-8px) translateX(4px); }
    }
    
    .animate-spin-slow {
      animation: spin-slow 3s linear infinite;
    }
    
    .animate-pulse-slow {
      animation: pulse-slow 2s ease-in-out infinite;
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.6s ease-out forwards;
    }
    
    .animate-slideInLeft {
      animation: slideInLeft 0.4s ease-out forwards;
    }
    
    .animate-float-slow {
      animation: float-slow 3s ease-in-out infinite;
    }
    
    .animation-delay-100 {
      animation-delay: 100ms;
    }
    
    .animation-delay-200 {
      animation-delay: 200ms;
    }
    
    .animation-delay-300 {
      animation-delay: 300ms;
    }
  `}</style>
</section>



        {/* Main Content Section */}
        <div className="relative z-10 px-4 md:px-8 lg:px-16 mb-12">
          {/* Rates Display Section */}
          <section className="mb-12" ref={containerRef}>
            {/* Section Header with Shuffle Controls */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      <span className="text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent animate-bounce">📦</span>
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full blur opacity-20"></div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Global Delivery Rates</h2>
                  </div>
                  <p className="text-gray-600 text-sm md:text-base">
                    Competitive shipping rates from Sri Lanka to worldwide destinations
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-medium border border-gray-200 shadow-sm">
                    Showing {filteredRates.length} of {rates.length} destinations
                  </div>
                  
                  {/* Shuffle Button */}
                  <button
                    onClick={handleManualShuffle}
                    disabled={isShuffling}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${isShuffling 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 shadow-sm'}`}
                  >
                    <span className={`text-sm ${isShuffling ? 'animate-spin' : ''}`}>🔄</span>
                    {isShuffling ? 'Shuffling...' : 'Shuffle'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Animated Filter Container */}
            <div className="mb-8 overflow-x-auto">
              <div className={`flex gap-2 pb-2 min-w-max transition-opacity duration-300 ${isShuffling ? 'opacity-50' : 'opacity-100'}`}>
                {['all', 'offers', 'air', 'sea'].map((filter, index) => {
                  const labels = {
                    all: { icon: '🌍', text: 'All Destinations' },
                    offers: { icon: '🔥', text: 'Special Offers', count: rates.filter(r => r.offer_price && r.offer_price > 0).length },
                    air: { icon: '✈️', text: 'Air Freight' },
                    sea: { icon: '🚢', text: 'Sea Cargo' }
                  };
                  
                  return (
                    <button 
                      key={filter}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all transform hover:-translate-y-0.5 ${activeFilter === filter 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:shadow-md'}`}
                      onClick={() => setActiveFilter(filter)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span>{labels[filter].icon}</span>
                      {labels[filter].text}
                      {labels[filter].count && (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                          {labels[filter].count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin animation-delay-300"></div>
                </div>
                <p className="text-gray-600 font-medium animate-pulse">Loading global delivery rates...</p>
              </div>
            ) : filteredRates.length === 0 ? (
              // Animated Empty State
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300 py-16 px-8 text-center animate-fadeIn">
                <div className="inline-block text-5xl mb-4 animate-bounce">🌏</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Destinations Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? `No destinations found for "${searchTerm}"` : 'No delivery rates available yet'}
                </p>
                <button 
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  onClick={() => {setSearchTerm(''); setActiveFilter('all');}}
                >
                  View All Destinations
                </button>
              </div>
            ) : (
              // Animated Rates Grid with Shuffle Effect
              <div 
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ${isShuffling ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
              >
                {filteredRates.map((r, index) => {
                  const normalPrice = Number(r?.normal_price ?? r?.rate ?? 0);
                  const offerPrice = r.offer_price ? Number(r.offer_price) : null;
                  const hasOffer = offerPrice && offerPrice < normalPrice;
                  const savingsPercent = hasOffer ? calculateSavings(normalPrice, offerPrice) : 0;
                  const imageUrl = getImageUrl(r.image);
                  const deliveryMethod = r.delivery_through || 'Standard';
                  const deliveryColor = getDeliveryColor(deliveryMethod);
                  const deliveryIcon = getDeliveryIcon(deliveryMethod);

                  return (
                    <div 
                      key={r.id} 
                      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col group animate-cardIn`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      {/* Floating Offer Badge */}
                      {hasOffer && (
                        <div 
                          className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 z-10 animate-pulse shadow-lg"
                          style={{ background: deliveryColor }}
                        >
                          <span className="text-xs">🔥</span>
                          Save {savingsPercent}%
                          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur opacity-30 -z-10"></div>
                        </div>
                      )}
                      
                      {/* Card Header with Glow Effect */}
                      <div className="p-6 border-b border-gray-100 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        
                        <div className="flex items-center gap-4 relative z-10">
                          {/* Animated Flag/Image */}
                          <div className="flex-shrink-0">
                            {imageUrl ? (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300">
                                <img 
                                  src={imageUrl} 
                                  alt={r.country_name || r.area} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-lg transition-colors duration-300"></div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-2xl text-white shadow-md group-hover:shadow-xl transition-all duration-300">
                                {getCountryFlag(r.country_name || r.area)}
                              </div>
                            )}
                          </div>
                          
                          {/* Destination Info */}
                          <div className="flex-1 min-w-0">
                            <div className="mb-1">
                              <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors duration-300">
                                {r.country_name || r.area}
                              </h3>
                              <p className="text-sm text-gray-500">
                                From Sri Lanka {r.country_name && r.country_name.toLowerCase().includes('international') ? 'International' : 'Local'}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm font-semibold animate-pulse-slow" style={{ color: deliveryColor }}>
                              <span className="text-sm">{deliveryIcon}</span>
                              <span>
                                {deliveryMethod === 'ship' ? 'Sea Cargo' : 
                                 deliveryMethod === 'plan' ? 'Air Freight' : deliveryMethod}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex-1">
                        {/* Animated Delivery Timeline */}
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3 group/item">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover/item:shadow-md transition-shadow duration-300">
                              <span className="text-lg group-hover/item:scale-110 transition-transform duration-300">📅</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Delivery Time
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {r.delivery_min_days || r.delivery_max_days 
                                  ? `${r.delivery_min_days || 0}-${r.delivery_max_days || ''} days`
                                  : r.eta || '5-10 business days'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 group/item">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover/item:shadow-md transition-shadow duration-300">
                              <span className="text-lg group-hover/item:scale-110 transition-transform duration-300">⚖️</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                Weight Range
                              </div>
                              <div className="text-sm font-semibold text-gray-900">
                                {r.min_weight || 0}kg - {r.max_weight || 1}kg
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Animated Pricing Card */}
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 relative overflow-hidden group/price">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover/price:translate-x-[100%] transition-transform duration-1000"></div>
                          
                          {hasOffer ? (
                            <>
                              <div className="flex justify-center items-baseline gap-3 mb-1 relative z-10">
                                <div className="text-base text-gray-400 line-through animate-fadeIn">
                                  LKR {normalPrice.toLocaleString()}
                                </div>
                                <div 
                                  className="text-2xl md:text-3xl font-extrabold animate-pulse-slow"
                                  style={{ color: deliveryColor }}
                                >
                                  LKR {offerPrice.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-center text-sm text-gray-500 font-medium relative z-10">
                                Special Offer Price
                              </div>
                            </>
                          ) : (
                            <div className="text-center relative z-10">
                              <div 
                                className="text-2xl md:text-3xl font-extrabold mb-1 animate-gradient bg-[length:200%_auto] bg-clip-text text-transparent"
                                style={{ backgroundImage: `linear-gradient(90deg, ${deliveryColor}, #6366f1, ${deliveryColor})` }}
                              >
                                LKR {normalPrice.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500 font-medium">
                                Standard Rate
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer with Interactive Buttons */}
                      <div className="p-6 pt-0 flex gap-3">
                        <button 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group/button relative overflow-hidden"
                          style={{ background: deliveryColor }}
                          onClick={handleWhatsApp}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000"></div>
                          <span className="text-lg group-hover/button:scale-110 transition-transform duration-300">💬</span>
                          <span className="relative z-10">Get Quote</span>
                        </button>
                        <button 
                          className="flex-1 bg-gradient-to-br from-gray-100 to-white text-gray-700 py-3 rounded-xl font-semibold border-2 border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-200 hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-300 group/button"
                          onClick={() => openDetails(r)}
                        >
                          <span className="text-lg group-hover/button:rotate-180 transition-transform duration-500">📋</span>
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Enhanced Details Modal */}
      {showDetails && detailsItem && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={closeDetails}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-modalIn"
            onClick={e => e.stopPropagation()}
          >
            {/* Animated Modal Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 rounded-3xl"></div>
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
              <div className="text-4xl animate-bounce">
                {getCountryFlag(detailsItem.country_name || detailsItem.area)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 animate-slideInRight">
                  {detailsItem.country_name || detailsItem.area || 'Delivery Details'}
                </h3>
                <p className="text-sm text-gray-500 animate-fadeIn animation-delay-100">Shipping from Sri Lanka</p>
              </div>
              <button 
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-500 hover:bg-gray-200 hover:scale-110 transition-all duration-300"
                onClick={closeDetails}
              >
                ×
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 relative z-0">
              {/* Shipping Information */}
              <div className="mb-8 animate-slideInUp animation-delay-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600 animate-pulse">📦</span>
                  Shipping Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      label: 'Delivery Method',
                      value: detailsItem.delivery_through ? 
                        (detailsItem.delivery_through === 'ship' ? 'Sea Cargo' : 
                         detailsItem.delivery_through === 'plan' ? 'Air Freight' : detailsItem.delivery_through) : 'Standard',
                      icon: getDeliveryIcon(detailsItem.delivery_through),
                      color: getDeliveryColor(detailsItem.delivery_through),
                      delay: 0
                    },
                    {
                      label: 'Delivery Time',
                      value: detailsItem.delivery_min_days || detailsItem.delivery_max_days 
                        ? `${detailsItem.delivery_min_days || 0}-${detailsItem.delivery_max_days || ''} business days`
                        : detailsItem.eta || '5-10 business days',
                      icon: '⏱️',
                      color: '#3b82f6',
                      delay: 100
                    },
                    {
                      label: 'Weight Range',
                      value: `${detailsItem.min_weight || 0}kg - ${detailsItem.max_weight || 1}kg`,
                      icon: '⚖️',
                      color: '#10b981',
                      delay: 200
                    },
                    {
                      label: 'Service Type',
                      value: detailsItem.delivery_type ? 
                        detailsItem.delivery_type.charAt(0).toUpperCase() + detailsItem.delivery_type.slice(1) : 'Standard',
                      icon: '✨',
                      color: '#8b5cf6',
                      delay: 300
                    }
                  ].map((item, index) => (
                    <div 
                      key={item.label}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all duration-300 animate-cardIn"
                      style={{ animationDelay: `${item.delay}ms` }}
                    >
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {item.label}
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow-sm"
                          style={{ background: item.color }}
                        >
                          {item.icon}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Pricing Details */}
              <div className="animate-slideInUp animation-delay-400">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-green-600 animate-pulse-slow">💰</span>
                  Pricing Details
                </h4>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                  {detailsItem.offer_price && detailsItem.offer_price < (detailsItem.normal_price || detailsItem.rate || 0) ? (
                    <>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 animate-fadeIn">
                        <span className="text-gray-700">Standard Price:</span>
                        <span className="text-gray-400 line-through font-medium">
                          LKR {Number(detailsItem.normal_price || detailsItem.rate || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200 animate-fadeIn animation-delay-100">
                        <span className="text-gray-700">Special Offer:</span>
                        <span className="text-green-600 font-bold text-lg animate-pulse-slow">
                          LKR {Number(detailsItem.offer_price).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 animate-fadeIn animation-delay-200">
                        <span className="text-gray-700">You Save:</span>
                        <span className="text-red-600 font-bold animate-bounce">
                          LKR {(Number(detailsItem.normal_price || detailsItem.rate || 0) - Number(detailsItem.offer_price)).toLocaleString()}
                          <span className="text-red-500 ml-2 text-sm">
                            ({calculateSavings(Number(detailsItem.normal_price || detailsItem.rate || 0), Number(detailsItem.offer_price))}%)
                          </span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center py-3 animate-fadeIn">
                      <span className="text-gray-700">Price:</span>
                      <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold text-xl">
                        LKR {Number(detailsItem.normal_price || detailsItem.rate || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-6 z-10">
              <div className="flex flex-col sm:flex-row gap-3 animate-slideInUp animation-delay-500">
                <button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
                  onClick={handleWhatsApp}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">💬</span>
                  <span className="relative z-10">Get Quote on WhatsApp</span>
                </button>
                <button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
                  onClick={handleCall}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="text-xl group-hover:scale-110 transition-transform duration-300">📞</span>
                  <span className="relative z-10">Call for Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ContactButtons />

      <Footer />

      {/* Add CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float-slow {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-10px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(60px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(60px) rotate(-360deg);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% auto;
        }
        
        .animate-cardIn {
          animation: cardIn 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-modalIn {
          animation: modalIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out forwards;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        
        .animation-delay-4000 {
          animation-delay: 4000ms;
        }
        
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </>
  );
};

export default ParcelService;