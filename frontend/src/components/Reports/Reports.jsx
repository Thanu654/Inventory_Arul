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
  }, [activeReport, range]); // Re-fetch when report or date range changes

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
    
    // Profit calculation: Net Sales - Cost
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
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #333; margin-bottom: 5px; }
            .header .date { color: #666; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; }
            td { padding: 10px; border-bottom: 1px solid #dee2e6; }
            .total-row { font-weight: bold; background-color: #f8f9fa; }
            .low-stock { color: #dc3545; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
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
                  <td>${item.name}</td>
                  <td class="${item.quantity <= 10 ? 'low-stock' : ''}">${item.quantity}</td>
                  <td>${parseFloat(item.price || 0).toFixed(2)}</td>
                  <td>${item.cost_price ? parseFloat(item.cost_price).toFixed(2) : '-'}</td>
                  <td>${item.category || '-'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5">Total Products: ${inventory.length}</td>
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
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header with Report Selection */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">📊 Reports Dashboard</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setDateRangeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <span>📅</span>
            <span>Date Range</span>
          </button>
        </div>
      </div>

      {/* Report Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <button 
          onClick={() => setActiveReport('profit-summary')}
          className={`p-6 rounded-xl shadow-lg transition-all ${activeReport === 'profit-summary' ? 'ring-2 ring-blue-500 bg-gradient-to-r from-blue-50 to-blue-100' : 'bg-white hover:shadow-xl'}`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-bold text-lg mb-1">Profit Summary</h3>
            <p className="text-sm text-gray-600">With expenses</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveReport('inventory')}
          className={`p-6 rounded-xl shadow-lg transition-all ${activeReport === 'inventory' ? 'ring-2 ring-green-500 bg-gradient-to-r from-green-50 to-green-100' : 'bg-white hover:shadow-xl'}`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-bold text-lg mb-1">Inventory</h3>
            <p className="text-sm text-gray-600">Current stock</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveReport('product-history')}
          className={`p-6 rounded-xl shadow-lg transition-all ${activeReport === 'product-history' ? 'ring-2 ring-purple-500 bg-gradient-to-r from-purple-50 to-purple-100' : 'bg-white hover:shadow-xl'}`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-bold text-lg mb-1">Product History</h3>
            <p className="text-sm text-gray-600">Track movements</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveReport('sales')}
          className={`p-6 rounded-xl shadow-lg transition-all ${activeReport === 'sales' ? 'ring-2 ring-cyan-500 bg-gradient-to-r from-cyan-50 to-cyan-100' : 'bg-white hover:shadow-xl'}`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-bold text-lg mb-1">Sales Report</h3>
            <p className="text-sm text-gray-600">Invoice profit</p>
          </div>
        </button>

        <button 
          onClick={() => setActiveReport('expenses')}
          className={`p-6 rounded-xl shadow-lg transition-all ${activeReport === 'expenses' ? 'ring-2 ring-red-500 bg-gradient-to-r from-red-50 to-red-100' : 'bg-white hover:shadow-xl'}`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-3xl mb-3">💸</div>
            <h3 className="font-bold text-lg mb-1">Expenses</h3>
            <p className="text-sm text-gray-600">Business costs</p>
          </div>
        </button>
      </div>

      {/* Date Range Modal */}
      {dateRangeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Select Date Range</h3>
                <button 
                  onClick={() => setDateRangeModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={range.startDate}
                    onChange={e => setRange(r => ({...r, startDate: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={range.endDate}
                    onChange={e => setRange(r => ({...r, endDate: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setDateRangeModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setDateRangeModalOpen(false);
                    // Auto-refresh current report with new date range
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Loading...</span>
            </div>
          </div>
        </div>
      )}

      {/* Report Content Area */}
      <div className="bg-white rounded-xl shadow-lg">
        {/* Profit Summary Report */}
        {activeReport === 'profit-summary' && (
          <div>
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">💰 Profit Summary Report (with Expenses)</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDateRangeModalOpen(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    📅 Change Date
                  </button>
                  <button 
                    onClick={() => {
                      setRange({ startDate: '', endDate: '' });
                      fetchProfitSummaryDetail();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {profitSummaryDetail ? (
                <div className="space-y-8">
                  {/* Before Start Day Summary */}
                  {range.startDate && profitSummaryDetail.before_start_day && (
                    <div className="mb-6 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                      <h4 className="font-semibold mb-4 text-lg text-yellow-900">Before Start Day (Before {range.startDate})</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div className="bg-white p-4 rounded-lg border border-yellow-100">
                          <div className="text-sm text-gray-600 mb-2">Total Invoices</div>
                          <div className="font-bold text-2xl">{profitSummaryDetail.before_start_day.totals.total_invoices || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-yellow-100">
                          <div className="text-sm text-gray-600 mb-2">Total Sales</div>
                          <div className="font-bold text-2xl">{(profitSummaryDetail.before_start_day.totals.total_sales || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-yellow-100">
                          <div className="text-sm text-gray-600 mb-2">Total Cost</div>
                          <div className="font-bold text-2xl">{(profitSummaryDetail.before_start_day.totals.total_cost || 0).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg border border-yellow-100">
                          <div className="text-sm text-gray-600 mb-2">Total Profit</div>
                          <div className="font-bold text-2xl text-green-600">{(profitSummaryDetail.before_start_day.totals.total_profit || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-yellow-100">
                          <div className="text-sm text-gray-600 mb-2">Total Expenses</div>
                          <div className="font-bold text-2xl text-red-600">{(profitSummaryDetail.before_start_day.totals.total_expenses || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-yellow-100">
                          <div className="text-sm text-gray-600 mb-2 font-semibold">Net Profit</div>
                          <div className={`font-bold text-2xl ${(profitSummaryDetail.before_start_day.totals.net_profit || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {(profitSummaryDetail.before_start_day.totals.net_profit || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Period Summary */}
                  {profitSummaryDetail.selected_period && (
                    <div className="mb-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-semibold mb-4 text-lg text-blue-900">
                        Selected Period {range.startDate || range.endDate ? `(${range.startDate ? range.startDate : 'Start'} to ${range.endDate ? range.endDate : 'End'})` : ''}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                          <div className="text-sm text-gray-600 mb-2">Total Invoices</div>
                          <div className="font-bold text-2xl">{profitSummaryDetail.selected_period.totals.total_invoices || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                          <div className="text-sm text-gray-600 mb-2">Total Sales</div>
                          <div className="font-bold text-2xl">{(profitSummaryDetail.selected_period.totals.total_sales || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                          <div className="text-sm text-gray-600 mb-2">Total Cost</div>
                          <div className="font-bold text-2xl">{(profitSummaryDetail.selected_period.totals.total_cost || 0).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                          <div className="text-sm text-gray-600 mb-2">Total Profit (from invoices)</div>
                          <div className="font-bold text-2xl text-green-600">{(profitSummaryDetail.selected_period.totals.total_profit || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                          <div className="text-sm text-gray-600 mb-2">Total Expenses</div>
                          <div className="font-bold text-2xl text-red-600">{(profitSummaryDetail.selected_period.totals.total_expenses || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-blue-100">
                          <div className="text-sm text-gray-600 mb-2 font-semibold">Net Profit (Profit - Expenses)</div>
                          <div className={`font-bold text-2xl ${(profitSummaryDetail.selected_period.totals.net_profit || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {(profitSummaryDetail.selected_period.totals.net_profit || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Overall Summary */}
                  {profitSummaryDetail.overall && (
                    <div className="mb-6 p-6 bg-green-50 rounded-xl border border-green-200">
                      <h4 className="font-semibold mb-4 text-lg text-green-900">Overall Summary (All Time)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div className="bg-white p-4 rounded-lg border border-green-100">
                          <div className="text-sm text-gray-600 mb-2">Total Invoices</div>
                          <div className="font-bold text-2xl">{profitSummaryDetail.overall.totals.total_invoices || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-green-100">
                          <div className="text-sm text-gray-600 mb-2">Total Sales</div>
                          <div className="font-bold text-2xl">{(profitSummaryDetail.overall.totals.total_sales || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-green-100">
                          <div className="text-sm text-gray-600 mb-2">Total Cost</div>
                          <div className="font-bold text-2xl">{(profitSummaryDetail.overall.totals.total_cost || 0).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-4 rounded-lg border border-green-100">
                          <div className="text-sm text-gray-600 mb-2">Total Profit</div>
                          <div className="font-bold text-2xl text-green-600">{(profitSummaryDetail.overall.totals.total_profit || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-green-100">
                          <div className="text-sm text-gray-600 mb-2">Total Expenses</div>
                          <div className="font-bold text-2xl text-red-600">{(profitSummaryDetail.overall.totals.total_expenses || 0).toFixed(2)}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-green-100">
                          <div className="text-sm text-gray-600 mb-2 font-semibold">Net Profit</div>
                          <div className={`font-bold text-2xl ${(profitSummaryDetail.overall.totals.net_profit || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {(profitSummaryDetail.overall.totals.net_profit || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Invoice Details Table for Selected Period */}
                  {profitSummaryDetail.selected_period && profitSummaryDetail.selected_period.invoices && profitSummaryDetail.selected_period.invoices.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-4 text-lg">Invoice Details (Selected Period)</h4>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offers</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {profitSummaryDetail.selected_period.invoices.map((inv, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-semibold">{inv.invoice_number}</td>
                                <td className="px-4 py-3">{new Date(inv.date).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{inv.customer_name || 'Walk-in'}</td>
                                <td className="px-4 py-3">{inv.total_amount.toFixed(2)}</td>
                                <td className="px-4 py-3">{inv.cost_total.toFixed(2)}</td>
                                <td className="px-4 py-3">{inv.offer_amount.toFixed(2)}</td>
                                <td className="px-4 py-3 font-semibold" style={{ color: inv.profit >= 0 ? '#16a34a' : '#dc2626' }}>
                                  {inv.profit.toFixed(2)}
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
                      <h4 className="font-semibold mb-4 text-lg">Expense Details (Selected Period)</h4>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {profitSummaryDetail.selected_period.expenses.map((exp, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3">{new Date(exp.created_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-semibold">{exp.title}</td>
                                <td className="px-4 py-3">{exp.category || '-'}</td>
                                <td className="px-4 py-3 font-semibold text-red-600">{exp.amount.toFixed(2)}</td>
                                <td className="px-4 py-3 text-gray-600">{exp.note || '-'}</td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 font-semibold">
                              <td colSpan="3" className="px-4 py-3 text-right">Total Expenses:</td>
                              <td className="px-4 py-3 text-red-600">{(profitSummaryDetail.selected_period.expenses_total || 0).toFixed(2)}</td>
                              <td className="px-4 py-3"></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">No profit summary data loaded</div>
                  <button 
                    onClick={() => {
                      setRange({ startDate: '', endDate: '' });
                      fetchProfitSummaryDetail();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">📦 Inventory Report (Current Stock)</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={printInventoryReport}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    🖨️ Print Report
                  </button>
                  <button 
                    onClick={fetchInventory}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Report Generated</div>
                    <div className="font-semibold">{new Date().toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total Products</div>
                    <div className="font-bold text-2xl">{inventory.length}</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventory.map(i => (
                      <tr key={i.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{i.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${i.quantity <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {i.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3">{parseFloat(i.price || 0).toFixed(2)}</td>
                        <td className="px-4 py-3">{i.cost_price ? parseFloat(i.cost_price).toFixed(2) : '-'}</td>
                        <td className="px-4 py-3">{i.category || '-'}</td>
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
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">📈 Product History</h3>
              </div>
            </div>
            <div className="p-6">
              {/* Product History Filters */}
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
                    <input 
                      type="date" 
                      value={productHistoryFilter.date} 
                      onChange={e => setProductHistoryFilter(f => ({...f, date: e.target.value}))} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Load History
                    </button>
                  </div>
                </div>
                
                {selectedProduct && (
                  <div className="text-sm text-gray-700">
                    Selected: <span className="font-semibold text-purple-700">{selectedProduct.name}</span>
                    {historyData.avg_cost && (
                      <span className="ml-4">
                        Avg Cost: <span className="font-semibold">{historyData.avg_cost}</span>
                      </span>
                    )}
                    {typeof historyData.starting_qty !== 'undefined' && (
                      <span className="ml-4">
                        Starting Qty: <span className="font-semibold text-blue-600">{historyData.starting_qty}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Product History Table */}
              <div className="overflow-x-auto">
                {historyError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    <span className="font-semibold">Error:</span> {historyError}
                  </div>
                )}
                
                {historyData.data && historyData.data.length > 0 ? (
                  <>
                    <div className="mb-4 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Showing {historyData.data.length} records
                      </div>
                      <button 
                        onClick={() => fetchProductHistory(productFilter.itemId)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                      >
                        Refresh Data
                      </button>
                    </div>
                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice / Bill</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Running Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {historyData.data.map((h, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3">{h.date ? new Date(h.date).toLocaleString() : '-'}</td>
                            <td className="px-4 py-3 font-medium">{h.ref || h.invoice_or_bill || h.invoice_number || h.bill_number || h.purchase_id || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                (h.type || h.purchase_type || '').toLowerCase().includes('sale') 
                                  ? 'bg-green-100 text-green-800'
                                  : (h.type || h.purchase_type || '').toLowerCase().includes('purchase')
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {h.type || h.purchase_type || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold">{h.quantity != null ? h.quantity : '-'}</td>
                            <td className="px-4 py-3">{h.created_by || '-'}</td>
                            <td className="px-4 py-3 font-bold">{typeof h.running_qty !== 'undefined' ? h.running_qty : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {productFilter.itemId ? 'No history found for the selected product and date range.' : 'Select a product and click "Load History" to see data.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sales Report */}
        {activeReport === 'sales' && (
          <div>
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">💰 Invoice Profit Report</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDateRangeModalOpen(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    📅 Change Date
                  </button>
                  <button 
                    onClick={() => {
                      setRange({ startDate: '', endDate: '' });
                      fetchSalesReport();
                    }}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>
          


              <div className="p-6">
              {/* Summary Totals */}
              {salesReportData.purchases && salesReportData.purchases.length > 0 && (
                <div className="mb-6 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Gross Sales</div>
                      <div className="text-2xl font-bold text-gray-800">
                        ₹{calculateSalesTotals().grossSales.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Discount</div>
                      <div className="text-2xl font-bold text-amber-600">
                        ₹{calculateSalesTotals().totalDiscount.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Net Sales</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ₹{calculateSalesTotals().netSales.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Total Profit</div>
                      <div className={`text-2xl font-bold ${calculateSalesTotals().totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{calculateSalesTotals().totalProfit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                {salesReportData.purchases && salesReportData.purchases.length > 0 ? (
                  <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COGS</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offers</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salesReportData.purchases.map(p => (
                        <tr key={p.purchase_id || p.invoice_number} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold">{p.invoice_number ?? p.bill_number ?? p.purchase_id}</td>
                          <td className="px-4 py-3">{new Date(p.purchase_at).toLocaleString()}</td>
                          <td className="px-4 py-3">{p.customer_name || 'Walk-in'}</td>
                          <td className="px-4 py-3">{(p.total_amount ?? p.total_sales ?? p.sale_total_amount ?? 0).toFixed ? (parseFloat(p.total_amount ?? p.total_sales ?? p.sale_total_amount ?? 0).toFixed(2)) : (p.total_amount ?? p.total_sales ?? p.sale_total_amount ?? 0)}</td>
                          <td className="px-4 py-3">{(p.cost_total ?? p.total_cogs ?? p.sale_cost_total ?? 0).toFixed ? (parseFloat(p.cost_total ?? p.total_cogs ?? p.sale_cost_total ?? 0).toFixed(2)) : (p.cost_total ?? p.total_cogs ?? p.sale_cost_total ?? 0)}</td>
                          <td className="px-4 py-3">{(p.total_allocated_offer ?? p.total_offers ?? 0).toFixed ? (parseFloat(p.total_allocated_offer ?? p.total_offers ?? 0).toFixed(2)) : (p.total_allocated_offer ?? p.total_offers ?? 0)}</td>
                          <td className="px-4 py-3 font-semibold" style={{ 
                            color: (p.profit ?? ((p.total_amount ?? p.total_sales ?? 0) - (p.cost_total ?? p.total_cogs ?? 0) - (p.total_allocated_offer ?? 0))) >= 0 ? '#16a34a' : '#dc2626' 
                          }}>
                            {typeof (p.profit ?? ((p.total_amount ?? p.total_sales ?? 0) - (p.cost_total ?? p.total_cogs ?? 0) - (p.total_allocated_offer ?? 0))) === 'number' 
                              ? (p.profit ?? ((p.total_amount ?? p.total_sales ?? 0) - (p.cost_total ?? p.total_cogs ?? 0) - (p.total_allocated_offer ?? 0))).toFixed(2)
                              : 'N/A'
                            }
                          </td>
                          <td className="px-4 py-3">{p.created_by || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No sales data available. Try changing the date range or click Refresh.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expenses Report */}
        {activeReport === 'expenses' && (
          <div>
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">💸 Expenses</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDateRangeModalOpen(true)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    📅 Change Date
                  </button>
                  <button 
                    onClick={() => setExpenseModalOpen(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    ➕ Add Expense
                  </button>
                  <button 
                    onClick={() => {
                      setRange({ startDate: '', endDate: '' });
                      fetchExpenses();
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Expenses Summary */}
              {expenses.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Total Expenses</div>
                      <div className="text-2xl font-bold text-red-600">
                        ₹{calculateExpensesTotal().toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Number of Expenses</div>
                      <div className="font-bold text-xl">{expenses.length}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                {expenses.length > 0 ? (
                  <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {expenses.map(e => (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{new Date(e.created_at).toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium">{e.title}</td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              {e.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-red-600">₹{e.amount}</td>
                          <td className="px-4 py-3 text-gray-600">{e.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No expenses recorded. Click "Add Expense" to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">➕ Add New Expense</h3>
                <button 
                  onClick={() => setExpenseModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input 
                  required 
                  placeholder="Enter expense title"
                  value={expenseForm.title} 
                  onChange={e => setExpenseForm(f => ({...f, title: e.target.value}))} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input 
                  placeholder="e.g., Office Supplies, Utilities"
                  value={expenseForm.category} 
                  onChange={e => setExpenseForm(f => ({...f, category: e.target.value}))} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={expenseForm.amount} 
                  onChange={e => setExpenseForm(f => ({...f, amount: e.target.value}))} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea 
                  placeholder="Add any additional notes..."
                  value={expenseForm.note} 
                  onChange={e => setExpenseForm(f => ({...f, note: e.target.value}))} 
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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