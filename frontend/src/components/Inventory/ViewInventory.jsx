import React, { useState, useEffect } from 'react';
import AddInventory from './AddInventory';

const ViewInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [subcatLoading, setSubcatLoading] = useState(false);
  const [subcatDeleteConfirm, setSubcatDeleteConfirm] = useState({ show: false, subcategory: null });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryDeleteConfirm, setCategoryDeleteConfirm] = useState({ show: false, category: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({ src: '', alt: '' });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

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

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchSubcategories();
    fetchSuppliers();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/subcategories`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      setSubcategories(data);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/suppliers`);
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      const data = await response.json();
      setSuppliersList(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddItem = (newItem) => {
    setItems(prevItems => [...prevItems, newItem]);
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    showToast('Item added successfully!', 'success');
  };

  const handleEditItem = (updatedItem) => {
    setItems(prevItems => 
      prevItems.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    showToast('Item updated successfully!', 'success');
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEditMode(true);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
  };

  const openViewModal = (item) => {
    setViewItem(item);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewItem(null);
  };

  const confirmDelete = (item) => {
    setDeleteConfirm({ show: true, item });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/items/${deleteConfirm.item.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      setItems(prevItems => prevItems.filter(item => item.id !== deleteConfirm.item.id));
      setDeleteConfirm({ show: false, item: null });
      showToast('Item deleted successfully!', 'success');
    } catch (err) {
      showToast('Failed to delete item: ' + err.message, 'error');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, item: null });
  };

  // Category management functions
  const openCategoryModal = () => {
    setCategoryFormData({ name: '' });
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setCategoryFormData({ name: '' });
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!categoryFormData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      setCategoryLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryFormData.name.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add category');
      }

      const result = await response.json();
      setCategories(prev => [...prev, result.category]);
      setCategoryFormData({ name: '' }); // Clear form but keep modal open
      showToast('Category added successfully!', 'success');
      // refresh subcategories in case
      fetchSubcategories();
    } catch (err) {
      showToast('Failed to add category: ' + err.message, 'error');
    } finally {
      setCategoryLoading(false);
    }
  };

  const confirmDeleteCategory = (category) => {
    setCategoryDeleteConfirm({ show: true, category });
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategoryId(prev => prev === categoryId ? null : categoryId);
  };

  const handleNewSubcategoryChange = (e) => {
    setNewSubcategoryName(e.target.value);
  };

  const handleAddSubcategory = async (categoryId, e) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) {
      showToast('Subcategory name is required', 'error');
      return;
    }
    try {
      setSubcatLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: categoryId, name: newSubcategoryName.trim() })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to add subcategory');
      }
      const result = await response.json();
      setSubcategories(prev => [...prev, result.subcategory]);
      setNewSubcategoryName('');
      showToast('Subcategory added!', 'success');
    } catch (err) {
      showToast('Failed to add subcategory: ' + err.message, 'error');
    } finally {
      setSubcatLoading(false);
    }
  };

  const confirmDeleteSubcategory = (subcat) => {
    setSubcatDeleteConfirm({ show: true, subcategory: subcat });
  };

  const handleDeleteSubcategory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/subcategories/${subcatDeleteConfirm.subcategory.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete subcategory');
      setSubcategories(prev => prev.filter(s => s.id !== subcatDeleteConfirm.subcategory.id));
      setSubcatDeleteConfirm({ show: false, subcategory: null });
      showToast('Subcategory deleted', 'success');
    } catch (err) {
      showToast('Failed to delete subcategory: ' + err.message, 'error');
    }
  };

  const cancelDeleteSubcategory = () => {
    setSubcatDeleteConfirm({ show: false, subcategory: null });
  };

  const handleDeleteCategory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categories/${categoryDeleteConfirm.category.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryDeleteConfirm.category.id));
      setCategoryDeleteConfirm({ show: false, category: null });
      showToast('Category deleted successfully!', 'success');
    } catch (err) {
      showToast('Failed to delete category: ' + err.message, 'error');
    }
  };

  const cancelDeleteCategory = () => {
    setCategoryDeleteConfirm({ show: false, category: null });
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

  // Search functionality
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryFilterChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    // Delay hiding to allow click on search results
    setTimeout(() => setIsSearchFocused(false), 200);
  };

  const handleItemClick = (item) => {
    setSearchTerm(item.name);
    setIsSearchFocused(false);
    // Scroll to the item in the table
    const itemRow = document.getElementById(`item-row-${item.id}`);
    if (itemRow) {
      itemRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      itemRow.classList.add('bg-blue-50');
      setTimeout(() => itemRow.classList.remove('bg-blue-50'), 2000);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchFocused(false);
    setCurrentPage(1); // Reset to first page when clearing search
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Error Loading Inventory</h3>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600 mt-2">Track and manage your inventory items</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Component */}
              <div className="relative">
                <div className="relative group">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    placeholder="Search items by name..."
                    className="w-full sm:w-64 px-4 py-2.5 pl-11 pr-10 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200"
                  />
                  <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Search Results Dropdown */}
                {isSearchFocused && searchTerm && filteredItems.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-2 max-h-64 overflow-y-auto z-20">
                    {filteredItems.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">{item.category || 'Uncategorized'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">${parseFloat(item.price).toFixed(2)}</div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              item.quantity > 10 ? 'bg-green-100 text-green-800' : 
                              item.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredItems.length > 10 && (
                      <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-b-xl">
                        {filteredItems.length - 10} more items...
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Category Filter Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryFilterChange}
                  className="w-full sm:w-56 px-4 py-2.5 pl-11 pr-4 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200 appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={openCategoryModal}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg transition duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Categories
                </button>
                <button
                  onClick={openAddModal}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg transition duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Your inventory is empty</h3>
              <p className="text-gray-600 mb-8">Start by adding your first inventory item to get started with tracking.</p>
              <button
                onClick={openAddModal}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-8 rounded-xl shadow-lg transition duration-200 hover:shadow-xl"
              >
                Add Your First Item
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Items</p>
                    <p className="text-3xl font-bold mt-1">{items.length}</p>
                  </div>
                  <div className="bg-blue-400/20 p-3 rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">In Stock</p>
                    <p className="text-3xl font-bold mt-1">
                      {items.filter(item => item.quantity > 0).length}
                    </p>
                  </div>
                  <div className="bg-emerald-400/20 p-3 rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Low Stock</p>
                    <p className="text-3xl font-bold mt-1">
                      {items.filter(item => item.quantity > 0 && item.quantity <= (item.min_stock ?? 10)).length}
                    </p>
                  </div>
                  <div className="bg-amber-400/20 p-3 rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Out of Stock</p>
                    <p className="text-3xl font-bold mt-1">
                      {items.filter(item => item.quantity === 0).length}
                    </p>
                  </div>
                  <div className="bg-red-400/20 p-3 rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Min Stock
                              </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {(() => {
                      const displayItems = filteredItems;
                      const totalPages = Math.ceil(displayItems.length / itemsPerPage);
                      const currentItems = displayItems.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      );
                      
                      if (currentItems.length === 0) {
                        return (
                          <tr>
                            <td colSpan="8" className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Items Found</h3>
                                <p className="text-gray-500">
                                  {searchTerm || selectedCategory 
                                    ? 'Try adjusting your search or filter criteria' 
                                    : 'Start by adding your first inventory item'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      
                      return currentItems.map((item) => (
                        <tr key={item.id} id={`item-row-${item.id}`} className="hover:bg-gray-50 transition-all duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              #{item.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.image ? (
<img
                            src={
                              item.image?.startsWith("http")
                                ? item.image
                                : `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${item.image}`
                            }
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              openImageModal(
                                item.image?.startsWith("http")
                                  ? item.image
                                  : `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}${item.image}`,
                                item.name
                              )
                            }
                          />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              item.quantity > (item.min_stock ?? 10) ? 'bg-green-100 text-green-800' : 
                              item.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.quantity} units
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {item.min_stock ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">${parseFloat(item.price).toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openViewModal(item)}
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition duration-200"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                              </button>
                              <button
                                onClick={() => openEditModal(item)}
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-medium rounded-lg shadow-sm transition duration-200"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => confirmDelete(item)}
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition duration-200"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination Controls */}
            {(() => {
              const displayItems = filteredItems;
              const totalPages = Math.ceil(displayItems.length / itemsPerPage);
              
              if (totalPages <= 1) return null;
              
              return (
                <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-2xl shadow-lg">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg ${
                        currentPage === 1
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg ${
                        currentPage === totalPages
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-semibold">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold">
                          {Math.min(currentPage * itemsPerPage, displayItems.length)}
                        </span>{' '}
                        of{' '}
                        <span className="font-semibold">{displayItems.length}</span> items
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 text-sm font-medium ${
                            currentPage === 1
                              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                              : 'text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            } ${page === 1 ? 'rounded-l-lg' : ''} ${page === totalPages ? 'rounded-r-lg' : ''}`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 text-sm font-medium ${
                            currentPage === totalPages
                              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                              : 'text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* Modals - All modals styled with consistent design */}

        {/* Item Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Inventory Item' : 'Add New Item'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <AddInventory 
                  onAdd={isEditMode ? handleEditItem : handleAddItem} 
                  onCancel={closeModal}
                  isEditMode={isEditMode}
                  initialData={editingItem}
                  categories={categories}
                  subcategories={subcategories}
                />
              </div>
            </div>
          </div>
        )}

        {/* Category Management Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Manage Categories & Subcategories</h2>
                  <button
                    onClick={closeCategoryModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Add Category Form */}
                <div className="mb-8 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Category
                  </h3>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <label htmlFor="categoryName" className="block text-sm font-semibold text-gray-900 mb-2">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        id="categoryName"
                        name="name"
                        value={categoryFormData.name}
                        onChange={handleCategoryChange}
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
                        placeholder="e.g., Electronics, Clothing, Furniture"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={categoryLoading}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {categoryLoading ? 'Adding...' : 'Add Category'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Categories Table */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Existing Categories ({categories.length})
                  </h3>
                  {categories.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <p className="text-gray-500">No categories yet. Add your first category above.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div key={category.id} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition duration-200">
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-emerald-100 p-2 rounded-lg">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                <p className="text-sm text-gray-500">ID: {category.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleCategoryExpand(category.id)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition duration-200 flex items-center gap-2"
                              >
                                <svg className={`w-4 h-4 transition-transform ${expandedCategoryId === category.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                                Subcategories
                              </button>
                              <button
                                onClick={() => confirmDeleteCategory(category)}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow transition duration-200 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>

                          {expandedCategoryId === category.id && (
                            <div className="border-t border-gray-200 bg-gray-50 p-5">
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    Subcategories for "{category.name}"
                                  </h5>
                                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                                    {subcategories.filter(s => s.category_id === category.id).length} subcategories
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {subcategories.filter(s => s.category_id === category.id).length === 0 ? (
                                    <div className="text-center py-4 text-gray-500 bg-white rounded-lg">
                                      No subcategories yet. Add one below.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                      {subcategories.filter(s => s.category_id === category.id).map(sc => (
                                        <div key={sc.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                                          <span className="font-medium text-gray-800">{sc.name}</span>
                                          <button onClick={() => confirmDeleteSubcategory(sc)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <form onSubmit={(e) => handleAddSubcategory(category.id, e)} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={newSubcategoryName}
                                  onChange={handleNewSubcategoryChange}
                                  placeholder="New subcategory name"
                                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="submit"
                                  disabled={subcatLoading}
                                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow transition duration-200 disabled:opacity-50"
                                >
                                  {subcatLoading ? 'Adding...' : 'Add'}
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modals */}
        {categoryDeleteConfirm.show && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
              <div className="p-6">
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0 bg-red-100 p-3 rounded-xl mr-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Category</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Are you sure you want to delete the category <strong>"{categoryDeleteConfirm.category?.name}"</strong>? This action cannot be undone and will remove all associated subcategories.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDeleteCategory}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCategory}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-200"
                  >
                    Delete Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {subcatDeleteConfirm.show && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
              <div className="p-6">
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0 bg-red-100 p-3 rounded-xl mr-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Subcategory</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Are you sure you want to delete the subcategory <strong>"{subcatDeleteConfirm.subcategory?.name}"</strong>? This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDeleteSubcategory}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteSubcategory}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-200"
                  >
                    Delete Subcategory
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
              <div className="p-6">
                <div className="flex items-start mb-6">
                  <div className="flex-shrink-0 bg-red-100 p-3 rounded-xl mr-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Item</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Are you sure you want to delete <strong>"{deleteConfirm.item?.name}"</strong>? This action cannot be undone and will permanently remove this item from your inventory.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition duration-200"
                  >
                    Delete Item
                  </button>
                </div>
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

        {/* View Item Modal */}
        {isViewModalOpen && viewItem && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Item Details
                  </h2>
                  <button
                    onClick={closeViewModal}
                    className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Item Image */}
                <div className="flex justify-center">
                  {viewItem.image ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${viewItem.image}`}
                      alt={viewItem.name}
                      className="w-64 h-64 object-cover rounded-2xl border-4 border-gray-200 shadow-lg cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => openImageModal(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${viewItem.image}`, viewItem.name)}
                    />
                  ) : (
                    <div className="w-64 h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-4 border-gray-200 flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Item Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Item ID</label>
                    <p className="mt-1 text-lg font-bold text-gray-900">#{viewItem.id}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Item Name</label>
                    <p className="mt-1 text-lg font-bold text-gray-900">{viewItem.name}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Category</label>
                    <p className="mt-1 text-lg font-semibold text-blue-600">{viewItem.category || 'Uncategorized'}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Subcategory</label>
                    <p className="mt-1 text-lg font-semibold text-purple-600">
                      {subcategories.find(sc => sc.id === viewItem.subcategory_id)?.name || 'None'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Quantity</label>
                    <p className={`mt-1 text-lg font-bold ${
                      viewItem.quantity > (viewItem.min_stock ?? 10) ? 'text-green-600' : 
                      viewItem.quantity > 0 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {viewItem.quantity} units
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Min Stock</label>
                    <p className="mt-1 text-lg font-bold text-gray-900">{viewItem.min_stock ?? 0} units</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Selling Price</label>
                    <p className="mt-1 text-lg font-bold text-green-600">${parseFloat(viewItem.price).toFixed(2)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Cost Price</label>
                    <p className="mt-1 text-lg font-bold text-orange-600">
                      {viewItem.cost_price ? `$${parseFloat(viewItem.cost_price).toFixed(2)}` : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Value</label>
                    <p className="mt-1 text-lg font-bold text-indigo-600">
                      ${(parseFloat(viewItem.price) * viewItem.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {viewItem.description && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Description</label>
                    <p className="mt-2 text-gray-700 leading-relaxed">{viewItem.description}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <label className="text-sm font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Created At
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {viewItem.created_at ? new Date(viewItem.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <label className="text-sm font-semibold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Last Updated
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {viewItem.updated_at ? new Date(viewItem.updated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={closeViewModal}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeViewModal();
                    openEditModal(viewItem);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg shadow-sm transition-all"
                >
                  Edit Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 animate-slideInRight ${
            toast.type === 'success' 
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
          }`}>
            <div className="flex items-center">
              {toast.type === 'success' ? (
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

export default ViewInventory;