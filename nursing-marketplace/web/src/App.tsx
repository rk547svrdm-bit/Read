import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { AuctionsPage } from "./pages/AuctionsPage";
import { NursePage } from "./pages/NursePage";
import { AuctionPage } from "./pages/AuctionPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { NurseDashboardPage } from "./pages/NurseDashboardPage";
import { ClientDashboardPage } from "./pages/ClientDashboardPage";

export function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/nurses/:id" element={<NursePage />} />
          <Route path="/auctions/:id" element={<AuctionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard/nurse"
            element={
              <ProtectedRoute role="NURSE">
                <NurseDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/client"
            element={
              <ProtectedRoute role="CLIENT">
                <ClientDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
