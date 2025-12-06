import React, { useState, useEffect } from 'react';

const Billing = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [mainSearchTerm, setMainSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ src: '', alt: '' });

  // Fetch inventory items from backend
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/items`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const openCartModal = () => {
    setIsCartModalOpen(true);
  };

  const closeCartModal = () => {
    setIsCartModalOpen(false);
  };

  // Image modal functions
  const openImageModal = (imageSrc, imageAlt) => {
    setSelectedImage({ src: imageSrc, alt: imageAlt });
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage({ src: '', alt: '' });
  };

  const handleMainSearchChange = (e) => {
    setMainSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const clearMainSearch = () => {
    setMainSearchTerm('');
    setCurrentPage(1); // Reset to first page when clearing search
  };

  const filteredMainProducts = items.filter(item =>
    item.name.toLowerCase().includes(mainSearchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredMainProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredMainProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };



  const addProductToBill = (item) => {
    const existingProduct = selectedProducts.find(p => p.id === item.id);
    if (existingProduct) {
      showToast('Product already added to bill', 'error');
      return;
    }
    
    setSelectedProducts(prev => [...prev, {
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      maxQuantity: item.quantity,
      selectedQuantity: 1,
      category: item.category
    }]);
    
    showToast(`${item.name} added to bill`, 'success');
  };

  const updateProductQuantity = (productId, quantity) => {
    const numQuantity = parseInt(quantity) || 0;
    
    setSelectedProducts(prev => 
      prev.map(p => {
        if (p.id === productId) {
          const maxAllowed = p.maxQuantity || p.quantity;
          const validQuantity = Math.max(0, Math.min(numQuantity, maxAllowed));
          
          // Show warning if user tries to enter more than available
          if (numQuantity > maxAllowed) {
            showToast(`Only ${maxAllowed} units available for ${p.name}`, 'warning');
          }
          
          return { ...p, selectedQuantity: validQuantity };
        }
        return p;
      })
    );
  };

  const removeProductFromBill = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product removed from bill', 'success');
  };

  const calculateProductTotal = (product) => {
    return product.price * product.selectedQuantity;
  };

  const calculateOverallTotal = () => {
    return selectedProducts.reduce((total, product) => total + calculateProductTotal(product), 0);
  };

  const clearBill = () => {
    setSelectedProducts([]);
    setCustomerName('');
    showToast('Bill cleared', 'success');
  };

  const printBill = async () => {
    try {
      const billDate = new Date().toLocaleDateString();
      const billTime = new Date().toLocaleTimeString();
      const billNumber = `INV-${Date.now()}`;
      const totalAmount = calculateOverallTotal();

      // Prepare purchase data
      const purchaseData = {
        billNumber,
        customerName: customerName.trim() || 'Walk-in Customer',
        totalAmount,
        paymentMethod: 'Cash',
        items: selectedProducts.map(product => ({
          itemId: product.id,
          itemName: product.name,
          itemPrice: product.price,
          quantity: product.selectedQuantity,
          totalPrice: calculateProductTotal(product)
        }))
      };

      // Save to backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save purchase');
      }

      // Update local items state to reflect reduced quantities
      setItems(prevItems => 
        prevItems.map(item => {
          const soldProduct = selectedProducts.find(p => p.id === item.id);
          if (soldProduct) {
            return { ...item, quantity: item.quantity - soldProduct.selectedQuantity };
          }
          return item;
        })
      );

      // Clear the bill
      setSelectedProducts([]);
      setCustomerName('');
      
      showToast(`Purchase saved! Bill number: ${billNumber}`, 'success');

      // Generate print content
      const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${billNumber}</title>
        <style>
          body { 
            font-family: 'Courier New', monospace; 
            margin: 0; 
            padding: 8px; 
            font-size: 11px;
            line-height: 1.2;
            width: 300px;
            max-width: 300px;
            color: #000;
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px; 
          }
          .company-name { 
            font-size: 14px; 
            font-weight: bold; 
            margin-bottom: 2px; 
            letter-spacing: 1px;
          }
          .receipt-type { 
            font-size: 11px; 
            margin-bottom: 8px; 
          }
          .separator {
            text-align: center;
            margin: 8px 0;
            font-size: 10px;
          }
          .bill-info { 
            margin-bottom: 15px; 
            font-size: 10px;
          }
          .bill-info div { 
            margin-bottom: 1px; 
          }
          .items-section {
            margin-bottom: 15px;
          }
          .item-row {
            margin-bottom: 6px;
            font-size: 10px;
          }
          .item-line1 {
            margin-bottom: 1px;
          }
          .item-line2 {
            display: flex;
            justify-content: space-between;
            margin-left: 10px;
          }
          .totals { 
            margin-top: 15px;
            font-size: 11px;
          }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 3px;
          }
          .grand-total { 
            font-weight: bold; 
            font-size: 12px;
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px solid #000;
          }
          .footer { 
            text-align: center; 
            margin-top: 15px; 
            font-size: 9px; 
          }
          .footer-line {
            margin-bottom: 2px;
          }
          @media print {
            body { 
              margin: 0; 
              padding: 5px;
              width: 280px;
            }
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">INVENTORY SYSTEM</div>
          <div class="receipt-type">SALES RECEIPT</div>
        </div>
        
        <div class="separator">...................................</div>
        
        <div class="bill-info">
          <div>Receipt #: ${billNumber}</div>
          <div>Date: ${billDate}</div>
          <div>Time: ${billTime}</div>
          <div>Customer: ${customerName.trim() || 'Walk-in Customer'}</div>
          <div>Payment: Cash</div>
        </div>
        
        <div class="separator">...................................</div>
        
        <div class="items-section">
          <div style="margin-bottom: 8px; font-weight: bold; font-size: 10px;">ITEMS PURCHASED</div>
          ${selectedProducts.map((product, index) => `
            <div class="item-row">
              <div class="item-line1">${index + 1}. ${product.name}</div>
              <div class="item-line2">
                <span>${product.selectedQuantity} x $${product.price.toFixed(2)}</span>
                <span>$${calculateProductTotal(product).toFixed(2)}</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="separator">...................................</div>
        
        <div class="totals">
          <div class="total-row grand-total">
            <span>TOTAL:</span>
            <span>$${totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="separator">...................................</div>
        
        <div class="footer">
          <div class="footer-line">Thank you for your business!</div>
          <div class="footer-line">Please visit again</div>
          <div style="margin-top: 8px; font-size: 8px;">${billDate} ${billTime}</div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    } catch (error) {
      console.error('Error processing bill:', error);
      showToast('Failed to process bill: ' + error.message, 'error');
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <button
          onClick={fetchItems}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Cart Section */}
      <div className="flex justify-between items-center mb-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={mainSearchTerm}
            onChange={handleMainSearchChange}
            placeholder="Search products..."
            className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {mainSearchTerm && (
            <button
              onClick={clearMainSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Shopping Cart Button */}
        <div className="ml-4">
        <button
          onClick={openCartModal}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
          <span>Shopping Cart ({selectedProducts.length})</span>
        </button>
        </div>
      </div>

      {/* Available Products */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Products</h2>
        
        {filteredMainProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {mainSearchTerm ? `No products found matching "${mainSearchTerm}"` : 'No products available.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {item.image && (
                  <div className="mb-3">
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${item.image}`}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageModal(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${item.image}`, item.name)}
                    />
                  </div>
                )}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category || 'Uncategorized'}</p>
                    <p className="text-lg font-semibold text-blue-600">${parseFloat(item.price).toFixed(2)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.quantity > 10 ? 'bg-green-100 text-green-800' : 
                    item.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    Stock: {item.quantity}
                  </span>
                </div>
                <button
                  onClick={() => addProductToBill(item)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
                >
                  Add to Bill
                </button>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          )}
          
          {/* Pagination Info */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredMainProducts.length)} of {filteredMainProducts.length} products
          </div>
          </>
        )}
      </div>



      {/* Shopping Cart Modal */}
      {isCartModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Shopping Cart</h2>
              <button
                onClick={closeCartModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Customer Information</h3>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name (optional - defaults to Walk-in Customer)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Bill Items */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Bill Items</h3>
                  {selectedProducts.length > 0 && (
                    <button
                      onClick={clearBill}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {selectedProducts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">No products added to bill yet.</p>
                    <p className="text-gray-500">Add products from the main page to create a bill.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedProducts.map((product, index) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.category || 'Uncategorized'}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              ${product.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="text"
                                value={product.selectedQuantity}
                                onChange={(e) => updateProductQuantity(product.id, e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="text-xs text-gray-500">Available: {product.maxQuantity}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${calculateProductTotal(product).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => removeProductFromBill(product.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition duration-200"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bill Summary and Actions */}
              {selectedProducts.length > 0 && (
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-xl font-bold text-gray-800">
                      Total: ${calculateOverallTotal().toFixed(2)}
                    </div>
                    <button
                      onClick={printBill}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                      🖨️ Process & Print Bill
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeImageModal}
              className="absolute -top-2 -right-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-gray-200 z-10"
            >
              ×
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <h3 className="text-lg font-semibold">{selectedImage.alt}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;