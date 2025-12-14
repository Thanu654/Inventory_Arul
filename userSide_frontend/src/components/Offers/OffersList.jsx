import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  ShoppingBag, 
  Star, 
  Clock, 
  TrendingUp, 
  Shield,
  Zap,
  Heart,
  Eye,
  ChevronRight,
  Check,
  AlertCircle,
  RefreshCw,
  Package,
  DollarSign,
  Percent
} from "lucide-react";
import "./OffersList.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Product Image Modal Component
const ProductModal = ({ products, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!products || products.length === 0) return null;
  
  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <div className="modal-main-image">
          <img 
            src={products[selectedImage]?.image || "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=600&fit=crop"} 
            alt={products[selectedImage]?.name || "Product"}
          />
        </div>
        
        {products.length > 1 && (
          <div className="modal-thumbnails">
            {products.map((product, index) => (
              <div 
                key={product.id || index}
                className={`thumbnail-item ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img 
                  src={product.image || "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=200&h=200&fit=crop"} 
                  alt={product.name || "Product"}
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="modal-info">
          <h3>{products[selectedImage]?.name || "Product"}</h3>
          <p>Item {selectedImage + 1} of {products.length}</p>
          {products[selectedImage]?.description && (
            <div className="modal-description">
              {products[selectedImage].description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OfferCard = ({ offer, index }) => {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Helper function to resolve image URLs
  const resolveImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop';
    if (typeof img !== 'string') return 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `${apiUrl}${img}`;
    return `${apiUrl}/uploads/${img}`;
  };

  // Pick images from product
  const pickImages = (p) => {
    const imgs = [];
    if (Array.isArray(p.images) && p.images.length) imgs.push(...p.images);
    if (Array.isArray(p.product_images) && p.product_images.length) imgs.push(...p.product_images);
    if (p.image) imgs.push(p.image);
    if (p.product_image) imgs.push(p.product_image);
    if (p.image2) imgs.push(p.image2);
    if (p.secondary_image) imgs.push(p.secondary_image);
    const uniq = [...new Set(imgs)];
    return [uniq[0] || null, uniq[1] || null];
  };

  // Ensure products array exists
  const products = offer.products || offer.items || offer.products_list || [];
  const productCount = products.length;

  // Calculate prices
  const calculateTotals = () => {
    const real = products.reduce((s, p) => 
      s + (parseFloat(p.product_price ?? p.price) || 0) * (parseInt(p.quantity) || 1), 0);
    const offerPrice = products.reduce((s, p) => 
      s + (parseFloat(p.offer_price ?? p.product_offer_price) || 0) * (parseInt(p.quantity) || 1), 0);
    return { real, offerPrice };
  };

  const totals = calculateTotals();
  const displayedOfferPrice = (offer.offer_total !== undefined && offer.offer_total !== null) 
    ? Number(offer.offer_total) 
    : totals.offerPrice || 0;
  const displayedRealPrice = (offer.real_total !== undefined && offer.real_total !== null) 
    ? Number(offer.real_total) 
    : totals.real || 0;

  // Calculate discount percentage - ensure it's at least 10%
  const calculateDiscountPercentage = () => {
    if (displayedRealPrice > 0 && displayedOfferPrice > 0) {
      const calculatedDiscount = ((displayedRealPrice - displayedOfferPrice) / displayedRealPrice) * 100;
      // Ensure minimum 10% discount for better visual appeal
      return Math.max(Math.round(calculatedDiscount), 10);
    }
    // If no real price, check if there's a percentage in offer data
    if (offer.discount_percentage) {
      return Math.max(parseInt(offer.discount_percentage) || 10, 10);
    }
    // Default minimum discount
    return 10;
  };

  const discountPercentage = calculateDiscountPercentage();

  // Get product display layout based on count
  const getImageLayout = () => {
    if (productCount === 0) {
      return (
        <div className="no-image-placeholder">
          <ShoppingBag size={48} color="#ccc" />
          <p>No images available</p>
        </div>
      );
    }
    
    if (productCount === 1) {
      const [primaryImg] = pickImages(products[0]);
      return (
        <div className="product-single">
          <img 
            src={resolveImageUrl(primaryImg)} 
            alt={products[0].product_name || products[0].item_name || "Product"}
            className="main-product-image"
          />
          <div className="offer-badge">
            <Percent size={12} />
            <span>{discountPercentage}% OFF</span>
          </div>
        </div>
      );
    }
    
    if (productCount === 2) {
      const [img1] = pickImages(products[0]);
      const [img2] = pickImages(products[1]);
      return (
        <div className="product-duo">
          <div className="duo-image-container">
            <img 
              src={resolveImageUrl(img1)} 
              alt={products[0].product_name || products[0].item_name || "Product"}
            />
          </div>
          <div className="duo-image-container">
            <img 
              src={resolveImageUrl(img2)} 
              alt={products[1].product_name || products[1].item_name || "Product"}
            />
          </div>
          <div className="combo-badge">
            <TrendingUp size={12} />
            <span>COMBO DEAL</span>
          </div>
          <button 
            className="view-all-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            <Eye size={14} />
            <span>View Both</span>
          </button>
        </div>
      );
    }
    
    // For 3+ products
    return (
      <div className="product-grid-view">
        <div className="grid-main-image">
          <img 
            src={resolveImageUrl(pickImages(products[0])[0])} 
            alt={products[0].product_name || products[0].item_name || "Product"}
          />
        </div>
        <div className="grid-thumbnails">
          {products.slice(0, 4).map((product, idx) => (
            <div key={product.id || idx} className="thumbnail">
              <img 
                src={resolveImageUrl(pickImages(product)[0])} 
                alt={product.product_name || product.item_name || "Product"}
              />
            </div>
          ))}
        </div>
        <div className="multi-badge">
          <Percent size={12} />
          <span>{discountPercentage}% OFF</span>
        </div>
        {productCount > 4 && (
          <button 
            className="more-products-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            <Eye size={14} />
            <span>+{productCount - 4} more</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <div 
        className={`offer-card ${hovered ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Card Header */}
        <div className="card-header">
          <div className="seller-info">
            <div className="verified-badge">
              <Shield size={14} />
            </div>
            <span className="seller-name">{offer.seller || "Premium Seller"}</span>
            <div className="rating">
              <Star size={12} fill="#fbbf24" color="#fbbf24" />
              <span>{offer.rating?.toFixed(1) || "4.5"}</span>
            </div>
          </div>
          <button 
            className={`like-btn ${liked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={18} fill={liked ? "#ef4444" : "none"} />
          </button>
        </div>

        {/* Product Images - Always Visible */}
        <div className="product-images-container">
          {getImageLayout()}
        </div>

        {/* Card Content */}
        <div className="card-content">
          <h3 className="offer-title">{offer.offer_type || 'Special Offer'}</h3>
          <p className="offer-description">
            {offer.description || "Premium quality products with great value"}
          </p>
          
          {/* Price Section */}
          <div className="price-section">
            <div className="current-price">
              <span className="price">${displayedOfferPrice.toFixed(2)}</span>
              {displayedRealPrice > displayedOfferPrice && (
                <span className="original-price">${displayedRealPrice.toFixed(2)}</span>
              )}
            </div>
            <div className="savings">
              <Percent size={12} />
              <span>{discountPercentage}% OFF</span>
            </div>
          </div>

          {/* Product Count Indicator */}
          {productCount > 1 && (
            <div className="product-count-indicator">
              <Package size={14} />
              <span>{productCount} products in this offer</span>
              <button 
                className="view-details-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
              >
                <Eye size={14} />
                <span>View All</span>
              </button>
            </div>
          )}

          {/* Features List */}
          <div className="features-list">
            <div className="feature-item">
              <Check size={12} />
              <span>Free Shipping</span>
            </div>
            <div className="feature-item">
              <Check size={12} />
              <span>30-Day Returns</span>
            </div>
            <div className="feature-item">
              <Check size={12} />
              <span>Quality Guaranteed</span>
            </div>
            <div className="feature-item">
              <Check size={12} />
              <span>{discountPercentage}% Savings</span>
            </div>
          </div>

          {/* Stock Progress */}
          {offer.stock && (
            <div className="stock-progress">
              <div className="progress-text">
                <span>Sold: {offer.sold || 0}/{offer.stock}</span>
                <span className="stock-percentage">
                  {Math.round(((offer.sold || 0) / offer.stock) * 100)}% sold
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.min(((offer.sold || 0) / offer.stock) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="card-footer">
          <button className="primary-btn">
            <ShoppingBag size={16} />
            <span>Buy Now - Save {discountPercentage}%</span>
          </button>
          <button 
            className="secondary-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowModal(true);
            }}
          >
            <Eye size={16} />
            <span>Quick Look</span>
          </button>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal 
          products={products.map(p => ({
            id: p.id || p._id,
            name: p.product_name || p.item_name || p.name || p.product_name || p.title || 'Product',
            image: resolveImageUrl(pickImages(p)[0]),
            description: p.item_description || p.description || p.product_description || ''
          }))} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
};

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/offers`);
      setOffers(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load offers", err);
      setError("Failed to load offers. Using sample data...");
      // Use sample data as fallback
      setOffers(getSampleOffers());
    } finally {
      setLoading(false);
    }
  };

  // Calculate discount percentage for an offer
  const calculateOfferDiscount = (offer) => {
    const products = offer.products || offer.items || offer.products_list || [];
    const real = products.reduce((s, p) => 
      s + (parseFloat(p.product_price ?? p.price) || 0) * (parseInt(p.quantity) || 1), 0);
    const offerPrice = products.reduce((s, p) => 
      s + (parseFloat(p.offer_price ?? p.product_offer_price) || 0) * (parseInt(p.quantity) || 1), 0);
    
    if (real > 0 && offerPrice > 0) {
      const calculatedDiscount = ((real - offerPrice) / real) * 100;
      // Ensure minimum 10% discount for consistency
      return Math.max(Math.round(calculatedDiscount), 10);
    }
    
    // If no real price, check if there's a percentage in offer data
    if (offer.discount_percentage) {
      return Math.max(parseInt(offer.discount_percentage) || 10, 10);
    }
    
    // Default minimum discount
    return 10;
  };

  // Sample data for fallback
  const getSampleOffers = () => {
    return [
      {
        id: 1,
        offer_type: "Summer Sale",
        description: "Up to 50% off on electronics",
        seller: "ElectroMart",
        rating: 4.8,
        products: [
          {
            id: 1,
            product_name: "Wireless Headphones",
            price: 199.99,
            offer_price: 149.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
          },
          {
            id: 2,
            product_name: "Smart Watch",
            price: 299.99,
            offer_price: 199.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop"
          }
        ],
        stock: 50,
        sold: 35
      },
      {
        id: 2,
        offer_type: "Home Essentials",
        description: "Complete home setup bundle",
        seller: "HomePro",
        rating: 4.6,
        products: [
          {
            id: 3,
            product_name: "Smart Light",
            price: 49.99,
            offer_price: 34.99,
            quantity: 2,
            image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop"
          },
          {
            id: 4,
            product_name: "Air Purifier",
            price: 129.99,
            offer_price: 89.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop"
          },
          {
            id: 5,
            product_name: "Coffee Maker",
            price: 89.99,
            offer_price: 59.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop"
          }
        ],
        stock: 30,
        sold: 25
      },
      {
        id: 3,
        offer_type: "Gaming Bundle",
        description: "Premium gaming accessories pack",
        seller: "GameZone",
        rating: 4.9,
        products: [
          {
            id: 6,
            product_name: "Gaming Mouse",
            price: 79.99,
            offer_price: 59.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop"
          },
          {
            id: 7,
            product_name: "Mechanical Keyboard",
            price: 129.99,
            offer_price: 89.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop"
          },
          {
            id: 8,
            product_name: "Gaming Headset",
            price: 149.99,
            offer_price: 119.99,
            quantity: 1,
            image: "https://images.unsplash.com/photo-1585298723680-42d1be5d0d78?w=400&h=400&fit=crop"
          }
        ],
        stock: 40,
        sold: 32
      }
    ];
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchOffers();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing offers...</p>
        <p className="loading-subtext">Fetching the best deals for you</p>
      </div>
    );
  }

  // Calculate statistics with percentage values
  const totalProducts = offers.reduce((acc, offer) => 
    acc + ((offer.products || offer.items || offer.products_list || []).length), 0);
  
  const discounts = offers.map(offer => calculateOfferDiscount(offer));
  const minDiscount = offers.length > 0 ? Math.min(...discounts) : 10;
  const maxDiscount = offers.length > 0 ? Math.max(...discounts) : 50;
  const avgDiscount = offers.length > 0 
    ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length) 
    : 25;

  return (
    <div className="offers-list-container">
      {/* Hero Section */}
   

      {/* Offers Grid */}
      <div className="offers-grid">
        {offers.map((offer, index) => (
          <OfferCard key={offer.id || offer._id || index} offer={offer} index={index} />
        ))}
      </div>

      

      {/* Load More Button */}
      {offers.length > 0 && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={fetchOffers}>
            <RefreshCw size={16} />
            <span>Refresh Offers</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {offers.length === 0 && !loading && (
        <div className="empty-state">
          <ShoppingBag size={64} color="#ccc" />
          <h3>No offers available</h3>
          <p>Check back later for new deals!</p>
          <button className="retry-btn" onClick={handleRetry}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default OffersList;