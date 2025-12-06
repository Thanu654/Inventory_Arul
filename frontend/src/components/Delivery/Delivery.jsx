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
  Weight,
  Hash,
  Percent,
  Camera
} from 'lucide-react';

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery entry?')) return;
    try {
      const res = await fetch(`/api/delivery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEntries();
      } else {
        const err = await res.json();
        alert(err.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
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

  // Professional Modal Component - Clean and Visible
  const ProfessionalModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Semi-transparent backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {modalMode === 'add' ? 'Add Delivery Rate' : 'Edit Delivery Rate'}
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                {modalMode === 'add' 
                  ? 'Create a new shipping rate for a specific country' 
                  : 'Update the existing delivery rate details'}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="px-8 pb-8">
          <div className="space-y-8">
            {/* Country Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Globe className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  value={form.country_name}
                  onChange={(e) => {
                    setForm({ ...form, country_name: e.target.value });
                    if (errors.country_name) setErrors({ ...errors, country_name: '' });
                  }}
                  className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 ${
                    errors.country_name 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter country name"
                />
              </div>
              {errors.country_name && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.country_name}
                </div>
              )}
            </div>

            {/* Weight Range - Two fields side by side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight Range (kg)
              </label>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min weight</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Hash className="text-gray-400" size={20} />
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
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 ${
                        errors.min_weight 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.min_weight && (
                    <div className="flex items-center mt-2 text-xs text-red-600">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.min_weight}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max weight</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Hash className="text-gray-400" size={20} />
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
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 ${
                        errors.max_weight 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.max_weight && (
                    <div className="flex items-center mt-2 text-xs text-red-600">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.max_weight}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prices - Two fields side by side */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Details
              </label>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Normal Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="text-gray-400" size={20} />
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
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 ${
                        errors.normal_price 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.normal_price && (
                    <div className="flex items-center mt-2 text-xs text-red-600">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.normal_price}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Offer Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Percent className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.offer_price}
                      onChange={(e) => {
                        setForm({ ...form, offer_price: e.target.value });
                        if (errors.offer_price) setErrors({ ...errors, offer_price: '' });
                      }}
                      className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 ${
                        errors.offer_price 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.offer_price && (
                    <div className="flex items-center mt-2 text-xs text-red-600">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.offer_price}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload - Clearly Visible Section */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                <div className="flex items-center">
                  <Camera className="mr-2 text-gray-500" size={18} />
                  Country Flag Image (Optional)
                </div>
              </label>
              
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Flag preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                      }}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Upload className="mr-2" size={18} />
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors p-8 text-center bg-gray-50">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 rounded-full bg-gray-200 mb-4">
                          <ImageIcon className="text-gray-500" size={28} />
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Click to upload flag image
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                        <div className="mt-4 inline-flex items-center px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                          <Upload className="mr-2" size={18} />
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
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 sm:mt-0 px-6 py-3.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center px-6 py-3.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={18} />
                      {modalMode === 'add' ? 'Create Rate' : 'Save Changes'}
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Delivery Management</h1>
            <p className="text-gray-600 mt-2">Manage shipping rates for different countries</p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
          >
            <Plus size={20} />
            <span>Add Delivery Rate</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="mt-4 text-gray-600">Loading delivery rates...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto text-gray-400" size={48} />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No delivery rates</h3>
            <p className="mt-2 text-gray-600">Add your first delivery rate to get started</p>
            <button
              onClick={handleAddNew}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg"
            >
              <Plus size={20} />
              Add Rate
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Weight Range</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Normal Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Offer Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.country_name} 
                            className="w-8 h-6 object-cover rounded mr-3 border"
                          />
                        )}
                        <span className="font-medium">{item.country_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">
                        {item.min_weight}kg - {item.max_weight}kg
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <DollarSign size={14} className="text-gray-500 mr-1" />
                        <span className="font-semibold">{item.normal_price}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.offer_price ? (
                        <div className="flex items-center">
                          <DollarSign size={14} className="text-green-500 mr-1" />
                          <span className="font-semibold text-green-600">{item.offer_price}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg"
                        >
                          <Edit2 size={14} className="mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 size={14} className="mr-2" />
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
      </div>

      {/* Modal */}
      {showModal && <ProfessionalModal />}
    </div>
  );
};

export default Delivery;