import React, { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || '';

export default function Reports() {
  const [products, setProducts] = useState([]);
  const [totals, setTotals] = useState(null);
  const [profitSummary, setProfitSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState({ data: [], totals: {}, avg_cost: 0 });
  const [historyError, setHistoryError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [salesReportData, setSalesReportData] = useState({ purchases: [], byCustomer: [], totals: {} });
  const [productFilter, setProductFilter] = useState({ itemId: '', itemName: '' });
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ title: '', category: '', amount: '', note: '' });
  const [range, setRange] = useState({ startDate: '', endDate: '' });
  const [profitSummaryDetail, setProfitSummaryDetail] = useState(null);
  const [productHistoryFilter, setProductHistoryFilter] = useState({ date: '' });
  
  // New state for report selection
  const [activeReport, setActiveReport] = useState('profit-summary');
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [dateRangeModalOpen, setDateRangeModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load initial data based on active report
  useEffect(() => {
    switch(activeReport) {
      case 'profit-summary':
        fetchProfitSummaryDetail();
        break;
      case 'inventory':
        fetchInventory();
        break;
      case 'expenses':
        fetchExpenses();
        break;
      case 'sales':
        fetchSalesReport();
        break;
      default:
        break;
    }
  }, [activeReport, range]);

  // Initial load on component mount
  useEffect(() => {
    fetchProfitSummaryDetail();
    fetchExpenses();
    fetchInventory();
  }, []);

  // Keep all your existing fetch functions exactly as they are
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/items`);
      if (!res.ok) return;
      const json = await res.json();
      setInventory(json || []);
    } catch (err) {
      console.error('fetchInventory', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);
      if (productFilter.itemId) params.append('itemId', productFilter.itemId);
      if (productFilter.itemName) params.append('itemName', productFilter.itemName);
      const res = await fetch(`${API}/reports/products?${params.toString()}`);
      const json = await res.json();
      setProducts(json.data || []);
      setTotals(json.totals || null);
    } catch (err) {
      console.error('fetchReports', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfit = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);
      const res = await fetch(`${API}/reports/profit?${params.toString()}`);
      const json = await res.json();
      setProfitSummary(json || null);
    } catch (err) {
      console.error('fetchProfit', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);
      const res = await fetch(`${API}/reports/expenses?${params.toString()}`);
      const json = await res.json();
      setExpenses(json.data || []);
    } catch (err) {
      console.error('fetchExpenses', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductHistory = async (itemId) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (productHistoryFilter.date) {
        params.append('startDate', productHistoryFilter.date);
      }
      if (itemId) params.append('itemId', itemId);
      const res = await fetch(`${API}/reports/product-history?${params.toString()}`);
      const text = await res.text();
      try {
        const json = text ? JSON.parse(text) : null;
        if (!res.ok) {
          console.error('product-history error response', res.status, json);
          setHistoryError(json && json.message ? json.message : `Server error ${res.status}`);
          setHistoryData({ data: [], totals: {}, avg_cost: 0 });
        } else {
          setHistoryError(null);
          setHistoryData(json || { data: [], totals: {}, avg_cost: 0 });
        }
      } catch (parseErr) {
        console.error('product-history parse error', parseErr, 'body:', text);
        setHistoryError('Invalid JSON response from server');
        setHistoryData({ data: [], totals: {}, avg_cost: 0 });
      }
    } catch (err) {
      console.error('fetchProductHistory', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);
      const res = await fetch(`${API}/reports/sales?${params.toString()}`);
      const json = await res.json();
      setSalesReportData(json || { purchases: [], byCustomer: [], totals: {} });
    } catch (err) {
      console.error('fetchSalesReport', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfitSummaryDetail = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);
      const res = await fetch(`${API}/reports/profit-summary?${params.toString()}`);
      const json = await res.json();
      setProfitSummaryDetail(json || { invoices: [], expenses: 0, totals: {} });
    } catch (err) {
      console.error('fetchProfitSummaryDetail', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${API}/reports/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });
      const json = await res.json();
      if (res.ok) {
        setExpenses(prev => [json.data, ...prev]);
        setExpenseForm({ title: '', category: '', amount: '', note: '' });
        setExpenseModalOpen(false);
      } else {
        console.error('expense error', json);
      }
    } catch (err) {
      console.error('handleExpenseSubmit', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals for various reports
  const calculateSalesTotals = () => {
    if (!salesReportData.purchases || salesReportData.purchases.length === 0) {
      return { 
        grossSales: 0, 
        netSales: 0, 
        totalProfit: 0, 
        totalDiscount: 0 
      };
    }
    
    const totals = salesReportData.purchases.reduce((acc, purchase) => {
      const grossSales = parseFloat(purchase.total_amount ?? purchase.total_sales ?? purchase.sale_total_amount ?? 0) || 0;
      const discount = parseFloat(purchase.total_allocated_offer ?? purchase.total_offers ?? 0) || 0;
      const netSales = grossSales - discount;
      
      const cost = parseFloat(purchase.cost_total ?? purchase.total_cogs ?? purchase.sale_cost_total ?? 0) || 0;
      const profit = netSales - cost;
      
      return {
        grossSales: acc.grossSales + grossSales,
        netSales: acc.netSales + netSales,
        totalProfit: acc.totalProfit + profit,
        totalDiscount: acc.totalDiscount + discount
      };
    }, { 
      grossSales: 0, 
      netSales: 0, 
      totalProfit: 0, 
      totalDiscount: 0 
    });
    
    return totals;
  };

  const calculateExpensesTotal = () => {
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
  };

  // Print inventory report
  const printInventoryReport = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleString();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Inventory Report</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
            .header h1 { color: #111827; margin-bottom: 5px; font-weight: 600; }
            .header .date { color: #6b7280; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f9fafb; padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 500; color: #374151; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .total-row { font-weight: 600; background-color: #f9fafb; }
            .low-stock { color: #dc2626; font-weight: 500; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Inventory Report</h1>
            <div class="date">Generated on: ${currentDate}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Available Quantity</th>
                <th>Price</th>
                <th>Cost Price</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${inventory.map(item => `
                <tr>
                  <td style="font-weight: 500;">${item.name}</td>
                  <td class="${item.quantity <= 10 ? 'low-stock' : ''}">${item.quantity}</td>
                  <td>${parseFloat(item.price || 0).toFixed(2)}</td>
                  <td>${item.cost_price ? parseFloat(item.cost_price).toFixed(2) : '-'}</td>
                  <td>${item.category || '-'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5" style="text-align: center;">Total Products: ${inventory.length}</td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>Inventory Management System</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header with Report Selection */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">📊 Reports Dashboard</h1>
            <p className="text-gray-600">Comprehensive analytics and insights for your business</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setDateRangeModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="text-xl">📅</span>
              <span className="font-medium text-gray-700">Date Range</span>
            </button>
          </div>
        </div>

        {/* Report Selection Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <button 
            onClick={() => setActiveReport('profit-summary')}
            className={`p-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${activeReport === 'profit-summary' 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-100 ring-2 ring-blue-200' 
              : 'bg-white hover:shadow-lg border border-gray-100'}`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-base">Profit Summary</h3>
              <p className="text-xs opacity-80">With expenses</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveReport('inventory')}
            className={`p-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${activeReport === 'inventory' 
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-100 ring-2 ring-emerald-200' 
              : 'bg-white hover:shadow-lg border border-gray-100'}`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="text-3xl mb-2">📦</div>
              <h3 className="font-semibold text-base">Inventory</h3>
              <p className="text-xs opacity-80">Current stock</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveReport('product-history')}
            className={`p-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${activeReport === 'product-history' 
              ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl shadow-purple-100 ring-2 ring-purple-200' 
              : 'bg-white hover:shadow-lg border border-gray-100'}`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="text-3xl mb-2">📈</div>
              <h3 className="font-semibold text-base">Product History</h3>
              <p className="text-xs opacity-80">Track movements</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveReport('sales')}
            className={`p-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${activeReport === 'sales' 
              ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-xl shadow-cyan-100 ring-2 ring-cyan-200' 
              : 'bg-white hover:shadow-lg border border-gray-100'}`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="text-3xl mb-2">📋</div>
              <h3 className="font-semibold text-base">Sales Report</h3>
              <p className="text-xs opacity-80">Invoice profit</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveReport('expenses')}
            className={`p-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 ${activeReport === 'expenses' 
              ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-xl shadow-rose-100 ring-2 ring-rose-200' 
              : 'bg-white hover:shadow-lg border border-gray-100'}`}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div className="text-3xl mb-2">💸</div>
              <h3 className="font-semibold text-base">Expenses</h3>
              <p className="text-xs opacity-80">Business costs</p>
            </div>
          </button>
        </div>
      </div>

      {/* Date Range Modal */}
      {dateRangeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Select Date Range</h3>
                <button 
                  onClick={() => setDateRangeModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={range.startDate}
                    onChange={e => setRange(r => ({...r, startDate: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={range.endDate}
                    onChange={e => setRange(r => ({...r, endDate: e.target.value}))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => setDateRangeModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setDateRangeModalOpen(false);
                    switch(activeReport) {
                      case 'profit-summary':
                        fetchProfitSummaryDetail();
                        break;
                      case 'expenses':
                        fetchExpenses();
                        break;
                      case 'sales':
                        fetchSalesReport();
                        break;
                      default:
                        break;
                    }
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Apply & Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              <div>
                <div className="font-semibold text-gray-900">Loading data...</div>
                <div className="text-sm text-gray-500">Please wait a moment</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Content Area */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Profit Summary Report */}
        {activeReport === 'profit-summary' && (
          <div>
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">💰 Profit Summary Report</h3>
                  <p className="text-gray-600 mt-1">Comprehensive profit analysis with expense breakdown</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDateRangeModalOpen(true)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center gap-2"
                  >
                    📅 Change Date
                  </button>
                  <button 
                    onClick={() => {
                      setRange({ startDate: '', endDate: '' });
                      fetchProfitSummaryDetail();
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              {profitSummaryDetail ? (
                <div className="space-y-8">
                  {/* Before Start Day Summary */}
                  {range.startDate && profitSummaryDetail.before_start_day && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-amber-50/50 rounded-2xl border border-amber-200">
                      <h4 className="font-semibold text-lg text-amber-900 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                        Before Start Day (Before {range.startDate})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Invoices</div>
                          <div className="font-bold text-3xl">{profitSummaryDetail.before_start_day.totals.total_invoices || 0}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Sales</div>
                          <div className="font-bold text-3xl">₹{(profitSummaryDetail.before_start_day.totals.total_sales || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Cost</div>
                          <div className="font-bold text-3xl">₹{(profitSummaryDetail.before_start_day.totals.total_cost || 0).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Profit</div>
                          <div className="font-bold text-3xl text-emerald-600">₹{(profitSummaryDetail.before_start_day.totals.total_profit || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Expenses</div>
                          <div className="font-bold text-3xl text-rose-600">₹{(profitSummaryDetail.before_start_day.totals.total_expenses || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2 font-semibold">Net Profit</div>
                          <div className={`font-bold text-3xl ${(profitSummaryDetail.before_start_day.totals.net_profit || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            ₹{(profitSummaryDetail.before_start_day.totals.net_profit || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Period Summary */}
                  {profitSummaryDetail.selected_period && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-2xl border border-blue-200">
                      <h4 className="font-semibold text-lg text-blue-900 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        Selected Period {range.startDate || range.endDate ? `(${range.startDate ? range.startDate : 'Start'} to ${range.endDate ? range.endDate : 'End'})` : ''}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Invoices</div>
                          <div className="font-bold text-3xl">{profitSummaryDetail.selected_period.totals.total_invoices || 0}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Sales</div>
                          <div className="font-bold text-3xl">₹{(profitSummaryDetail.selected_period.totals.total_sales || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Cost</div>
                          <div className="font-bold text-3xl">₹{(profitSummaryDetail.selected_period.totals.total_cost || 0).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Profit (from invoices)</div>
                          <div className="font-bold text-3xl text-emerald-600">₹{(profitSummaryDetail.selected_period.totals.total_profit || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Expenses</div>
                          <div className="font-bold text-3xl text-rose-600">₹{(profitSummaryDetail.selected_period.totals.total_expenses || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2 font-semibold">Net Profit (Profit - Expenses)</div>
                          <div className={`font-bold text-3xl ${(profitSummaryDetail.selected_period.totals.net_profit || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            ₹{(profitSummaryDetail.selected_period.totals.net_profit || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overall Summary */}
                  {profitSummaryDetail.overall && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-emerald-50 to-emerald-50/50 rounded-2xl border border-emerald-200">
                      <h4 className="font-semibold text-lg text-emerald-900 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                        Overall Summary (All Time)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Invoices</div>
                          <div className="font-bold text-3xl">{profitSummaryDetail.overall.totals.total_invoices || 0}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Sales</div>
                          <div className="font-bold text-3xl">₹{(profitSummaryDetail.overall.totals.total_sales || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Cost</div>
                          <div className="font-bold text-3xl">₹{(profitSummaryDetail.overall.totals.total_cost || 0).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Profit</div>
                          <div className="font-bold text-3xl text-emerald-600">₹{(profitSummaryDetail.overall.totals.total_profit || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2">Total Expenses</div>
                          <div className="font-bold text-3xl text-rose-600">₹{(profitSummaryDetail.overall.totals.total_expenses || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm">
                          <div className="text-sm text-gray-600 mb-2 font-semibold">Net Profit</div>
                          <div className={`font-bold text-3xl ${(profitSummaryDetail.overall.totals.net_profit || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            ₹{(profitSummaryDetail.overall.totals.net_profit || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Invoice Details Table for Selected Period */}
                  {profitSummaryDetail.selected_period && profitSummaryDetail.selected_period.invoices && profitSummaryDetail.selected_period.invoices.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-lg mb-6 text-gray-800">Invoice Details (Selected Period)</h4>
                      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Invoice #</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Sales</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Offers</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Profit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {profitSummaryDetail.selected_period.invoices.map((inv, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-gray-900">{inv.invoice_number}</td>
                                <td className="px-6 py-4 text-gray-600">{new Date(inv.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium">{inv.customer_name || 'Walk-in'}</td>
                                <td className="px-6 py-4 font-medium">₹{inv.total_amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-gray-600">₹{inv.cost_total.toFixed(2)}</td>
                                <td className="px-6 py-4 text-gray-600">₹{inv.offer_amount.toFixed(2)}</td>
                                <td className="px-6 py-4 font-semibold" style={{ color: inv.profit >= 0 ? '#059669' : '#dc2626' }}>
                                  ₹{inv.profit.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Expense Details Table for Selected Period */}
                  {profitSummaryDetail.selected_period && profitSummaryDetail.selected_period.expenses && profitSummaryDetail.selected_period.expenses.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-semibold text-lg mb-6 text-gray-800">Expense Details (Selected Period)</h4>
                      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {profitSummaryDetail.selected_period.expenses.map((exp, idx) => (
                              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-gray-600">{new Date(exp.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{exp.title}</td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                    {exp.category || 'Uncategorized'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-semibold text-rose-600">₹{exp.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-gray-600">{exp.note || '-'}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 font-semibold">
                              <td colSpan="3" className="px-6 py-4 text-right text-gray-700">Total Expenses:</td>
                              <td className="px-6 py-4 text-rose-600">₹{(profitSummaryDetail.selected_period.expenses_total || 0).toFixed(2)}</td>
                              <td className="px-6 py-4"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-gray-400 mb-6">
                    <div className="text-6xl mb-4">📊</div>
                    <div className="text-xl font-medium text-gray-600 mb-2">No profit summary data loaded</div>
                    <p className="text-gray-500">Try refreshing or check your connection</p>
                  </div>
                  <button 
                    onClick={() => {
                      setRange({ startDate: '', endDate: '' });
                      fetchProfitSummaryDetail();
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    Load Profit Summary
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inventory Report */}
        {activeReport === 'inventory' && (
          <div>
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-emerald-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">📦 Inventory Report</h3>
                  <p className="text-gray-600 mt-1">Current stock levels and product information</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={printInventoryReport}
                    className="px-4 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    🖨️ Print Report
                  </button>
                  <button 
                    onClick={fetchInventory}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="mb-6 p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-sm opacity-90">Report Generated</div>
                    <div className="font-semibold text-xl">{new Date().toLocaleString()}</div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-sm opacity-90">Total Products in Stock</div>
                    <div className="font-bold text-4xl">{inventory.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Available Qty</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cost Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventory.map(i => (
                      <tr key={i.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{i.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${i.quantity <= 10 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                            {i.quantity} {i.quantity <= 10 && '⚠️'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">₹{parseFloat(i.price || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-600">{i.cost_price ? `₹${parseFloat(i.cost_price).toFixed(2)}` : '-'}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {i.category || 'Uncategorized'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Product History Report */}
        {activeReport === 'product-history' && (
          <div>
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-purple-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">📈 Product History</h3>
                  <p className="text-gray-600 mt-1">Track product movements and inventory changes</p>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              {/* Product History Filters */}
              <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-2xl border border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
                    <input 
                      type="date" 
                      value={productHistoryFilter.date} 
                      onChange={e => setProductHistoryFilter(f => ({...f, date: e.target.value}))} 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
                    <select 
                      value={productFilter.itemId} 
                      onChange={e => {
                        const id = e.target.value;
                        const item = inventory.find(it => String(it.id) === String(id));
                        setProductFilter(f => ({ ...f, itemId: id, itemName: item ? item.name : '' }));
                        if (item) setSelectedProduct({ id: item.id, name: item.name });
                        else setSelectedProduct(null);
                      }} 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
                    >
                      <option value="">-- Select product --</option>
                      {inventory.map(i => (
                        <option key={i.id} value={i.id}>{i.name} (ID: {i.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => {
                        if (productFilter.itemId) {
                          fetchProductHistory(productFilter.itemId);
                        }
                      }}
                      disabled={!productFilter.itemId}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Load History
                    </button>
                  </div>
                </div>
                
                {selectedProduct && (
                  <div className="text-sm text-gray-700 bg-white/50 p-3 rounded-lg">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="font-medium">Selected: <span className="text-purple-700">{selectedProduct.name}</span></span>
                      {historyData.avg_cost && (
                        <span className="flex items-center gap-1">
                          <span className="text-gray-600">Avg Cost:</span>
                          <span className="font-semibold">₹{historyData.avg_cost}</span>
                        </span>
                      )}
                      {typeof historyData.starting_qty !== 'undefined' && (
                        <span className="flex items-center gap-1">
                          <span className="text-gray-600">Starting Qty:</span>
                          <span className="font-semibold text-blue-600">{historyData.starting_qty}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product History Table */}
              <div>
                {historyError && (
                  <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <span className="font-semibold">Error:</span> {historyError}
                    </div>
                  </div>
                )}
                
                {historyData.data && historyData.data.length > 0 ? (
                  <>
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {historyData.data.length} records
                      </div>
                      <button 
                        onClick={() => fetchProductHistory(productFilter.itemId)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 rounded-xl hover:bg-purple-200 font-medium transition-colors border border-purple-200"
                      >
                        Refresh Data
                      </button>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Invoice / Bill</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created By</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Running Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {historyData.data.map((h, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 text-gray-600">{h.date ? new Date(h.date).toLocaleString() : '-'}</td>
                              <td className="px-6 py-4 font-medium text-gray-900">{h.ref || h.invoice_or_bill || h.invoice_number || h.bill_number || h.purchase_id || '-'}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                                  (h.type || h.purchase_type || '').toLowerCase().includes('sale') 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : (h.type || h.purchase_type || '').toLowerCase().includes('purchase')
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                  {h.type || h.purchase_type || '-'}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold">{h.quantity != null ? h.quantity : '-'}</td>
                              <td className="px-6 py-4 text-gray-600">{h.created_by || '-'}</td>
                              <td className="px-6 py-4 font-bold text-gray-900">{typeof h.running_qty !== 'undefined' ? h.running_qty : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4 text-gray-300">📋</div>
                    <div className="text-xl font-medium text-gray-600 mb-2">
                      {productFilter.itemId ? 'No history found' : 'Select a product'}
                    </div>
                    <p className="text-gray-500">
                      {productFilter.itemId 
                        ? 'No historical data for the selected product and date range.' 
                        : 'Choose a product and click "Load History" to see its transaction history.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sales Report */}
        {activeReport === 'sales' && (
          <div>
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-cyan-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">💰 Invoice Profit Report</h3>
                  <p className="text-gray-600 mt-1">Detailed sales analysis with profit margins</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDateRangeModalOpen(true)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center gap-2"
                  >
                    📅 Change Date
                  </button>
                  <button 
                    onClick={() => {
                      setRange({ startDate: '', endDate: '' });
                      fetchSalesReport();
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Summary Totals */}
              {salesReportData.purchases && salesReportData.purchases.length > 0 && (
                <div className="mb-6 p-5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl shadow-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm opacity-90 mb-1">Gross Sales</div>
                      <div className="text-2xl font-bold">
                        ₹{calculateSalesTotals().grossSales.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm opacity-90 mb-1">Discount</div>
                      <div className="text-2xl font-bold text-amber-200">
                        ₹{calculateSalesTotals().totalDiscount.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm opacity-90 mb-1">Net Sales</div>
                      <div className="text-2xl font-bold">
                        ₹{calculateSalesTotals().netSales.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm opacity-90 mb-1">Total Profit</div>
                      <div className={`text-2xl font-bold ${calculateSalesTotals().totalProfit >= 0 ? 'text-emerald-200' : 'text-rose-200'}`}>
                        ₹{calculateSalesTotals().totalProfit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                {salesReportData.purchases && salesReportData.purchases.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Invoice#</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Sales</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">COGS</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Offers</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Profit</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {salesReportData.purchases.map(p => (
                        <tr key={p.purchase_id || p.invoice_number} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-gray-900">{p.invoice_number ?? p.bill_number ?? p.purchase_id}</td>
                          <td className="px-6 py-4 text-gray-600">{new Date(p.purchase_at).toLocaleString()}</td>
                          <td className="px-6 py-4 font-medium">{p.customer_name || 'Walk-in'}</td>
                          <td className="px-6 py-4 font-medium">₹{(p.total_amount ?? p.total_sales ?? p.sale_total_amount ?? 0).toFixed ? (parseFloat(p.total_amount ?? p.total_sales ?? p.sale_total_amount ?? 0).toFixed(2)) : (p.total_amount ?? p.total_sales ?? p.sale_total_amount ?? 0)}</td>
                          <td className="px-6 py-4 text-gray-600">₹{(p.cost_total ?? p.total_cogs ?? p.sale_cost_total ?? 0).toFixed ? (parseFloat(p.cost_total ?? p.total_cogs ?? p.sale_cost_total ?? 0).toFixed(2)) : (p.cost_total ?? p.total_cogs ?? p.sale_cost_total ?? 0)}</td>
                          <td className="px-6 py-4 text-gray-600">₹{(p.total_allocated_offer ?? p.total_offers ?? 0).toFixed ? (parseFloat(p.total_allocated_offer ?? p.total_offers ?? 0).toFixed(2)) : (p.total_allocated_offer ?? p.total_offers ?? 0)}</td>
                          <td className="px-6 py-4 font-semibold" style={{ 
                            color: (p.profit ?? ((p.total_amount ?? p.total_sales ?? 0) - (p.cost_total ?? p.total_cogs ?? 0) - (p.total_allocated_offer ?? 0))) >= 0 ? '#059669' : '#dc2626' 
                          }}>
                            {typeof (p.profit ?? ((p.total_amount ?? p.total_sales ?? 0) - (p.cost_total ?? p.total_cogs ?? 0) - (p.total_allocated_offer ?? 0))) === 'number' 
                              ? `₹${(p.profit ?? ((p.total_amount ?? p.total_sales ?? 0) - (p.cost_total ?? p.total_cogs ?? 0) - (p.total_allocated_offer ?? 0))).toFixed(2)}`
                              : 'N/A'
                            }
                          </td>
                          <td className="px-6 py-4 text-gray-600">{p.created_by || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4 text-gray-300">💰</div>
                    <div className="text-xl font-medium text-gray-600 mb-2">No sales data available</div>
                    <p className="text-gray-500">Try changing the date range or click Refresh</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expenses Report */}
        {activeReport === 'expenses' && (
          <div>
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-rose-50/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">💸 Expenses</h3>
                  <p className="text-gray-600 mt-1">Track and manage business expenses</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDateRangeModalOpen(true)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors flex items-center gap-2"
                  >
                    📅 Change Date
                  </button>
                  <button 
                    onClick={() => setExpenseModalOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    ➕ Add Expense
                  </button>
                  <button 
                    onClick={() => {
                      setRange({ startDate: '', endDate: '' });
                      fetchExpenses();
                    }}
                    className="px-4 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-medium shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              {/* Expenses Summary */}
              {expenses.length > 0 && (
                <div className="mb-6 p-5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl shadow-lg">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-sm opacity-90">Total Expenses</div>
                      <div className="text-3xl font-bold">
                        ₹{calculateExpensesTotal().toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <div className="text-sm opacity-90">Number of Expenses</div>
                      <div className="font-bold text-3xl">{expenses.length}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                {expenses.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {expenses.map(e => (
                        <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-gray-600">{new Date(e.created_at).toLocaleString()}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{e.title}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                              {e.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-rose-600">₹{e.amount}</td>
                          <td className="px-6 py-4 text-gray-600">{e.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4 text-gray-300">💸</div>
                    <div className="text-xl font-medium text-gray-600 mb-2">No expenses recorded</div>
                    <p className="text-gray-500">Click "Add Expense" to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-rose-50/50">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">➕ Add New Expense</h3>
                <button 
                  onClick={() => setExpenseModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input 
                  required 
                  placeholder="Enter expense title"
                  value={expenseForm.title} 
                  onChange={e => setExpenseForm(f => ({...f, title: e.target.value}))} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input 
                  placeholder="e.g., Office Supplies, Utilities"
                  value={expenseForm.category} 
                  onChange={e => setExpenseForm(f => ({...f, category: e.target.value}))} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={expenseForm.amount} 
                  onChange={e => setExpenseForm(f => ({...f, amount: e.target.value}))} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea 
                  placeholder="Add any additional notes..."
                  value={expenseForm.note} 
                  onChange={e => setExpenseForm(f => ({...f, note: e.target.value}))} 
                  rows="3"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 focus:outline-none transition-all"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}