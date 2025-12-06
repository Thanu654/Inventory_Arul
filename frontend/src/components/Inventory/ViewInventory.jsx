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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryDeleteConfirm, setCategoryDeleteConfirm] = useState({ show: false, category: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUpdateQuantityModalOpen, setIsUpdateQuantityModalOpen] = useState(false);
  const [updateQuantityData, setUpdateQuantityData] = useState({ itemId: '', additionalQuantity: '' });
  const [updateQuantityLoading, setUpdateQuantityLoading] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
  }, []);

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
    } catch (err) {
      showToast('Failed to add category: ' + err.message, 'error');
    } finally {
      setCategoryLoading(false);
    }
  };

  const confirmDeleteCategory = (category) => {
    setCategoryDeleteConfirm({ show: true, category });
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
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
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
      itemRow.classList.add('bg-blue-100');
      setTimeout(() => itemRow.classList.remove('bg-blue-100'), 2000);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchFocused(false);
    setCurrentPage(1); // Reset to first page when clearing search
  };

  // Update quantity functionality
  const openUpdateQuantityModal = () => {
    setUpdateQuantityData({ itemId: '', additionalQuantity: '' });
    setItemSearchTerm('');
    setIsItemDropdownOpen(false);
    setIsUpdateQuantityModalOpen(true);
  };

  const closeUpdateQuantityModal = () => {
    setIsUpdateQuantityModalOpen(false);
    setUpdateQuantityData({ itemId: '', additionalQuantity: '' });
    setItemSearchTerm('');
    setIsItemDropdownOpen(false);
  };

  const clearUpdateQuantityForm = () => {
    setUpdateQuantityData({ itemId: '', additionalQuantity: '' });
    setItemSearchTerm('');
    setIsItemDropdownOpen(false);
  };

  const handleItemSearchChange = (e) => {
    const value = e.target.value;
    setItemSearchTerm(value);
    setIsItemDropdownOpen(true);
    // Clear selected item if search doesn't match
    if (updateQuantityData.itemId) {
      const selectedItem = items.find(item => item.id == updateQuantityData.itemId);
      if (selectedItem && !selectedItem.name.toLowerCase().includes(value.toLowerCase())) {
        setUpdateQuantityData(prev => ({ ...prev, itemId: '' }));
      }
    }
  };

  const handleItemSelect = (item) => {
    setUpdateQuantityData(prev => ({ ...prev, itemId: item.id }));
    setItemSearchTerm(item.name);
    setIsItemDropdownOpen(false);
  };

  const handleItemSearchFocus = () => {
    setIsItemDropdownOpen(true);
  };

  const handleItemSearchBlur = () => {
    // Delay hiding to allow click on dropdown items
    setTimeout(() => setIsItemDropdownOpen(false), 200);
  };

  const filteredItemsForUpdate = items.filter(item =>
    item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
  );

  const handleUpdateQuantityChange = (e) => {
    const { name, value } = e.target;
    setUpdateQuantityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateQuantity = async (e) => {
    e.preventDefault();
    
    if (!updateQuantityData.itemId || !updateQuantityData.additionalQuantity) {
      showToast('Please select an item and enter quantity to add', 'error');
      return;
    }

    const additionalQty = parseInt(updateQuantityData.additionalQuantity);
    if (isNaN(additionalQty) || additionalQty <= 0) {
      showToast('Please enter a valid positive number', 'error');
      return;
    }

    try {
      setUpdateQuantityLoading(true);
      
      const selectedItem = items.find(item => item.id == updateQuantityData.itemId);
      const newQuantity = selectedItem.quantity + additionalQty;
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/items/${updateQuantityData.itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedItem,
          quantity: newQuantity
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quantity');
      }

      const result = await response.json();
      setItems(prevItems => 
        prevItems.map(item => 
          item.id == updateQuantityData.itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      clearUpdateQuantityForm(); // Clear form but keep modal open
      showToast(`Quantity updated! Added ${additionalQty} units. New total: ${newQuantity}`, 'success');
    } catch (err) {
      showToast('Failed to update quantity: ' + err.message, 'error');
    } finally {
      setUpdateQuantityLoading(false);
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
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center space-x-4">
          {/* Search Component */}
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder="Search inventory..."
                className="w-64 px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {isSearchFocused && searchTerm && filteredItems.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto z-10">
                {filteredItems.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category || 'Uncategorized'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">${parseFloat(item.price).toFixed(2)}</div>
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
                  <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                    {filteredItems.length - 10} more items...
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={openCategoryModal}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              📂 Manage Categories
            </button>
            <button
              onClick={openUpdateQuantityModal}
              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              📦 Update Quantity
            </button>
            <button
              onClick={openAddModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              + Add New Item
            </button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">No items found in inventory.</p>
          <button
            onClick={openAddModal}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const displayItems = searchTerm ? filteredItems : items;
                    const totalPages = Math.ceil(displayItems.length / itemsPerPage);
                    const currentItems = displayItems.slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    );
                    
                    return currentItems.map((item) => (
                      <tr key={item.id} id={`item-row-${item.id}`} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.image ? (
                            <img
                              src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${item.image}`}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${item.image}`, item.name)}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.quantity > 10 ? 'bg-green-100 text-green-800' : 
                            item.quantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${parseFloat(item.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.category || 'Uncategorized'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md transition duration-200 inline-flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(item)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition duration-200 inline-flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
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
            const displayItems = searchTerm ? filteredItems : items;
            const totalPages = Math.ceil(displayItems.length / itemsPerPage);
            
            if (totalPages <= 1) return null;
            
            return (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
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
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
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
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, displayItems.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{displayItems.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-500 bg-white hover:bg-gray-50'
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
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-500 bg-white hover:bg-gray-50'
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <AddInventory 
                onAdd={isEditMode ? handleEditItem : handleAddItem} 
                onCancel={closeModal}
                isEditMode={isEditMode}
                initialData={editingItem}
                categories={categories}
              />
            </div>
          </div>
        </div>
      )}

      {/* Update Quantity Modal */}
      {isUpdateQuantityModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Update Inventory Quantity</h2>
              <button
                onClick={closeUpdateQuantityModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateQuantity} className="space-y-4">
                <div className="relative">
                  <label htmlFor="itemSearch" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Item *
                  </label>
                  <input
                    type="text"
                    id="itemSearch"
                    value={itemSearchTerm}
                    onChange={handleItemSearchChange}
                    onFocus={handleItemSearchFocus}
                    onBlur={handleItemSearchBlur}
                    placeholder="Type to search items..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  
                  {/* Dropdown for item selection */}
                  {isItemDropdownOpen && filteredItemsForUpdate.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                      {filteredItemsForUpdate.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.category || 'Uncategorized'}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">Current: {item.quantity}</div>
                              <div className="text-xs text-gray-500">${parseFloat(item.price).toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {updateQuantityData.itemId && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="text-sm text-blue-700">
                      <strong>Current Quantity:</strong> {items.find(item => item.id == updateQuantityData.itemId)?.quantity || 0}
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="additionalQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity to Add *
                  </label>
                  <input
                    type="number"
                    id="additionalQuantity"
                    name="additionalQuantity"
                    value={updateQuantityData.additionalQuantity}
                    onChange={handleUpdateQuantityChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quantity to add"
                    required
                  />
                </div>
                
                {updateQuantityData.itemId && updateQuantityData.additionalQuantity && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <div className="text-sm text-green-700">
                      <strong>New Total Quantity:</strong> {(items.find(item => item.id == updateQuantityData.itemId)?.quantity || 0) + parseInt(updateQuantityData.additionalQuantity || 0)}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeUpdateQuantityModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateQuantityLoading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                  >
                    {updateQuantityLoading ? 'Updating...' : 'Update Quantity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Manage Categories</h2>
              <button
                onClick={closeCategoryModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Add Category Form */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={categoryLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {categoryLoading ? 'Adding...' : 'Add Category'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories Table */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Existing Categories</h3>
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No categories available. Add your first category above.
                  </div>
                ) : (
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                          <tr key={category.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {category.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {category.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => confirmDeleteCategory(category)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition duration-200 inline-flex items-center"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Delete Confirmation Modal */}
      {categoryDeleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to delete the category "{categoryDeleteConfirm.category?.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDeleteCategory}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to delete "{deleteConfirm.item?.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
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

export default ViewInventory;
