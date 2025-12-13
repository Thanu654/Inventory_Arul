import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dashboard`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {[
            { label: 'Total Items', value: dashboardData?.stats.totalItems || 0, icon: '📦', color: 'blue' },
            { label: 'Inventory Value', value: `${dashboardData?.stats.totalValue || '0.00'} /=`, icon: '💰', color: 'green' },
            { label: 'Low Stock', value: dashboardData?.stats.lowStock || 0, icon: '⚠️', color: 'yellow' },
            { label: 'Total Sales', value: dashboardData?.stats.totalSales || 0, icon: '📈', color: 'purple' },
            { label: 'Revenue', value: `${dashboardData?.stats.totalRevenue || '0.00'} /=`, icon: '💵', color: 'indigo' },
            { label: 'Categories', value: dashboardData?.stats.totalCategories || 0, icon: '📂', color: 'pink' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border border-white/20 p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`text-3xl p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600 dark:bg-${stat.color}-900/50`}>
                  {stat.icon}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* Low Stock Alert */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 transform transition-all hover:shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <span className="mr-2">Low Stock Alert</span>
                <span className="text-2xl">⚠️</span>
              </h2>
              <span className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 px-3 py-1 rounded-full text-sm font-semibold">
                {dashboardData?.lowStockItems?.length || 0} items
              </span>
            </div>

            {dashboardData?.lowStockItems?.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {dashboardData.lowStockItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-red-50/70 dark:bg-red-900/30 rounded-xl border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {item.quantity} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-3">✅</div>
                <p className="font-medium">All items are well stocked!</p>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard/notifications')}
              className="w-full mt-5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform transition-all hover:scale-105 active:scale-95"
            >
              View All Notifications →
            </button>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 transform transition-all hover:shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-5 flex items-center">
              <span className="mr-2">Top Selling Products</span>
              <span className="text-2xl">🏆</span>
            </h2>

            {dashboardData?.topProducts?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50/70 dark:bg-green-900/30 rounded-xl border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm"
                  >
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-sm font-bold mr-3 shadow-md">
                        #{index + 1}
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{product.name}</span>
                    </div>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {product.totalSold} sold
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-3">📊</div>
                <p className="font-medium">No sales data available yet</p>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard/transactions')}
              className="w-full mt-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform transition-all hover:scale-105 active:scale-95"
            >
              Go to transactions →
            </button>
          </div>
        </div>

        {/* Monthly Sales Trend */}
        {dashboardData?.monthlySales?.length > 0 && (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 mb-10">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <span className="mr-2">Monthly Sales Trend</span>
              <span className="text-2xl">📅</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dashboardData.monthlySales.slice(0).reverse().map((month, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                    {month.salesCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">sales</div>
                  <div className="mt-2 text-sm font-bold text-green-600 dark:text-green-400">
                    ${parseFloat(month.revenue || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
            <span className="mr-2">Quick Actions</span>
            <span className="text-2xl">⚡</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Manage Inventory', icon: '📦', route: '/dashboard/inventory', color: 'blue' },
              { label: 'Process Sale', icon: '🛒', route: '/dashboard/billing', color: 'green' },
              { label: 'Notifications', icon: '🔔', route: '/dashboard/notifications', color: 'yellow' },
              { label: 'Manage Offers', icon: '⭐', route: '/dashboard/offers', color: 'purple' },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => navigate(action.route)}
                className={`group flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 dark:from-${action.color}-900/50 dark:to-${action.color}-800/50 border border-${action.color}-200/50 dark:border-${action.color}-700/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95`}
              >
                <div className={`text-4xl mb-3 group-hover:animate-pulse`}>{action.icon}</div>
                <h3 className="font-bold text-gray-800 dark:text-white">{action.label}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {action.route === '/inventory' && 'View & edit items'}
                  {action.route === '/billing' && 'Create new bill'}
                  {action.route === '/notifications' && 'Check alerts'}
                  {action.route === '/offers' && 'Create promotions'}
                </p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;