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

  useEffect(() => {
    fetchReports();
    fetchExpenses();
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API}/items`);
      if (!res.ok) return;
      const json = await res.json();
      setInventory(json || []);
    } catch (err) {
      console.error('fetchInventory', err);
    }
  };

  const fetchReports = async () => {
    try {
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
    }
  };

  const fetchProfit = async () => {
    try {
      const params = new URLSearchParams();
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);
      const res = await fetch(`${API}/reports/profit?${params.toString()}`);
      const json = await res.json();
      setProfitSummary(json || null);
    } catch (err) {
      console.error('fetchProfit', err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const params = new URLSearchParams();
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);
      const res = await fetch(`${API}/reports/expenses?${params.toString()}`);
      const json = await res.json();
      setExpenses(json.data || []);
    } catch (err) {
      console.error('fetchExpenses', err);
    }
  };

  const fetchProductHistory = async (itemId) => {
    try {
      const params = new URLSearchParams();
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);
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
      setHistoryModalOpen(true);
    } catch (err) {
      console.error('fetchProductHistory', err);
    }
  };

  const fetchSalesReport = async () => {
    try {
      const params = new URLSearchParams();
      if (range.startDate) params.append('startDate', range.startDate);
      if (range.endDate) params.append('endDate', range.endDate);
      const res = await fetch(`${API}/reports/sales?${params.toString()}`);
      const json = await res.json();
      setSalesReportData(json || { purchases: [], byCustomer: [], totals: {} });
    } catch (err) {
      console.error('fetchSalesReport', err);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/reports/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });
      const json = await res.json();
      if (res.ok) {
        setExpenses(prev => [json.data, ...prev]);
        setExpenseForm({ title: '', category: '', amount: '', note: '' });
      } else {
        console.error('expense error', json);
      }
    } catch (err) {
      console.error('handleExpenseSubmit', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Reports</h2>

      <section className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Profit Summary (optional date range)</h3>
        <div className="flex gap-2 items-center mb-3">
          <input type="date" value={range.startDate} onChange={e => setRange(r => ({...r, startDate: e.target.value}))} className="border px-2 py-1" />
          <input type="date" value={range.endDate} onChange={e => setRange(r => ({...r, endDate: e.target.value}))} className="border px-2 py-1" />
          <button onClick={async () => { await fetchProfit(); await fetchExpenses(); }} className="bg-indigo-600 text-white px-3 py-1 rounded">Apply</button>
          <button onClick={() => { setRange({startDate:'', endDate:''}); setProfitSummary(null); fetchReports(); fetchExpenses(); }} className="ml-2 px-3 py-1 border rounded">Reset</button>
        </div>
        <div>
          <button onClick={fetchProfit} className="px-3 py-1 bg-green-600 text-white rounded mr-2">Load Profit</button>
          {profitSummary && (
            <div className="mt-3">
              <div>Total Purchases: <strong>{profitSummary.total_purchases}</strong></div>
              <div>Total Sales: <strong>{profitSummary.total_sales}</strong></div>
              <div>Profit: <strong>{profitSummary.profit}</strong></div>
            </div>
          )}
        </div>
      </section>

      {/* Product History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h4 className="font-semibold">Product History: {selectedProduct ? selectedProduct.name || selectedProduct.id : ''}</h4>
              <button onClick={() => setHistoryModalOpen(false)} className="px-3 py-1 border rounded">Close</button>
            </div>
            <div className="p-4">
              <div className="mb-3 text-sm text-gray-600">Avg Cost: {historyData.avg_cost}</div>
              {historyError && (<div className="mb-3 text-sm text-red-600">Error: {historyError}</div>)}
              {typeof historyData.starting_qty !== 'undefined' && (
                <div className="mb-3 text-sm text-gray-600">Starting Qty{range.startDate ? ` (as of ${range.startDate})` : ''}: {historyData.starting_qty}</div>
              )}
              <div className="overflow-x-auto">
                {(!historyData.data || historyData.data.length === 0) && !historyError && (
                  <div className="p-4 text-sm text-gray-600">No history found for the selected product and date range.</div>
                )}
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="px-2 py-1">Date</th>
                      <th className="px-2 py-1">Invoice / Bill</th>
                      <th className="px-2 py-1">Type</th>
                      <th className="px-2 py-1">Quantity</th>
                      <th className="px-2 py-1">Created By</th>
                      <th className="px-2 py-1">Running Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.data && historyData.data.map((h, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-2 py-1">{h.date ? new Date(h.date).toLocaleString() : '-'}</td>
                        <td className="px-2 py-1">{h.ref || h.invoice_or_bill || h.invoice_number || h.bill_number || h.purchase_id || '-'}</td>
                        <td className="px-2 py-1">{h.type || h.purchase_type || '-'}</td>
                        <td className="px-2 py-1">{h.quantity != null ? h.quantity : '-'}</td>
                        <td className="px-2 py-1">{h.created_by || '-'}</td>
                        <td className="px-2 py-1">{typeof h.running_qty !== 'undefined' ? h.running_qty : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Product Report</h3>
        <div className="flex gap-2 mb-3 items-center">
          <select value={productFilter.itemId} onChange={e => {
            const id = e.target.value;
            const item = inventory.find(it => String(it.id) === String(id));
            setProductFilter(f => ({ ...f, itemId: id, itemName: item ? item.name : '' }));
            if (item) setSelectedProduct({ id: item.id, name: item.name });
            else setSelectedProduct(null);
          }} className="border px-2 py-1">
            <option value="">-- Select product --</option>
            {inventory.map(i => (
              <option key={i.id} value={i.id}>{i.name} (ID: {i.id})</option>
            ))}
          </select>
          <button onClick={fetchReports} className="bg-indigo-600 text-white px-3 py-1 rounded">Apply Product Filter</button>
          <button onClick={() => { if (productFilter.itemId) { fetchProductHistory(productFilter.itemId); } }} disabled={!productFilter.itemId} className="ml-2 px-3 py-1 border rounded">View Selected Product History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="px-2 py-1">Product</th>
                <th className="px-2 py-1">Sold Qty</th>
                <th className="px-2 py-1">Sold Amount</th>
                <th className="px-2 py-1">Purchased Qty</th>
                <th className="px-2 py-1">Purchased Amount</th>
                <th className="px-2 py-1">Avg Cost</th>
                <th className="px-2 py-1">Profit</th>
                <th className="px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={`${p.item_id}-${p.item_name}`} className="border-b">
                  <td className="px-2 py-1">{p.item_name}</td>
                  <td className="px-2 py-1">{p.sold_qty}</td>
                  <td className="px-2 py-1">{p.sold_amount}</td>
                  <td className="px-2 py-1">{p.purchased_qty}</td>
                  <td className="px-2 py-1">{p.purchased_amount}</td>
                  <td className="px-2 py-1">{p.avg_cost}</td>
                  <td className="px-2 py-1">{p.profit}</td>
                  <td className="px-2 py-1">
                    <button onClick={() => { setSelectedProduct({ id: p.item_id, name: p.item_name }); fetchProductHistory(p.item_id); }} className="px-2 py-1 border rounded text-sm">View History</button>
                  </td>
                </tr>
              ))}
            </tbody>
            {totals && (
              <tfoot>
                <tr className="font-medium">
                  <td className="px-2 py-1">Totals</td>
                  <td className="px-2 py-1">{totals.sold_qty}</td>
                  <td className="px-2 py-1">{totals.sold_amount}</td>
                  <td className="px-2 py-1">{totals.purchased_qty}</td>
                  <td className="px-2 py-1">{totals.purchased_amount}</td>
                  <td className="px-2 py-1">-</td>
                  <td className="px-2 py-1">{totals.profit}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Expenses</h3>
        <form onSubmit={handleExpenseSubmit} className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input required placeholder="Title" value={expenseForm.title} onChange={e => setExpenseForm(f => ({...f, title: e.target.value}))} className="border px-2 py-1" />
          <input placeholder="Category" value={expenseForm.category} onChange={e => setExpenseForm(f => ({...f, category: e.target.value}))} className="border px-2 py-1" />
          <input required type="number" step="0.01" placeholder="Amount" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({...f, amount: e.target.value}))} className="border px-2 py-1" />
          <textarea placeholder="Note" value={expenseForm.note} onChange={e => setExpenseForm(f => ({...f, note: e.target.value}))} className="col-span-1 sm:col-span-3 border px-2 py-1" />
          <div className="sm:col-span-3">
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded">Add Expense</button>
            <button type="button" onClick={fetchExpenses} className="ml-2 px-3 py-1 border rounded">Refresh</button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="px-2 py-1">Date</th>
                <th className="px-2 py-1">Title</th>
                <th className="px-2 py-1">Category</th>
                <th className="px-2 py-1">Amount</th>
                <th className="px-2 py-1">Note</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-b">
                  <td className="px-2 py-1">{new Date(e.created_at).toLocaleString()}</td>
                  <td className="px-2 py-1">{e.title}</td>
                  <td className="px-2 py-1">{e.category}</td>
                  <td className="px-2 py-1">{e.amount}</td>
                  <td className="px-2 py-1">{e.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inventory Report */}
      <section className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Inventory Report (Current Stock)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="px-2 py-1">Product</th>
                <th className="px-2 py-1">Available Qty</th>
                <th className="px-2 py-1">Price</th>
                <th className="px-2 py-1">Cost Price</th>
                <th className="px-2 py-1">Category</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(i => (
                <tr key={i.id} className="border-b">
                  <td className="px-2 py-1">{i.name}</td>
                  <td className="px-2 py-1">{i.quantity}</td>
                  <td className="px-2 py-1">{parseFloat(i.price || 0).toFixed(2)}</td>
                  <td className="px-2 py-1">{i.cost_price ? parseFloat(i.cost_price).toFixed(2) : '-'}</td>
                  <td className="px-2 py-1">{i.category || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Invoice Profit Report */}
      <section className="mb-6 bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">Invoice Profit Report</h3>
        <div className="flex gap-2 items-center mb-3">
          <input type="date" value={range.startDate} onChange={e => setRange(r => ({...r, startDate: e.target.value}))} className="border px-2 py-1" />
          <input type="date" value={range.endDate} onChange={e => setRange(r => ({...r, endDate: e.target.value}))} className="border px-2 py-1" />
          <button onClick={fetchSalesReport} className="bg-indigo-600 text-white px-3 py-1 rounded">Load Invoices</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="px-2 py-1">Invoice#</th>
                <th className="px-2 py-1">Date</th>
                <th className="px-2 py-1">Customer</th>
                <th className="px-2 py-1">Total Sales</th>
                <th className="px-2 py-1">COGS</th>
                <th className="px-2 py-1">Offers</th>
                <th className="px-2 py-1">Profit</th>
                <th className="px-2 py-1">Created By</th>
              </tr>
            </thead>
            <tbody>
              {salesReportData.purchases && salesReportData.purchases.map(p => (
                <tr key={p.purchase_id || p.invoice_number} className="border-b">
                  <td className="px-2 py-1">{p.invoice_number ?? p.bill_number ?? p.purchase_id}</td>
                  <td className="px-2 py-1">{new Date(p.purchase_at).toLocaleString()}</td>
                  <td className="px-2 py-1">{p.customer_name || 'Walk-in'}</td>
                  <td className="px-2 py-1">{(p.total_amount ?? p.total_sales ?? p.sale_total_amount ?? 0).toFixed ? (parseFloat(p.total_amount ?? p.total_sales ?? p.sale_total_amount ?? 0).toFixed(2)) : (p.total_amount ?? p.total_sales ?? p.sale_total_amount ?? 0)}</td>
                  <td className="px-2 py-1">{(p.cost_total ?? p.total_cogs ?? p.sale_cost_total ?? 0).toFixed ? (parseFloat(p.cost_total ?? p.total_cogs ?? p.sale_cost_total ?? 0).toFixed(2)) : (p.cost_total ?? p.total_cogs ?? p.sale_cost_total ?? 0)}</td>
                  <td className="px-2 py-1">{(p.total_allocated_offer ?? p.total_offers ?? 0).toFixed ? (parseFloat(p.total_allocated_offer ?? p.total_offers ?? 0).toFixed(2)) : (p.total_allocated_offer ?? p.total_offers ?? 0)}</td>
                  <td className="px-2 py-1">{(p.profit ?? ((p.total_amount ?? p.total_sales ?? 0) - (p.cost_total ?? p.total_cogs ?? 0) - (p.total_allocated_offer ?? 0))).toFixed ? parseFloat(p.profit ?? ((p.total_amount ?? p.total_sales ?? 0) - (p.cost_total ?? p.total_cogs ?? 0) - (p.total_allocated_offer ?? 0))).toFixed(2) : (p.profit ?? ((p.total_amount ?? p.total_sales ?? 0) - (p.cost_total ?? p.total_cogs ?? 0) - (p.total_allocated_offer ?? 0)))}</td>
                  <td className="px-2 py-1">{p.created_by || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
