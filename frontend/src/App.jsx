import React from 'react';
import "./globals.css";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ViewInventory from './components/Inventory/ViewInventory';
import Dashboard from './components/Dashboard/Dashboard';
import Billing from './components/Billing/Billing';
import Transactions from './components/Transactions/Transactions';
import Notifications from './components/Notifications/Notifications';
import Offers from './components/Offers/Offers';
import Delivery from './components/Delivery/Delivery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<ViewInventory />} />
          <Route path="delivery" element={<Delivery />} />
          <Route path="billing" element={<Billing />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="offers" element={<Offers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;