import React, { useEffect, useState } from 'react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });
  const [editing, setEditing] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/suppliers`);
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${import.meta.env.VITE_API_BASE_URL}/suppliers/${editing}` : `${import.meta.env.VITE_API_BASE_URL}/suppliers`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed');
      await fetchSuppliers();
      setForm({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });
      setEditing(null);
    } catch (err) { console.error(err); }
  };

  const handleEdit = (s) => {
    setEditing(s.id);
    setForm({ name: s.name || '', contact_person: s.contact_person || '', phone: s.phone || '', email: s.email || '', address: s.address || '', notes: s.notes || '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete supplier?')) return;
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/suppliers/${id}`, { method: 'DELETE' });
    await fetchSuppliers();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 py-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
            <h3 className="font-semibold text-lg mb-4 text-blue-700">{editing ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
            <input name="contact_person" placeholder="Contact Person" value={form.contact_person} onChange={handleChange} className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
            <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
            <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
            <div className="flex space-x-3 pt-2">
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition font-semibold">{editing ? 'Update' : 'Add'}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' }); }} className="px-6 py-2 border border-blue-400 text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition font-semibold">Cancel</button>}
            </div>
          </form>
        </div>
        <div>
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
            <h3 className="font-semibold text-lg mb-4 text-blue-700">Existing Suppliers</h3>
            {loading ? <div className="text-blue-500">Loading...</div> : (
              <div className="md:max-h-[480px] md:overflow-y-auto md:pr-2">
                <ul className="space-y-3">
                  {suppliers.map(s => (
                    <li key={s.id} className="flex justify-between items-center border-b border-blue-100 py-3 group hover:bg-blue-50 rounded-lg transition">
                      <div>
                        <div className="font-semibold text-blue-900 group-hover:text-blue-700">{s.name}</div>
                        <div className="text-sm text-gray-500">{s.contact_person} {s.phone && `· ${s.phone}`}</div>
                      </div>
                      <div className="space-x-2 flex">
                        <button onClick={() => handleEdit(s)} className="px-4 py-1 bg-yellow-400 text-white rounded-lg shadow hover:bg-yellow-500 transition font-semibold">Edit</button>
                        <button onClick={() => handleDelete(s.id)} className="px-4 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition font-semibold">Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
