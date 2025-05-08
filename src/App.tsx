
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
import { supabase } from "./integrations/supabase/client";

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
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("strataiUser");
    console.log("ProtectedRoute: Verificando usuário armazenado", { storedUser });
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure ID is a number
        parsedUser.id = typeof parsedUser.id === 'number' ? parsedUser.id : Number(parsedUser.id);
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
    const checkSession = async () => {
      try {
        // Check if Supabase session exists
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
        }
        
        // If Supabase has an active session, use it
        if (session?.user) {
          console.log("Sessão do Supabase encontrada:", session.user);
          // You might want to fetch more user data from your database here
          
          // For now, we'll still use localStorage as fallback
        }
        
        // Check localStorage as fallback
        const storedUser = localStorage.getItem("strataiUser");
        console.log("App: Verificando usuário armazenado", { storedUser });
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Ensure ID is a number (0 is a valid ID)
            parsedUser.id = typeof parsedUser.id === 'number' ? parsedUser.id : Number(parsedUser.id);
            console.log("App: Usuário carregado", parsedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error("Erro ao analisar usuário do localStorage:", error);
            localStorage.removeItem("strataiUser");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      }
    };
    
    checkSession();
  }, []);
  
  const handleLogout = () => {
    console.log("Realizando logout");
    localStorage.removeItem("strataiUser");
    
    // Also sign out from Supabase
    supabase.auth.signOut()
      .then(() => {
        console.log("Supabase signout successful");
      })
      .catch((error) => {
        console.error("Erro ao fazer logout do Supabase:", error);
      });
      
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
