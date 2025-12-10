import React, { useEffect, useState } from 'react';
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
    // Get current user name from localStorage
    const userName = localStorage.getItem('name') || 'User';
    setCurrentUserName(userName);
  }, []);

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
  }, []);

  // Keep initialPayment in sync when Payment Method is Cash and items change
  useEffect(() => {
    try {
      if (newInvoice.paymentMethod === 'Cash') {
        const total = parseFloat(computeTotal()) || 0;
        setNewInvoice(prev => ({ ...prev, initialPayment: total }));
      }
    } catch (e) {
      // ignore
    }
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
      // Ensure we have the latest balance
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/purchases/${purchaseId}`);
      const data = await res.json();
      const balance = data.balance || 0;
      setCurrentBalance(balance);
      const name = localStorage.getItem('name') || '';
      const userId = localStorage.getItem('userId') || localStorage.getItem('id') || null;
      setCurrentUserName(name);
      setPaymentData({ amount: balance, method: 'Cash', note: '', paid_by: name, paid_by_id: userId ? parseInt(userId) : null });
      setPaymentModalOpen(true);
      // set selected for context
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

      // Refresh details and list
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
      // update unitPrice when item selected
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
      // basic validation
      if (!newInvoice.items || newInvoice.items.length === 0) return alert('Add at least one product');
      const valid = newInvoice.items.every(it => it.itemId && parseInt(it.qty) > 0);
      if (!valid) return alert('Each line requires a product and quantity');

      // compute totals and validate below

      // Determine totals and validate according to payment method
      const total = parseFloat(computeTotal());
      let initialPay = parseFloat(newInvoice.initialPayment || 0);
      if (newInvoice.paymentMethod === 'Cash') {
        // enforce full payment
        initialPay = total;
      }

      if (initialPay > total) {
        return alert('Initial payment cannot exceed total amount');
      }

      if (newInvoice.paymentMethod === 'Credit') {
        // credit: no initial payment allowed, require due date
        if (initialPay > 0) return alert('Credit payment must have zero initial payment');
        if (!newInvoice.dueDate) return alert('Due date is required for credit payments');
      }

      if (newInvoice.paymentMethod === 'Partial') {
        // partial: require 0 < initialPay < total and due date
        if (!(initialPay > 0 && initialPay < total)) return alert('Partial payment requires an initial payment greater than 0 and less than total');
        if (!newInvoice.dueDate) return alert('Due date is required for partial payments');
      }

      // set paymentStatus based on initialPay
      let paymentStatus = 'pending';
      if (initialPay >= total && total > 0) paymentStatus = 'paid';
      else if (initialPay > 0 && initialPay < total) paymentStatus = 'partial';

      // update payload paymentStatus and ensure initialPayment is set for backend recording
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

      // if initial payment entered, record it and include payer info (name + optional id)
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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Supplier Purchases / Invoices</h2>
      <div className="bg-white rounded shadow p-4">
        <div className="mb-4 flex justify-between">
          <div className="space-x-2">
            <button onClick={openNewInvoice} className="px-3 py-1 bg-green-600 text-white rounded">New Purchase / Invoice</button>
            <button onClick={() => setSuppliersModalOpen(true)} className="px-3 py-1 bg-blue-600 text-white rounded">Manage Suppliers</button>
          </div>
        </div>
        {loading ? <div>Loading...</div> : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left"><th>ID</th><th>Invoice</th><th>Supplier</th><th>Total</th><th>Balance</th><th>Date</th><th>Created By</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {purchases.map(p => {
                const paid = parseFloat(p.paid_amount || 0);
                const total = parseFloat(p.total_amount || 0);
                let status = p.payment_status || 'pending';
                if (paid >= total && total > 0) status = 'paid';
                else if (paid > 0 && paid < total) status = 'partial';

                // Determine displayed payment method label per requested logic
                let methodLabel = '';
                if (paid === 0) {
                  methodLabel = 'Credit';
                } else if (paid >= total) {
                  methodLabel = 'Cash';
                } else {
                  methodLabel = 'Partial Payment';
                }

                // Resolve supplier name from suppliers list if available
                const supplierName = suppliers.find(s => s.id == p.supplier_id)?.name || p.customer_name || 'Supplier';

                // Only show due date column for credit or partial payments
                const showDue = (paid === 0) || (paid > 0 && paid < total) || (p.payment_method === 'Credit');

                return (
                  <tr key={p.id} className="border-t">
                    <td className="py-2">{p.id}</td>
                    <td>{p.bill_number}</td>
                    <td>{supplierName}</td>
                    <td>${parseFloat(p.total_amount).toFixed(2)}</td>
                    <td>${(total - paid).toFixed(2)}</td>
                    <td>{showDue ? (p.due_date ? new Date(p.due_date).toLocaleDateString() : '-') : new Date(p.created_at).toLocaleDateString()}</td>
                    <td>{p.created_by || '-'}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        {status === 'paid' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Paid</span>
                        ) : status === 'partial' ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">Partial</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">Pending</span>
                        )}
                        <span className="text-sm text-gray-700">{methodLabel}</span>
                        <button onClick={() => openDetails(p.id)} className="px-3 py-1 bg-blue-600 text-white rounded">View</button>
                        {status !== 'paid' && (
                          <button onClick={() => openPaymentModal(p.id)} className="px-3 py-1 bg-orange-600 text-white rounded">Record Payment</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Details / Print */}
      {selected && (
        <div className="mt-6 bg-white rounded shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">Invoice: {selected.bill_number}</h3>
              <div className="text-sm text-gray-600">Supplier: {selected.customer_name} {selected.supplier_id ? `(ID:${selected.supplier_id})` : ''}</div>
              <div className="text-sm text-gray-600">Date: {selected.invoice_date || new Date(selected.created_at).toLocaleDateString()}</div>
              <div className="text-sm text-gray-600">Due Date: {selected.due_date || '-'}</div>
              <div className="text-sm mt-1">
                Payment Status: {selected.payment_status === 'paid' ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Paid</span> : selected.payment_status === 'partial' ? <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Partial</span> : <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">{selected.payment_status || 'Pending'}</span>}
              </div>
            </div>
            <div className="space-x-2">
              <button onClick={printInvoice} className="px-3 py-1 bg-green-600 text-white rounded">Print</button>
              <button onClick={() => setSelected(null)} className="px-3 py-1 border rounded">Close</button>
            </div>
          </div>
          <table className="w-full mt-4 text-sm border-t">
            <thead>
              <tr className="text-left"><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr>
            </thead>
            <tbody>
              {selected.items.map((it, idx) => (
                <tr key={idx} className="border-t"><td>{it.name}</td><td>{it.quantity}</td><td>${parseFloat(it.price).toFixed(2)}</td><td>${parseFloat(it.total_price).toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
            <div className="text-right mt-4 font-semibold">Grand Total: ${parseFloat(selected.total_amount).toFixed(2)}</div>
          <div className="text-right mt-2">Paid: ${parseFloat(selected.paidAmount || 0).toFixed(2)} — Balance: ${parseFloat(selected.balance || 0).toFixed(2)}</div>

          {/* Payments history */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Payments</h4>
            {selected.payments && selected.payments.length > 0 ? (
              <table className="w-full text-sm border">
                <thead className="bg-gray-50"><tr><th className="p-2">Date</th><th className="p-2">Amount</th><th className="p-2">Method</th><th className="p-2">Paid By</th><th className="p-2">Note</th></tr></thead>
                <tbody>
                  {selected.payments.map((pay) => (
                    <tr key={pay.id} className="border-t">
                      <td className="p-2">{pay.paid_at ? new Date(pay.paid_at).toLocaleString() : '-'}</td>
                      <td className="p-2">${parseFloat(pay.amount).toFixed(2)}</td>
                      <td className="p-2">{pay.method}</td>
                      <td className="p-2">{(pay.paid_by_name ? `${pay.paid_by_name}${pay.paid_by_role ? ' ('+pay.paid_by_role+')' : ''}` : (pay.paid_by || '-'))}</td>
                      <td className="p-2">{pay.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-sm text-gray-500">No payments recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-3">Record Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm">Method</label>
                <select className="w-full px-2 py-1 border" value={paymentData.method} onChange={(e)=>{
                  const method = e.target.value;
                  // if Cash, default amount to full balance
                  const amt = method === 'Cash' ? currentBalance : paymentData.amount;
                  setPaymentData(prev=>({...prev, method, amount: amt}));
                }}>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Amount</label>
                <input type="number" step="0.01" min="0" max={currentBalance} className="w-full px-2 py-1 border" value={paymentData.amount} onChange={(e)=>{
                  let v = e.target.value === '' ? '' : parseFloat(e.target.value);
                  if (v !== '' && v > currentBalance) v = currentBalance;
                  setPaymentData(prev=>({...prev, amount: v}));
                }} />
                <div className="text-xs text-gray-500">Balance: {currentBalance}</div>
              </div>
              <div>
                <label className="block text-sm">Paid By</label>
                <input className="w-full px-2 py-1 border" value={paymentData.paid_by || currentUserName} onChange={(e)=>setPaymentData(prev=>({...prev, paid_by: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm">Note (optional)</label>
                <textarea className="w-full px-2 py-1 border" value={paymentData.note} onChange={(e)=>setPaymentData(prev=>({...prev, note: e.target.value}))} />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={()=>setPaymentModalOpen(false)} className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={submitPayment} className="px-3 py-1 bg-green-600 text-white rounded">Submit Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Suppliers Modal (reuse Suppliers component) */}
      {suppliersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-4xl p-4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Suppliers</h3>
              <button onClick={()=>setSuppliersModalOpen(false)} className="text-xl">×</button>
            </div>
            <Suppliers />
          </div>
        </div>
      )}

      {/* New Purchase Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center p-6">
          <div className="bg-white rounded shadow-lg w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Supplier Purchase / Invoice</h3>
              <button onClick={closeNewInvoice} className="text-xl">×</button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-sm">Invoice #</label>
                <input className="w-full px-2 py-1 border" value={newInvoice.billNumber} onChange={(e)=>setNewInvoice(prev=>({...prev,billNumber:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm">Supplier</label>
                <select className="w-full px-2 py-1 border" value={newInvoice.supplierId} onChange={(e)=>setNewInvoice(prev=>({...prev,supplierId:e.target.value}))}>
                  <option value="">-- Select --</option>
                  {suppliers.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm">Invoice Date</label>
                <input type="date" className="w-full px-2 py-1 border" value={newInvoice.invoiceDate} onChange={(e)=>setNewInvoice(prev=>({...prev,invoiceDate:e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm">Created By</label>
                <input type="text" className="w-full px-2 py-1 border bg-gray-100" value={currentUserName} readOnly disabled />
              </div>
            </div>

            <div className="mb-3">
              <table className="w-full text-sm border">
                <thead className="bg-gray-50"><tr><th className="p-2">Product</th><th className="p-2">Qty</th><th className="p-2">Unit</th><th className="p-2">Line Total</th><th className="p-2">Actions</th></tr></thead>
                <tbody>
                  {newInvoice.items.map((line, idx)=> (
                    <tr key={idx} className="border-t">
                      <td className="p-2">
                        <select className="w-full px-2 py-1 border" value={line.itemId} onChange={(e)=>updateLine(idx,'itemId',e.target.value)}>
                          <option value="">-- Select product --</option>
                          {itemsList.map(it=> <option key={it.id} value={it.id}>{it.name}</option>)}
                        </select>
                      </td>
                      <td className="p-2"><input type="number" min="1" className="w-24 px-2 py-1 border" value={line.qty} onChange={(e)=>updateLine(idx,'qty',parseInt(e.target.value||0))} /></td>
                      <td className="p-2"><input type="number" step="0.01" className="w-32 px-2 py-1 border" value={line.unitPrice} onChange={(e)=>updateLine(idx,'unitPrice',parseFloat(e.target.value||0))} /></td>
                      <td className="p-2">${parseFloat(line.total||0).toFixed(2)}</td>
                      <td className="p-2"><button className="px-2 py-1 bg-red-500 text-white rounded" onClick={()=>removeLine(idx)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2">
                <button onClick={addLine} className="px-3 py-1 bg-blue-600 text-white rounded">Add Line</button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-sm">Payment Method</label>
                <select className="w-full px-2 py-1 border" value={newInvoice.paymentMethod} onChange={(e)=>{
                  const method = e.target.value;
                  const total = parseFloat(computeTotal());
                  setNewInvoice(prev => {
                    const updated = { ...prev, paymentMethod: method };
                    if (method === 'Cash') {
                      // auto-fill full payment
                      updated.initialPayment = total;
                    } else if (method === 'Partial') {
                      // default to zero, user must enter amount (partial)
                      updated.initialPayment = 0;
                    } else if (method === 'Credit') {
                      // no initial payment
                      updated.initialPayment = 0;
                    }
                    return updated;
                  });
                }}>
                  <option>Cash</option>
                  <option>Partial</option>
                  <option>Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm">Initial Payment</label>
                <input type="number" step="0.01" min="0" max={parseFloat(computeTotal())} className="w-full px-2 py-1 border" value={newInvoice.initialPayment} onChange={(e)=>{
                  const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                  const total = parseFloat(computeTotal());
                  if (val !== '' && val > total) {
                    return; // prevent overpaying in input
                  }
                  setNewInvoice(prev=>({...prev, initialPayment: val}));
                }} />
              </div>
              {(newInvoice.paymentMethod === 'Partial' || newInvoice.paymentMethod === 'Credit' || parseFloat(computeTotal()) > parseFloat(newInvoice.initialPayment || 0)) && (
                <div>
                  <label className="block text-sm">Due Date</label>
                  <input type="date" className="w-full px-2 py-1 border" value={newInvoice.dueDate} onChange={(e)=>setNewInvoice(prev=>({...prev,dueDate:e.target.value}))} />
                </div>
              )}
            </div>

            <div className="mt-4 text-right">
              <div className="mb-2 font-semibold">Grand Total: ${computeTotal()}</div>
              <div className="space-x-2">
                <button onClick={closeNewInvoice} className="px-3 py-1 border rounded">Cancel</button>
                <button onClick={submitNewInvoice} className="px-3 py-1 bg-green-600 text-white rounded">Save & Receive Stock</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
