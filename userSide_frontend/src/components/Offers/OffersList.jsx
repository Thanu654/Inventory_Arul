import React, { useEffect, useState, useRef } from "react";
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
  Percent,
  ChevronLeft,
  ChevronDown,
  Grid3x3,
  List,
  Maximize2,
  Minus,
  Plus,
  ShoppingCart,
  Tag
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Enhanced Product Modal for many products
const ProductGridModal = ({ products, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  
  if (!products || products.length === 0) return null;
  
  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + productsPerPage);
  
  // Helper function to resolve image URLs
  const resolveImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop';
    if (typeof img !== 'string') return 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `${apiUrl}${img}`;
    return `${apiUrl}/uploads/${img}`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Products ({products.length})</h2>
            <p className="text-gray-600 text-sm">Scroll to view all items in this offer</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-200 p-1 rounded-lg">
              <button
                className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List size={18} />
              </button>
            </div>
            
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
              <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
                <Minus size={16} />
              </button>
              <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
                <Plus size={16} />
              </button>
            </div>
            
            <button 
              className="bg-gray-800 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Product Grid/List */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentProducts.map((product, index) => {
                const imgIndex = startIndex + index;
                return (
                  <div 
                    key={product.id || imgIndex}
                    className={`border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                      selectedImage === imgIndex ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(imgIndex)}
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                  >
                    <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={resolveImageUrl(product.image)} 
                        alt={product.name || "Product"}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{imgIndex + 1}
                        </span>
                        {product.price && (
                          <span className="text-sm font-bold text-green-600">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                        {product.name || "Product"}
                      </h4>
                      {product.description && (
                        <p className="text-gray-600 text-xs line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {currentProducts.map((product, index) => {
                const imgIndex = startIndex + index;
                return (
                  <div 
                    key={product.id || imgIndex}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedImage === imgIndex ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(imgIndex)}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={resolveImageUrl(product.image)} 
                        alt={product.name || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {product.name || "Product"}
                        </span>
                        {product.price && (
                          <span className="text-lg font-bold text-green-600 flex-shrink-0 ml-2">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          Item #{imgIndex + 1}
                        </span>
                        {product.category && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {product.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
              <button
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`w-10 h-10 rounded-lg ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'border hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        
        {/* Selected Product Detail */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-200">
              <img 
                src={resolveImageUrl(products[selectedImage]?.image)} 
                alt={products[selectedImage]?.name || "Product"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {products[selectedImage]?.name || "Product"}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Product {selectedImage + 1} of {products.length}
                  </p>
                </div>
                {products[selectedImage]?.price && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${parseFloat(products[selectedImage].price).toFixed(2)}
                    </div>
                    {products[selectedImage]?.originalPrice && (
                      <div className="text-gray-400 line-through">
                        ${parseFloat(products[selectedImage].originalPrice).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {products[selectedImage]?.description && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {products[selectedImage].description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-3 mt-4">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <button className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Save for Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Offer Card - Clear display for 1-20 products
const OfferCard = ({ offer, index }) => {
  const [liked, setLiked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  
  // Helper function to resolve image URLs
  const resolveImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop';
    if (typeof img !== 'string') return 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop';
    if (img.startsWith('http')) return img;
    if (img.startsWith('/')) return `${apiUrl}${img}`;
    return `${apiUrl}/uploads/${img}`;
  };

  // Pick images from product - KEEPING YOUR ORIGINAL LOGIC
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

  // Ensure products array exists - KEEPING YOUR ORIGINAL LOGIC
  const products = offer.products || offer.items || offer.products_list || [];
  const productCount = products.length;

  // Calculate prices - KEEPING YOUR ORIGINAL LOGIC
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

  // Calculate discount percentage - KEEPING YOUR ORIGINAL LOGIC
  const calculateDiscountPercentage = () => {
    if (displayedRealPrice > 0 && displayedOfferPrice > 0) {
      const calculatedDiscount = ((displayedRealPrice - displayedOfferPrice) / displayedRealPrice) * 100;
      return Math.max(Math.round(calculatedDiscount), 10);
    }
    if (offer.discount_percentage) {
      return Math.max(parseInt(offer.discount_percentage) || 10, 10);
    }
    return 10;
  };

  const discountPercentage = calculateDiscountPercentage();

  // Get product display based on count - IMPROVED VERSION
  const getProductDisplay = () => {
    if (productCount === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-xl gap-3">
          <Package size={48} className="text-gray-400" />
          <p className="text-gray-500">No products available</p>
        </div>
      );
    }

    if (productCount === 1) {
      const [primaryImg] = pickImages(products[0]);
      return (
        <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden">
          <img 
            src={resolveImageUrl(primaryImg)} 
            alt={products[0].product_name || products[0].item_name || "Product"}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Percent size={12} />
            <span>{discountPercentage}% OFF</span>
          </div>
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
            1 Product
          </div>
        </div>
      );
    }

    if (productCount === 2) {
      const [img1] = pickImages(products[0]);
      const [img2] = pickImages(products[1]);
      return (
        <div className="grid grid-cols-2 gap-4 h-64">
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <img 
              src={resolveImageUrl(img1)} 
              alt={products[0].product_name || products[0].item_name || "Product"}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              #1
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <img 
              src={resolveImageUrl(img2)} 
              alt={products[1].product_name || products[1].item_name || "Product"}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              #2
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            2 Items
          </div>
        </div>
      );
    }

    if (productCount === 3) {
      return (
        <div className="grid grid-cols-2 gap-3 h-64">
          <div className="relative row-span-2 rounded-xl overflow-hidden bg-gray-100">
            <img 
              src={resolveImageUrl(pickImages(products[0])[0])} 
              alt={products[0].product_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              #1
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <img 
              src={resolveImageUrl(pickImages(products[1])[0])} 
              alt={products[1].product_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              #2
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <img 
              src={resolveImageUrl(pickImages(products[2])[0])} 
              alt={products[2].product_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
              #3
            </div>
          </div>
          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            3 Items
          </div>
        </div>
      );
    }

    if (productCount === 4) {
      return (
        <div className="grid grid-cols-2 gap-3 h-64">
          {products.slice(0, 4).map((product, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden bg-gray-100">
              <img 
                src={resolveImageUrl(pickImages(product)[0])} 
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                #{idx + 1}
              </div>
            </div>
          ))}
          <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            4 Items
          </div>
        </div>
      );
    }

    // For 5-20 products - Show grid with count
    return (
      <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 gap-2 p-4 h-full">
          {products.slice(0, 9).map((product, idx) => (
            <div key={idx} className="relative rounded-lg overflow-hidden bg-white border border-gray-300">
              <img 
                src={resolveImageUrl(pickImages(product)[0])} 
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
              {idx < 8 && (
                <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {idx + 1}
                </div>
              )}
              {idx === 8 && productCount > 9 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    +{productCount - 8}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {productCount} Items
        </div>
        
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs">
          {productCount} Products in Bundle
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
       

        {/* Product Display */}
        <div className="p-5">
          {getProductDisplay()}
        </div>

        {/* Card Content */}
        <div className="p-5 pt-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
            {offer.description || "Special Offer"}
          </h3>
          
          
          
          {/* Price Section */}
          <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ${displayedOfferPrice.toFixed(2)}
                </div>
                {displayedRealPrice > displayedOfferPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 line-through text-sm">
                      ${displayedRealPrice.toFixed(2)}
                    </span>
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      Save ${(displayedRealPrice - displayedOfferPrice).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-700">Total Value</div>
                <div className="text-lg font-bold text-green-600">
                  {discountPercentage}% OFF
                </div>
              </div>
            </div>
            
            {/* Product Count Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Package size={14} />
                <span>{productCount} items included</span>
              </div>
              <button 
                className="text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-700"
                onClick={() => setShowModal(true)}
              >
                <Eye size={14} />
                <span>View All</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Avg. Price/Item</div>
              <div className="font-bold text-gray-900">
                ${(displayedOfferPrice / productCount).toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">You Save</div>
              <div className="font-bold text-green-600">
                ${(displayedRealPrice - displayedOfferPrice).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Stock Progress */}
          {offer.stock && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} />
                  <span>Limited Stock</span>
                </div>
                <span className="font-semibold">
                  {offer.sold || 0}/{offer.stock} sold
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(((offer.sold || 0) / offer.stock) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
              <ShoppingBag size={16} />
              <span>Buy Now</span>
            </button>
            <button 
              className="flex-1 border-2 border-blue-500 text-blue-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
              onClick={() => setShowModal(true)}
            >
              <Maximize2 size={16} />
              <span>Details</span>
            </button>
          </div>

          {/* Product Count Badge */}
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 rounded-full">
              <Tag size={14} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">
                Bundle of {productCount} Products
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid Modal */}
      {showModal && (
        <ProductGridModal 
          products={products.map(p => ({
            id: p.id || p._id,
            name: p.product_name || p.item_name || p.name || p.title || 'Product',
            image: resolveImageUrl(pickImages(p)[0]),
            description: p.item_description || p.description || p.product_description || '',
            price: p.offer_price || p.product_offer_price || p.price,
            originalPrice: p.product_price || p.price,
            category: p.category || p.type
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
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchOffers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/offers`);
      setOffers(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load offers", err);
      setError("Failed to load offers. Using sample data...");
      setOffers(getSampleOffers());
    } finally {
      setLoading(false);
    }
  };

  // Sample data function - KEEPING YOUR ORIGINAL LOGIC
  const getSampleOffers = () => {
    return [
      {
        id: 1,
        offer_type: "Electronics Bundle",
        description: "Complete electronics setup with 8 premium products",
        seller: "ElectroMart",
        rating: 4.8,
        products: Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          product_name: `Electronics Product ${i + 1}`,
          price: 99.99 + i * 50,
          offer_price: 69.99 + i * 35,
          quantity: 1,
          image: "https://images.unsplash.com/photo-15" + (i % 10) + "6656793-08538906a9f8?w=400&h=400&fit=crop"
        })),
        stock: 50,
        sold: 35
      },
      {
        id: 2,
        offer_type: "Home Essentials Pack",
        description: "15 essential home products for modern living",
        seller: "HomePro",
        rating: 4.6,
        products: Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          product_name: `Home Product ${i + 1}`,
          price: 29.99 + i * 20,
          offer_price: 19.99 + i * 15,
          quantity: 1,
          image: "https://images.unsplash.com/photo-15" + ((i + 3) % 10) + "6656793-08538906a9f8?w=400&h=400&fit=crop"
        })),
        stock: 30,
        sold: 25
      },
      {
        id: 3,
        offer_type: "Office Setup",
        description: "Complete office setup with 5 premium items",
        seller: "OfficePlus",
        rating: 4.9,
        products: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          product_name: `Office Product ${i + 1}`,
          price: 149.99 + i * 100,
          offer_price: 99.99 + i * 70,
          quantity: 1,
          image: "https://images.unsplash.com/photo-15" + ((i + 5) % 10) + "6656793-08538906a9f8?w=400&h=400&fit=crop"
        })),
        stock: 40,
        sold: 32
      },
      {
        id: 4,
        offer_type: "Kitchen Essentials",
        description: "3 premium kitchen products bundle",
        seller: "KitchenPro",
        rating: 4.7,
        products: Array.from({ length: 3 }, (_, i) => ({
          id: i + 1,
          product_name: `Kitchen Product ${i + 1}`,
          price: 79.99 + i * 60,
          offer_price: 49.99 + i * 40,
          quantity: 1,
          image: "https://images.unsplash.com/photo-15" + ((i + 7) % 10) + "6656793-08538906a9f8?w=400&h=400&fit=crop"
        })),
        stock: 25,
        sold: 20
      },
      {
        id: 5,
        offer_type: "Single Product Deal",
        description: "Premium single product at discounted price",
        seller: "SoloDeals",
        rating: 4.5,
        products: Array.from({ length: 1 }, (_, i) => ({
          id: i + 1,
          product_name: `Premium Single Product`,
          price: 299.99,
          offer_price: 199.99,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop"
        })),
        stock: 100,
        sold: 85
      }
    ];
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Filter and sort offers
  const filteredOffers = offers.filter(offer => {
    const productCount = (offer.products || offer.items || offer.products_list || []).length;
    if (filter === "single") return productCount === 1;
    if (filter === "multiple") return productCount > 1;
    if (filter === "large") return productCount >= 5;
    return true;
  });

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    const aCount = (a.products || a.items || a.products_list || []).length;
    const bCount = (b.products || b.items || b.products_list || []).length;
    
    if (sortBy === "productCount") return bCount - aCount;
    if (sortBy === "discount") {
      const aDiscount = calculateDiscountPercentage(a);
      const bDiscount = calculateDiscountPercentage(b);
      return bDiscount - aDiscount;
    }
    return 0;
  });

  // Calculate discount percentage - KEEPING YOUR ORIGINAL LOGIC
  const calculateDiscountPercentage = (offer) => {
    const products = offer.products || offer.items || offer.products_list || [];
    const real = products.reduce((s, p) => 
      s + (parseFloat(p.product_price ?? p.price) || 0) * (parseInt(p.quantity) || 1), 0);
    const offerPrice = products.reduce((s, p) => 
      s + (parseFloat(p.offer_price ?? p.product_offer_price) || 0) * (parseInt(p.quantity) || 1), 0);
    
    if (real > 0 && offerPrice > 0) {
      const calculatedDiscount = ((real - offerPrice) / real) * 100;
      return Math.max(Math.round(calculatedDiscount), 10);
    }
    
    if (offer.discount_percentage) {
      return Math.max(parseInt(offer.discount_percentage) || 10, 10);
    }
    
    return 10;
  };

  // Calculate statistics
  const totalProducts = offers.reduce((acc, offer) => 
    acc + ((offer.products || offer.items || offer.products_list || []).length), 0);
  
  const discounts = offers.map(offer => calculateDiscountPercentage(offer));
  const avgDiscount = offers.length > 0 
    ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length) 
    : 25;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-4">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-lg text-gray-700 font-medium">Loading offers...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Stats */}
      

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-700 mb-2">Filter by Product Count:</div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Offers", icon: "📦" },
              { key: "single", label: "Single Product", icon: "1️⃣" },
              { key: "multiple", label: "Multiple Products", icon: "🛍️" },
              { key: "large", label: "Large Bundles (5+)", icon: "📊" }
            ].map((item) => (
              <button
                key={item.key}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  filter === item.key 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setFilter(item.key)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="w-full sm:w-64">
          
        </div>
      </div>

      {/* Offers Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {sortedOffers.map((offer, index) => (
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

      {/* Empty State */}
      {sortedOffers.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-lg p-12 max-w-lg mx-auto text-center">
          <Package size={64} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No offers match your filters</h3>
          <p className="text-gray-600 mb-6">Try changing your filter settings</p>
          <button 
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            onClick={() => setFilter("all")}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Load More/Refresh */}
      <div className="text-center">
        <button 
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all mx-auto"
          onClick={fetchOffers}
        >
          <RefreshCw size={16} />
          <span>Refresh Offers</span>
        </button>
      </div>
    </div>
  );
};

export default OffersList;