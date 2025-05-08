
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
import { supabase, cleanupAuthState } from "./integrations/supabase/client";

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
    // First check for active Supabase session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro na sessão do Supabase:", error);
        }
        
        if (session) {
          console.log("Sessão do Supabase encontrada:", session);
          // Here we would typically fetch user data from your TRACKING | USERS table
          // For now, fall back to localStorage
        }
        
        // Check localStorage as fallback
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
      } catch (err) {
        console.error("Erro ao verificar sessão:", err);
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando autenticação...</div>;
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
    const checkAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log("Auth state change:", event, session);
            
            // On sign out, clear local user
            if (event === 'SIGNED_OUT') {
              setUser(null);
              localStorage.removeItem("strataiUser");
              return;
            }
            
            // On sign in, we would typically fetch user data
            if (event === 'SIGNED_IN' && session) {
              // For now, just log it
              console.log("User signed in:", session.user);
              
              // In a real implementation, we'd fetch user data from your database here
              // setTimeout is used to avoid potential deadlocks with Supabase auth
              setTimeout(() => {
                // fetchUserData(session.user.id);
              }, 0);
            }
          }
        );
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log("Existing session found:", session.user);
          // Would fetch user data here
        }
        
        // Check localStorage as fallback
        const storedUser = localStorage.getItem("strataiUser");
        console.log("App: Verificando usuário armazenado", { storedUser });
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // Ensure ID is a number
            parsedUser.id = typeof parsedUser.id === 'number' ? parsedUser.id : Number(parsedUser.id);
            console.log("App: Usuário carregado", parsedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error("Erro ao analisar usuário do localStorage:", error);
            cleanupAuthState();
          }
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      }
    };
    
    checkAuth();
  }, []);
  
  const handleLogout = async () => {
    console.log("Realizando logout");
    // Clean up auth state first
    cleanupAuthState();
    
    try {
      // Sign out from Supabase with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error("Erro ao fazer logout do Supabase:", error);
      } else {
        console.log("Supabase logout bem-sucedido");
      }
    } catch (error) {
      console.error("Erro ao fazer logout do Supabase:", error);
    }
    
    // Clear user state
    setUser(null);
    toast.success("Logout realizado com sucesso");
    
    // Force page reload for a clean state
    window.location.href = '/login';
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
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard 
                    user={user || {
                      id: 0,
                      name: "Carregando...",
                      email: "Carregando..."
                    }}
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
