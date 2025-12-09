import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [items, setItems] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    offerType: '',
    offerValue: '',
    description: '',
    selectedProducts: [],
    realTotal: 0,
    offerTotal: 0
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchOffers();
    fetchItems();
  }, []);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/api/offers`);
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      } else {
        toast.error('Failed to fetch offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Error fetching offers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/items`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      offerType: '',
      offerValue: '',
      description: '',
      selectedProducts: [],
      realTotal: 0,
      offerTotal: 0
    });
    setSearchTerm('');
  };

  const addProductToOffer = (item) => {
    const existingProduct = formData.selectedProducts.find(p => p.id === item.id);
    if (existingProduct) {
      toast.warning('Product already added to offer');
      return;
    }

    const newProduct = {
      id: item.id,
      name: item.name,
      price: parseFloat(item.price) || 0,
      quantity: 1,
      maxQuantity: parseInt(item.quantity) || 0
    };

    setFormData(prev => ({
      ...prev,
      selectedProducts: [...prev.selectedProducts, newProduct]
    }));

    calculateTotals([...formData.selectedProducts, newProduct], formData.offerTotal);
  };

  const updateProductQuantity = (productId, quantity) => {
    const numQuantity = parseInt(quantity) || 0;
    
    const updatedProducts = formData.selectedProducts.map(p => {
      if (p.id === productId) {
        const maxAllowed = p.maxQuantity;
        const validQuantity = Math.max(0, Math.min(numQuantity, maxAllowed));
        
        if (numQuantity > maxAllowed) {
          toast.warning(`Only ${maxAllowed} units available for ${p.name}`);
        }
        
        return { ...p, quantity: validQuantity };
      }
      return p;
    });

    setFormData(prev => ({ ...prev, selectedProducts: updatedProducts }));
    calculateTotals(updatedProducts, formData.offerTotal);
  };

  const removeProductFromOffer = (productId) => {
    const updatedProducts = formData.selectedProducts.filter(p => p.id !== productId);
    setFormData(prev => ({ ...prev, selectedProducts: updatedProducts }));
    calculateTotals(updatedProducts, formData.offerTotal);
  };

  const calculateTotals = (products, offerTotal) => {
    const realTotal = products.reduce((sum, product) => {
      const price = parseFloat(product.price) || 0;
      const quantity = parseInt(product.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    setFormData(prev => {
      let derivedOfferTotal = offerTotal || prev.offerTotal;

      if (prev.offerType === 'percentage' && prev.offerValue !== '' && prev.offerValue !== null) {
        const pct = Math.max(0, Math.min(100, parseFloat(prev.offerValue) || 0));
        derivedOfferTotal = +(realTotal * (1 - pct / 100)).toFixed(2);
      } else if (prev.offerType === 'fixed' && prev.offerValue !== '' && prev.offerValue !== null) {
        const discount = Math.max(0, parseFloat(prev.offerValue) || 0);
        const appliedDiscount = Math.min(discount, realTotal);
        derivedOfferTotal = +(realTotal - appliedDiscount).toFixed(2);
      }

      return { ...prev, realTotal, offerTotal: derivedOfferTotal };
    });
  };

  const handleOfferValueChange = (value) => {
    const num = parseFloat(value);
    const offerValue = isNaN(num) ? '' : num;

    // compute offerTotal based on offerType
    let offerTotal = formData.realTotal;

    if (formData.offerType === 'percentage') {
      const pct = isNaN(offerValue) ? 0 : Math.max(0, Math.min(100, offerValue));
      offerTotal = +(formData.realTotal * (1 - pct / 100)).toFixed(2);
    } else if (formData.offerType === 'fixed') {
      const discount = isNaN(offerValue) ? 0 : Math.max(0, offerValue);
      // ensure discount does not exceed real total
      if (discount > formData.realTotal) {
        toast.error('Offer discount cannot exceed total sale value');
      }
      const appliedDiscount = Math.min(discount, formData.realTotal);
      offerTotal = +(formData.realTotal - appliedDiscount).toFixed(2);
    }

    setFormData(prev => ({ ...prev, offerValue, offerTotal }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.offerType.trim()) {
      toast.error('Please enter offer type');
      return;
    }

    if (formData.selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    if (formData.offerTotal <= 0) {
      toast.error('Please enter a valid offer total');
      return;
    }

    try {
      const offerData = {
        offerType: formData.offerType,
        description: formData.description,
        products: formData.selectedProducts,
        realTotal: formData.realTotal,
        offerTotal: formData.offerTotal
      };

      const response = await fetch(`${apiUrl}/api/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });

      if (response.ok) {
        toast.success('Offer created successfully!');
        setIsAddModalOpen(false);
        resetForm();
        fetchOffers();
      } else {
        toast.error('Failed to create offer');
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('Error creating offer');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    try {
      const offerData = {
        offerType: formData.offerType,
        description: formData.description,
        products: formData.selectedProducts,
        realTotal: formData.realTotal,
        offerTotal: formData.offerTotal
      };

      const response = await fetch(`${apiUrl}/api/offers/${selectedOffer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData)
      });

      if (response.ok) {
        toast.success('Offer updated successfully!');
        setIsEditModalOpen(false);
        resetForm();
        setSelectedOffer(null);
        fetchOffers();
      } else {
        toast.error('Failed to update offer');
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      toast.error('Error updating offer');
    }
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/offers/${offerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Offer deleted successfully!');
        fetchOffers();
      } else {
        toast.error('Failed to delete offer');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error('Error deleting offer');
    }
  };

  const openEditModal = async (offer) => {
    try {
      const response = await fetch(`${apiUrl}/api/offers/${offer.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOffer(data);
        // derive offerValue and normalized offerType when editing
        const realTotalNum = parseFloat(data.real_total) || 0;
        const offerTotalNum = parseFloat(data.offer_total) || 0;
        const discountAmount = Math.max(0, realTotalNum - offerTotalNum);
        let derivedType = 'fixed';
        let derivedValue = discountAmount;

        if (data.offer_type && typeof data.offer_type === 'string') {
          const t = data.offer_type.toLowerCase();
          if (t.includes('%') || t.includes('percent')) {
            derivedType = 'percentage';
            derivedValue = realTotalNum === 0 ? 0 : +((discountAmount / realTotalNum) * 100).toFixed(2);
          }
        }

        setFormData({
          offerType: derivedType,
          offerValue: derivedValue,
          description: data.description || '',
          selectedProducts: (data.products || []).map(product => ({
            id: product.product_id || product.id,
            name: product.product_name || product.name,
            price: product.product_price || product.price,
            quantity: product.quantity,
            maxQuantity: product.maxQuantity || 999
          })),
          realTotal: realTotalNum,
          offerTotal: offerTotalNum
        });
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching offer details:', error);
      toast.error('Error loading offer details');
    }
  };

  const openViewModal = async (offer) => {
    try {
      const response = await fetch(`${apiUrl}/api/offers/${offer.id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOffer(data);
        setIsViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching offer details:', error);
      toast.error('Error loading offer details');
    }
  };

  const calculateSavings = (realTotal, offerTotal) => {
    const real = parseFloat(realTotal) || 0;
    const offer = parseFloat(offerTotal) || 0;
    return real - offer;
  };

  const calculateDiscountPercent = (realTotal, offerTotal) => {
    const real = parseFloat(realTotal) || 0;
    const offer = parseFloat(offerTotal) || 0;
    if (real === 0) return 0;
    return ((real - offer) / real * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Offers Management</h1>
            <p className="text-gray-600 mt-1">Create and manage special offers and discounts</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create New Offer
          </button>
        </div>

        {/* Offers List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Available Offers</h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading offers...</span>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <path d="M20 12c0-1.1-.9-2-2-2V7c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Offers Yet</h3>
                <p className="text-gray-600">Create your first offer to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{offer.offer_type}</h3>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {calculateDiscountPercent(offer.real_total, offer.offer_total)}% OFF
                        </span>
                      </div>
                      
                      {offer.description && (
                        <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Original Price:</span>
                          <span className="line-through text-gray-500">${(parseFloat(offer.real_total) || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Offer Price:</span>
                          <span className="font-semibold text-green-600">${(parseFloat(offer.offer_total) || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">You Save:</span>
                          <span className="font-semibold text-red-600">${calculateSavings(offer.real_total, offer.offer_total).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between space-x-2">
                        <button
                          onClick={() => openViewModal(offer)}
                          className="flex-1 px-3 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openEditModal(offer)}
                          className="flex-1 px-3 py-2 text-green-600 border border-green-600 rounded-md hover:bg-green-50 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="flex-1 px-3 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Offer Modal */}
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {isAddModalOpen ? 'Create New Offer' : 'Edit Offer'}
                </h3>
              </div>
              
              <form onSubmit={isAddModalOpen ? handleSubmit : handleEdit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Offer Type *
                    </label>
                    <select
                      value={formData.offerType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        // derive new offerTotal using current offerValue and newType
                        let derivedOfferTotal = formData.realTotal;
                        const v = parseFloat(formData.offerValue) || 0;
                        if (newType === 'percentage') {
                          const pct = Math.max(0, Math.min(100, v));
                          derivedOfferTotal = +(formData.realTotal * (1 - pct / 100)).toFixed(2);
                        } else if (newType === 'fixed') {
                          const appliedDiscount = Math.min(Math.max(0, v), formData.realTotal);
                          derivedOfferTotal = +(formData.realTotal - appliedDiscount).toFixed(2);
                        }
                        setFormData(prev => ({ ...prev, offerType: newType, offerTotal: derivedOfferTotal }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={formData.selectedProducts.length === 0}
                      required
                    >
                      <option value="">Select offer type</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed (LKR)</option>
                    </select>
                    {formData.selectedProducts.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Select at least one product to choose type</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Optional description"
                    />
                  </div>
                </div>

                {/* Product Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Add Products to Offer
                  </label>
                  
                  {/* Search Input */}
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search products by name or category..."
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                          <circle cx="11" cy="11" r="8" />
                          <path d="M21 21l-4.35-4.35" />
                        </svg>
                      </div>
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 hover:text-gray-600">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto border border-gray-200 rounded-lg p-4" style={{scrollbarWidth: 'thin'}}>
                    {items
                      .filter(item => {
                        if (!searchTerm) return true;
                        const search = searchTerm.toLowerCase();
                        return item.name.toLowerCase().includes(search) || 
                               (item.category && item.category.toLowerCase().includes(search));
                      })
                      .map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addProductToOffer(item)}
                        className="flex-shrink-0 w-48 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                      >
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-600">${(parseFloat(item.price) || 0).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">Stock: {item.quantity || 0}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Products */}
                {formData.selectedProducts.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Selected Products
                    </label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {formData.selectedProducts.map(product => (
                            <tr key={product.id}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name || product.product_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">${(parseFloat(product.price || product.product_price) || 0).toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={product.quantity}
                                  onChange={(e) => updateProductQuantity(product.id, e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="text-xs text-gray-500">Max: {product.maxQuantity}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ${((parseFloat(product.price) || 0) * (parseInt(product.quantity) || 0)).toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => removeProductFromOffer(product.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
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

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Real Total
                    </label>
                    <input
                      type="text"
                      value={`$${(parseFloat(formData.realTotal) || 0).toFixed(2)}`}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Offer Value *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.offerValue}
                      onChange={(e) => handleOfferValueChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={formData.offerType === 'percentage' ? 'Enter percentage (e.g., 20 for 20%)' : 'Enter discount amount (LKR)'}
                      disabled={!formData.offerType || formData.selectedProducts.length === 0}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Tip: use % type to apply percentage discount, or LKR for fixed amount.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      You Save
                    </label>
                    <input
                      type="text"
                      value={`$${Math.max(0, (parseFloat(formData.realTotal) || 0) - (parseFloat(formData.offerTotal) || 0)).toFixed(2)}`}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      resetForm();
                      setSelectedOffer(null);
                    }}
                    className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {isAddModalOpen ? 'Create Offer' : 'Update Offer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Offer Modal */}
        {isViewModalOpen && selectedOffer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Offer Details</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Type</label>
                    <p className="text-lg font-semibold text-gray-900">{selectedOffer.offer_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                    <p className="text-lg font-semibold text-green-600">
                      {calculateDiscountPercent(selectedOffer.real_total, selectedOffer.offer_total)}% OFF
                    </p>
                  </div>
                </div>

                {selectedOffer.description && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{selectedOffer.description}</p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Products Included</label>
                  {selectedOffer.products && selectedOffer.products.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedOffer.products.map(product => (
                            <tr key={product.id}>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">{product.product_name || product.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">${(parseFloat(product.product_price || product.price) || 0).toFixed(2)}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{product.quantity}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                ${((parseFloat(product.product_price || product.price) || 0) * (parseInt(product.quantity) || 0)).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No products found</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                    <p className="text-xl font-bold text-gray-900 line-through">${(parseFloat(selectedOffer.real_total) || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price</label>
                    <p className="text-xl font-bold text-green-600">${(parseFloat(selectedOffer.offer_total) || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-1">You Save</label>
                    <p className="text-xl font-bold text-red-600">
                      ${calculateSavings(selectedOffer.real_total, selectedOffer.offer_total).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setSelectedOffer(null);
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;