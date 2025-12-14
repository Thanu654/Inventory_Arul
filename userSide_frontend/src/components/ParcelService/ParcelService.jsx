import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ParcelService.css';
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
    if (!method) return '#4c6ef5';
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
      <main className="parcel-container">
        {/* Premium Sri Lanka Global Hero Section */}
        <section className="sl-global-hero">
          <div className="hero-gradient-overlay"></div>
          
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-icon">🏆</span>
              <span>Sri Lanka's Premier Global Courier</span>
            </div>
            
            <div className="hero-title-group">
              <div className="title-line">
                <span className="title-word">From</span>
                <span className="title-highlight">Sri Lanka</span>
              </div>
              <div className="title-line">
                <span className="title-word">To The</span>
                <span className="title-highlight">World</span>
              </div>
            </div>
            
            <p className="hero-subtitle">
              Premium air & sea freight services connecting Sri Lanka with global destinations.
              Fast, reliable, and secure delivery solutions worldwide.
            </p>
            
            <div className="hero-transport">
              <div className="transport-item">
                <div className="transport-icon">✈️</div>
                <div className="transport-label">Air Freight</div>
              </div>
              <div className="transport-divider"></div>
              <div className="transport-item">
                <div className="transport-icon">🚢</div>
                <div className="transport-label">Sea Cargo</div>
              </div>
              <div className="transport-divider"></div>
              <div className="transport-item">
                <div className="transport-icon">⚡</div>
                <div className="transport-label">Express Delivery</div>
              </div>
            </div>

            <div className="hero-search">
              <div className="search-container">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search destinations (e.g., USA, UK, Australia...)"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="hero-actions">
              <button className="whatsapp-hero-btn" onClick={handleWhatsApp}>
                <div className="btn-content">
                  <span className="btn-icon">💬</span>
                  <span className="btn-text">Get Instant Quote</span>
                </div>
                <span className="btn-subtext">Via WhatsApp</span>
              </button>
              
              <button className="call-hero-btn" onClick={handleCall}>
                <div className="btn-content">
                  <span className="btn-icon">📞</span>
                  <span className="btn-text">Call Our Experts</span>
                </div>
                <span className="btn-subtext">+94 755 350 105</span>
              </button>
            </div>
          </div>
          
          <div className="hero-visual-container">
            <div className="globe-visual">
              <div className="globe-spin">🌍</div>
              <div className="airplane-flying">✈️</div>
              <div className="ship-sailing">🚢</div>
              
              {rates.slice(0, 4).map((rate, index) => {
                const imageUrl = getImageUrl(rate.image);
                return (
                  <div key={rate.id} className={`destination-marker marker-${index + 1}`}>
                    {imageUrl ? (
                      <img src={imageUrl} alt={rate.country_name || rate.area} className="marker-image" />
                    ) : (
                      <div className="marker-flag">{getCountryFlag(rate.country_name || rate.area)}</div>
                    )}
                    <div className="marker-pulse"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <div className="global-content">
          {/* Rates Display Section */}
          <section className="global-rates-section">
            <div className="section-header-global">
              <div className="header-left">
                <h2 className="section-title-global">
                  <span className="title-icon-global">📦</span>
                  Global Delivery Rates
                </h2>
                <p className="section-description-global">
                  Competitive shipping rates from Sri Lanka to worldwide destinations
                </p>
              </div>
              
              <div className="header-right">
                <div className="results-count">
                  Showing {filteredRates.length} of {rates.length} destinations
                </div>
              </div>
            </div>
            
            <div className="filter-container-global">
              <div className="filter-scroll">
                <button 
                  className={`filter-btn-global ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  <span className="filter-icon">🌍</span>
                  All Destinations
                </button>
                
                <button 
                  className={`filter-btn-global ${activeFilter === 'offers' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('offers')}
                >
                  <span className="filter-icon">🔥</span>
                  Special Offers
                  <span className="offer-badge">
                    {rates.filter(r => r.offer_price && r.offer_price > 0).length}
                  </span>
                </button>
                
               
                
          
                <button 
                  className={`filter-btn-global ${activeFilter === 'air' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('air')}
                >
                  <span className="filter-icon">✈️</span>
                  Air Freight
                </button>
                
                <button 
                  className={`filter-btn-global ${activeFilter === 'sea' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('sea')}
                >
                  <span className="filter-icon">🚢</span>
                  Sea Cargo
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-global">
                <div className="loader"></div>
                <p className="loading-text">Loading global delivery rates...</p>
              </div>
            ) : filteredRates.length === 0 ? (
              <div className="empty-global">
                <div className="empty-icon-global">🌏</div>
                <h3 className="empty-title">No Destinations Found</h3>
                <p className="empty-description">
                  {searchTerm ? `No destinations found for "${searchTerm}"` : 'No delivery rates available yet'}
                </p>
                <button className="empty-action" onClick={() => {setSearchTerm(''); setActiveFilter('all');}}>
                  View All Destinations
                </button>
              </div>
            ) : (
              <div className="rates-grid-global">
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
                    <div key={r.id} className="rate-card-global">
                      {hasOffer && (
                        <div className="offer-tag-global" style={{ background: deliveryColor }}>
                          <span className="tag-icon">🔥</span>
                          Save {savingsPercent}%
                        </div>
                      )}
                      
                      <div className="card-header-global">
                        <div className="destination-flag">
                          {imageUrl ? (
                            <div className="flag-image-container">
                              <img src={imageUrl} alt={r.country_name || r.area} className="flag-image" />
                              <div className="flag-overlay"></div>
                            </div>
                          ) : (
                            <div className="flag-emoji">
                              {getCountryFlag(r.country_name || r.area)}
                            </div>
                          )}
                        </div>
                        
                        <div className="destination-info-global">
                          <div className="destination-main">
                            <h3 className="destination-name-global">{r.country_name || r.area}</h3>
                            <div className="destination-subtitle">
                              From Sri Lanka {r.country_name && r.country_name.toLowerCase().includes('international') ? 'International' : 'Local'}
                            </div>
                          </div>
                          
                          <div className="delivery-method" style={{ color: deliveryColor }}>
                            <span className="method-icon">{deliveryIcon}</span>
                            <span className="method-text">
                              {deliveryMethod === 'ship' ? 'Sea Cargo' : 
                               deliveryMethod === 'plan' ? 'Air Freight' : deliveryMethod}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="card-body-global">
                        <div className="delivery-timeline">
                          <div className="timeline-item">
                            <span className="timeline-icon">📅</span>
                            <div className="timeline-content">
                              <div className="timeline-label">Delivery Time</div>
                              <div className="timeline-value">
                                {r.delivery_min_days || r.delivery_max_days 
                                  ? `${r.delivery_min_days || 0}-${r.delivery_max_days || ''} days`
                                  : r.eta || '5-10 business days'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="timeline-item">
                            <span className="timeline-icon">⚖️</span>
                            <div className="timeline-content">
                              <div className="timeline-label">Weight Range</div>
                              <div className="timeline-value">
                                {r.min_weight || 0}kg - {r.max_weight || 1}kg
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pricing-global">
                          {hasOffer ? (
                            <>
                              <div className="price-comparison">
                                <div className="original-price-global">
                                  LKR {normalPrice.toLocaleString()}
                                </div>
                                <div className="current-price-global" style={{ color: deliveryColor }}>
                                  LKR {offerPrice.toLocaleString()}
                                </div>
                              </div>
                              <div className="price-label-offer">Special Offer Price</div>
                            </>
                          ) : (
                            <div className="standard-pricing">
                              <div className="standard-price-global" style={{ color: deliveryColor }}>
                                LKR {normalPrice.toLocaleString()}
                              </div>
                              <div className="price-label-standard">Standard Rate</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card-footer-global">
                        <button 
                          className="action-btn inquire-global" 
                          onClick={handleWhatsApp}
                          style={{ background: deliveryColor }}
                        >
                          <span className="action-icon">💬</span>
                          Get Quote
                        </button>
                        <button 
                          className="action-btn details-global" 
                          onClick={() => openDetails(r)}
                        >
                          <span className="action-icon">📋</span>
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Premium Sidebar */}
          <aside className="global-sidebar">
            {/* Sri Lanka Special Card */}
            <div className="sl-special-card">
              <div className="sl-card-header">
                <div className="sl-flag">🇱🇰</div>
                <h3 className="sl-card-title">Sri Lanka Special</h3>
              </div>
              <p className="sl-card-description">
                Exclusive rates for shipping from Sri Lanka to popular destinations
              </p>
              
              <div className="sl-popular-destinations">
                {rates
                  .filter(r => r.country_name && !r.country_name.toLowerCase().includes('international'))
                  .slice(0, 3)
                  .map(r => (
                    <div key={r.id} className="popular-destination">
                      <div className="popular-flag">
                        {getCountryFlag(r.country_name || r.area)}
                      </div>
                      <div className="popular-info">
                        <div className="popular-name">{r.country_name || r.area}</div>
                        <div className="popular-price">LKR {Number(r.normal_price || r.rate || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Contact Experts Card */}
            <div className="experts-card">
              <div className="experts-header">
                <h3 className="experts-title">Contact Our Experts</h3>
                <p className="experts-subtitle">24/7 Customer Support</p>
              </div>
              
              <div className="experts-contact">
                <div className="expert-item">
                  <div className="expert-avatar">
                    <div className="avatar-initial">J</div>
                  </div>
                  <div className="expert-info">
                    <div className="expert-name">Janith Perera</div>
                    <div className="expert-role">International Shipping Manager</div>
                    <button className="expert-action" onClick={handleCall}>
                      <span className="action-phone">📞</span>
                      Call Expert
                    </button>
                  </div>
                </div>
                
                <div className="expert-item">
                  <div className="expert-avatar">
                    <div className="avatar-initial">M</div>
                  </div>
                  <div className="expert-info">
                    <div className="expert-name">Maria Silva</div>
                    <div className="expert-role">Customer Relations</div>
                    <button className="expert-action whatsapp-expert" onClick={handleWhatsApp}>
                      <span className="action-whatsapp">💬</span>
                      WhatsApp Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Methods Card */}
            <div className="methods-card">
              <h3 className="methods-title">Shipping Methods</h3>
              
              <div className="method-types">
                <div className="method-type" style={{ borderLeftColor: '#3b82f6' }}>
                  <div className="type-icon">✈️</div>
                  <div className="type-info">
                    <div className="type-name">Air Freight</div>
                    <div className="type-desc">Fastest delivery (3-7 days)</div>
                  </div>
                </div>
                
                <div className="method-type" style={{ borderLeftColor: '#0ea5e9' }}>
                  <div className="type-icon">🚢</div>
                  <div className="type-info">
                    <div className="type-name">Sea Cargo</div>
                    <div className="type-desc">Economical (15-30 days)</div>
                  </div>
                </div>
                
                <div className="method-type" style={{ borderLeftColor: '#8b5cf6' }}>
                  <div className="type-icon">⚡</div>
                  <div className="type-info">
                    <div className="type-name">Express</div>
                    <div className="type-desc">Priority (1-3 days)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Inquiry Card */}
            <div className="inquiry-global-card">
              <div className="inquiry-icon">📝</div>
              <h3 className="inquiry-title">Need a Custom Quote?</h3>
              <p className="inquiry-description">
                Get personalized shipping rates for your specific requirements
              </p>
              
              <div className="inquiry-buttons">
                <button className="inquiry-btn whatsapp-inquiry" onClick={handleWhatsApp}>
                  <span className="btn-icon-inquiry">💬</span>
                  WhatsApp Quote
                </button>
                
                <button className="inquiry-btn call-inquiry" onClick={handleCall}>
                  <span className="btn-icon-inquiry">📞</span>
                  Call for Quote
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="stats-card">
              <h3 className="stats-title">Our Global Reach</h3>
              
              <div className="stats-grid">
                <div className="stat-item-global">
                  <div className="stat-number-global">{rates.filter(r => r.country_name && r.country_name.toLowerCase().includes('international')).length}+</div>
                  <div className="stat-label-global">Countries</div>
                </div>
                
                <div className="stat-item-global">
                  <div className="stat-number-global">24/7</div>
                  <div className="stat-label-global">Support</div>
                </div>
                
                <div className="stat-item-global">
                  <div className="stat-number-global">{rates.length}+</div>
                  <div className="stat-label-global">Destinations</div>
                </div>
                
                <div className="stat-item-global">
                  <div className="stat-number-global">99%</div>
                  <div className="stat-label-global">Success Rate</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Details Modal */}
      {showDetails && detailsItem && (
        <div className="details-modal-overlay" onClick={closeDetails}>
          <div className="details-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDetails}>×</button>
            
            <div className="modal-header">
              <div className="modal-flag">
                {getCountryFlag(detailsItem.country_name || detailsItem.area)}
              </div>
              <div>
                <h3 className="modal-title">{detailsItem.country_name || detailsItem.area || 'Delivery Details'}</h3>
                <p className="modal-subtitle">Shipping from Sri Lanka</p>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4 className="detail-title">Shipping Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="detail-label">Delivery Method</div>
                    <div className="detail-value">
                      <span className="method-indicator" 
                            style={{ background: getDeliveryColor(detailsItem.delivery_through) }}>
                        {getDeliveryIcon(detailsItem.delivery_through)}
                      </span>
                      {detailsItem.delivery_through ? 
                        (detailsItem.delivery_through === 'ship' ? 'Sea Cargo' : 
                         detailsItem.delivery_through === 'plan' ? 'Air Freight' : detailsItem.delivery_through) : 'Standard'}
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Delivery Time</div>
                    <div className="detail-value">
                      {detailsItem.delivery_min_days || detailsItem.delivery_max_days 
                        ? `${detailsItem.delivery_min_days || 0}-${detailsItem.delivery_max_days || ''} business days`
                        : detailsItem.eta || '5-10 business days'}
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Weight Range</div>
                    <div className="detail-value">
                      {detailsItem.min_weight || 0}kg - {detailsItem.max_weight || 1}kg
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-label">Service Type</div>
                    <div className="detail-value">
                      {detailsItem.delivery_type ? 
                        detailsItem.delivery_type.charAt(0).toUpperCase() + detailsItem.delivery_type.slice(1) : 'Standard'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4 className="detail-title">Pricing Details</h4>
                <div className="pricing-details">
                  {detailsItem.offer_price && detailsItem.offer_price < (detailsItem.normal_price || detailsItem.rate || 0) ? (
                    <>
                      <div className="price-row">
                        <span className="price-label">Standard Price:</span>
                        <span className="price-value original">LKR {Number(detailsItem.normal_price || detailsItem.rate || 0).toLocaleString()}</span>
                      </div>
                      <div className="price-row">
                        <span className="price-label">Special Offer:</span>
                        <span className="price-value offer">LKR {Number(detailsItem.offer_price).toLocaleString()}</span>
                      </div>
                      <div className="price-row">
                        <span className="price-label">You Save:</span>
                        <span className="price-value savings">
                          LKR {(Number(detailsItem.normal_price || detailsItem.rate || 0) - Number(detailsItem.offer_price)).toLocaleString()}
                          <span className="savings-percent">
                            ({calculateSavings(Number(detailsItem.normal_price || detailsItem.rate || 0), Number(detailsItem.offer_price))}%)
                          </span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="price-row">
                      <span className="price-label">Price:</span>
                      <span className="price-value standard">LKR {Number(detailsItem.normal_price || detailsItem.rate || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-action whatsapp-modal" onClick={handleWhatsApp}>
                <span className="action-icon">💬</span>
                Get Quote on WhatsApp
              </button>
              <button className="modal-action call-modal" onClick={handleCall}>
                <span className="action-icon">📞</span>
                Call for Details
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ParcelService;