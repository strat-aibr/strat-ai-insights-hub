
import { supabase } from "@/integrations/supabase/client";
import { type User } from "@/types";
import { toast } from "sonner";

// Function to fetch users from Supabase
export async function fetchUsers(): Promise<User[]> {
  try {
    console.log("Iniciando fetchUsers...");
    
    // Instead of using count(), directly fetch the users
    const { data, error } = await supabase
      .from("TRACKING | USERS")
      .select("id, name, email, instancia, strat")
      .order('id');
    
    if (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Erro ao buscar lista de usuários");
      throw error;
    }

    if (!data || data.length === 0) {
      console.log("Nenhum usuário encontrado");
      return [];
    }

    console.log("Usuários encontrados:", data.length, data);
    
    // Map the data to the User type, adding role property as it's required by the User type
    const users: User[] = data.map(user => ({
      id: typeof user.id === 'number' ? user.id : Number(user.id),
      name: user.name || "",
      email: user.email || "",
      instancia: user.instancia || "",
      role: undefined, // Add this property as it's required by the User type
      strat: user.strat || false
    }));
    
    return users;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    toast.error("Falha ao buscar usuários");
    return [];
  }
}
