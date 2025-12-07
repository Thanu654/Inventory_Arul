import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = localStorage.getItem("role"); // "admin" or "staff"
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]"); // staff permissions/pages

  // Determine active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('inventory')) return 'inventory';
    if (path.includes('billing')) return 'billing';
    if (path.includes('transactions')) return 'transactions';
    if (path.includes('notifications')) return 'notifications';
    if (path.includes('delivery')) return 'delivery';
    if (path.includes('offers')) return 'offers';
    if (path.includes('report')) return 'report';
    if (path.includes('add-staff')) return 'add-staff';
    if (path.includes('staff')) return 'view-staff';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  // ICONS
  const DashboardIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-white" : "text-gray-400"}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
    </svg>
  );

  const BillingIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-white" : "text-gray-400"}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
      <path d="M6 18h4" />
    </svg>
  );

  const InventoryIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-white" : "text-gray-400"}>
      <path d="M20 7h-4V5l-2-2h-4L8 5v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
      <path d="M8 5h8v2H8z" />
      <circle cx="12" cy="15" r="2" />
      <path d="M14 12h-4" />
    </svg>
  );

  const OffersIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-white" : "text-gray-400"}>
      <path d="M20 12c0-1.1-.9-2-2-2V7c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5z" />
      <path d="M8 7h8v3H8z" />
      <circle cx="12" cy="17" r="1" />
      <path d="M16 17h-2" />
      <path d="M10 17H8" />
    </svg>
  );

  const DeliveryIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-white" : "text-gray-400"}>
      <path d="M3 11h13v8H3z" />
      <path d="M16 11h2l3 3v4" />
      <path d="M7 11V7a3 3 0 0 1 3-3h4" />
    </svg>
  );

  const TransactionsIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-white" : "text-gray-400"}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  const NotificationIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-white" : "text-gray-400"}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const ReportIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={active ? "text-white" : "text-gray-400"}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );

  const ChevronLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );

  // MENU ITEMS
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { id: 'billing', label: 'Billing', icon: BillingIcon, path: '/dashboard/billing' },
    { id: 'inventory', label: 'Inventory', icon: InventoryIcon, path: '/dashboard/inventory' },
    { id: 'purchases', label: 'Purchases', icon: BillingIcon, path: '/dashboard/purchases' },
    { id: 'delivery', label: 'Delivery', icon: DeliveryIcon, path: '/dashboard/delivery' },
    { id: 'transactions', label: 'Transactions', icon: TransactionsIcon, path: '/dashboard/transactions' },
    { id: 'notifications', label: 'Notifications', icon: NotificationIcon, path: '/dashboard/notifications' },
    { id: 'offers', label: 'Offers', icon: OffersIcon, path: '/dashboard/offers' },
    { id: 'report', label: 'Report', icon: ReportIcon, path: '/dashboard/report' },
  ];

  const adminMenus = [
    { id: 'add-staff', label: 'Add Staffs', icon: DashboardIcon, path: '/dashboard/add-staff' },
    { id: 'view-staff', label: 'View Staffs', icon: DashboardIcon, path: '/dashboard/staff' },
  ];

  // CLICK HANDLER
  const handleTabClick = (item) => navigate(item.path);

  return (
    <div className={`h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 text-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} shadow-xl relative`}>
      {/* HEADER */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <DashboardIcon active />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">StockMaster</h2>
              <p className="text-xs text-gray-400">Inventory System</p>
            </div>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Staff restriction
            if (role === 'staff' && !permissions.includes(item.id)) return null;

            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleTabClick(item)}
                  className={`w-full flex items-center rounded-lg px-3 py-3 transition-all duration-200 ${
                    isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-800 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon active={isActive} />
                  {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}

          {/* ADMIN ONLY */}
          {role === 'admin' && adminMenus.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleTabClick(item)}
                  className={`w-full flex items-center rounded-lg px-3 py-3 transition-all duration-200 ${
                    isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-800 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon active={isActive} />
                  {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
