
import { supabase } from "@/integrations/supabase/client";
import { type Card, type FilterParams } from "@/types";
import { formatDateForAPI } from "@/lib/date-utils";
import { toast } from "sonner";

// Function to fetch cards (leads) from Supabase based on filters
export async function fetchCards(filters: FilterParams): Promise<Card[]> {
  try {
    console.log("Iniciando fetchCards com filtros:", filters);
    
    console.log("Supabase client status:", supabase);
    
    let query = supabase.from("TRACKING | CARDS").select("*");

    // Apply userId filter if provided - this is now properly applied
    if (filters.userId !== null && filters.userId !== undefined) {
      console.log("Filtrando por ID de usuário:", filters.userId);
      query = query.eq("user_id", filters.userId);
    } else {
      console.log("Buscando todos os cards sem filtro de usuário");
    }

    if (filters.dateRange?.from && filters.dateRange?.to) {
      const fromDate = formatDateForAPI(filters.dateRange.from);
      const toDate = formatDateForAPI(filters.dateRange.to);
      console.log(`Filtrando por intervalo de data: ${fromDate} a ${toDate}`);
      query = query.gte("data_criacao", fromDate).lte("data_criacao", toDate);
    }

    // Apply other filters
    if (filters.fonte) {
      query = query.eq("fonte", filters.fonte);
    }

    if (filters.campanha) {
      query = query.eq("campanha", filters.campanha);
    }

    if (filters.conjunto) {
      query = query.eq("conjunto", filters.conjunto);
    }

    if (filters.anuncio) {
      query = query.eq("anuncio", filters.anuncio);
    }

    if (filters.palavraChave) {
      query = query.eq("palavra_chave", filters.palavraChave);
    }

    // Filter out organic results if hideOrganic is true
    if (filters.hideOrganic) {
      query = query.neq("fonte", "organic").neq("fonte", "Organic");
    }

    if (filters.search) {
      query = query.or(`nome.ilike.%${filters.search}%,numero_de_telefone.ilike.%${filters.search}%`);
    }

    console.log("Executando query do Supabase para cards...");
    const { data, error } = await query;

    if (error) {
      console.error("Erro detalhado ao buscar cards:", error);
      toast.error("Erro ao buscar leads: " + error.message);
      throw error;
    }

    console.log("Resposta da query de cards:", data);

    if (!data) {
      console.log("Nenhum card encontrado");
      return [];
    }

    console.log("Cards encontrados:", data.length, "amostra:", data.slice(0, 2));
    
    // Cast the data to the Card type
    return data as unknown as Card[];
  } catch (error) {
    console.error("Erro ao buscar cards:", error);
    toast.error("Falha ao buscar leads. Verifique o console para mais detalhes.");
    return [];
  }
}
