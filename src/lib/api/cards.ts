
import { supabase } from "@/integrations/supabase/client";
import { type Card, type FilterParams } from "@/types";
import { formatDateForAPI } from "@/lib/date-utils";
import { toast } from "sonner";

// Function to fetch cards (leads) from Supabase based on filters
export async function fetchCards(filters: FilterParams): Promise<Card[]> {
  try {
    console.log("Iniciando fetchCards com filtros:", filters);
    
    let query = supabase.from("TRACKING | CARDS").select("*");

    // Apply userId filter if provided
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
      query = query.not("fonte", "ilike", "%orgânico%").not("fonte", "ilike", "%organic%");
    }

    if (filters.search) {
      query = query.or(`nome.ilike.%${filters.search}%,numero_de_telefone.ilike.%${filters.search}%`);
    }

    console.log("Executando query do Supabase para cards...");
    const { data, error } = await query;

    if (error) {
      console.error("Erro detalhado ao buscar cards:", error);
      toast.error("Erro ao buscar leads: " + error.message);
      return []; // Return empty array on error instead of throwing
    }

    console.log("Resposta da query de cards:", data ? data.length : 0, "resultados");

    if (!data || data.length === 0) {
      console.log("Nenhum card encontrado");
      return [];
    }

    // Ensure all data has the required fields even if they're null
    const normalizedData = data.map(item => ({
      id: item.id || 0,
      nome: item.nome || "",
      numero_de_telefone: item.numero_de_telefone || "",
      user_id: item.user_id || 0,
      fonte: item.fonte || "",
      campanha: item.campanha || null,
      conjunto: item.conjunto || null,
      anuncio: item.anuncio || null,
      palavra_chave: item.palavra_chave || null,
      browser: item.browser || "",
      location: item.location || { city: "" },
      dispositivo: item.dispositivo || "",
      data_criacao: item.data_criacao || "",
    }));
    
    return normalizedData as Card[];
  } catch (error) {
    console.error("Erro ao buscar cards:", error);
    toast.error("Falha ao buscar leads. Verifique o console para mais detalhes.");
    return []; // Return empty array on error
  }
}
