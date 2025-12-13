import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Eye, 
  DollarSign, 
  Calendar, 
  User, 
  Truck, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Printer,
  X,
  Download,
  ShoppingCart,
  Building,
  Receipt,
  ChevronRight,
  Users,
  Package
} from 'lucide-react';
import Suppliers from '../Suppliers/Suppliers.jsx';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [suppliersModalOpen, setSuppliersModalOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ billNumber: '', supplierId: '', supplierName: '', invoiceDate: '', dueDate: '', paymentStatus: 'pending', items: [{ itemId: '', qty: 1, unitPrice: 0, total: 0 }], initialPayment: 0, paymentMethod: 'Cash' });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: 0, method: 'Cash', note: '' });
  const [currentBalance, setCurrentBalance] = useState(0);
  const [currentUserName, setCurrentUserName] = useState('');

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases?type=supplier`);
      const data = await res.json();
      setPurchases(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPurchases();
    const userName = localStorage.getItem('name') || 'User';
    setCurrentUserName(userName);
  }, []);

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    try {
      if (newInvoice.paymentMethod === 'Cash') {
        const total = parseFloat(computeTotal()) || 0;
        setNewInvoice(prev => ({ ...prev, initialPayment: total }));
      }
    } catch (e) {}
  }, [newInvoice.items, newInvoice.paymentMethod]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/items`);
      const data = await res.json();
      setItemsList(data);
    } catch (err) { console.error(err); }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/suppliers`);
      const data = await res.json();
      setSuppliers(data);
    } catch (err) { console.error(err); }
  };

  const openDetails = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/${id}`);
      const data = await res.json();
      setSelected({ ...data.purchase, items: data.items, payments: data.payments || [], paidAmount: data.paidAmount || 0, balance: data.balance || 0 });
    } catch (err) { console.error(err); }
  };

  const openPaymentModal = async (purchaseId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/${purchaseId}`);
      const data = await res.json();
      const balance = data.balance || 0;
      setCurrentBalance(balance);
      const name = localStorage.getItem('name') || '';
      const userId = localStorage.getItem('userId') || localStorage.getItem('id') || null;
      setCurrentUserName(name);
      setPaymentData({ amount: balance, method: 'Cash', note: '', paid_by: name, paid_by_id: userId ? parseInt(userId) : null });
      setPaymentModalOpen(true);
      setSelected({ ...data.purchase, items: data.items, payments: data.payments || [], paidAmount: data.paidAmount || 0, balance: data.balance || 0 });
    } catch (err) {
      console.error('Failed to load purchase for payment', err);
      alert('Failed to load purchase details');
    }
  };

  const submitPayment = async () => {
    try {
      if (!selected || !selected.id) return alert('No purchase selected');
      const amt = parseFloat(paymentData.amount || 0);
      if (amt <= 0) return alert('Enter an amount greater than zero');

      const body = { amount: amt, method: paymentData.method, note: paymentData.note, paid_by: paymentData.paid_by || currentUserName };
      if (paymentData.paid_by_id) body.paid_by_id = paymentData.paid_by_id;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/${selected.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to record payment');

      await fetchPurchases();
      const res2 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/${selected.id}`);
      const updated = await res2.json();
      setSelected({ ...updated.purchase, items: updated.items, payments: updated.payments || [], paidAmount: updated.paidAmount || 0, balance: updated.balance || 0 });
      setPaymentModalOpen(false);
      alert('Payment recorded');
    } catch (err) {
      console.error('Payment error', err);
      alert(err.message || 'Failed to record payment');
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const openNewInvoice = () => {
    setIsNewOpen(true);
    setNewInvoice({ billNumber: `INV-${Date.now()}`, supplierId: '', supplierName: '', invoiceDate: '', dueDate: '', paymentStatus: 'pending', items: [{ itemId: '', qty: 1, unitPrice: 0, total: 0 }], initialPayment: 0, paymentMethod: 'Cash' });
  };

  const closeNewInvoice = () => setIsNewOpen(false);

  const updateLine = (index, field, value) => {
    setNewInvoice(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      if (field === 'itemId') {
        const it = itemsList.find(i => i.id == value);
        items[index].unitPrice = it ? (it.cost_price ?? it.costPrice ?? it.price ?? 0) : 0;
      }
      items[index].total = parseFloat(( (items[index].unitPrice || 0) * (parseInt(items[index].qty || 0) || 0) ).toFixed(2));
      return { ...prev, items };
    });
  };

  const addLine = () => setNewInvoice(prev => ({ ...prev, items: [...prev.items, { itemId: '', qty: 1, unitPrice: 0, total: 0 }] }));
  const removeLine = (idx) => setNewInvoice(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const computeTotal = () => newInvoice.items.reduce((s, it) => s + (parseFloat(it.total || 0)), 0).toFixed(2);

  const submitNewInvoice = async () => {
    try {
      if (!newInvoice.items || newInvoice.items.length === 0) return alert('Add at least one product');
      const valid = newInvoice.items.every(it => it.itemId && parseInt(it.qty) > 0);
      if (!valid) return alert('Each line requires a product and quantity');

      const total = parseFloat(computeTotal());
      let initialPay = parseFloat(newInvoice.initialPayment || 0);
      if (newInvoice.paymentMethod === 'Cash') {
        initialPay = total;
      }

      if (initialPay > total) {
        return alert('Initial payment cannot exceed total amount');
      }

      if (newInvoice.paymentMethod === 'Credit') {
        if (initialPay > 0) return alert('Credit payment must have zero initial payment');
        if (!newInvoice.dueDate) return alert('Due date is required for credit payments');
      }

      if (newInvoice.paymentMethod === 'Partial') {
        if (!(initialPay > 0 && initialPay < total)) return alert('Partial payment requires an initial payment greater than 0 and less than total');
        if (!newInvoice.dueDate) return alert('Due date is required for partial payments');
      }

      let paymentStatus = 'pending';
      if (initialPay >= total && total > 0) paymentStatus = 'paid';
      else if (initialPay > 0 && initialPay < total) paymentStatus = 'partial';

      const payload = {
        billNumber: newInvoice.billNumber,
        customerName: newInvoice.supplierName || 'Supplier',
        totalAmount: total,
        paymentMethod: newInvoice.paymentMethod,
        supplierId: newInvoice.supplierId || null,
        invoiceDate: newInvoice.invoiceDate || null,
        dueDate: newInvoice.dueDate || null,
        paymentStatus: paymentStatus,
        created_by: currentUserName,
        items: newInvoice.items.map(it => ({ itemId: it.itemId, itemName: itemsList.find(i => i.id == it.itemId)?.name || '', itemPrice: parseFloat(it.unitPrice || 0), quantity: parseInt(it.qty), totalPrice: parseFloat(it.total || 0) }))
      };

      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/receive`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create purchase');

      const initialPaymentToRecord = (newInvoice.paymentMethod === 'Cash') ? total : parseFloat(newInvoice.initialPayment || 0);
      if (initialPaymentToRecord > 0) {
        const payerName = localStorage.getItem('name') || '';
        const payerId = localStorage.getItem('userId') || localStorage.getItem('id') || null;
        const payBody = { amount: initialPaymentToRecord, method: newInvoice.paymentMethod === 'Cash' ? 'Cash' : 'Partial', note: 'Initial payment', paid_by: payerName };
        if (payerId) payBody.paid_by_id = parseInt(payerId);

        await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/${data.purchaseId}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payBody) });
      }

      await fetchPurchases();
      closeNewInvoice();
      alert('Purchase recorded successfully');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed');
    } finally { setLoading(false); }
  };

  // Calculate statistics
  const stats = {
    totalPurchases: purchases.length,
    totalAmount: purchases.reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0).toFixed(2),
    totalPaid: purchases.reduce((sum, p) => sum + parseFloat(p.paid_amount || 0), 0).toFixed(2),
    totalBalance: purchases.reduce((sum, p) => {
      const paid = parseFloat(p.paid_amount || 0);
      const total = parseFloat(p.total_amount || 0);
      return sum + (total - paid);
    }, 0).toFixed(2)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-1">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Purchases</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalPurchases}</p>
                </div>
                <div className="bg-blue-400/20 p-3 rounded-xl">
                  <Receipt className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Value</p>
                  <p className="text-3xl font-bold mt-1">${stats.totalAmount}</p>
                </div>
                <div className="bg-green-400/20 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Amount Paid</p>
                  <p className="text-3xl font-bold mt-1">${stats.totalPaid}</p>
                </div>
                <div className="bg-amber-400/20 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Balance</p>
                  <p className="text-3xl font-bold mt-1">${stats.totalBalance}</p>
                </div>
                <div className="bg-purple-400/20 p-3 rounded-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Supplier Purchases</h2>
                  <p className="text-sm text-gray-600">Track and manage all supplier purchases and invoices</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSuppliersModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
              >
                <Users className="w-5 h-5" />
                <span>Manage Suppliers</span>
              </button>
              <button
                onClick={openNewInvoice}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                <span>New Purchase</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                <ShoppingCart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
              </div>
              <p className="mt-6 text-gray-600 font-medium">Loading purchases...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Start by adding your first purchase to track supplier invoices and inventory.
              </p>
              <button
                onClick={openNewInvoice}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Create First Purchase
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Invoice #
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Supplier
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Total
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Balance
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Created By
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {purchases.map(p => {
                    const paid = parseFloat(p.paid_amount || 0);
                    const total = parseFloat(p.total_amount || 0);
                    let status = p.payment_status || 'pending';
                    if (paid >= total && total > 0) status = 'paid';
                    else if (paid > 0 && paid < total) status = 'partial';

                    let methodLabel = '';
                    if (paid === 0) {
                      methodLabel = 'Credit';
                    } else if (paid >= total) {
                      methodLabel = 'Cash';
                    } else {
                      methodLabel = 'Partial';
                    }

                    const supplierName = suppliers.find(s => s.id == p.supplier_id)?.name || p.customer_name || 'Supplier';
                    const showDue = (paid === 0) || (paid > 0 && paid < total) || (p.payment_method === 'Credit');

                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            #{p.bill_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{supplierName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">${total.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            (total - paid) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}>
                            ${(total - paid).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(p.created_at).toLocaleDateString()}
                            </span>
                            {showDue && p.due_date && (
                              <span className="text-xs text-amber-600 font-medium">
                                Due: {new Date(p.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-700">{p.created_by || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              {status === 'paid' ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Paid
                                </span>
                              ) : status === 'partial' ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Partial
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </span>
                              )}
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                {methodLabel}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openDetails(p.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition duration-200"
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              View
                            </button>
                            {status !== 'paid' && (
                              <button
                                onClick={() => openPaymentModal(p.id)}
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-medium rounded-lg shadow-sm transition duration-200"
                              >
                                <DollarSign className="w-4 h-4 mr-1.5" />
                                Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Results Count */}
          {!loading && purchases.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{purchases.length}</span> purchases
                </p>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Purchase Management System</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Details Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-slideUp">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-xl">
                      <Receipt className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
                      <p className="text-sm text-gray-600">#{selected.bill_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={printInvoice}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Supplier Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-700">{selected.customer_name}</span>
                      </div>
                      {selected.supplier_id && (
                        <div className="text-sm text-gray-500">Supplier ID: {selected.supplier_id}</div>
                      )}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Invoice Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Invoice Date:</span>
                        <span className="font-medium">{selected.invoice_date || new Date(selected.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">{selected.due_date || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selected.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          selected.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selected.payment_status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchased Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit Price</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {selected.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Package className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{it.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {it.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="font-medium">${parseFloat(it.price).toFixed(2)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="font-bold">${parseFloat(it.total_price).toFixed(2)}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Grand Total:</span>
                        <span className="text-2xl font-bold text-gray-900">${parseFloat(selected.total_amount).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="text-xl font-bold text-green-600">${parseFloat(selected.paidAmount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Remaining Balance:</span>
                        <span className="text-xl font-bold text-amber-600">${parseFloat(selected.balance || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payments History */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Payment History</h3>
                    {selected.payments && selected.payments.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {selected.payments.map((pay) => (
                          <div key={pay.id} className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">${parseFloat(pay.amount).toFixed(2)}</div>
                                <div className="text-sm text-gray-500">
                                  {pay.paid_at ? new Date(pay.paid_at).toLocaleDateString() : '-'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-700">{pay.method}</div>
                                <div className="text-xs text-gray-500">{pay.paid_by || '-'}</div>
                              </div>
                            </div>
                            {pay.note && (
                              <div className="mt-2 text-sm text-gray-600 border-t pt-2">{pay.note}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">No payments recorded yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {paymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPaymentModalOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
                    <p className="text-sm text-gray-600">Invoice Balance: ${currentBalance.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => setPaymentModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={paymentData.method}
                      onChange={(e) => {
                        const method = e.target.value;
                        const amt = method === 'Cash' ? currentBalance : paymentData.amount;
                        setPaymentData(prev => ({ ...prev, method, amount: amt }));
                      }}
                    >
                      <option>Cash</option>
                      <option>Bank Transfer</option>
                      <option>Credit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={currentBalance}
                        className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={paymentData.amount}
                        onChange={(e) => {
                          let v = e.target.value === '' ? '' : parseFloat(e.target.value);
                          if (v !== '' && v > currentBalance) v = currentBalance;
                          setPaymentData(prev => ({ ...prev, amount: v }));
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Current Balance: ${currentBalance.toFixed(2)}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paid By</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={paymentData.paid_by || currentUserName}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, paid_by: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                    <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      rows="3"
                      value={paymentData.note}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Add payment note..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => setPaymentModalOpen(false)}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitPayment}
                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Submit Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suppliers Modal */}
        {suppliersModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSuppliersModalOpen(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-slideUp">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-3 rounded-xl">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Suppliers Management</h2>
                      <p className="text-sm text-gray-600">Manage your supplier contacts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSuppliersModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <Suppliers />
              </div>
            </div>
          </div>
        )}

        {/* New Purchase Modal - Keeping your existing structure but with styling */}
        {isNewOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-6 animate-fadeIn">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeNewInvoice} />
            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-slideUp">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-100 to-green-200 p-3 rounded-xl">
                      <Plus className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">New Supplier Purchase / Invoice</h2>
                      <p className="text-sm text-gray-600">Create a new purchase order and receive stock</p>
                    </div>
                  </div>
                  <button
                    onClick={closeNewInvoice}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Your existing form content with enhanced styling */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice #</label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={newInvoice.billNumber}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, billNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={newInvoice.supplierId}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, supplierId: e.target.value }))}
                    >
                      <option value="">-- Select Supplier --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={newInvoice.invoiceDate}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Created By</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-700"
                      value={currentUserName}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Purchase Items</h3>
                    <button
                      onClick={addLine}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Add Line
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Unit Price</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Line Total</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {newInvoice.items.map((line, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={line.itemId}
                                onChange={(e) => updateLine(idx, 'itemId', e.target.value)}
                              >
                                <option value="">-- Select product --</option>
                                {itemsList.map(it => <option key={it.id} value={it.id}>{it.name}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={line.qty}
                                onChange={(e) => updateLine(idx, 'qty', parseInt(e.target.value || 0))}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  type="number"
                                  step="0.01"
                                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={line.unitPrice}
                                  onChange={(e) => updateLine(idx, 'unitPrice', parseFloat(e.target.value || 0))}
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="font-bold text-gray-900">${parseFloat(line.total || 0).toFixed(2)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeLine(idx)}
                                className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      value={newInvoice.paymentMethod}
                      onChange={(e) => {
                        const method = e.target.value;
                        const total = parseFloat(computeTotal());
                        setNewInvoice(prev => {
                          const updated = { ...prev, paymentMethod: method };
                          if (method === 'Cash') {
                            updated.initialPayment = total;
                          } else if (method === 'Partial') {
                            updated.initialPayment = 0;
                          } else if (method === 'Credit') {
                            updated.initialPayment = 0;
                          }
                          return updated;
                        });
                      }}
                    >
                      <option>Cash</option>
                      <option>Partial</option>
                      <option>Credit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Initial Payment</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={parseFloat(computeTotal())}
                        className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={newInvoice.initialPayment}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                          const total = parseFloat(computeTotal());
                          if (val !== '' && val > total) return;
                          setNewInvoice(prev => ({ ...prev, initialPayment: val }));
                        }}
                      />
                    </div>
                  </div>
                  {(newInvoice.paymentMethod === 'Partial' || newInvoice.paymentMethod === 'Credit' || parseFloat(computeTotal()) > parseFloat(newInvoice.initialPayment || 0)) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        value={newInvoice.dueDate}
                        onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  )}
                </div>

                {/* Total and Actions */}
                <div className="border-t pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">Total: ${computeTotal()}</div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={closeNewInvoice}
                        className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitNewInvoice}
                        className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Save & Receive Stock
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Purchases;