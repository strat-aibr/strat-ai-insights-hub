
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase, cleanupAuthState } from "@/integrations/supabase/client";

// Mock users for testing - we'll also try Supabase auth first
const MOCK_USERS = [
  {
    id: "admin-id",
    email: "admin@stratai.com",
    password: "admin123",
    name: "Administrador",
    role: "admin"
  },
  {
    id: "client-id",
    email: "cliente@example.com",
    password: "cliente123",
    name: "Cliente Demo",
    role: "client"
  }
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const storedUser = localStorage.getItem("strataiUser");
      
      if (session?.user || storedUser) {
        navigate("/dashboard");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      // Clean up existing auth state to avoid conflicts
      cleanupAuthState();
      
      // First try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.log("Supabase login error:", error);
        
        // If Supabase fails, try mock users as fallback
        const user = MOCK_USERS.find(
          u => u.email === email && u.password === password
        );
        
        if (user) {
          console.log("Mock user login successful");
          
          // Store user info in localStorage
          const { password: _, ...userWithoutPassword } = user;
          localStorage.setItem("strataiUser", JSON.stringify(userWithoutPassword));
          
          toast.success(`Bem-vindo, ${user.name}!`);
          navigate("/dashboard");
        } else {
          toast.error("Email ou senha incorretos");
        }
      } else if (data.user) {
        console.log("Supabase login successful:", data.user);
        
        // In a real app, you would fetch the user's profile data from your database here
        // For now, create a temporary user object based on Supabase data
        const userProfile = {
          id: 1, // This should ideally come from your database
          name: data.user.user_metadata.name || data.user.email?.split('@')[0] || "Usuário",
          email: data.user.email || "",
          role: "client" // Default role - would ideally come from your database
        };
        
        localStorage.setItem("strataiUser", JSON.stringify(userProfile));
        toast.success(`Bem-vindo, ${userProfile.name}!`);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-stratai-600 to-stratai-800 bg-clip-text text-transparent">
              Strat AI Report
            </h1>
          </div>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
