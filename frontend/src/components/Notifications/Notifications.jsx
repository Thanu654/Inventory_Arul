import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  // alert-settings removed: use per-item `min_stock` only
  const [isLoading, setIsLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ src: '', alt: '' });
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchLowStockItems();
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/subcategories`);
      if (!res.ok) return;
      const data = await res.json();
      setSubcategories(data || []);
    } catch (err) {
      console.error('Failed to load subcategories', err);
    }
  };

  // alert settings removed; thresholds come from each item's `min_stock` field

  // Fetch all items and compute low-stock using per-item `min_stock` only
  const fetchLowStockItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/api/items`);
      if (!response.ok) {
        toast.error('Failed to fetch items');
        setIsLoading(false);
        return;
      }
      const items = await response.json();

      // Determine low-stock per item using min_stock when available. Only include items that have min_stock defined.
      const lowItems = items.filter(item => {
        if (item.min_stock === undefined || item.min_stock === null) return false;
        const threshold = parseInt(item.min_stock);
        const qty = parseInt(item.quantity) || 0;
        return qty <= threshold;
      });

      setLowStockItems(lowItems || []);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      toast.error('Error fetching low stock items');
    } finally {
      setIsLoading(false);
    }
  };

  // alert-settings functions removed; per-item `min_stock` controls behaviour

  // Use per-item threshold (min_stock). If not set, computeThreshold returns null.
  const computeThreshold = (item) => {
    return (item.min_stock !== undefined && item.min_stock !== null) ? parseInt(item.min_stock) : null;
  };

  const getBadgeColor = (item) => {
    const quantity = parseInt(item.quantity) || 0;
    const threshold = computeThreshold(item);
    if (quantity === 0) return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-200';
    if (threshold !== null && quantity <= Math.floor(threshold / 2)) return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200';
    return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-200';
  };

  const getStatusText = (item) => {
    const quantity = parseInt(item.quantity) || 0;
    const threshold = computeThreshold(item);
    if (quantity === 0) return 'Out of Stock';
    if (threshold !== null && quantity <= Math.floor(threshold / 2)) return 'Critical';
    return 'Low Stock';
  };

  const getPriorityIcon = (item) => {
    const quantity = parseInt(item.quantity) || 0;
    const threshold = computeThreshold(item);
    if (quantity === 0) return '🔥';
    if (threshold !== null && quantity <= Math.floor(threshold / 2)) return '⚠️';
    return '📉';
  };

  const openImageModal = (imageSrc, imageAlt) => {
    setSelectedImage({ src: imageSrc, alt: imageAlt });
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage({ src: '', alt: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Inventory Alerts
                </h1>
                <p className="text-gray-600 mt-1">Monitor low stock items and manage inventory alerts in real-time</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchLowStockItems}
              className="group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
            >
              <div className="p-1 rounded-lg bg-white/20 backdrop-blur-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
              </div>
              <span className="font-medium text-white">Refresh Alerts</span>
            </button>
          </div>
        </div>

        {/* Alert Summary: showing Low Stock and Out of Stock counts (per-item min_stock) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            {
              title: "Low Stock Items",
              value: lowStockItems.length,
              icon: (
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                </div>
              ),
              color: "from-orange-500 to-orange-600",
              unit: "items"
            },
            {
              title: "Out of Stock",
              value: lowStockItems.filter(item => item.quantity === 0).length,
              icon: (
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-red-200">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
              ),
              color: "from-red-500 to-red-600",
              unit: "items"
            }
          ].map((stat, index) => (
            <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">{stat.title}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                    <span className="text-sm text-gray-500">{stat.unit}</span>
                  </div>
                </div>
                <div className="group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${Math.min(100, (stat.value / (lowStockItems.length + 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Low Stock Items List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h2>
                <p className="text-gray-600 mt-1">Items that have a configured `min_stock` and are at or below that level</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowOutOfStockOnly(!showOutOfStockOnly)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    showOutOfStockOnly
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Out Of Stock
                </button>
                <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <span className="text-sm font-medium text-blue-700">
                    Total: {showOutOfStockOnly ? lowStockItems.filter(item => item.quantity === 0).length : lowStockItems.length} alert{(showOutOfStockOnly ? lowStockItems.filter(item => item.quantity === 0).length : lowStockItems.length) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading inventory alerts...</p>
              </div>
            ) : (() => {
              const filteredItems = showOutOfStockOnly 
                ? lowStockItems.filter(item => item.quantity === 0)
                : lowStockItems;

              if (filteredItems.length === 0) {
                return (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">{showOutOfStockOnly ? '📦' : '✅'}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {showOutOfStockOnly ? 'No Out of Stock Items!' : 'All Stock Levels Are Optimal!'}
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {showOutOfStockOnly 
                        ? 'Great! You have no items with zero quantity. All products are in stock.'
                        : `No items are currently at or below their configured min_stock. Your inventory is well-managed!`
                      }
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filteredItems.map((item, index) => (
                  <div 
                    key={index} 
                    className="group bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-purple-50 rounded-xl border border-gray-200 hover:border-blue-200 p-6 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {item.image ? (
                            <div 
                              className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-lg group-hover:border-blue-100 transition-all cursor-pointer"
                              onClick={() => openImageModal(`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${item.image}`, item.name)}
                            >
                              <img
                                src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${item.image}`}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border border-blue-200">
                              <span className="text-2xl">📦</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{getPriorityIcon(item)}</span>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Category:</span>
                              <span className="font-medium text-gray-700">{item.category || 'Uncategorized'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Subcategory:</span>
                              <span className="font-medium text-gray-700">{(subcategories.find(sc => String(sc.id) === String(item.subcategory_id))?.name) || 'None'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Min Stock:</span>
                              <span className="font-bold text-gray-900">{item.min_stock ?? 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Price:</span>
                              <span className="font-bold text-green-600">${parseFloat(item.price).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
                        <div className="text-right">
                          <div className="text-4xl font-bold text-gray-900 mb-1">{item.quantity}</div>
                          <div className="text-sm text-gray-500">units remaining</div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${getBadgeColor(item)}`}>
                            {getStatusText(item)}
                          </span>
                          <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                            {(() => {
                              const threshold = computeThreshold(item) || 1;
                              const qty = parseInt(item.quantity) || 0;
                              const percent = threshold === 0 ? 100 : Math.min(100, Math.round((qty / threshold) * 100));
                              const barClass = qty === 0 ? 'bg-gradient-to-r from-red-500 to-pink-500' : (qty <= Math.floor(threshold / 2) ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500');
                              return (
                                <div className={`h-full rounded-full ${barClass}`} style={{ width: `${percent}%` }}></div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
        </div>

        {/* Image Modal */}
        {imageModalOpen && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeImageModal}
          >
            <div 
              className="relative max-w-4xl w-full max-h-[90vh] animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeImageModal}
                className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all hover:scale-110 z-10"
              >
                ×
              </button>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="w-full h-full max-h-[70vh] object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.alt}</h3>
                  <div className="flex items-center gap-2 text-white/80">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Product Image</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        

        {/* Add custom animations */}
        <style jsx>{`
          @keyframes scaleUp {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-scaleUp {
            animation: scaleUp 0.3s ease-out;
          }
          
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          input[type="range"]:hover::-webkit-slider-thumb {
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
        `}</style>
      </div>
    </div>
  );
};

export default Notifications;