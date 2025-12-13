import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Globe,
  Package,
  DollarSign,
  Image as ImageIcon,
  Upload,
  AlertCircle,
  Hash,
  Percent,
  Camera,
  Truck,
  MapPin,
  Globe as GlobeIcon,
  Layers,
  Search,
  Filter
} from 'lucide-react';

// Move ProfessionalModal outside Delivery
const ProfessionalModal = ({
  modalMode,
  form,
  setForm,
  errors,
  setErrors,
  imagePreview,
  setImagePreview,
  imageFile,
  setImageFile,
  submitting,
  handleSubmit,
  closeModal,
  handleImageChange
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
    {/* Backdrop with blur */}
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={closeModal}
    />
    
    {/* Modal Container */}
    <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
      {/* Modal Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${modalMode === 'add' ? 'bg-gradient-to-r from-blue-100 to-blue-200' : 'bg-gradient-to-r from-amber-100 to-amber-200'}`}>
              {modalMode === 'add' ? (
                <Truck className="w-6 h-6 text-blue-600" />
              ) : (
                <Edit2 className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Add Delivery Rate' : 'Edit Delivery Rate'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {modalMode === 'add'
                  ? 'Create a new shipping rate for a specific country'
                  : 'Update the existing delivery rate details'}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Country Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              <span className="flex items-center gap-2">
                <GlobeIcon className="w-4 h-4" />
                Country Name
                <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Globe className="text-gray-400 w-5 h-5" />
              </div>
              <input
                type="text"
                value={form.country_name}
                onChange={(e) => {
                  setForm({ ...form, country_name: e.target.value });
                  if (errors.country_name) setErrors({ ...errors, country_name: '' });
                }}
                className={`w-full px-4 py-3.5 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                  errors.country_name
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                placeholder="Enter country name (e.g., United States)"
              />
            </div>
            {errors.country_name && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {errors.country_name}
              </div>
            )}
          </div>

          {/* Weight Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Weight Range (kg)
                <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">Minimum Weight</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Hash className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.min_weight}
                    onChange={(e) => {
                      setForm({ ...form, min_weight: e.target.value });
                      if (errors.min_weight) setErrors({ ...errors, min_weight: '' });
                    }}
                    className={`w-full px-4 py-3.5 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                      errors.min_weight
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.min_weight && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.min_weight}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">Maximum Weight</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Hash className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.max_weight}
                    onChange={(e) => {
                      setForm({ ...form, max_weight: e.target.value });
                      if (errors.max_weight) setErrors({ ...errors, max_weight: '' });
                    }}
                    className={`w-full px-4 py-3.5 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                      errors.max_weight
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.max_weight && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.max_weight}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prices */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price Details
                <span className="text-red-500">*</span>
              </span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">Normal Price</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <DollarSign className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.normal_price}
                    onChange={(e) => {
                      setForm({ ...form, normal_price: e.target.value });
                      if (errors.normal_price) setErrors({ ...errors, normal_price: '' });
                    }}
                    className={`w-full px-4 py-3.5 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                      errors.normal_price
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.normal_price && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.normal_price}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">Offer Price (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Percent className="text-gray-400 w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.offer_price}
                    onChange={(e) => setForm({ ...form, offer_price: e.target.value })}
                    className="w-full px-4 py-3.5 pl-11 border-2 border-gray-200 hover:border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Discounted price for promotions</p>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              <span className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Country Flag (Optional)
              </span>
            </label>
            
            {imagePreview ? (
              <div className="space-y-4">
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                    <img
                      src={imagePreview}
                      alt="Flag preview"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                      }}
                      className="p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <label className="cursor-pointer p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors shadow-lg hover:shadow-xl">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-4">
                      <ImageIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload country flag
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                      <Upload className="w-4 h-4 mr-2" />
                      Browse Files
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </label>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {modalMode === 'add' ? 'Create Delivery Rate' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
);

const Delivery = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [form, setForm] = useState({
    id: null,
    country_name: '',
    min_weight: '',
    max_weight: '',
    normal_price: '',
    offer_price: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'withOffer', 'noOffer'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemName, setDeleteItemName] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery');
      const data = await res.json();
      setEntries(data || []);
    } catch (err) {
      console.error('Failed to fetch delivery entries', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.country_name.trim()) {
      newErrors.country_name = 'Country name is required';
    }

    if (!form.min_weight) {
      newErrors.min_weight = 'Minimum weight is required';
    } else if (parseFloat(form.min_weight) < 0) {
      newErrors.min_weight = 'Weight must be positive';
    }

    if (!form.max_weight) {
      newErrors.max_weight = 'Maximum weight is required';
    } else if (parseFloat(form.max_weight) < 0) {
      newErrors.max_weight = 'Weight must be positive';
    } else if (parseFloat(form.max_weight) <= parseFloat(form.min_weight)) {
      newErrors.max_weight = 'Max weight must be greater than min weight';
    }

    if (!form.normal_price) {
      newErrors.normal_price = 'Price is required';
    } else if (parseFloat(form.normal_price) < 0) {
      newErrors.normal_price = 'Price must be positive';
    }

    if (form.offer_price && parseFloat(form.offer_price) < 0) {
      newErrors.offer_price = 'Offer price must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (item) => {
    setForm({
      id: item.id,
      country_name: item.country_name || '',
      min_weight: item.min_weight || '',
      max_weight: item.max_weight || '',
      normal_price: item.normal_price || '',
      offer_price: item.offer_price ?? ''
    });
    setImageFile(null);
    setImagePreview(item.image || '');
    setModalMode('edit');
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setDeleteItemId(item.id);
    setDeleteItemName(item.country_name);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/delivery/${deleteItemId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEntries();
        setShowDeleteModal(false);
        setDeleteItemId(null);
        setDeleteItemName('');
      } else {
        const err = await res.json();
        alert(err.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteItemId(null);
    setDeleteItemName('');
  };

  const handleAddNew = () => {
    setForm({
      id: null,
      country_name: '',
      min_weight: '',
      max_weight: '',
      normal_price: '',
      offer_price: ''
    });
    setImageFile(null);
    setImagePreview('');
    setModalMode('add');
    setErrors({});
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    fd.append('country_name', form.country_name.trim());
    fd.append('min_weight', form.min_weight);
    fd.append('max_weight', form.max_weight);
    fd.append('normal_price', form.normal_price);
    if (form.offer_price !== '') fd.append('offer_price', form.offer_price);
    if (imageFile) fd.append('image', imageFile);
    try {
      const url = form.id ? `/api/delivery/${form.id}` : '/api/delivery';
      const method = form.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: fd });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchEntries();
      } else {
        const err = await res.json();
        alert(err.message || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      country_name: '',
      min_weight: '',
      max_weight: '',
      normal_price: '',
      offer_price: ''
    });
    setImageFile(null);
    setImagePreview('');
    setErrors({});
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.country_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'withOffer') {
      return matchesSearch && entry.offer_price;
    } else if (filter === 'noOffer') {
      return matchesSearch && !entry.offer_price;
    }
    
    return matchesSearch;
  });

  const stats = {
    total: entries.length,
    withOffer: entries.filter(e => e.offer_price).length,
    noOffer: entries.filter(e => !e.offer_price).length,
    totalValue: entries.reduce((sum, e) => sum + parseFloat(e.normal_price), 0).toFixed(2)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Rates</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="bg-blue-400/20 p-3 rounded-xl">
                  <Layers className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">With Offers</p>
                  <p className="text-3xl font-bold mt-1">{stats.withOffer}</p>
                </div>
                <div className="bg-green-400/20 p-3 rounded-xl">
                  <Percent className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Without Offers</p>
                  <p className="text-3xl font-bold mt-1">{stats.noOffer}</p>
                </div>
                <div className="bg-amber-400/20 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg Price</p>
                  <p className="text-3xl font-bold mt-1">
                    ${stats.total > 0 ? (parseFloat(stats.totalValue) / stats.total).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="bg-purple-400/20 p-3 rounded-xl">
                  <GlobeIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="relative group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by country name..."
                  className="w-full px-4 py-3 pl-11 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition duration-200"
                />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-3 mx-auto border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition duration-200 font-medium text-gray-700"
                >
                  <option value="all">All Rates</option>
                  <option value="withOffer">With Offers</option>
                  <option value="noOffer">Without Offers</option>
                </select>
              </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleAddNew}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Add Delivery Rate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                <Truck className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
              </div>
              <p className="mt-6 text-gray-600 font-medium">Loading delivery rates...</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No matching results' : 'No delivery rates yet'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms to find what you\'re looking for.' 
                  : 'Start by adding your first delivery rate to manage shipping costs.'}
              </p>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Add First Rate
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Country
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Weight Range
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Normal Price
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        Offer Price
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredEntries.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.country_name} 
                              className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 hover:scale-105"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                              <Globe className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="text-sm font-semibold text-gray-900">{item.country_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                            {item.min_weight}kg
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                            {item.max_weight}kg
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">${parseFloat(item.normal_price).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.offer_price ? (
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-green-600">${parseFloat(item.offer_price).toFixed(2)}</div>
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 rounded-full">
                              -{((1 - (parseFloat(item.offer_price) / parseFloat(item.normal_price))) * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">No offer</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-medium rounded-lg shadow-sm transition duration-200"
                          >
                            <Edit2 className="w-4 h-4 mr-1.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition duration-200"
                          >
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Results Count */}
          {!loading && filteredEntries.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredEntries.length}</span> of <span className="font-semibold">{entries.length}</span> delivery rates
                  {searchTerm && ` for "${searchTerm}"`}
                  {filter !== 'all' && ` (${filter === 'withOffer' ? 'with offers' : 'without offers'})`}
                </p>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Delivery Management System</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ProfessionalModal
          modalMode={modalMode}
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          imageFile={imageFile}
          setImageFile={setImageFile}
          submitting={submitting}
          handleSubmit={handleSubmit}
          closeModal={closeModal}
          handleImageChange={handleImageChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={cancelDelete}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-gray-700 text-base leading-relaxed">
                Are you sure you want to delete the delivery rate for{' '}
                <span className="font-bold text-gray-900">{deleteItemName}</span>?
              </p>
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">
                    Deleting this rate will permanently remove it from the system and cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 rounded-lg transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

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
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Delivery;