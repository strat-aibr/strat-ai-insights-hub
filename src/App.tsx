
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User } from "@/types";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientView from "./pages/ClientView";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is stored in localStorage (will be replaced with Supabase session)
    const storedUser = localStorage.getItem("strataiUser");
    console.log("ProtectedRoute: Verificando usuário armazenado", { storedUser });
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure ID is a number
        parsedUser.id = Number(parsedUser.id) || 0;
        console.log("ProtectedRoute: Usuário carregado", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Erro ao analisar usuário do localStorage:", error);
        localStorage.removeItem("strataiUser");
        toast.error("Erro na sessão do usuário. Por favor, faça login novamente.");
      }
    } else {
      console.log("ProtectedRoute: Nenhum usuário encontrado");
    }
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }
  
  if (!user) {
    console.log("ProtectedRoute: Redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  console.log("ProtectedRoute: Renderizando conteúdo protegido para usuário", user);
  return children;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check if user is stored in localStorage (will be replaced with Supabase session)
    const storedUser = localStorage.getItem("strataiUser");
    console.log("App: Verificando usuário armazenado", { storedUser });
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure ID is a number
        parsedUser.id = Number(parsedUser.id) || 0;
        console.log("App: Usuário carregado", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Erro ao analisar usuário do localStorage:", error);
        localStorage.removeItem("strataiUser");
      }
    }
  }, []);
  
  const handleLogout = () => {
    console.log("Realizando logout");
    localStorage.removeItem("strataiUser");
    setUser(null);
    toast.success("Logout realizado com sucesso");
  };

  // Só define isAdmin se o usuário existir
  const isAdmin = user?.role === "admin";
  console.log("App: Estado atual", { user, isAdmin });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {/* Garantir que user é passado apenas quando não for nulo */}
                  <Dashboard 
                    user={user as User} 
                    isAdmin={!!isAdmin} 
                    onLogout={handleLogout} 
                  />
                </ProtectedRoute>
              }
            />
            <Route path="/strat-ai-report/view" element={<ClientView />} />
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
