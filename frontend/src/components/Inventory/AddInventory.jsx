import React, { useState, useEffect } from 'react';

const AddInventory = ({ onAdd, onCancel, isEditMode = false, initialData = null, categories = [], subcategories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
        quantity: '', // Make quantity optional
    costPrice: '',
    sellingPrice: '',
    subcategoryId: '',
    category: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form data when in edit mode
  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        quantity: initialData.quantity?.toString() || '',
        costPrice: (initialData.cost_price ?? initialData.costPrice ?? '')?.toString() || '',
        sellingPrice: (initialData.price ?? initialData.sellingPrice ?? '')?.toString() || '',
        subcategoryId: initialData.subcategory_id ? String(initialData.subcategory_id) : (initialData.subcategoryId ? String(initialData.subcategoryId) : ''),
        category: initialData.category || ''
      });
      
      // Set existing image preview if available
      if (initialData.image) {
        setImagePreview(`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${initialData.image}`);
      }
    }
  }, [isEditMode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear any previous errors
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
        // Validation: require name and selling price; quantity is optional (defaults to 0)
        if (!formData.name.trim() || !formData.sellingPrice) {
          setError('Name and selling price are required fields');
          return;
        }
        if (parseFloat(formData.sellingPrice) < 0 || (formData.costPrice !== '' && parseFloat(formData.costPrice) < 0)) {
          setError('Prices must be positive numbers');
          return;
        }
        if (formData.quantity !== '' && formData.quantity !== null && formData.quantity !== undefined && parseInt(formData.quantity) < 0) {
          setError('Quantity must be a positive number');
          return;
        }

    try {
      setLoading(true);
      
      const url = isEditMode 
        ? `${import.meta.env.VITE_API_BASE_URL}/items/${initialData.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/items`;
        
      const method = isEditMode ? 'PUT' : 'POST';
      
      // Create FormData to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('quantity', parseInt(formData.quantity));
            // Only append quantity if user provided it; otherwise backend will default to 0
            if (formData.quantity !== '' && formData.quantity !== null && formData.quantity !== undefined) {
              formDataToSend.append('quantity', parseInt(formData.quantity));
            }
      // Append selling price (keeps existing backend `price` field)
      formDataToSend.append('price', parseFloat(formData.sellingPrice));
      // Append cost price (backend may ignore if not supported yet)
      if (formData.costPrice !== '') {
        formDataToSend.append('cost_price', parseFloat(formData.costPrice));
      }
      formDataToSend.append('category', formData.category.trim() || '');
      if (formData.subcategoryId) {
        formDataToSend.append('subcategory_id', parseInt(formData.subcategoryId));
      }
      
      // Add image if selected
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      }
      
      const response = await fetch(url, {
        method: method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'add'} item`);
      }

      const result = await response.json();
      onAdd(result.item);
      
      // Reset form if adding new item
      if (!isEditMode) {
        setFormData({
          name: '',
          description: '',
          quantity: '',
          costPrice: '',
          sellingPrice: '',
          category: ''
        });
      }
      
    } catch (err) {
      setError(err.message);
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} item:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
          Item Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          placeholder="Enter item name"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
          placeholder="Enter item description"
        />
      </div>

        <div className='hidden'>
          <label htmlFor="quantity" className="block text-sm font-semibold text-gray-900 mb-2">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="0"
            step="1"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            placeholder="0"
            defaultValue={0}
            readOnly
          />
        </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="costPrice" className="block text-sm font-semibold text-gray-900 mb-2">
            Cost Price
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              type="number"
              id="costPrice"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="sellingPrice" className="block text-sm font-semibold text-gray-900 mb-2">
            Selling Price *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
            <input
              type="number"
              id="sellingPrice"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="0.00"
              required
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-semibold text-gray-900 mb-2">
          Product Image
        </label>
        <div className="space-y-3">
          <div className="relative">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
            />
          </div>
          {imagePreview && (
            <div className="relative inline-block group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-xl border-2 border-gray-200 shadow-md"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition duration-200 hover:scale-110"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white cursor-pointer"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory select (shows only when a category is selected AND has subcategories) */}
        {formData.category && (() => {
          const selectedCategoryId = categories.find(c => c.name === formData.category)?.id;
          const availableSubcategories = subcategories.filter(sc => String(sc.category_id) === String(selectedCategoryId));
          
          if (availableSubcategories.length === 0) return null;
          
          return (
            <div>
              <label htmlFor="subcategory" className="block text-sm font-semibold text-gray-900 mb-2">
                Subcategory
              </label>
              <select
                id="subcategory"
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 appearance-none bg-white cursor-pointer"
              >
                <option value="">Select a subcategory (optional)</option>
                {availableSubcategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>{sc.name}</option>
                ))}
              </select>
            </div>
          );
        })()}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-200"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditMode ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isEditMode ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
              </svg>
              {isEditMode ? 'Update Item' : 'Add Item'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default AddInventory;
