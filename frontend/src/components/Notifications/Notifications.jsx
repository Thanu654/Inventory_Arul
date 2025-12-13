import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [alertQuantity, setAlertQuantity] = useState(10);
  const [tempAlertQuantity, setTempAlertQuantity] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ src: '', alt: '' });
  const [showOutOfStockOnly, setShowOutOfStockOnly] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAlertSettings();
    fetchLowStockItems();
  }, []);

  const fetchAlertSettings = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/alert-settings`);
      if (response.ok) {
        const data = await response.json();
        if (data.alertQuantity) {
          setAlertQuantity(data.alertQuantity);
        }
      }
    } catch (error) {
      console.error('Error fetching alert settings:', error);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/api/low-stock-items`);
      if (response.ok) {
        const data = await response.json();
        setLowStockItems(data.items || []);
      } else {
        toast.error('Failed to fetch low stock items');
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      toast.error('Error fetching low stock items');
    } finally {
      setIsLoading(false);
    }
  };

  const openSettingsModal = () => {
    setTempAlertQuantity(alertQuantity);
    setIsSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setTempAlertQuantity(alertQuantity);
    setIsSettingsModalOpen(false);
  };

  const handleSaveAlertSettings = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/alert-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertQuantity: tempAlertQuantity }),
      });

      if (response.ok) {
        setAlertQuantity(tempAlertQuantity);
        toast.success('Alert quantity updated successfully!');
        setIsSettingsModalOpen(false);
        fetchLowStockItems();
      } else {
        toast.error('Failed to update alert settings');
      }
    } catch (error) {
      console.error('Error updating alert settings:', error);
      toast.error('Error updating alert settings');
    }
  };

  const getBadgeColor = (quantity) => {
    if (quantity === 0) return 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-200';
    if (quantity <= alertQuantity / 2) return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200';
    return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-200';
  };

  const getStatusText = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= alertQuantity / 2) return 'Critical';
    return 'Low Stock';
  };

  const getPriorityIcon = (quantity) => {
    if (quantity === 0) return '🔥';
    if (quantity <= alertQuantity / 2) return '⚠️';
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
              onClick={openSettingsModal}
              className="group px-6 py-3 bg-white rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 flex items-center justify-center gap-3"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Alert Settings</span>
            </button>
            
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

        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Alert Threshold",
              value: alertQuantity,
              icon: (
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  </svg>
                </div>
              ),
              color: "from-blue-500 to-blue-600",
              unit: "units"
            },
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
                  style={{ width: `${Math.min(100, (stat.value / (index === 0 ? 50 : lowStockItems.length + 1)) * 100)}%` }}
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
                <p className="text-gray-600 mt-1">Items below the alert threshold of <span className="font-semibold text-blue-600">{alertQuantity}</span> units</p>
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
                        : `No items are currently below the alert threshold of ${alertQuantity} units. Your inventory is well-managed!`
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
                            <span className="text-2xl">{getPriorityIcon(item.quantity)}</span>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-medium">SKU: {item.sku || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Category:</span>
                              <span className="font-medium text-gray-700">{item.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Price:</span>
                              <span className="font-bold text-green-600">${item.price}</span>
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
                          <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${getBadgeColor(item.quantity)}`}>
                            {getStatusText(item.quantity)}
                          </span>
                          <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.quantity === 0 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 
                                item.quantity <= alertQuantity / 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 
                                'bg-gradient-to-r from-yellow-500 to-orange-500'
                              }`}
                              style={{ width: `${Math.min(100, (item.quantity / alertQuantity) * 100)}%` }}
                            ></div>
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

        {/* Alert Settings Modal */}
        {isSettingsModalOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeSettingsModal}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Alert Settings</h3>
                    <p className="text-gray-600 mt-1">Configure low stock notifications</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Alert Threshold
                    </label>
                    <div className="relative group">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={tempAlertQuantity}
                        onChange={(e) => setTempAlertQuantity(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-purple-600 [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>1</span>
                        <span className="font-medium text-blue-600">Current: {tempAlertQuantity}</span>
                        <span>100</span>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-sm text-gray-700">
                        Items with quantity <span className="font-bold text-blue-600">below {tempAlertQuantity}</span> will trigger low stock alerts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={closeSettingsModal}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAlertSettings}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Save Settings
                </button>
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