import React, { useState } from "react";
import axios from "../api/axiosInstance";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faUser, 
  faEnvelope, 
  faLock, 
  faCheck, 
  faTimes,
  faEye,
  faEyeSlash,
  faShieldAlt,
  faArrowLeft,
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle,
  faCopy,
  faKey
} from '@fortawesome/free-solid-svg-icons';

export default function AddStaff() {
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
      
      // Show success animation
      setShowSuccess(true);
      
      // Reset form after delay
      setTimeout(() => {
        setForm({ name: "", email: "", password: "" });
        setPages([]);
        setFormErrors({});
        setShowSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error adding staff:", error);
      alert(`❌ Failed to add staff: ${error.response?.data?.message || error.message}`);
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

  // Password strength indicator
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

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Success Overlay */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-3xl p-12 max-w-md text-center transform animate-popIn">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Success!</h3>
              <p className="text-gray-600 mb-6">Staff member has been added successfully</p>
              <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Redirecting...</span>
              </div>
            </div>
          </div>
        )}

        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center text-sm text-gray-600 mb-4">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group mr-4"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-400">Staff Management</span>
            <span className="mx-2">/</span>
            <span className="text-blue-600 font-medium">Add New Staff</span>
          </nav>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Add New Staff Member</h1>
              <p className="text-gray-600 text-lg">Create secure staff accounts with role-based access</p>
            </div>
            <div className="hidden md:block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-lg">
              <div className="text-sm opacity-90">Quick Add</div>
              <div className="font-bold">Staff Account</div>
            </div>
          </div>
        </div>

        {/* Progress & Status Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faUserPlus} className="text-white text-xl" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-xs text-white font-bold">1</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create Staff Account</h2>
                <p className="text-gray-500 text-sm">Complete all required fields below</p>
              </div>
            </div>
            
            <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Form Status</div>
              <div className="flex items-center space-x-3">
                <div className={`flex items-center ${form.name && !formErrors.name ? 'text-green-600' : 'text-gray-400'}`}>
                  <FontAwesomeIcon icon={form.name && !formErrors.name ? faCheckCircle : faUser} className="w-4 h-4 mr-1" />
                  <span className="text-sm">Name</span>
                </div>
                <div className={`flex items-center ${form.email && !formErrors.email ? 'text-green-600' : 'text-gray-400'}`}>
                  <FontAwesomeIcon icon={form.email && !formErrors.email ? faCheckCircle : faEnvelope} className="w-4 h-4 mr-1" />
                  <span className="text-sm">Email</span>
                </div>
                <div className={`flex items-center ${form.password && !formErrors.password ? 'text-green-600' : 'text-gray-400'}`}>
                  <FontAwesomeIcon icon={form.password && !formErrors.password ? faCheckCircle : faLock} className="w-4 h-4 mr-1" />
                  <span className="text-sm">Password</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
              style={{ 
                width: `${(form.name && !formErrors.name && form.email && !formErrors.email && form.password && !formErrors.password) ? '100' : '50'}%`,
                backgroundSize: '200% 100%',
                animation: 'gradientShift 3s ease infinite'
              }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 transition-all duration-300 hover:shadow-2xl">
              <form onSubmit={handleSubmit}>
                
                {/* Section 1: Basic Information */}
                <div className="mb-10">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faUser} className="text-blue-600 text-lg" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <FontAwesomeIcon icon={faUser} className="text-blue-500 mr-2 w-4 h-4" />
                        Full Name
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 ${
                            formErrors.name 
                              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                              : form.name 
                              ? 'border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                              : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                          } bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white`}
                          placeholder="John Doe"
                          value={form.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={isSubmitting}
                        />
                        {form.name && !formErrors.name && (
                          <div className="absolute right-4 top-4">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-popIn">
                              <FontAwesomeIcon icon={faCheck} className="text-white w-3 h-3" />
                            </div>
                          </div>
                        )}
                      </div>
                      {formErrors.name ? (
                        <div className="mt-2 flex items-center text-red-600 animate-shake">
                          <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{formErrors.name}</span>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center text-gray-500">
                          <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">Enter staff member's full name</span>
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                        <FontAwesomeIcon icon={faEnvelope} className="text-blue-500 mr-2 w-4 h-4" />
                        Email Address
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 ${
                            formErrors.email 
                              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                              : form.email 
                              ? 'border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                              : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                          } bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white`}
                          placeholder="john.doe@company.com"
                          value={form.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={isSubmitting}
                        />
                        {form.email && !formErrors.email && (
                          <div className="absolute right-4 top-4">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-popIn">
                              <FontAwesomeIcon icon={faCheck} className="text-white w-3 h-3" />
                            </div>
                          </div>
                        )}
                      </div>
                      {formErrors.email ? (
                        <div className="mt-2 flex items-center text-red-600 animate-shake">
                          <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{formErrors.email}</span>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center text-gray-500">
                          <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">Used for login and notifications</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Security Settings */}
                <div className="mb-10">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-50 rounded-xl flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-green-600 text-lg" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Security Settings</h3>
                  </div>

                  {/* Password Field with Generator */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-gray-800 flex items-center">
                        <FontAwesomeIcon icon={faLock} className="text-blue-500 mr-2 w-4 h-4" />
                        Password
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        disabled={isSubmitting}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors group"
                      >
                        <FontAwesomeIcon icon={faKey} className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        Generate Secure Password
                      </button>
                    </div>
                    
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 ${
                          formErrors.password 
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                            : form.password 
                            ? 'border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        } bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white pr-24`}
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
                            className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                            title="Copy password"
                          >
                            <FontAwesomeIcon icon={faCopy} className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {form.password && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Password strength</span>
                          <span className={`text-sm font-semibold ${passwordStrength.color.replace('bg-', 'text-')}`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${passwordStrength.color} transition-all duration-500 ease-out`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          {['Weak', 'Fair', 'Good', 'Strong'].map((label, idx) => (
                            <span key={label} className={`text-xs ${passwordStrength.strength >= (idx + 1) * 25 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {generatedPassword && (
                      <div className="mt-3 animate-fadeIn">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3" />
                          <span className="text-sm text-green-800">
                            Secure password generated! It has been auto-filled.
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {formErrors.password ? (
                      <div className="mt-3 flex items-center text-red-600 animate-shake">
                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{formErrors.password}</span>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className={`flex items-center ${form.password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                            <FontAwesomeIcon icon={form.password.length >= 6 ? faCheck : faTimes} className="w-3 h-3 mr-1" />
                            <span>6+ characters</span>
                          </div>
                          <div className={`flex items-center ${/[A-Z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <FontAwesomeIcon icon={/[A-Z]/.test(form.password) ? faCheck : faTimes} className="w-3 h-3 mr-1" />
                            <span>Uppercase</span>
                          </div>
                          <div className={`flex items-center ${/[a-z]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <FontAwesomeIcon icon={/[a-z]/.test(form.password) ? faCheck : faTimes} className="w-3 h-3 mr-1" />
                            <span>Lowercase</span>
                          </div>
                          <div className={`flex items-center ${/[0-9]/.test(form.password) ? 'text-green-600' : 'text-gray-400'}`}>
                            <FontAwesomeIcon icon={/[0-9]/.test(form.password) ? faCheck : faTimes} className="w-3 h-3 mr-1" />
                            <span>Numbers</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Access Permissions */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-50 rounded-xl flex items-center justify-center mr-3">
                        <FontAwesomeIcon icon={faShieldAlt} className="text-purple-600 text-lg" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Access Permissions</h3>
                        <p className="text-gray-500 text-sm mt-1">Select modules staff can access</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={selectAllPages}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllPages}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 border border-gray-300"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Permission Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {allPages.map(page => {
                      const isSelected = pages.includes(page.id);
                      return (
                        <div
                          key={page.id}
                          onClick={() => togglePage(page.id)}
                          className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                            isSelected
                              ? `border-blue-500 bg-gradient-to-br from-blue-50 to-white shadow-lg scale-[1.02]`
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${page.color} flex items-center justify-center mr-3 shadow-sm`}>
                                <span className="text-xl">{page.icon}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{page.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">Access permission</p>
                              </div>
                            </div>
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              isSelected 
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-transparent' 
                                : 'bg-white border-gray-300'
                            }`}>
                              {isSelected && (
                                <FontAwesomeIcon icon={faCheck} className="text-white w-3 h-3" />
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-bl-xl"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Selection Summary */}
                  <div className={`rounded-2xl p-5 transition-all duration-500 ${
                    pages.length === 0 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-sm ${
                          pages.length === 0 
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100' 
                            : 'bg-gradient-to-r from-green-100 to-emerald-100'
                        }`}>
                          <div className={`text-2xl font-bold ${
                            pages.length === 0 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {pages.length}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {pages.length === 0 ? 'No Access Granted' : 'Access Permissions Set'}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {pages.length} of {allPages.length} modules selected
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl font-medium ${
                        pages.length === 0 
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' 
                          : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                      }`}>
                        {pages.length === 0 ? '⚠️ No Access' : '✅ Ready'}
                      </div>
                    </div>
                    {pages.length === 0 && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-300">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 mr-3" />
                          <span className="text-sm text-yellow-800">
                            Staff won't be able to access any system modules. Consider granting at least basic access.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-8 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-sm text-gray-500 md:w-1/3">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                        <span>All fields marked with * are required</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ name: "", email: "", password: "" });
                          setPages([]);
                          setFormErrors({});
                        }}
                        disabled={isSubmitting}
                        className="px-8 py-3.5 text-gray-700 hover:text-gray-900 font-medium rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 hover:bg-gray-50 min-w-[140px] flex items-center justify-center"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                        Clear All
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none min-w-[180px] relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {isSubmitting ? (
                          <div className="flex items-center justify-center relative z-10">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                            <span className="font-medium">Creating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center relative z-10">
                            <FontAwesomeIcon icon={faUserPlus} className="w-5 h-5 mr-3" />
                            <span className="font-medium">Create Staff Account</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-gray-900 to-white-800 text-white rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 rounded-xl">
                  <div>
                    <div className="text-2xl font-bold">{allPages.length}</div>
                    <div className="text-sm text-gray-300">Total Modules</div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📊</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 rounded-xl">
                  <div>
                    <div className="text-2xl font-bold">{pages.length}</div>
                    <div className="text-sm text-gray-300">Selected</div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800 bg-opacity-50 rounded-xl">
                  <div>
                    <div className="text-2xl font-bold">{allPages.length - pages.length}</div>
                    <div className="text-sm text-gray-300">Available</div>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📦</span>
                  </div>
                </div>
              </div>
            </div>
                {/* Quick Actions */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl p-6 border border-green-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-green-600 w-5 h-5 mr-2" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={selectAllPages}
                    className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Grant Full Access
                  </button>
                  <button
                    onClick={() => {
                      setForm(prev => ({
                        ...prev,
                        password: Math.random().toString(36).slice(-10) + "A1!"
                      }));
                    }}
                    className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Generate Strong Password
                  </button>
                </div>
              </div>


            {/* Form Completion */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-6">Completion Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Basic Information</span>
                  <span className={`font-medium ${form.name && form.email ? 'text-green-600' : 'text-gray-400'}`}>
                    {form.name && form.email ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${form.name && form.email ? '100' : '50'}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">Security Setup</span>
                  <span className={`font-medium ${form.password && !formErrors.password ? 'text-green-600' : 'text-gray-400'}`}>
                    {form.password && !formErrors.password ? 'Secure' : 'Required'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${form.password && !formErrors.password ? '100' : '33'}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-600">Permissions</span>
                  <span className={`font-medium ${pages.length > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {pages.length > 0 ? 'Set' : 'Recommended'}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${pages.length > 0 ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-yellow-500 to-yellow-600'}`}
                    style={{ width: `${pages.length > 0 ? '100' : '75'}%` }}
                  ></div>
                </div>
              </div>
              
            </div>
            {/* Help Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-lg">💡</span>
                </div>
                Best Practices
              </h3>
              <div className="space-y-3">
                <div className="flex items-start p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <FontAwesomeIcon icon={faUser} className="text-blue-600 w-3 h-3" />
                  </div>
                  <span className="text-sm text-gray-700">Use the staff member's official name for easy identification</span>
                </div>
                <div className="flex items-start p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-green-600 w-3 h-3" />
                  </div>
                  <span className="text-sm text-gray-700">Grant permissions based on role requirements only</span>
                </div>
                <div className="flex items-start p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <FontAwesomeIcon icon={faKey} className="text-purple-600 w-3 h-3" />
                  </div>
                  <span className="text-sm text-gray-700">Share passwords securely via encrypted channels</span>
                </div>
                <div className="flex items-start p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors">
                  <div className="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-pink-600 w-3 h-3" />
                  </div>
                  <span className="text-sm text-gray-700">Staff can update their password after first login</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="inline-flex items-center space-x-6">
            <span>🔒 Secure form submission</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>🔄 Auto-save disabled</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>⏱️ Takes about 2 minutes</span>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          70% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-popIn {
          animation: popIn 0.4s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}