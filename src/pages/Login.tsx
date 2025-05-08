
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoginForm from "@/components/auth/LoginForm";

// This is a placeholder for actual authentication
// Will be replaced with Supabase authentication
const mockLogin = async (email: string, password: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Mock credentials for demo
  if (email === "admin@stratai.com" && password === "admin123") {
    return {
      id: "admin-id",
      name: "Administrator",
      email: "admin@stratai.com",
      role: "admin"
    };
  }
  
  if (email === "cliente@example.com" && password === "cliente123") {
    return {
      id: "client-id-1",
      name: "Cliente Demo",
      email: "cliente@example.com",
      role: "client"
    };
  }
  
  throw new Error("Credenciais inválidas");
};

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const user = await mockLogin(email, password);
      
      // Store user in localStorage (will be replaced with Supabase session)
      localStorage.setItem("strataiUser", JSON.stringify(user));
      
      toast.success(`Bem-vindo(a), ${user.name}!`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Credenciais inválidas. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return <LoginForm onLogin={handleLogin} isLoading={isLoading} />;
}
