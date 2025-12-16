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

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Product Image Modal Component
const ProductModal = ({ products, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!products || products.length === 0) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 bg-black bg-opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl hover:bg-opacity-70 z-10 transition-colors"
          onClick={onClose}
        >
          ×
        </button>
        
        <div className="h-96 p-8 bg-gray-50 flex items-center justify-center">
          <img 
            src={products[selectedImage]?.image || "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=600&fit=crop"} 
            alt={products[selectedImage]?.name || "Product"}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        {products.length > 1 && (
          <div className="flex gap-4 p-8 bg-gray-50 overflow-x-auto">
            {products.map((product, index) => (
              <div 
                key={product.id || index}
                className={`w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-3 flex-shrink-0 ${
                  selectedImage === index ? 'border-blue-500' : 'border-transparent'
                } bg-white`}
                onClick={() => setSelectedImage(index)}
              >
                <img 
                  src={product.image || "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=200&h=200&fit=crop"} 
                  alt={product.name || "Product"}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="p-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {products[selectedImage]?.name || "Product"}
          </h3>
          <p className="text-gray-600 mb-4">
            Item {selectedImage + 1} of {products.length}
          </p>
          {products[selectedImage]?.description && (
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed">
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
        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
          <ShoppingBag size={48} />
          <p className="text-sm">No images available</p>
        </div>
      );
    }
    
    if (productCount === 1) {
      const [primaryImg] = pickImages(products[0]);
      return (
        <div className="relative h-full">
          <img 
            src={resolveImageUrl(primaryImg)} 
            alt={products[0].product_name || products[0].item_name || "Product"}
            className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border-2 border-white">
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
        <div className="grid grid-cols-2 gap-3 h-full p-4 relative">
          <div className="rounded-xl overflow-hidden">
            <img 
              src={resolveImageUrl(img1)} 
              alt={products[0].product_name || products[0].item_name || "Product"}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="rounded-xl overflow-hidden">
            <img 
              src={resolveImageUrl(img2)} 
              alt={products[1].product_name || products[1].item_name || "Product"}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border-2 border-white">
            <TrendingUp size={12} />
            <span>COMBO DEAL</span>
          </div>
          <button 
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-95 text-blue-600 border-2 border-blue-600 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1 hover:bg-blue-600 hover:text-white transition-colors z-10"
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
      <div className="grid grid-rows-[60%_40%] gap-2 h-full p-4 relative">
        <div className="rounded-xl overflow-hidden">
          <img 
            src={resolveImageUrl(pickImages(products[0])[0])} 
            alt={products[0].product_name || products[0].item_name || "Product"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {products.slice(0, 4).map((product, idx) => (
            <div key={product.id || idx} className="rounded-lg overflow-hidden bg-white border border-gray-200">
              <img 
                src={resolveImageUrl(pickImages(product)[0])} 
                alt={product.product_name || product.item_name || "Product"}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border-2 border-white">
          <Percent size={12} />
          <span>{discountPercentage}% OFF</span>
        </div>
        {productCount > 4 && (
          <button 
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-95 text-blue-600 border-2 border-blue-600 px-3 py-1 rounded-full font-semibold text-xs flex items-center gap-1 hover:bg-blue-600 hover:text-white transition-colors z-10"
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
        className={`bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 relative overflow-hidden border border-gray-200 ${
          hovered ? 'hover:shadow-2xl hover:-translate-y-1 hover:border-blue-500' : ''
        }`}
        style={{ animationDelay: `${index * 0.05}s` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Card Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-semibold text-gray-700">
              {offer.seller || "Premium Seller"}
            </span>
            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full text-xs text-yellow-800">
              <Star size={12} fill="#fbbf24" className="text-yellow-500" />
              <span>{offer.rating?.toFixed(1) || "4.5"}</span>
            </div>
          </div>
          <button 
            className={`p-2 rounded-full hover:bg-red-50 transition-colors ${liked ? 'text-red-500' : 'text-gray-400'}`}
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
        <div className="h-64 bg-gray-50 rounded-xl mb-6 overflow-hidden">
          {getImageLayout()}
        </div>

        {/* Card Content */}
        <div className="py-2">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {offer.offer_type || 'Special Offer'}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.7rem]">
            {offer.description || "Premium quality products with great value"}
          </p>
          
          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-extrabold text-gray-900">
                ${displayedOfferPrice.toFixed(2)}
              </span>
              {displayedRealPrice > displayedOfferPrice && (
                <span className="text-base text-gray-400 line-through">
                  ${displayedRealPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
              <span>{discountPercentage}% OFF</span>
            </div>
          </div>

          {/* Product Count Indicator */}
          {productCount > 1 && (
            <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg mb-3 text-blue-800 text-sm">
              <Package size={14} />
              <span>{productCount} products in this offer</span>
              <button 
                className="ml-auto text-blue-600 font-semibold text-sm underline"
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
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Check size={12} className="text-green-500" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Check size={12} className="text-green-500" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Check size={12} className="text-green-500" />
              <span>Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Check size={12} className="text-green-500" />
              <span>{discountPercentage}% Savings</span>
            </div>
          </div>

          {/* Stock Progress */}
          {offer.stock && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Sold: {offer.sold || 0}/{offer.stock}</span>
                <span className="font-semibold text-gray-700">
                  {Math.round(((offer.sold || 0) / offer.stock) * 100)}% sold
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(((offer.sold || 0) / offer.stock) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <ShoppingBag size={16} />
            <span>Buy Now - Save {discountPercentage}%</span>
          </button>
          <button 
            className="flex-1 bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold border-2 border-gray-200 flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-lg text-gray-700 font-medium">Loading amazing offers...</p>
        <p className="text-gray-500 text-sm">Fetching the best deals for you</p>
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
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <div className="text-3xl font-extrabold text-blue-600 mb-2">{offers.length}</div>
          <div className="text-gray-600 text-sm font-medium">Active Offers</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <div className="text-3xl font-extrabold text-green-600 mb-2">{avgDiscount}%</div>
          <div className="text-gray-600 text-sm font-medium">Avg. Discount</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <div className="text-3xl font-extrabold text-orange-600 mb-2">{totalProducts}</div>
          <div className="text-gray-600 text-sm font-medium">Total Products</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <div className="text-3xl font-extrabold text-purple-600 mb-2">{minDiscount}-{maxDiscount}%</div>
          <div className="text-gray-600 text-sm font-medium">Discount Range</div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {offers.map((offer, index) => (
          <OfferCard key={offer.id || offer._id || index} offer={offer} index={index} />
        ))}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Demo Mode</h4>
              <p className="text-yellow-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {offers.length > 0 && (
        <div className="text-center mb-12">
          <button 
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all mx-auto"
            onClick={fetchOffers}
          >
            <RefreshCw size={16} />
            <span>Refresh Offers</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {offers.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg mx-auto text-center">
          <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No offers available</h3>
          <p className="text-gray-600 mb-6">Check back later for new deals!</p>
          <button 
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-600 transition-colors mx-auto"
            onClick={handleRetry}
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default OffersList;