import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import MobileSidebar from './MobileSidebar';
import Topbar from './Topbar';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // Your logout logic here
    console.log('User logged out');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Hamburger Menu Button - Mobile Only */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-lg"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;