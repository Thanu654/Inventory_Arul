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
import Login from './components/Login';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
// import AddStaff from './components/Staff/AddStaff';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected routes under /dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<ViewInventory />} />
          <Route path="delivery" element={<Delivery />} />
          <Route path="billing" element={<Billing />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="offers" element={<Offers />} />

          {/* Admin-only pages */}
          {/* <Route path="add-staff" element={<AdminRoute><AddStaff /></AdminRoute>} /> */}
        </Route>

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
