import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ onLogout }) => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'User';
  const email = localStorage.getItem('email') || 'user@example.com';
  const role = localStorage.getItem('role') || 'User';


  const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    setShowUserMenu(false);
    navigate('/');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return 'Dashboard';
      case '/inventory':
        return 'Inventory Management';
      case '/billing':
        return 'Billing & Invoicing';
      case '/offers':
        return 'Offers & Promotions';
      case '/report':
        return 'Reports & Analytics';
      default:
        return 'Dashboard';
    }
  };


  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left side: Page Title */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
      </div>

      {/* Right side: Icons and User profile */}
      <div className="flex items-center space-x-4">

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold"><UserIcon/></span>
            </div>
            <div className="text-left hidden md:block">
              <p className="font-medium text-gray-900">{role}</p> 
              <p className="text-sm text-gray-500">Inventory Manager</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Overlay to close menu when clicking outside */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowUserMenu(false)}
              />
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-100">
                <span className="text-white font-semibold">{name.split(' ').map(n=>n[0]).join('')}</span>
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">{email}</p>
                </div>
                
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  My Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Account Settings
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Help & Support
                </a>
                
                <div className="border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogoutIcon />
                    <span className="ml-2">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;