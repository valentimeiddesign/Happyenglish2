import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Products } from "./pages/Products";
import { Customers } from "./pages/Customers";
import { Purchases } from "./pages/Purchases";
import { Reviews } from "./pages/Reviews";
import { Sync } from "./pages/Sync";
import { Settings } from "./pages/Settings";
import { Spinner } from "./components/bits";

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Spinner className="w-6 h-6 text-muted-foreground" />
    </div>
  );
}

function ProtectedLayout() {
  const { session, isAdmin, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (!session || !isAdmin) return <Navigate to="/admin/login" replace />;
  return <Layout />;
}

function LoginRoute() {
  const { session, isAdmin, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (session && isAdmin) return <Navigate to="/admin" replace />;
  return <Login />;
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginRoute />} />
      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="sync" element={<Sync />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminRoutes />
    </AuthProvider>
  );
}
