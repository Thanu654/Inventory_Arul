import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Tag, Plus, Search, X, Eye, Edit2, Trash2, Package, DollarSign, TrendingDown, AlertCircle } from 'lucide-react';

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
    offerTotal: 0,
    costTotal: 0
  });

  const [lastOfferSummary, setLastOfferSummary] = useState({ show: false, totalCost: 0, profit: 0 });

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
      offerTotal: 0,
      costTotal: 0
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
      costPrice: parseFloat(item.cost_price ?? item.costPrice) || 0,
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
    const costTotal = products.reduce((sum, product) => {
      const cost = parseFloat(product.costPrice ?? product.cost_price) || 0;
      const quantity = parseInt(product.quantity) || 0;
      return sum + (cost * quantity);
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

      return { ...prev, realTotal, offerTotal: derivedOfferTotal, costTotal };
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
        products: formData.selectedProducts.map(p => ({
          product_id: p.id,
          product_name: p.name,
          product_price: p.price,
          cost_price: p.costPrice ?? p.cost_price ?? 0,
          quantity: p.quantity,
          total_price: +((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)).toFixed(2),
          cost_total: +(((parseFloat(p.costPrice ?? p.cost_price) || 0) * (parseInt(p.quantity) || 0))).toFixed(2)
        })),
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
        // calculate profit and show summary on page (do not store)
        const totalCost = formData.costTotal || 0;
        const profit = +(((parseFloat(formData.offerTotal) || 0) - totalCost)).toFixed(2);
        setLastOfferSummary({ show: true, totalCost, profit });
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
        products: formData.selectedProducts.map(p => ({
          product_id: p.id,
          product_name: p.name,
          product_price: p.price,
          cost_price: p.costPrice ?? p.cost_price ?? 0,
          quantity: p.quantity,
          total_price: +((parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0)).toFixed(2),
          cost_total: +(((parseFloat(p.costPrice ?? p.cost_price) || 0) * (parseInt(p.quantity) || 0))).toFixed(2)
        })),
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
            costPrice: product.cost_price ?? product.costPrice ?? 0,
            quantity: product.quantity,
            maxQuantity: product.maxQuantity || 999
          })),
          realTotal: realTotalNum,
          offerTotal: offerTotalNum,
          costTotal: (data.products || []).reduce((sum, product) => {
            const cost = parseFloat(product.cost_price ?? product.costPrice) || 0;
            const qty = parseInt(product.quantity) || 0;
            return sum + cost * qty;
          }, 0)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Offers List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="p-6 flex flex-row items-center justify-between border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Available Offers
            </h2>
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create New Offer
            </button>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading offers...</span>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Tag className="w-10 h-10 text-purple-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Offers Yet</h3>
                <p className="text-gray-600">Create your first offer to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <div key={offer.id} className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600"></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">{offer.offer_type}</h3>
                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                          {calculateDiscountPercent(offer.real_total, offer.offer_total)}% OFF
                        </span>
                      </div>
                      
                      {offer.description && (
                        <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                      )}
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600 font-medium">Original Price:</span>
                          <span className="line-through text-gray-500 font-semibold">${(parseFloat(offer.real_total) || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                          <span className="text-sm text-gray-700 font-medium">Offer Price:</span>
                          <span className="font-bold text-green-600 text-lg">${(parseFloat(offer.offer_total) || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                          <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" />
                            You Save:
                          </span>
                          <span className="font-bold text-red-600 text-lg">${calculateSavings(offer.real_total, offer.offer_total).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => openViewModal(offer)}
                          className="px-3 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow hover:shadow-md text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => openEditModal(offer)}
                          className="px-3 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all shadow hover:shadow-md text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="px-3 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow hover:shadow-md text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Last offer summary (non-persistent) */}
        {lastOfferSummary.show && (
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Last Offer Summary (not stored)</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">Total Cost: ${(+lastOfferSummary.totalCost).toFixed(2)}</div>
              <div className="text-green-600 font-bold">Company Profit: ${(+lastOfferSummary.profit).toFixed(2)}</div>
            </div>
            <div>
              <button onClick={() => setLastOfferSummary({ show: false, totalCost: 0, profit: 0 })} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Dismiss</button>
            </div>
          </div>
        )}

        {/* Add/Edit Offer Modal */}
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-600">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  {isAddModalOpen ? <Plus className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
                  {isAddModalOpen ? 'Create New Offer' : 'Edit Offer'}
                </h3>
              </div>
              
              <form onSubmit={isAddModalOpen ? handleSubmit : handleEdit} className="p-6">
                
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
                        className="w-full px-4 py-3 pl-11 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        placeholder="Search products by name or category..."
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto border-2 border-gray-200 rounded-xl p-4 bg-gradient-to-br from-gray-50 to-white" style={{scrollbarWidth: 'thin'}}>
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
                        className="flex-shrink-0 w-52 p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all duration-200 text-left group"
                      >
                        <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{item.name}</div>
                        <div className="text-sm text-green-600 font-semibold mt-2">${(parseFloat(item.price) || 0).toFixed(2)}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Stock: {item.quantity || 0}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Products */}
                {formData.selectedProducts.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Selected Products ({formData.selectedProducts.length})
                    </label>
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-md">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost Price</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost Total</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {formData.selectedProducts.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">{product.name || product.product_name}</td>
                              <td className="px-4 py-3 text-sm font-medium text-green-600 whitespace-nowrap">${(parseFloat(product.price || product.product_price) || 0).toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  readOnly
                                  value={`$${(parseFloat(product.costPrice ?? product.cost_price) || 0).toFixed(2)}`}
                                  className="w-28 px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 font-medium text-center"
                                />
                              </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="text"
                                    value={product.quantity}
                                    onChange={(e) => updateProductQuantity(product.id, e.target.value)}
                                    className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium text-center"
                                  />
                                  <div className="text-xs text-gray-500 mt-1">Max: {product.maxQuantity}</div>
                                </td>
                                <td className="px-4 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">
                                  ${((parseFloat(product.price) || 0) * (parseInt(product.quantity) || 0)).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  ${( (parseFloat(product.costPrice ?? product.cost_price) || 0) * (parseInt(product.quantity) || 0) ).toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => removeProductFromOffer(product.id)}
                                    className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price After Offer</label>
                    <input
                      type="text"
                      value={`$${(parseFloat(formData.offerTotal) || 0).toFixed(2)}`}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost Price</label>
                    <input
                      type="text"
                      value={`$${(parseFloat(formData.costTotal) || 0).toFixed(2)}`}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      resetForm();
                      setSelectedOffer(null);
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl font-medium"
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
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-cyan-600">
                <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                  <Eye className="w-6 h-6" />
                  Offer Details
                </h3>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">Original Price</label>
                    <p className="text-2xl font-bold text-gray-900 line-through">${(parseFloat(selectedOffer.real_total) || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-center p-5 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border-2 border-green-200">
                    <label className="block text-sm font-semibold text-green-700 mb-2">Offer Price</label>
                    <p className="text-2xl font-bold text-green-600">${(parseFloat(selectedOffer.offer_total) || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-center p-5 bg-gradient-to-br from-red-50 to-orange-100 rounded-xl border-2 border-red-200">
                    <label className="block text-sm font-semibold text-red-700 mb-2 flex items-center justify-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      You Save
                    </label>
                    <p className="text-2xl font-bold text-red-600">
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
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg font-medium"
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