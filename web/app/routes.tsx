import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { MainApp } from "./pages/MainApp";
import { InvitePage } from "./components/InvitePage";
import { ScanProfile } from "./pages/ScanProfile";
import { useAuth } from "./contexts/AuthContext";
import { PaymentConfirmPage } from "./pages/PaymentConfirmPage";

// Protected Route Component
function ProtectedRoute() {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-red-50 via-amber-50 to-yellow-50">
        <div className="text-center">
          <div className="size-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <MainApp />,
      },
    ],
  },
  {
    path: "/profile/edit",
    element: <Navigate to="/app" replace />,
  },
  {
    path: "/payment/confirm",
    element: <ProtectedRoute />,
    children: [{ index: true, element: <PaymentConfirmPage /> }],
  },
  {
    path: "/scan/:userId",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <ScanProfile />,
      },
    ],
  },
  {
    path: "/invite/:inviterId",
    element: <InvitePage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);