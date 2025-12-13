import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance'; 
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSync, faUser, faEnvelope, faIdCard, faCircle, faSearch, faFilter, faQuestionCircle, faLock, faCheck, faTimes, faEye, faEyeSlash, faShieldAlt, faInfoCircle, faCheckCircle, faCopy, faKey } from '@fortawesome/free-solid-svg-icons';

const ViewStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [pages, setPages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const allPages = [
    { id: "dashboard", name: "Dashboard", icon: "📊", color: "from-blue-500 to-blue-600" },
    { id: "inventory", name: "Inventory", icon: "📦", color: "from-green-500 to-green-600" },
    { id: "billing", name: "Billing", icon: "💰", color: "from-yellow-500 to-yellow-600" },
    { id: "delivery", name: "Delivery", icon: "🚚", color: "from-purple-500 to-purple-600" },
    { id: "transactions", name: "Transactions", icon: "📋", color: "from-indigo-500 to-indigo-600" },
    { id: "offers", name: "Offers & Promotions", icon: "🎁", color: "from-pink-500 to-pink-600" },
    { id: "notifications", name: "Notifications", icon: "🔔", color: "from-red-500 to-red-600" }
  ];

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/staff', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStaffList(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch staff data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleEdit = (id) => {
    try {
      const staff = staffList.find(s => s.id === id);
      if (!staff) {
        alert('Staff member not found');
        return;
      }
      setSelectedStaff(staff);
      setForm({
        name: staff.name,
        email: staff.email,
        password: ""
      });
      setPages(staff.pages ? JSON.parse(staff.pages) : []);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load staff details');
    }
  };

  const handleAddNew = () => {
    setIsAddModalOpen(true);
  };

  const handleView = (id) => {
    const staff = staffList.find(s => s.id === id);
    if (!staff) {
      alert('Staff member not found');
      return;
    }
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!form.name.trim()) {
      errors.name = "Name is required";
    } else if (form.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!form.password) {
      errors.password = "Password is required";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errors.password = "Include uppercase, lowercase & numbers";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = () => {
    const errors = {};
    
    if (!form.name.trim()) {
      errors.name = "Name is required";
    } else if (form.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Password is optional for edit
    if (form.password && form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (form.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      errors.password = "Include uppercase, lowercase & numbers";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm(prev => ({ ...prev, password }));
    setGeneratedPassword(password);
    setTimeout(() => setGeneratedPassword(""), 3000);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(form.password);
    alert("Password copied to clipboard!");
  };

  const togglePage = (pageId) => {
    setPages(prev =>
      prev.includes(pageId) ? prev.filter(p => p !== pageId) : [...prev, pageId]
    );
  };

  const selectAllPages = () => {
    setPages(allPages.map(page => page.id));
  };

  const clearAllPages = () => {
    setPages([]);
  };
  
  const resetForm = () => {
    setForm({ name: "", email: "", password: "" });
    setPages([]);
    setFormErrors({});
    setShowPassword(false);
    setGeneratedPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (pages.length === 0) {
      if (!window.confirm("⚠️ No pages selected. Staff will have no access. Continue?")) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      await axios.post("/add-staff",
        { ...form, pages },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setShowSuccess(true);
      
      setTimeout(() => {
        resetForm();
        setShowSuccess(false);
        setIsAddModalOpen(false);
        fetchStaff();
      }, 2000);
      
    } catch (error) {
      console.error("Error adding staff:", error);
      alert(`❌ Failed to add staff: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }
    
    if (pages.length === 0) {
      if (!window.confirm("⚠️ No pages selected. Staff will have no access. Continue?")) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      const updateData = {
        name: form.name,
        email: form.email,
        pages
      };
      
      // Only include password if it was changed
      if (form.password) {
        updateData.password = form.password;
      }
      
      await axios.put(`/staff/${selectedStaff.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      setShowSuccess(true);
      
      setTimeout(() => {
        resetForm();
        setShowSuccess(false);
        setIsEditModalOpen(false);
        setSelectedStaff(null);
        fetchStaff();
      }, 2000);
      
    } catch (error) {
      console.error("Error updating staff:", error);
      alert(`❌ Failed to update staff: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const getPasswordStrength = () => {
    if (!form.password) return { strength: 0, color: "bg-gray-200", text: "No password" };
    
    let strength = 0;
    if (form.password.length >= 6) strength += 25;
    if (/[a-z]/.test(form.password)) strength += 25;
    if (/[A-Z]/.test(form.password)) strength += 25;
    if (/[0-9]/.test(form.password)) strength += 25;
    
    if (strength <= 25) return { strength, color: "bg-red-500", text: "Weak" };
    if (strength <= 50) return { strength, color: "bg-yellow-500", text: "Fair" };
    if (strength <= 75) return { strength, color: "bg-blue-500", text: "Good" };
    return { strength, color: "bg-green-500", text: "Strong" };
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffList(staffList.filter(staff => staff.id !== id));
      alert('Staff deleted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to delete staff');
    }
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.id.toString().includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on leave': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
            <h3 className="mt-6 text-xl font-semibold text-gray-700">Loading Staff Members</h3>
            <p className="mt-2 text-gray-500">Please wait while we fetch the latest data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2">
      <div className="max-w-7xl mx-auto">
        
         {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Total Staff</p>
                          <p className="text-3xl font-bold mt-1">{staffList.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium">Active</p>
                          <p className="text-3xl font-bold mt-1">{staffList.filter(s => s.status === 'active').length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-amber-100 text-sm font-medium">Inactive</p>
                          <p className="text-3xl font-bold mt-1">{staffList.filter(s => s.status === 'inactive').length}</p>
                        </div>
                      </div>
                    </div>
                  </div>


        {/* Header Section */}
        <div className="mt-4 mb-8">
          {/* Search and Filter Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-10 py-3 w-full border border-gray-300 rounded-xl 
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                           transition-all duration-300 text-lg"
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
                </div>
                <select
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl 
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                           appearance-none bg-white cursor-pointer text-lg"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on leave">On Leave</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchStaff}
                className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 
                         hover:text-white px-2 py-3 rounded-xl font-semibold text-lg 
                         transition-all duration-300 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faSync} className="mr-2" />
                Refresh
              </button>
              <button
                onClick={handleAddNew}
                className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 
                         hover:text-white px-2 py-3 rounded-xl font-semibold text-lg 
                         transition-all duration-300 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add New Staff
              </button>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{filteredStaff.length}</span> of{' '}
                <span className="font-semibold">{staffList.length}</span> staff members
              </p>
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                {filteredStaff.length} Records
              </span>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {filteredStaff.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                        ID
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        Name
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                        Email
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        <FontAwesomeIcon icon={faCircle} className="mr-2" />
                        Status
                      </th>
                      <th className="py-4 px-30 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStaff.map((staff) => (
                      <tr 
                        key={staff.id}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                      >
                        <td className="py-4 px-6">
                          <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                            #{staff.id}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{staff.name}</div>
                        </td>
                        <td className="py-4 px-6">
                          <a 
                            href={`mailto:${staff.email}`}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                          >
                            {staff.email}
                          </a>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(staff.status)}`}>
                            <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-70"></span>
                            {staff.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(staff.id)}
                              className="bg-green-50 text-green-600 hover:bg-green-100 
                                       px-4 py-2 rounded-lg font-medium transition-colors duration-200 
                                       flex items-center"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-2" />
                              View
                            </button>
                            <button
                              onClick={() => handleEdit(staff.id)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 
                                       px-4 py-2 rounded-lg font-medium transition-colors duration-200 
                                       flex items-center"
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-2" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(staff.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 
                                       px-4 py-2 rounded-lg font-medium transition-colors duration-200 
                                       flex items-center"
                            >
                              <FontAwesomeIcon icon={faTrash} className="mr-2" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                  No Staff Members Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No staff members have been added yet'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 
                             px-6 py-3 rounded-xl font-medium transition-colors duration-300"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

         
        </div>

        {/* Help Button */}
        <button
          onClick={() => alert('Need help? Contact your system administrator.')}
          className="fixed bottom-8 right-8 bg-indigo-600 text-white hover:bg-indigo-700 
                   w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 
                   flex items-center justify-center text-xl z-50"
          aria-label="Help"
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
        </button>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Success Overlay */}
            {showSuccess && (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10 rounded-2xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-white text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Success!</h3>
                  <p className="text-gray-600">Staff member has been added successfully</p>
                </div>
              </div>
            )}

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
                  <FontAwesomeIcon icon={faPlus} className="w-6 h-6" />
                  Add New Staff Member
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`w-full px-4 py-3 rounded-xl border-2 ${formErrors.name ? 'border-red-300' : form.name ? 'border-green-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`}
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {form.name && !formErrors.name && (
                        <div className="absolute right-4 top-3">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FontAwesomeIcon icon={faTimes} className="mr-1" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        className={`w-full px-4 py-3 rounded-xl border-2 ${formErrors.email ? 'border-red-300' : form.email ? 'border-green-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`}
                        placeholder="john.doe@company.com"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {form.email && !formErrors.email && (
                        <div className="absolute right-4 top-3">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FontAwesomeIcon icon={faTimes} className="mr-1" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-green-500 mr-2" />
                    Security Settings
                  </h4>
                  <button
                    type="button"
                    onClick={generatePassword}
                    disabled={isSubmitting}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faKey} />
                    Generate Password
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${formErrors.password ? 'border-red-300' : form.password ? 'border-green-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all pr-24`}
                      placeholder="Create a strong password"
                      value={form.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-2 top-2 flex items-center space-x-1">
                      {form.password && (
                        <button
                          type="button"
                          onClick={copyPassword}
                          className="px-2 py-1 text-gray-600 hover:text-blue-600"
                          title="Copy password"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-2 py-1 text-gray-600 hover:text-blue-600"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>
                  
                  {form.password && (() => {
                    const passwordStrength = getPasswordStrength();
                    return (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Password strength</span>
                          <span className={`text-sm font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${passwordStrength.color} transition-all`} style={{ width: `${passwordStrength.strength}%` }}></div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {formErrors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FontAwesomeIcon icon={faTimes} className="mr-1" />
                      {formErrors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Access Permissions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-purple-500 mr-2" />
                    Access Permissions
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllPages}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearAllPages}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {allPages.map(page => {
                    const isSelected = pages.includes(page.id);
                    return (
                      <div
                        key={page.id}
                        onClick={() => togglePage(page.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{page.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{page.name}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-transparent' : 'border-gray-300'}`}>
                            {isSelected && <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <p className="mt-3 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                  Selected {pages.length} of {allPages.length} modules
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Staff Modal */}
      {isViewModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-500 to-teal-500">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
                  <FontAwesomeIcon icon={faEye} className="w-6 h-6" />
                  Staff Details
                </h3>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedStaff(null);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {/* Basic Information Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faUser} className="text-green-500 mr-2" />
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Staff ID */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                      Staff ID
                    </label>
                    <p className="text-lg font-medium text-gray-900">#{selectedStaff.id}</p>
                  </div>

                  {/* Full Name */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      <FontAwesomeIcon icon={faUser} className="mr-2" />
                      Full Name
                    </label>
                    <p className="text-lg font-medium text-gray-900">{selectedStaff.name}</p>
                  </div>

                  {/* Email Address */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                      Email Address
                    </label>
                    <p className="text-lg font-medium text-gray-900">{selectedStaff.email}</p>
                  </div>

                  {/* Status */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      <FontAwesomeIcon icon={faCircle} className="mr-2" />
                      Status
                    </label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedStaff.status)}`}>
                      <span className="w-2 h-2 rounded-full mr-2 bg-current opacity-70"></span>
                      {selectedStaff.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Access Permissions Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-purple-500 mr-2" />
                  Access Permissions
                </h4>

                <div className="bg-gray-50 p-4 rounded-xl">
                  {selectedStaff.pages && JSON.parse(selectedStaff.pages).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {JSON.parse(selectedStaff.pages).map(pageId => {
                        const pageInfo = allPages.find(p => p.id === pageId);
                        return pageInfo ? (
                          <div
                            key={pageId}
                            className="bg-white p-3 rounded-lg border-2 border-green-200 shadow-sm"
                          >
                            <div className="flex items-center">
                              <span className="text-xl mr-2">{pageInfo.icon}</span>
                              <span className="text-sm font-medium text-gray-900">{pageInfo.name}</span>
                              <FontAwesomeIcon icon={faCheck} className="ml-auto text-green-500" />
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-gray-300 text-4xl mb-3" />
                      <p className="text-gray-500">No permissions assigned</p>
                    </div>
                  )}
                  
                  {selectedStaff.pages && JSON.parse(selectedStaff.pages).length > 0 && (
                    <p className="mt-4 text-sm text-gray-600 flex items-center">
                      <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                      Total {JSON.parse(selectedStaff.pages).length} module(s) accessible
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500 mt-1 mr-3" />
                  <div>
                    <h5 className="font-semibold text-blue-900 mb-1">Staff Account Information</h5>
                    <p className="text-sm text-blue-700">
                      This staff member has access to {selectedStaff.pages ? JSON.parse(selectedStaff.pages).length : 0} modules in the system. 
                      To modify permissions or update details, use the Edit button.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedStaff(null);
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEdit(selectedStaff.id);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl font-medium flex items-center"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" />
                  Edit Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Success Overlay */}
            {showSuccess && (
              <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-10 rounded-2xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-white text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Success!</h3>
                  <p className="text-gray-600">Staff member has been updated successfully</p>
                </div>
              </div>
            )}

            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-500 to-orange-500">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white flex items-center gap-3">
                  <FontAwesomeIcon icon={faEdit} className="w-6 h-6" />
                  Edit Staff Member
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedStaff(null);
                    resetForm();
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={handleUpdate} className="p-6">
              {/* Basic Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2" />
                  Basic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`w-full px-4 py-3 rounded-xl border-2 ${formErrors.name ? 'border-red-300' : form.name ? 'border-green-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`}
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {form.name && !formErrors.name && (
                        <div className="absolute right-4 top-3">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FontAwesomeIcon icon={faTimes} className="mr-1" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        className={`w-full px-4 py-3 rounded-xl border-2 ${formErrors.email ? 'border-red-300' : form.email ? 'border-green-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all`}
                        placeholder="john.doe@company.com"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={isSubmitting}
                      />
                      {form.email && !formErrors.email && (
                        <div className="absolute right-4 top-3">
                          <FontAwesomeIcon icon={faCheck} className="text-green-500" />
                        </div>
                      )}
                    </div>
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <FontAwesomeIcon icon={faTimes} className="mr-1" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-green-500 mr-2" />
                    Security Settings
                  </h4>
                  <button
                    type="button"
                    onClick={generatePassword}
                    disabled={isSubmitting}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faKey} />
                    Generate Password
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Password <span className="text-gray-500">(Leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${formErrors.password ? 'border-red-300' : form.password ? 'border-green-300' : 'border-gray-300'} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all pr-24`}
                      placeholder="Enter new password or leave blank"
                      value={form.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-2 top-2 flex items-center space-x-1">
                      {form.password && (
                        <button
                          type="button"
                          onClick={copyPassword}
                          className="px-2 py-1 text-gray-600 hover:text-blue-600"
                          title="Copy password"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-2 py-1 text-gray-600 hover:text-blue-600"
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                  </div>
                  
                  {form.password && (() => {
                    const passwordStrength = getPasswordStrength();
                    return (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Password strength</span>
                          <span className={`text-sm font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${passwordStrength.color} transition-all`} style={{ width: `${passwordStrength.strength}%` }}></div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {formErrors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FontAwesomeIcon icon={faTimes} className="mr-1" />
                      {formErrors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Access Permissions */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-purple-500 mr-2" />
                    Access Permissions
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAllPages}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearAllPages}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {allPages.map(page => {
                    const isSelected = pages.includes(page.id);
                    return (
                      <div
                        key={page.id}
                        onClick={() => togglePage(page.id)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-xl mr-2">{page.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{page.name}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-transparent' : 'border-gray-300'}`}>
                            {isSelected && <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <p className="mt-3 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                  Selected {pages.length} of {allPages.length} modules
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedStaff(null);
                    resetForm();
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewStaff;