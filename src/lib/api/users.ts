
import { supabase } from "@/integrations/supabase/client";
import { type User } from "@/types";
import { toast } from "sonner";

// Function to fetch users from Supabase
export async function fetchUsers(): Promise<User[]> {
  try {
    console.log("Iniciando fetchUsers...");
    
    // Log the client to check if it's properly initialized
    console.log("Supabase client status:", supabase);
    
    // Direct query with extended logging
    console.log("Executando query para buscar usuários...");
    const { data, error } = await supabase
      .from("TRACKING | USERS")
      .select("*");
    
    if (error) {
      console.error("Erro detalhado ao buscar usuários:", error);
      toast.error("Erro ao buscar lista de usuários: " + error.message);
      throw error;
    }

    console.log("Resposta da query de usuários:", data);

    if (!data || data.length === 0) {
      console.log("Nenhum usuário encontrado na tabela TRACKING | USERS");
      return [];
    }
    
    // Map the data to the User type, adding role property as it's required by the User type
    const users: User[] = data.map(user => ({
      id: typeof user.id === 'number' ? user.id : Number(user.id),
      name: user.name || "",
      email: user.email || "",
      instancia: user.instancia || "",
      role: "client", // Default role since it's required by the User type
      strat: user.strat || false
    }));
    
    console.log("Usuários processados:", users);
    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    toast.error("Falha ao buscar usuários. Verifique o console para mais detalhes.");
    return [];
  }
}
