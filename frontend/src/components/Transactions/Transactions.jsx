import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, transaction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const [editFormData, setEditFormData] = useState({
    customer_name: '',
    total_amount: '',
    items: []
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseItems = async (purchaseId) => {
    try {
      setLoadingItems(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/${purchaseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch purchase items');
      }
      
      const data = await response.json();
      setPurchaseItems(data.items || []);
    } catch (err) {
      toast.error('Error fetching purchase details: ' + err.message);
      console.error('Error fetching purchase items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const openViewModal = async (transaction) => {
    setViewingTransaction(transaction);
    setIsViewModalOpen(true);
    await fetchPurchaseItems(transaction.id);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingTransaction(null);
    setPurchaseItems([]);
  };

  const openEditModal = async (transaction) => {
    setEditingTransaction(transaction);
    setEditFormData({
      customer_name: transaction.customer_name || '',
      total_amount: transaction.total_amount || '',
      items: []
    });
    
    // Fetch purchase items for editing
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/${transaction.id}`);
      if (response.ok) {
        const data = await response.json();
        setEditFormData(prev => ({
          ...prev,
          items: data.items || []
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
    
    // Recalculate total amount
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/${editingTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: editFormData.customer_name.trim(),
          total_amount: parseFloat(editFormData.total_amount),
          items: editFormData.items.map(item => ({
            item_id: item.item_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total_price: item.total_price
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update transaction');
      }

      toast.success('Transaction updated successfully!');
      closeEditModal();
      fetchTransactions(); // Refresh the list
    } catch (err) {
      toast.error('Error updating transaction: ' + err.message);
    }
  };

  const confirmDelete = (transaction) => {
    setDeleteConfirm({ show: true, transaction });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/${deleteConfirm.transaction.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete transaction');
      }

      toast.success('Transaction deleted successfully!');
      setDeleteConfirm({ show: false, transaction: null });
      fetchTransactions(); // Refresh the list
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Transactions</h1>
        <p className="text-gray-600">View and manage all purchase transactions</p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">No transactions found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const totalPages = Math.ceil(transactions.length / transactionsPerPage);
                    const currentTransactions = transactions.slice(
                      (currentPage - 1) * transactionsPerPage,
                      currentPage * transactionsPerPage
                    );
                    
                    return currentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.customer_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="font-semibold text-green-600">
                            ${parseFloat(transaction.total_amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openViewModal(transaction)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition duration-200 inline-flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(transaction)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md transition duration-200 inline-flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(transaction)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition duration-200 inline-flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            
            {/* Page Total */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(transactions.length / transactionsPerPage)}
                </div>
                <div className="text-lg font-semibold text-green-600">
                  Page Total: ${(() => {
                    const currentTransactions = transactions.slice(
                      (currentPage - 1) * transactionsPerPage,
                      currentPage * transactionsPerPage
                    );
                    const pageTotal = currentTransactions.reduce((sum, transaction) => {
                      return sum + parseFloat(transaction.total_amount);
                    }, 0);
                    return pageTotal.toFixed(2);
                  })()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Pagination Controls */}
          {(() => {
            const totalPages = Math.ceil(transactions.length / transactionsPerPage);
            
            if (totalPages <= 1) return null;
            
            return (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
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
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
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
                      <span className="font-medium">
                        {(currentPage - 1) * transactionsPerPage + 1}
                      </span>{' '}
                      to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * transactionsPerPage, transactions.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-medium">{transactions.length}</span> transactions
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-500 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-gray-500 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Transaction Details #{viewingTransaction?.id}
              </h2>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Customer Name</h3>
                  <p className="text-lg font-semibold text-gray-900">{viewingTransaction?.customer_name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h3>
                  <p className="text-lg font-semibold text-green-600">${parseFloat(viewingTransaction?.total_amount || 0).toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Date & Time</h3>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(viewingTransaction?.created_at)}</p>
                </div>
              </div>

              {/* Purchase Items */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Items</h3>
                {loadingItems ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : purchaseItems.length > 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {purchaseItems.map((item, index) => {
                          const price = parseFloat(item.price) || 0;
                          const quantity = parseInt(item.quantity) || 0;
                          const subtotal = price * quantity;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {item.name || 'Unknown Item'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {quantity}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                ${price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                ${subtotal.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No items found for this transaction.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Transaction #{editingTransaction?.id}
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 max-h-96 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={editFormData.customer_name}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              
              {/* Purchase Items */}
              {editFormData.items.length > 0 && (
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Purchase Items
                  </label>
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Item
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Qty
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {editFormData.items.map((item, index) => {
                          const price = parseFloat(item.price) || 0;
                          const quantity = parseInt(item.quantity) || 0;
                          const total = price * quantity;
                          
                          return (
                            <tr key={index}>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                ${price.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                <input
                                  type="number"
                                  min="1"
                                  value={quantity}
                                  onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                ${total.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Total Amount *
                </label>
                <input
                  type="number"
                  name="total_amount"
                  value={editFormData.total_amount}
                  onChange={handleEditFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Enter total amount"
                  step="0.01"
                  min="0"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Total is automatically calculated based on item quantities</p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L5.18 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete Transaction
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete transaction #{deleteConfirm.transaction?.id}? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setDeleteConfirm({ show: false, transaction: null })}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;