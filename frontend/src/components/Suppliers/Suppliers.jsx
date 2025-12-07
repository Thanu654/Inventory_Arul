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
    <div>
      <h2 className="text-xl font-semibold mb-4">Suppliers</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded shadow">
            <h3 className="font-medium">{editing ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
            <input name="contact_person" placeholder="Contact Person" value={form.contact_person} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded">{editing ? 'Update' : 'Add'}</button>
              {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' }); }} className="px-4 py-2 border rounded">Cancel</button>}
            </div>
          </form>
        </div>
        <div>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-medium mb-2">Existing Suppliers</h3>
            {loading ? <div>Loading...</div> : (
              <ul className="space-y-2">
                {suppliers.map(s => (
                  <li key={s.id} className="flex justify-between items-center border-b py-2">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-gray-500">{s.contact_person} {s.phone && `· ${s.phone}`}</div>
                    </div>
                    <div className="space-x-2">
                      <button onClick={() => handleEdit(s)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
