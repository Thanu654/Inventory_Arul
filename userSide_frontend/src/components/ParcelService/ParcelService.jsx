import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../Layouts/Header';
import Footer from '../Layouts/Footer';

const ParcelService = () => {
  const [rates, setRates] = useState([]);
  const [area, setArea] = useState('');
  const [rate, setRate] = useState('');
  const [eta, setEta] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/delivery');
        setRates(res.data || []);
      } catch (err) {
        console.error('Failed to load delivery rates', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const addRate = (e) => {
    e.preventDefault();
    if (!area.trim() || !rate.trim()) {
      setMessage('Please provide an area and a rate.');
      return;
    }
    const r = { id: Date.now(), area: area.trim(), rate: parseFloat(rate), eta: eta.trim() };
    setRates(prev => [r, ...prev]);
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
  const filteredRates = rates.filter(rateItem => {
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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Premium Sri Lanka Global Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 to-blue-600 rounded-3xl mx-4 md:mx-8 lg:mx-16 my-6 md:my-8 overflow-hidden min-h-[480px] flex flex-col justify-between">
          {/* Hero Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(37,99,235,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.2)_0%,transparent_50%)]"></div>
          </div>
          
          <div className="relative z-10 flex-1 px-6 md:px-8 lg:px-12 py-8">
            {/* Hero Title Group */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl md:text-3xl font-light text-white/90">From</span>
                <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Sri Lanka
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl font-light text-white/90">To The</span>
                <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  World
                </span>
              </div>
            </div>
            
            {/* Hero Subtitle */}
            <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
              Premium air & sea freight services connecting Sri Lanka with global destinations.
              Fast, reliable, and secure delivery solutions worldwide.
            </p>
          </div>
          
          {/* Hero Visual Container */}
          <div className="relative z-10 h-48 md:h-64 lg:h-72 flex items-center justify-center px-4">
            <div className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64">
              {/* Globe */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl md:text-7xl opacity-20 animate-spin">
                🌍
              </div>
              
              {/* Airplane */}
              <div className="absolute top-1/4 left-1/4 text-3xl animate-bounce">
                ✈️
              </div>
              
              {/* Ship */}
              <div className="absolute bottom-1/4 right-1/4 text-3xl animate-pulse">
                🚢
              </div>
              
              {/* Destination Markers */}
              {rates.slice(0, 4).map((rate, index) => {
                const imageUrl = getImageUrl(rate.image);
                return (
                  <div 
                    key={rate.id} 
                    className={`absolute animate-bounce ${index === 0 ? 'top-1/5 left-1/5' : ''} ${index === 1 ? 'top-2/5 right-1/5' : ''} ${index === 2 ? 'bottom-2/5 left-1/3' : ''} ${index === 3 ? 'bottom-1/5 right-1/3' : ''}`}
                  >
                    {imageUrl ? (
                      <div className="relative">
                        <img 
                          src={imageUrl} 
                          alt={rate.country_name || rate.area} 
                          className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover"
                        />
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/60 animate-ping"></div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl border-2 border-white shadow-lg">
                          {getCountryFlag(rate.country_name || rate.area)}
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/60 animate-ping"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <div className="px-4 md:px-8 lg:px-16 mb-12">
          {/* Rates Display Section */}
          <section className="mb-12">
            {/* Section Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <span className="text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">📦</span>
                    Global Delivery Rates
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    Competitive shipping rates from Sri Lanka to worldwide destinations
                  </p>
                </div>
                
                <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full font-medium">
                  Showing {filteredRates.length} of {rates.length} destinations
                </div>
              </div>
            </div>
            
            {/* Filter Container */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex gap-2 pb-2 min-w-max">
                <button 
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'}`}
                  onClick={() => setActiveFilter('all')}
                >
                  <span>🌍</span>
                  All Destinations
                </button>
                
                <button 
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${activeFilter === 'offers' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'}`}
                  onClick={() => setActiveFilter('offers')}
                >
                  <span>🔥</span>
                  Special Offers
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                    {rates.filter(r => r.offer_price && r.offer_price > 0).length}
                  </span>
                </button>
                
                <button 
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${activeFilter === 'air' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'}`}
                  onClick={() => setActiveFilter('air')}
                >
                  <span>✈️</span>
                  Air Freight
                </button>
                
                <button 
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${activeFilter === 'sea' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400'}`}
                  onClick={() => setActiveFilter('sea')}
                >
                  <span>🚢</span>
                  Sea Cargo
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Loading global delivery rates...</p>
              </div>
            ) : filteredRates.length === 0 ? (
              // Empty State
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 py-16 px-8 text-center">
                <div className="text-5xl mb-4 opacity-50">🌏</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Destinations Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? `No destinations found for "${searchTerm}"` : 'No delivery rates available yet'}
                </p>
                <button 
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  onClick={() => {setSearchTerm(''); setActiveFilter('all');}}
                >
                  View All Destinations
                </button>
              </div>
            ) : (
              // Rates Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRates.map(r => {
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
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      {/* Offer Tag */}
                      {hasOffer && (
                        <div 
                          className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 z-10"
                          style={{ background: deliveryColor }}
                        >
                          <span className="text-xs">🔥</span>
                          Save {savingsPercent}%
                        </div>
                      )}
                      
                      {/* Card Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          {/* Flag/Image */}
                          <div className="flex-shrink-0">
                            {imageUrl ? (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md">
                                <img 
                                  src={imageUrl} 
                                  alt={r.country_name || r.area} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-2xl text-white">
                                {getCountryFlag(r.country_name || r.area)}
                              </div>
                            )}
                          </div>
                          
                          {/* Destination Info */}
                          <div className="flex-1 min-w-0">
                            <div className="mb-1">
                              <h3 className="text-lg font-bold text-gray-900 truncate">
                                {r.country_name || r.area}
                              </h3>
                              <p className="text-sm text-gray-500">
                                From Sri Lanka {r.country_name && r.country_name.toLowerCase().includes('international') ? 'International' : 'Local'}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: deliveryColor }}>
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
                        {/* Delivery Timeline */}
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">📅</span>
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
                          
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg">⚖️</span>
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
                        
                        {/* Pricing */}
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4">
                          {hasOffer ? (
                            <>
                              <div className="flex justify-center items-baseline gap-3 mb-1">
                                <div className="text-base text-gray-400 line-through">
                                  LKR {normalPrice.toLocaleString()}
                                </div>
                                <div 
                                  className="text-2xl md:text-3xl font-extrabold"
                                  style={{ color: deliveryColor }}
                                >
                                  LKR {offerPrice.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-center text-sm text-gray-500 font-medium">
                                Special Offer Price
                              </div>
                            </>
                          ) : (
                            <div className="text-center">
                              <div 
                                className="text-2xl md:text-3xl font-extrabold mb-1"
                                style={{ color: deliveryColor }}
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

                      {/* Card Footer */}
                      <div className="p-6 pt-0 flex gap-3">
                        <button 
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                          onClick={handleWhatsApp}
                          style={{ background: deliveryColor }}
                        >
                          <span className="text-lg">💬</span>
                          Get Quote
                        </button>
                        <button 
                          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold border-2 border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-200 hover:border-gray-300 transition-colors"
                          onClick={() => openDetails(r)}
                        >
                          <span className="text-lg">📋</span>
                          Details
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

      {/* Details Modal */}
      {showDetails && detailsItem && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
          onClick={closeDetails}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
              <div className="text-4xl">
                {getCountryFlag(detailsItem.country_name || detailsItem.area)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {detailsItem.country_name || detailsItem.area || 'Delivery Details'}
                </h3>
                <p className="text-sm text-gray-500">Shipping from Sri Lanka</p>
              </div>
              <button 
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl text-gray-500 hover:bg-gray-200 transition-colors"
                onClick={closeDetails}
              >
                ×
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {/* Shipping Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">📦</span>
                  Shipping Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Delivery Method
                    </div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                        style={{ background: getDeliveryColor(detailsItem.delivery_through) }}
                      >
                        {getDeliveryIcon(detailsItem.delivery_through)}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {detailsItem.delivery_through ? 
                          (detailsItem.delivery_through === 'ship' ? 'Sea Cargo' : 
                           detailsItem.delivery_through === 'plan' ? 'Air Freight' : detailsItem.delivery_through) : 'Standard'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Delivery Time
                    </div>
                    <div className="font-semibold text-gray-900">
                      {detailsItem.delivery_min_days || detailsItem.delivery_max_days 
                        ? `${detailsItem.delivery_min_days || 0}-${detailsItem.delivery_max_days || ''} business days`
                        : detailsItem.eta || '5-10 business days'}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Weight Range
                    </div>
                    <div className="font-semibold text-gray-900">
                      {detailsItem.min_weight || 0}kg - {detailsItem.max_weight || 1}kg
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Service Type
                    </div>
                    <div className="font-semibold text-gray-900">
                      {detailsItem.delivery_type ? 
                        detailsItem.delivery_type.charAt(0).toUpperCase() + detailsItem.delivery_type.slice(1) : 'Standard'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pricing Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-green-600">💰</span>
                  Pricing Details
                </h4>
                <div className="bg-gray-50 rounded-xl p-6">
                  {detailsItem.offer_price && detailsItem.offer_price < (detailsItem.normal_price || detailsItem.rate || 0) ? (
                    <>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700">Standard Price:</span>
                        <span className="text-gray-400 line-through font-medium">
                          LKR {Number(detailsItem.normal_price || detailsItem.rate || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700">Special Offer:</span>
                        <span className="text-green-600 font-bold text-lg">
                          LKR {Number(detailsItem.offer_price).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-700">You Save:</span>
                        <span className="text-red-600 font-bold">
                          LKR {(Number(detailsItem.normal_price || detailsItem.rate || 0) - Number(detailsItem.offer_price)).toLocaleString()}
                          <span className="text-red-500 ml-2 text-sm">
                            ({calculateSavings(Number(detailsItem.normal_price || detailsItem.rate || 0), Number(detailsItem.offer_price))}%)
                          </span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-700">Price:</span>
                      <span className="text-blue-600 font-bold text-xl">
                        LKR {Number(detailsItem.normal_price || detailsItem.rate || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  onClick={handleWhatsApp}
                >
                  <span className="text-xl">💬</span>
                  Get Quote on WhatsApp
                </button>
                <button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  onClick={handleCall}
                >
                  <span className="text-xl">📞</span>
                  Call for Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ParcelService;