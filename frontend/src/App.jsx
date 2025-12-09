import React from 'react';
import "./globals.css";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import Layout from './components/Layout/Layout';
import ViewInventory from './components/Inventory/ViewInventory';
import Suppliers from './components/Suppliers/Suppliers';
import Purchases from './components/Purchases/Purchases';
import Dashboard from './components/Dashboard/Dashboard';
import Billing from './components/Billing/Billing';
import Transactions from './components/Transactions/Transactions';
import Notifications from './components/Notifications/Notifications';
import Offers from './components/Offers/Offers';
import Delivery from './components/Delivery/Delivery';
import Login from './components/Login';
import AddStaff from './components/Staff/AddStaff';
import ViewStaff from './components/Staff/viewStaff';
import Reports from './components/Reports/Reports';
import { ProtectedRoute, AdminRoute} from './components/ProtectedRoute';
import { PermissionRoute } from './components/PermissionRoute';
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ LOGIN */}
        <Route path="/" element={<Login />} />

        {/* ✅ PROTECTED DASHBOARD LAYOUT */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* ✅ DEFAULT DASHBOARD */}
          <Route index element={<Dashboard />} />

          {/* ✅ STAFF PERMISSION BASED ROUTES */}
          <Route
            path="inventory"
            element={
              <PermissionRoute page="inventory">
                <ViewInventory />
              </PermissionRoute>
            }
          />

          <Route
            path="suppliers"
            element={
              <PermissionRoute page="inventory">
                <Suppliers />
              </PermissionRoute>
            }
          />

          <Route
            path="purchases"
            element={
              <PermissionRoute page="inventory">
                <Purchases />
              </PermissionRoute>
            }
          />

          <Route
            path="delivery"
            element={
              <PermissionRoute page="delivery">
                <Delivery />
              </PermissionRoute>
            }
          />

          <Route
            path="billing"
            element={
              <PermissionRoute page="billing">
                <Billing />
              </PermissionRoute>
            }
          />

          <Route
            path="transactions"
            element={
              <PermissionRoute page="transactions">
                <Transactions />
              </PermissionRoute>
            }
          />

          <Route
            path="notifications"
            element={
              <PermissionRoute page="notifications">
                <Notifications />
              </PermissionRoute>
            }
          />

          <Route
            path="reports"
            element={
              <PermissionRoute page="reports">
                <Reports />
              </PermissionRoute>
            }
          />

          <Route
            path="offers"
            element={
              <PermissionRoute page="offers">
                <Offers />
              </PermissionRoute>
            }
          />



          {/* ✅ ADMIN ONLY PAGE */}
          <Route
            path="add-staff"
            element={
              <AdminRoute>
                <AddStaff />
              </AdminRoute>
            }
          />
          <Route
            path="staff"
            element={
              <AdminRoute>
                <ViewStaff />
              </AdminRoute>
            }
          />

        </Route>

        {/* ✅ FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
