import React, { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';

const Billing = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [offerType, setOfferType] = useState('none'); // 'none' | 'percent' | 'lkr'
  const [offerValue, setOfferValue] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [paidBy, setPaidBy] = useState(localStorage.getItem('name') || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now()}`);
  const [billType, setBillType] = useState('invoice'); // always 'invoice' for this UI
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

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get('/staff');
      setUsers(res.data);
      
      // Set default user from localStorage
      const currentUserName = localStorage.getItem('name');
      const currentUserId = localStorage.getItem('userId');
      
      if (currentUserName) {
        setPaidBy(currentUserName);
      }
      
      if (currentUserId) {
        setSelectedUserId(currentUserId);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchUsers();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.product-search-container')) {
        setShowProductDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const openCartModal = () => {
    // generate a fresh invoice number when opening cart
    setInvoiceNumber(`INV-${Date.now()}`);
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
    // Check if product is out of stock
    if (item.quantity === 0) {
      showToast('Cannot add out of stock product', 'error');
      return;
    }
    
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
    // Allow empty string for typing (don't convert to 0 yet)
    if (quantity === '' || quantity === null || quantity === undefined) {
      setSelectedProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, selectedQuantity: '' } : p)
      );
      return;
    }
    
    const numQuantity = parseInt(quantity);
    
    // Only remove if user explicitly enters 0
    if (numQuantity === 0) {
      setSelectedProducts(prev => prev.filter(p => p.id !== productId));
      showToast('Product removed from bill', 'info');
      return;
    }
    
    // Handle invalid input
    if (isNaN(numQuantity) || numQuantity < 0) {
      return;
    }
    
    setSelectedProducts(prev => 
      prev.map(p => {
        if (p.id === productId) {
          const maxAllowed = p.maxQuantity || p.quantity;
          const validQuantity = Math.min(numQuantity, maxAllowed);
          
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

  const calculateDiscount = (subtotal) => {
    const val = parseFloat(offerValue) || 0;
    if (offerType === 'percent') return (subtotal * Math.min(Math.max(val, 0), 100)) / 100;
    if (offerType === 'lkr') return Math.min(Math.max(val, 0), subtotal);
    return 0;
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateOverallTotal();
    const discount = calculateDiscount(subtotal);
    return Math.max(0, subtotal - discount);
  };

  const handleOfferTypeChange = (value) => {
    const subtotal = calculateOverallTotal();
    if (value === 'none') {
      setOfferType('none');
      setOfferValue('');
      return;
    }

    // if switching to percent and current value > 100, clamp
    if (value === 'percent') {
      const v = parseFloat(offerValue) || 0;
      if (v > 100) {
        setOfferValue('100');
        showToast('Percentage cannot exceed 100%. It was set to 100.', 'warning');
      }
    }

    // if switching to lkr and current value > subtotal, clamp
    if (value === 'lkr') {
      const v = parseFloat(offerValue) || 0;
      if (v > subtotal) {
        setOfferValue(String(subtotal.toFixed(2)));
        showToast('Fixed discount cannot exceed subtotal. It was adjusted.', 'warning');
      }
    }

    setOfferType(value);
  };

  const handleOfferValueChange = (value) => {
    // Allow user-friendly typing: accept numbers with optional decimal (max 2 places)
    if (value === '' || value === null) {
      setOfferValue('');
      return;
    }

    // Only allow digits and optional single dot with up to 2 decimals
    const re = /^\d*(?:\.\d{0,2})?$/;
    if (!re.test(value)) {
      // ignore invalid keystrokes
      return;
    }

    // Keep raw string while typing to avoid interfering with user edits
    setOfferValue(value);

    // Basic live validation for percent (clamp to 100)
    if (offerType === 'percent') {
      const num = parseFloat(value);
      if (!isNaN(num) && num > 100) {
        setOfferValue('100');
        showToast('Percentage cannot be more than 100%', 'warning');
      }
    }
    
    // Immediate clamp for LKR: prevent entering more than subtotal
    if (offerType === 'lkr') {
      const num = parseFloat(value);
      const subtotal = calculateOverallTotal();
      if (!isNaN(num) && num > subtotal) {
        setOfferValue(String(subtotal.toFixed(2)));
        showToast('Fixed discount cannot exceed subtotal', 'warning');
      }
    }
  };

  const normalizeOfferValueBlur = () => {
    // Normalize & clamp value on blur and format for display
    if (offerValue === '' || offerValue === null) return;
    let num = parseFloat(offerValue);
    if (isNaN(num)) {
      setOfferValue('');
      return;
    }
    const subtotal = calculateOverallTotal();
    if (offerType === 'percent') {
      num = Math.max(0, Math.min(100, num));
      // show without trailing decimals if integer, otherwise up to 2 decimals
      setOfferValue(Number.isInteger(num) ? String(num) : String(+num.toFixed(2)));
    } else if (offerType === 'lkr') {
      num = Math.max(0, Math.min(subtotal, num));
      setOfferValue(String(num.toFixed(2)));
    } else {
      setOfferValue(String(num));
    }
  };

  // Ensure fixed LKR offerValue never exceeds subtotal when items/quantities change
  useEffect(() => {
    if (offerType === 'lkr') {
      const subtotal = calculateOverallTotal();
      const v = parseFloat(offerValue) || 0;
      if (v > subtotal) {
        // Adjust to new subtotal but keep formatting friendly (two decimals)
        setOfferValue(String(subtotal.toFixed(2)));
        showToast('Fixed discount adjusted to current subtotal', 'warning');
      }
    }
  }, [selectedProducts]);

  // Picker states for selecting existing products inside modal
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickedItemId, setPickedItemId] = useState('');
  const [pickedQty, setPickedQty] = useState(1);
  const [pickedPrice, setPickedPrice] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const handlePickerSearch = (e) => {
    setPickerSearch(e.target.value);
    setShowProductDropdown(true);
  };

  const handlePickChange = (item) => {
    setPickedItemId(item.id);
    setPickerSearch(item.name);
    setPickedPrice(parseFloat(item.price).toFixed(2));
    setPickedQty(1);
    setShowProductDropdown(false);
  };

  const handlePickedQtyChange = (e) => {
    const value = e.target.value;
    const qty = parseInt(value) || 0;
    
    if (!pickedItemId) {
      setPickedQty(value);
      return;
    }
    
    const selectedItem = items.find(i => String(i.id) === String(pickedItemId));
    if (!selectedItem) {
      setPickedQty(value);
      return;
    }
    
    // Check if quantity exceeds available stock
    if (qty > selectedItem.quantity) {
      showToast(`Only ${selectedItem.quantity} units available for ${selectedItem.name}`, 'warning');
      setPickedQty(selectedItem.quantity);
    } else {
      setPickedQty(value);
    }
  };

  const addPickedProductToBill = () => {
    if (!pickedItemId) {
      showToast('Please select a product to add', 'error');
      return;
    }
    const it = items.find(i => String(i.id) === String(pickedItemId));
    if (!it) {
      showToast('Selected product not found', 'error');
      return;
    }
    const qty = parseInt(pickedQty) || 1;
    if (qty <= 0) {
      showToast('Quantity must be at least 1', 'error');
      return;
    }

    const existing = selectedProducts.find(p => p.id === it.id);
    if (existing) {
      const newQty = existing.selectedQuantity + qty;
      // Only enforce available stock on customer invoices (sales)
      if (billType === 'invoice' && newQty > (it.quantity || 0)) {
        showToast(`Only ${it.quantity} units available for ${it.name}`, 'warning');
        return;
      }
      setSelectedProducts(prev => prev.map(p => p.id === existing.id ? { ...p, selectedQuantity: newQty } : p));
      showToast(`Updated quantity for ${it.name}`, 'success');
    } else {
      // If supplier purchase, we can allow adding any positive quantity (stock will increase)
      setSelectedProducts(prev => [...prev, { id: it.id, name: it.name, price: parseFloat(it.price), maxQuantity: it.quantity, selectedQuantity: qty, category: it.category }]);
      showToast(`${it.name} added to bill`, 'success');
    }

    // Clear picker fields
    setPickedItemId('');
    setPickedPrice('');
    setPickedQty(1);
    setPickerSearch('');
  };

  const clearBill = () => {
    setSelectedProducts([]);
    setCustomerName('');
    setInvoiceNumber(`INV-${Date.now()}`);
    showToast('Bill cleared', 'success');
  };

  const printBill = async () => {
    // Validate that all products have valid quantities
    const hasEmptyQuantity = selectedProducts.some(p => 
      p.selectedQuantity === '' || 
      p.selectedQuantity === null || 
      p.selectedQuantity === undefined || 
      p.selectedQuantity <= 0
    );
    
    if (hasEmptyQuantity) {
      showToast('Please fill in all quantities before proceeding', 'error');
      return;
    }
    
    
    
    try {
      const billDate = new Date().toLocaleDateString();
      const billTime = new Date().toLocaleTimeString();
      const billNumber = invoiceNumber || `INV-${Date.now()}`;
      const subtotal = calculateOverallTotal();
      const discount = calculateDiscount(subtotal);
      const totalAmount = Math.max(0, subtotal - discount);

      // Save products data before clearing for print receipt
      const productsForPrint = [...selectedProducts];
      const customerNameForPrint = customerName.trim() || 'Walk-in Customer';
      const paidByForPrint = paidBy;

      // Prepare purchase data
      const purchaseData = {
        billNumber,
        customerName: customerNameForPrint,
        totalAmount,
        paymentMethod: 'Cash',
        // send offer fields at top level so backend stores them with the purchase record
        offerType: offerType === 'none' ? null : offerType,
        offerValue: offerValue ? parseFloat(offerValue) : 0,
        offerAmount: discount,
        createdBy: paidBy || null,
        createdById: selectedUserId ? parseInt(selectedUserId) : null,
        billType: 'invoice',
        items: selectedProducts.map(product => ({
          itemId: product.isCustom ? null : product.id,
          itemName: product.name,
          itemPrice: product.price,
          quantity: product.selectedQuantity,
          totalPrice: calculateProductTotal(product)
        }))
      };

      // Save to backend
      // Create a sale (customer invoice)
      const endpoint = '/sales';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
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

      // Update local items state: decrease for invoice, increase for supplier purchase
      setItems(prevItems => 
        prevItems.map(item => {
          const changed = selectedProducts.find(p => p.id === item.id);
          if (changed) {
            return { ...item, quantity: billType === 'supplier' ? item.quantity + changed.selectedQuantity : item.quantity - changed.selectedQuantity };
          }
          return item;
        })
      );

      // Clear the bill completely
      setSelectedProducts([]);
      setCustomerName('');
      setInvoiceNumber(`INV-${Date.now()}`);
      setOfferType('none');
      setOfferValue('');
      
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
          <div>Customer: ${customerNameForPrint}</div>
          <div>Payment: Cash</div>
          ${paidByForPrint ? `<div>Created By: ${paidByForPrint}</div>` : ''}
          ${discount && discount > 0 ? `<div>Discount: $${discount.toFixed(2)}</div>` : ''}
        </div>
        
        <div class="separator">...................................</div>
        
        <div class="items-section">
          <div style="margin-bottom: 8px; font-weight: bold; font-size: 10px;">ITEMS PURCHASED</div>
          ${productsForPrint.map((product, index) => `
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading billing system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl shadow-md p-6 max-w-2xl mx-auto">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Error Loading Products</h3>
              <p className="mt-2 text-gray-700">{error}</p>
              <button
                onClick={fetchItems}
                className="mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-200"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing System</h1>
              <p className="text-gray-600 mt-2">Create invoices and manage sales</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <div className="relative group">
                  <input
                    type="text"
                    value={mainSearchTerm}
                    onChange={handleMainSearchChange}
                    placeholder="Search products by name..."
                    className="w-full px-4 py-3 pl-11 pr-10 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200"
                  />
                  <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {mainSearchTerm && (
                    <button
                      onClick={clearMainSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Invoice Button */}
              <button
                onClick={openCartModal}
                className="relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition duration-200 active:scale-95 flex items-center justify-center gap-3"
              >
                <div className="relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                  {selectedProducts.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {selectedProducts.length}
                    </span>
                  )}
                </div>
                <span className="font-semibold">View Invoice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold mt-1">{items.length}</p>
              </div>
              <div className="bg-blue-400/20 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">In Stock</p>
                <p className="text-3xl font-bold mt-1">
                  {items.filter(item => item.quantity > 0).length}
                </p>
              </div>
              <div className="bg-green-400/20 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Cart Items</p>
                <p className="text-3xl font-bold mt-1">{selectedProducts.length}</p>
              </div>
              <div className="bg-amber-400/20 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H17M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM20.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Cart Total</p>
                <p className="text-3xl font-bold mt-1">${calculateOverallTotal().toFixed(2)}</p>
              </div>
              <div className="bg-purple-400/20 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Available Products</h2>
              <p className="text-sm text-gray-600 mt-1">Click "Add to Bill" to add products to invoice</p>
            </div>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredMainProducts.length} products
            </div>
          </div>
          
          {filteredMainProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {mainSearchTerm ? `No products found matching "${mainSearchTerm}"` : 'No products available'}
              </h3>
              <p className="text-gray-600">
                {mainSearchTerm ? 'Try a different search term' : 'Add products in inventory first'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentItems.map((item) => (
                  <div key={item.id} className="group bg-white border-2 border-gray-200 hover:border-blue-300 p-1 rounded-xl hover:shadow-lg transition-all duration-200">
                    {/* Product Image */}
                    {item.image && (
                      <div className="mb-4 relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${item.image}`}
                          alt={item.name}
                          className="w-full h-40 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => openImageModal(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${item.image}`, item.name)}
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            item.quantity > 10 ? 'bg-green-500/90 text-white' : 
                            item.quantity > 0 ? 'bg-yellow-500/90 text-white' : 
                            'bg-red-500/90 text-white'
                          }`}>
                            Stock: {item.quantity}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Product Info */}
                    <div className="space-y-3 p-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-500">{item.category || 'Uncategorized'}</span>
                          <span className="text-lg font-bold text-blue-600">${parseFloat(item.price).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Add to Bill Button */}
                      <button
                        onClick={() => addProductToBill(item)}
                        disabled={item.quantity === 0}
                        className={`w-full font-medium py-2.5 px-4 rounded-lg shadow transition duration-200 flex items-center justify-center gap-2 ${
                          item.quantity === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-md active:scale-95'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {item.quantity === 0 ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          )}
                        </svg>
                        {item.quantity === 0 ? 'Out of Stock' : 'Add to Bill'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
                      <span className="font-semibold">{Math.min(endIndex, filteredMainProducts.length)}</span> of{" "}
                      <span className="font-semibold">{filteredMainProducts.length}</span> products
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition duration-200 ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <div className="flex items-center space-x-1">
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
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                                currentPage === pageNum
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                      </div>
                      
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition duration-200 ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Invoice Modal */}
        {isCartModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-100 to-green-200 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m2 0a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2m3-7h6l1 5H8l1-5z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Sales Invoice</h2>
                      <p className="text-sm text-gray-600">Create and manage customer invoices</p>
                    </div>
                  </div>
                  <button
                    onClick={closeCartModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Customer Information */}
                <div className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">Customer Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Walk-in Customer (default)"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">Invoice #</label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        readOnly
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">Bill Type</label>
                      <input
                        type="text"
                        value="Invoice (Customer)"
                        readOnly
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">Created By</label>
                      <input
                        type="text"
                        value={paidBy}
                        readOnly
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Picker */}
                <div className="mb-8 bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Quick Add Products
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2 space-y-2 relative product-search-container">
                      <label className="block text-sm font-medium text-gray-900">Search & Select Product</label>
                      <div className="relative">
                        <input
                          value={pickerSearch}
                          onChange={handlePickerSearch}
                          onFocus={() => setShowProductDropdown(true)}
                          placeholder="Type to filter products..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        
                        {/* Custom dropdown list below the input */}
                        {showProductDropdown && (
                          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                            {items
                              .filter(i => i.name.toLowerCase().includes(pickerSearch.toLowerCase()))
                              .sort((a, b) => {
                                // Sort: items with stock > 0 first, then items with 0 stock
                                if (a.quantity > 0 && b.quantity === 0) return -1;
                                if (a.quantity === 0 && b.quantity > 0) return 1;
                                return 0;
                              })
                              .map(item => (
                                <div
                                  key={item.id}
                                  onClick={() => item.quantity > 0 && handlePickChange(item)}
                                  className={`px-4 py-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                                    item.quantity === 0 
                                      ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                                      : 'hover:bg-blue-50 cursor-pointer'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        {item.quantity === 0 && (
                                          <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                                            Out of Stock
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-500">{item.category || 'Uncategorized'}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-blue-600">${parseFloat(item.price).toFixed(2)}</p>
                                      <p className={`text-xs font-medium ${item.quantity > 10 ? 'text-green-600' : item.quantity > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        Stock: {item.quantity}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {items.filter(i => i.name.toLowerCase().includes(pickerSearch.toLowerCase())).length === 0 && (
                              <div className="px-4 py-3 text-center text-gray-500">
                                No products found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">Unit Price</label>
                      <input
                        value={pickedPrice}
                        readOnly
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">Quantity</label>
                      <input
                        type="number"
                        value={pickedQty}
                        onChange={handlePickedQtyChange}
                        min="1"
                        max={pickedItemId ? items.find(i => String(i.id) === String(pickedItemId))?.quantity : undefined}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        onClick={addPickedProductToBill}
                        className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow hover:shadow-lg transition duration-200"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Product
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bill Items */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Bill Items ({selectedProducts.length})
                    </h3>
                    {selectedProducts.length > 0 && (
                      <button
                        onClick={clearBill}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2.5 px-4 rounded-xl shadow hover:shadow-lg transition duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear All Items
                      </button>
                    )}
                  </div>

                  {selectedProducts.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No items in bill</h4>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Add products using the quick add section above or from the main products grid
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Unit Price</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {selectedProducts.map((product, index) => (
                              <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="font-semibold text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500">{product.category || 'Uncategorized'}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-bold text-blue-600">${product.price.toFixed(2)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      value={product.selectedQuantity}
                                      onChange={(e) => updateProductQuantity(product.id, e.target.value)}
                                      min="0"
                                      max={product.maxQuantity}
                                      className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <div className="text-xs text-gray-500">Max: {product.maxQuantity}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-lg font-bold text-gray-900">${calculateProductTotal(product).toFixed(2)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => removeProductFromBill(product.id)}
                                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-md transition duration-200 flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Discount Section */}
                <div className="mb-8 bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-2xl border border-amber-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    Discount Options
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">Discount Type</label>
                      <select
                        value={offerType}
                        onChange={(e) => handleOfferTypeChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                      >
                        <option value="none">No Discount</option>
                        <option value="percent">Percentage (%)</option>
                        <option value="lkr">Fixed Amount ($)</option>
                      </select>
                    </div>

                    {offerType !== 'none' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          {offerType === 'percent' ? 'Discount Percentage' : 'Discount Amount'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={offerValue}
                            onChange={(e) => handleOfferValueChange(e.target.value)}
                            onBlur={normalizeOfferValueBlur}
                            placeholder={offerType === 'percent' ? 'Enter % (0-100)' : 'Enter $ amount'}
                            className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                          />
                          <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                            {offerType === 'percent' ? '%' : '$'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">Current Discount</label>
                      <div className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-lg font-bold text-amber-600">
                        ${calculateDiscount(calculateOverallTotal()).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  {offerType !== 'none' && (
                    <p className="text-sm text-gray-600 mt-3">
                      {offerType === 'percent' 
                        ? 'Percentage discount will be calculated from subtotal' 
                        : 'Fixed amount discount will be subtracted from subtotal'}
                    </p>
                  )}
                </div>

                {/* Bill Summary & Actions */}
                {selectedProducts.length > 0 && (
                  <div className="border-t pt-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="space-y-4">
                        <div className="text-2xl font-bold text-gray-900">Bill Summary</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between w-64">
                            <span className="text-gray-700">Subtotal:</span>
                            <span className="text-lg font-semibold">${calculateOverallTotal().toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between w-64">
                            <span className="text-gray-700">Discount:</span>
                            <span className="text-lg font-semibold text-red-600">-${calculateDiscount(calculateOverallTotal()).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between w-64 pt-3 border-t border-gray-300">
                            <span className="text-xl font-bold text-gray-900">Final Total:</span>
                            <span className="text-2xl font-bold text-green-600">${calculateFinalTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={clearBill}
                          className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition duration-200"
                        >
                          Clear Bill
                        </button>
                        <button
                          onClick={printBill}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-200 flex items-center justify-center gap-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          <span>Process & Print Bill</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {imageModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn" onClick={closeImageModal}>
            <div className="relative max-w-5xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeImageModal}
                className="absolute -top-3 -right-3 bg-white hover:bg-gray-100 text-black rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold shadow-2xl transition duration-200 z-10"
              >
                ×
              </button>
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-6 rounded-b-xl">
                <h3 className="text-xl font-bold">{selectedImage.alt}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 animate-slideInRight ${
            toast.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
              : toast.type === 'warning'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
          }`}>
            <div className="flex items-center">
              {toast.type === 'success' ? (
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : toast.type === 'warning' ? (
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="font-semibold">{toast.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Billing;