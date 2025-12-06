import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './SideBar';
import Topbar from './Topbar';

const Layout = () => {
  const handleLogout = () => {
    // Your logout logic here
    console.log('User logged out');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
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