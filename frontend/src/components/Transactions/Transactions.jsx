import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, transaction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    total_amount: '',
    items: []
  });

  // Handle Today filter
  const handleTodayFilter = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
    setSelectedMonth('');
    setCurrentPage(1);
  };

  // Handle Month change
  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    
    if (month) {
      const [year, monthNum] = month.split('-');
      const firstDay = new Date(year, monthNum - 1, 1);
      const lastDay = new Date(year, monthNum, 0);
      
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else {
      setStartDate('');
      setEndDate('');
    }
    setCurrentPage(1);
  };

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users`);
        if (res.ok) {
          const usersData = await res.json();
          setUsers(usersData);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filterType, selectedUserId, startDate, endDate, selectedMonth]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      if (filterType === 'sale') {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sales`);
        if (!res.ok) throw new Error('Failed to fetch sales');
        const rows = await res.json();
        let mapped = rows.map(r => ({
          id: r.id,
          bill_number: r.invoice_number || r.bill_number || null,
          customer_name: r.customer_name || r.customer || 'Walk-in Customer',
          total_amount: r.total_amount,
          created_at: r.created_at,
          source: 'sale',
          raw: r
        }));
        
        mapped = applyFilters(mapped);
        setTransactions(mapped);
        return;
      }

      if (filterType === 'supplier') {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases?type=supplier`);
        if (!res.ok) throw new Error('Failed to fetch supplier purchases');
        const rows = await res.json();
        let mapped = rows.map(r => ({
          id: r.id,
          bill_number: r.bill_number || null,
          customer_name: r.customer_name || r.supplier_name || 'Supplier',
          total_amount: r.total_amount,
          created_at: r.created_at,
          source: 'purchase',
          raw: r
        }));
        
        mapped = applyFilters(mapped);
        setTransactions(mapped);
        return;
      }

      const [resSales, resPurchases] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/sales`),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases?type=supplier`)
      ]);
      if (!resSales.ok || !resPurchases.ok) throw new Error('Failed to fetch transactions');
      const [salesRows, purchasesRows] = await Promise.all([resSales.json(), resPurchases.json()]);
      const salesMapped = salesRows.map(r => ({
        id: r.id,
        bill_number: r.invoice_number || null,
        customer_name: r.customer_name || 'Walk-in Customer',
        total_amount: r.total_amount,
        created_at: r.created_at,
        source: 'sale',
        raw: r
      }));
      const purchasesMapped = purchasesRows.map(r => ({
        id: r.id,
        bill_number: r.bill_number || null,
        customer_name: r.customer_name || 'Supplier',
        total_amount: r.total_amount,
        created_at: r.created_at,
        source: 'purchase',
        raw: r
      }));
      let merged = [...salesMapped, ...purchasesMapped];
      
      merged = applyFilters(merged);
      merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTransactions(merged);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    let filtered = data;

    if (selectedUserId) {
      filtered = filtered.filter(t => {
        const createdByName = t.raw?.created_by;
        const createdById = t.raw?.created_by_id;
        
        if (createdById && createdById.toString() === selectedUserId) return true;
        
        const user = users.find(u => u.id.toString() === selectedUserId);
        if (user && createdByName === user.name) return true;
        
        return false;
      });
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(t => new Date(t.created_at) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.created_at) <= end);
    }

    return filtered;
  };

  const fetchPurchaseItems = async (transaction) => {
    try {
      setLoadingItems(true);
      let url;
      if (transaction.source === 'sale') {
        url = `${import.meta.env.VITE_API_BASE_URL}/sales/${transaction.id}`;
      } else {
        url = `${import.meta.env.VITE_API_BASE_URL}/purchases/${transaction.id}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction items');
      }
      const data = await response.json();
      setPurchaseItems(data.items || []);
      setTransactionDetails(data.sale || data.purchase || null);
    } catch (err) {
      toast.error('Error fetching transaction details: ' + err.message);
      console.error('Error fetching transaction items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const openViewModal = async (transaction) => {
    setViewingTransaction(transaction);
    setIsViewModalOpen(true);
    await fetchPurchaseItems(transaction);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingTransaction(null);
    setPurchaseItems([]);
    setTransactionDetails(null);
  };

  const openEditModal = async (transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      bill_number: transaction.bill_number || transaction.raw?.invoice_number || '',
      customer_name: transaction.customer_name || '',
      total_amount: transaction.total_amount || '',
      items: []
    });

    try {
      const url = transaction.source === 'sale'
        ? `${import.meta.env.VITE_API_BASE_URL}/sales/${transaction.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/purchases/${transaction.id}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const items = data.items || [];
        const norm = items.map(it => ({
          item_id: it.item_id ?? it.itemId ?? null,
          name: it.name || it.itemName || '',
          price: parseFloat(it.price ?? it.item_price ?? it.itemPrice ?? 0),
          quantity: parseInt(it.quantity) || 0,
          total_price: parseFloat(it.total_price ?? it.totalPrice ?? it.total ?? 0)
        }));

        setEditFormData(prev => ({
          ...prev,
          items: norm,
          bill_number: data.sale?.invoice_number ?? data.purchase?.bill_number ?? prev.bill_number,
          customer_name: data.sale?.customer_name ?? data.purchase?.customer_name ?? prev.customer_name,
          total_amount: data.sale?.total_amount ?? data.purchase?.total_amount ?? prev.total_amount
        }));
      }
    } catch (err) {
      console.error('Error fetching items for edit:', err);
    }

    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
    setEditFormData({
      customer_name: '',
      total_amount: '',
      items: []
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemQuantityChange = (itemIndex, quantity) => {
    const numQuantity = parseInt(quantity) || 0;
    setEditFormData(prev => ({
      ...prev,
      items: prev.items.map((item, index) => {
        if (index === itemIndex) {
          const newTotalPrice = parseFloat(item.price) * numQuantity;
          return { ...item, quantity: numQuantity, total_price: newTotalPrice };
        }
        return item;
      })
    }));
    
    const newTotal = editFormData.items.reduce((sum, item, index) => {
      if (index === itemIndex) {
        return sum + (parseFloat(item.price) * numQuantity);
      }
      return sum + parseFloat(item.total_price || 0);
    }, 0);
    
    setEditFormData(prev => ({
      ...prev,
      total_amount: newTotal.toFixed(2)
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editFormData.customer_name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (!editFormData.total_amount || parseFloat(editFormData.total_amount) <= 0) {
      toast.error('Valid total amount is required');
      return;
    }

    try {
      let url, body;
      if (editingTransaction.source === 'sale') {
        url = `${import.meta.env.VITE_API_BASE_URL}/sales/${editingTransaction.id}`;
        body = {
          billNumber: editFormData.bill_number || editFormData.billNumber || null,
          customerName: editFormData.customer_name.trim(),
          totalAmount: parseFloat(editFormData.total_amount),
          items: editFormData.items.map(item => ({
            itemId: item.item_id,
            itemName: item.name,
            itemPrice: item.price,
            quantity: item.quantity,
            totalPrice: item.total_price
          }))
        };
      } else {
        url = `${import.meta.env.VITE_API_BASE_URL}/purchases/${editingTransaction.id}`;
        body = {
          customer_name: editFormData.customer_name.trim(),
          total_amount: parseFloat(editFormData.total_amount),
          items: editFormData.items.map(item => ({
            item_id: item.item_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total_price: item.total_price
          }))
        };
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update transaction');
      }

      toast.success('Transaction updated successfully!');
      closeEditModal();
      fetchTransactions();
    } catch (err) {
      toast.error('Error updating transaction: ' + err.message);
    }
  };

  const confirmDelete = (transaction) => {
    setDeleteConfirm({ show: true, transaction });
  };

  const handleDelete = async () => {
    try {
      const id = deleteConfirm.transaction.id;
      const endpoint = deleteConfirm.transaction.source === 'sale'
        ? `${import.meta.env.VITE_API_BASE_URL}/sales/${id}`
        : `${import.meta.env.VITE_API_BASE_URL}/purchases/${id}`;

      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete transaction');
      }

      toast.success('Transaction deleted successfully!');
      setDeleteConfirm({ show: false, transaction: null });
      fetchTransactions();
    } catch (err) {
      toast.error('Error deleting transaction: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L5.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchTransactions}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm hover:shadow-md transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        {/* Filter Tabs */}
      
      <div className='flex flex-row items-center justify-between'>
        <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-200 mb-6 inline-flex">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${filterType === 'all' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-50'}`}
          >
            All Transactions
          </button>
          <button 
            onClick={() => setFilterType('sale')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${filterType === 'sale' 
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Sales
          </button>
          <button 
            onClick={() => setFilterType('supplier')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${filterType === 'supplier' 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Purchases
          </button>
        </div>
        <div className="flex flex-row items-center justify-between gap-4">
          <button
              onClick={fetchTransactions}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all border border-blue-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
                Refresh
          </button>
          {/* Clear Filters Button */}
            <button
                onClick={() => {
                  setSelectedUserId('');
                  setStartDate('');
                  setEndDate('');
                  setSelectedMonth('');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all border border-blue-600"
              >
                Clear Filters
          </button>
        </div>
      </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
         <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900">Filter Transactions</h3>
            </div>
            
            {/* Badge - Pill style */}
            <span className="bg-blue-200 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full">
              {transactions.filter(t => {
                if (filterType === 'all') return true;
                if (filterType === 'supplier') return t.source === 'purchase';
                if (filterType === 'sale') return t.source === 'sale';
                return true;
              }).length} transactions
            </span>
          </div>
        </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Created By Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSelectedMonth('');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSelectedMonth('');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>

            {/* Today Button */}
            <div className="flex items-end">
              <button
                onClick={handleTodayFilter}
                className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-md hover:shadow-lg"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4 text-gray-300">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or add new transactions</p>
            <button
              onClick={() => {
                setSelectedUserId('');
                setStartDate('');
                setEndDate('');
                setFilterType('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 font-medium shadow-sm hover:shadow-md transition-all"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(() => {
                    const filtered = transactions.filter(t => {
                      if (filterType === 'all') return true;
                      if (filterType === 'supplier') return (t.source === 'purchase');
                      if (filterType === 'sale') return (t.source === 'sale');
                      return true;
                    });
                    const totalPages = Math.ceil(filtered.length / transactionsPerPage);
                    const currentTransactions = filtered.slice(
                      (currentPage - 1) * transactionsPerPage,
                      currentPage * transactionsPerPage
                    );

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="px-8 py-12 text-center">
                            <div className="text-gray-400">
                              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.801 0A2.25 2.25 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                              </svg>
                              <p className="text-lg font-medium text-gray-500">No transactions for selected filter</p>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return currentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50/50 transition-colors duration-200 group">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-50 transition-colors">
                              <span className="text-sm font-semibold text-gray-700">#{transaction.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{transaction.customer_name || 'N/A'}</div>
                            {transaction.bill_number && (
                              <div className="text-sm text-gray-500">#{transaction.bill_number}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${transaction.source === 'sale' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                            {transaction.source === 'sale' ? '+' : '-'}$
                            {(() => {
                              const subtotal = parseFloat(transaction.total_amount) || 0;
                              const discount = parseFloat(transaction.raw?.offer_amount ?? 0);
                              const total = subtotal - discount;
                              return Math.max(total, 0).toFixed(2);
                            })()}
                          </div>
                        </td>
                        <td className="px-8 py-4 text-sm text-gray-600">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{transaction.raw?.created_by || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${transaction.source === 'purchase' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-purple-100 text-purple-800 border border-purple-200'}`}>
                            {transaction.source === 'purchase' ? '📥 Purchase' : '💰 Sale'}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openViewModal(transaction)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openEditModal(transaction)}
                              className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => confirmDelete(transaction)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            
            {/* Page Total */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(transactions.filter(t => {
                    if (filterType === 'all') return true;
                    if (filterType === 'supplier') return (t.source === 'purchase');
                    if (filterType === 'sale') return (t.source === 'sale');
                    return true;
                  }).length / transactionsPerPage)}
                </div>
                
                {/* Total Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  {/* Sales Total */}
                  <div className="bg-white rounded-xl shadow-md border-l-4 border-emerald-500 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Sales Total</p>
                        <p className="text-3xl font-bold text-emerald-600">
                          +${(() => {
                          const filtered = transactions.filter(t => {
                            if (filterType === 'all') return (t.source === 'sale');
                            if (filterType === 'supplier') return false;
                            if (filterType === 'sale') return (t.source === 'sale');
                            return false;
                          });
                          // Sum over the entire filtered set (ignore pagination)
                          const salesTotal = filtered.reduce((sum, transaction) => {
                            const subtotal = parseFloat(transaction.total_amount) || 0;
                            const discount = parseFloat(transaction.raw?.offer_amount ?? 0);
                            const total = subtotal - discount;
                            return sum + Math.max(total, 0);
                          }, 0);
                          return salesTotal.toFixed(2);
                        })()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Supplier Total */}
                  <div className="bg-white rounded-xl shadow-md border-l-4 border-red-500 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Supplier Total</p>
                        <p className="text-3xl font-bold text-red-600">
                          -${(() => {
                          const filtered = transactions.filter(t => {
                            if (filterType === 'all') return (t.source === 'purchase');
                            if (filterType === 'supplier') return (t.source === 'purchase');
                            if (filterType === 'sale') return false;
                            return false;
                          });
                          // Sum over the entire filtered set (ignore pagination)
                          const supplierTotal = filtered.reduce((sum, transaction) => {
                            const subtotal = parseFloat(transaction.total_amount) || 0;
                            const discount = parseFloat(transaction.raw?.offer_amount ?? 0);
                            const total = subtotal - discount;
                            return sum + Math.max(total, 0);
                          }, 0);
                          return supplierTotal.toFixed(2);
                        })()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Net Total */}
                  <div className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Net Total</p>
                        <p className="text-3xl font-bold text-blue-600">
                          ${(() => {
                          const filtered = transactions.filter(t => {
                            if (filterType === 'all') return true;
                            if (filterType === 'supplier') return (t.source === 'purchase');
                            if (filterType === 'sale') return (t.source === 'sale');
                            return true;
                          });

                          // Compute totals from the full filtered results (ignore pagination)
                          const salesTotal = filtered
                            .filter(t => t.source === 'sale')
                            .reduce((sum, transaction) => {
                              const subtotal = parseFloat(transaction.total_amount) || 0;
                              const discount = parseFloat(transaction.raw?.offer_amount ?? 0);
                              const total = subtotal - discount;
                              return sum + Math.max(total, 0);
                            }, 0);

                          const supplierTotal = filtered
                            .filter(t => t.source === 'purchase')
                            .reduce((sum, transaction) => {
                              const subtotal = parseFloat(transaction.total_amount) || 0;
                              const discount = parseFloat(transaction.raw?.offer_amount ?? 0);
                              const total = subtotal - discount;
                              return sum + Math.max(total, 0);
                            }, 0);

                          const netTotal = salesTotal - supplierTotal;
                          return netTotal.toFixed(2);
                        })()}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pagination */}
          {(() => {
            const filtered = transactions.filter(t => {
              if (filterType === 'all') return true;
              if (filterType === 'supplier') return (t.source === 'purchase');
              if (filterType === 'sale') return (t.source === 'sale');
              return true;
            });
            const totalPages = Math.ceil(filtered.length / transactionsPerPage);
            
            if (totalPages <= 1) return null;
            
            return (
              <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-2xl shadow-sm">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg ${
                      currentPage === totalPages
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-semibold">
                        {(currentPage - 1) * transactionsPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-semibold">
                        {Math.min(currentPage * transactionsPerPage, filtered.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold">{filtered.length}</span> transactions
                    </p>
                  </div>
                  <div>
                    <nav className="inline-flex rounded-lg shadow-sm">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-500 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-500 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* View Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Transaction Details
                </h2>
                <p className="text-gray-600">Invoice #{viewingTransaction?.id}</p>
              </div>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Transaction Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                  <div className="text-sm font-medium text-gray-500 mb-1">Invoice / Bill #</div>
                  <div className="text-xl font-bold text-gray-900">
                    {transactionDetails?.invoice_number || transactionDetails?.bill_number || viewingTransaction?.bill_number || `#${viewingTransaction?.id}`}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                  <div className="text-sm font-medium text-gray-500 mb-1">Customer</div>
                  <div className="text-xl font-bold text-gray-900">
                    {transactionDetails?.customer_name || viewingTransaction?.customer_name || 'N/A'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                  <div className="text-sm font-medium text-gray-500 mb-1">Created By</div>
                  <div className="text-xl font-bold text-gray-900">
                    {transactionDetails?.created_by || viewingTransaction?.raw?.created_by || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                  <div className="text-sm font-medium text-gray-500 mb-1">Subtotal</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(() => {
                      const sum = purchaseItems.reduce((s, it) => {
                        const rawVal = (it.total_price ?? it.totalPrice ?? it.total) || 0;
                        const v = parseFloat(rawVal);
                        return s + (isNaN(v) ? 0 : v);
                      }, 0);
                      return sum.toFixed(2);
                    })()}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-50/50 p-5 rounded-xl border border-red-200">
                  <div className="text-sm font-medium text-gray-500 mb-1">Discount</div>
                  <div className="text-2xl font-bold text-red-600">
                    -${parseFloat(transactionDetails?.offer_amount ?? transactionDetails?.offerAmount ?? viewingTransaction?.raw?.offer_amount ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 p-5 rounded-xl border border-emerald-200">
                  <div className="text-sm font-medium text-gray-500 mb-1">Total</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    ${(() => {
                      const subtotal = purchaseItems.reduce((s, it) => {
                        const rawVal = (it.total_price ?? it.totalPrice ?? it.total) || 0;
                        const v = parseFloat(rawVal);
                        return s + (isNaN(v) ? 0 : v);
                      }, 0);
                      const discount = parseFloat(transactionDetails?.offer_amount ?? transactionDetails?.offerAmount ?? viewingTransaction?.raw?.offer_amount ?? 0);
                      const total = subtotal - discount;
                      return Math.max(total, 0).toFixed(2);
                    })()}
                  </div>
                </div>
              </div>

              {/* Total Amount Card */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-blue-100 text-sm font-medium">Total Amount (After Discount)</div>
                    <div className="text-white text-3xl font-bold">
                      ${(() => {
                        const subtotal = purchaseItems.reduce((s, it) => {
                          const rawVal = (it.total_price ?? it.totalPrice ?? it.total) || 0;
                          const v = parseFloat(rawVal);
                          return s + (isNaN(v) ? 0 : v);
                        }, 0);
                        const discount = parseFloat(transactionDetails?.offer_amount ?? transactionDetails?.offerAmount ?? viewingTransaction?.raw?.offer_amount ?? 0);
                        const total = subtotal - discount;
                        return Math.max(total, 0).toFixed(2);
                      })()}
                    </div>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>

              {/* Purchase Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Purchase Items ({purchaseItems.length})
                </h3>
                {loadingItems ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : purchaseItems.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {purchaseItems.map((item, index) => {
                          const price = parseFloat(item.price) || 0;
                          const quantity = parseInt(item.quantity) || 0;
                          const subtotal = price * quantity;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{item.name || 'Unknown Item'}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                  {quantity}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-900">
                                ${price.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 font-semibold text-gray-900">
                                ${subtotal.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <div className="text-gray-400 text-5xl mb-3">📋</div>
                    <p className="text-gray-600">No items found for this transaction.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-amber-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Transaction
                </h2>
                <p className="text-gray-600">Update transaction details</p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold transition-colors"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={editFormData.customer_name}
                  onChange={handleEditFormChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              
              {/* Purchase Items */}
              {editFormData.items.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Purchase Items
                  </label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                              Item
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                              Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {editFormData.items.map((item, index) => {
                            const price = parseFloat(item.price) || 0;
                            const quantity = parseInt(item.quantity) || 0;
                            const total = price * quantity;
                            
                            return (
                              <tr key={index} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  ${price.toFixed(2)}
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                  ${total.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Adjust quantities to update the total amount</p>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Amount *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</div>
                  <input
                    type="number"
                    name="total_amount"
                    value={editFormData.total_amount}
                    onChange={handleEditFormChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    readOnly
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Total is automatically calculated based on item quantities</p>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Update Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L5.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Delete Transaction?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete transaction #{deleteConfirm.transaction?.id}? 
                  This action cannot be undone and will permanently remove the transaction.
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDeleteConfirm({ show: false, transaction: null })}
                  className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-medium shadow-sm hover:shadow-md transition-all"
                >
                  Delete Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;