import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ExivaPage from "./pages/ExivaPage";
import RelatorioPage from "./pages/RelatorioPage";
import BonecosPage from "./pages/BonecosPage";
import MapaPage from "./pages/MapaPage";

import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdminOrAbove, loading } = useAuth();
  if (loading) return null;
  return isAdminOrAbove ? <>{children}</> : <Navigate to="/" replace />;
}

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center animate-pulse">
        <svg className="h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="m16 16 3.5 3.5"/><path d="M19 21a2 2 0 0 0 2-2v0a2 2 0 0 0-.6-1.4L18 15"/></svg>
      </div>
      <span className="text-xs font-mono text-muted-foreground tracking-wider">CARREGANDO...</span>
    </div>
  );
  if (!user) return <LoginPage />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/exiva" element={<ExivaPage />} />
        <Route path="/relatorio" element={<RelatorioPage />} />
        <Route path="/bonecos" element={<BonecosPage />} />
        <Route path="/mapa" element={<MapaPage />} />
        
        <Route path="/admin/usuarios" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
