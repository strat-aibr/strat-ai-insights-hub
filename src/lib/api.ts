import { supabase } from "@/integrations/supabase/client";
import { type Card, type DashboardStats, type FilterParams, type User } from "@/types";
import { calculatePreviousPeriod, formatDateForAPI } from "./date-utils";
import { toast } from "sonner";

// Function to generate a client link
export async function generateClientLink(userId: number): Promise<string> {
  try {
    console.log("Generating client link for user ID:", userId);
    
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from("TRACKING | USERS")
      .select("id, name")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error checking user:", userError);
      throw new Error("User not found");
    }

    // Create a simple token (in a production app, you'd use a more secure method)
    const token = btoa(`client-${userId}-${Date.now()}`);
    
    // In a real app, you would store this token in the database
    // For now, we'll just return the link
    const baseUrl = window.location.origin;
    return `${baseUrl}/strat-ai-report/view?token=${token}&userId=${userId}`;
  } catch (error) {
    console.error("Error generating client link:", error);
    throw error;
  }
}

// Function to fetch users from Supabase
export async function fetchUsers(): Promise<User[]> {
  try {
    console.log("Iniciando fetchUsers...");
    
    // Test the connection first
    const { data: testData, error: testError } = await supabase
      .from("TRACKING | USERS")
      .select("count()")
      .limit(1);
    
    if (testError) {
      console.error("Erro no teste de conexão:", testError);
      toast.error("Erro ao conectar com o banco de dados");
      throw testError;
    }
    
    console.log("Teste de conexão bem-sucedido:", testData);
    
    // Now fetch the actual data
    const { data, error } = await supabase
      .from("TRACKING | USERS")
      .select("id, name, email, instancia, strat");

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

// Function to fetch cards (leads) from Supabase based on filters
export async function fetchCards(filters: FilterParams): Promise<Card[]> {
  try {
    console.log("Iniciando fetchCards com filtros:", filters);
    
    if (!filters || (filters.userId === null && filters.userId !== 0)) {
      console.warn("Filtros inválidos ou sem ID de usuário:", filters);
      return [];
    }
    
    // Test the connection first
    const { data: testData, error: testError } = await supabase
      .from("TRACKING | CARDS")
      .select("count()")
      .limit(1);
    
    if (testError) {
      console.error("Erro no teste de conexão para cards:", testError);
      toast.error("Erro ao conectar com o banco de dados");
      throw testError;
    }
    
    console.log("Teste de conexão para cards bem-sucedido:", testData);
    
    let query = supabase.from("TRACKING | CARDS").select("*");

    // Apply filters
    if (filters.userId) {
      console.log("Filtrando por ID de usuário:", filters.userId);
      query = query.eq("user_id", filters.userId);
    }

    if (filters.dateRange?.from && filters.dateRange?.to) {
      const fromDate = formatDateForAPI(filters.dateRange.from);
      const toDate = formatDateForAPI(filters.dateRange.to);
      console.log(`Filtrando por intervalo de data: ${fromDate} a ${toDate}`);
      query = query.gte("data_criacao", fromDate).lte("data_criacao", toDate);
    }

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

    if (filters.search) {
      query = query.or(`nome.ilike.%${filters.search}%,numero_de_telefone.ilike.%${filters.search}%`);
    }

    console.log("Executando query do Supabase para cards...");
    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar cards:", error);
      toast.error("Erro ao buscar leads");
      throw error;
    }

    if (!data) {
      console.log("Nenhum card encontrado");
      return [];
    }

    console.log("Cards encontrados:", data.length, "amostra:", data.slice(0, 2));
    
    // Cast the data to the Card type
    return data as unknown as Card[];
  } catch (error) {
    console.error("Erro ao buscar cards:", error);
    toast.error("Falha ao buscar leads");
    return [];
  }
}

// Function to fetch dashboard statistics
export async function fetchDashboardStats(filters: FilterParams): Promise<DashboardStats> {
  try {
    console.log("Gerando estatísticas do dashboard com filtros:", filters);
    
    // First, fetch the cards based on the current filters
    const currentCards = await fetchCards(filters);
    console.log("Cards obtidos para estatísticas:", currentCards.length);
    
    // Calculate the previous period for comparison
    const { previousFrom, previousTo } = calculatePreviousPeriod(
      filters.dateRange?.from, 
      filters.dateRange?.to
    );
    
    // Fetch cards for the previous period
    const previousFilters = {
      ...filters,
      dateRange: { from: previousFrom, to: previousTo }
    };
    
    // Fetch the previous cards
    const previousCards = await fetchCards(previousFilters);
    console.log("Cards do período anterior:", previousCards.length);
    
    // Calculate percentage change
    const currentCount = currentCards.length;
    const previousCount = previousCards.length;
    let percentageChange = 0;
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    
    if (previousCount > 0) {
      percentageChange = ((currentCount - previousCount) / previousCount) * 100;
      trend = percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral';
    } else if (currentCount > 0) {
      percentageChange = 100;
      trend = 'up';
    }
    
    // Process data for charts
    const leadsByDate: { date: string; count: number }[] = [];
    const locationMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    
    // Count leads by campaign, set, and ad
    const campaignMap = new Map<string, number>();
    const setMap = new Map<string, number>();
    const adMap = new Map<string, number>();
    
    currentCards.forEach(card => {
      // Process date
      const date = card.data_criacao ? (typeof card.data_criacao === 'string' ? card.data_criacao.split('T')[0] : '') : '';
      if (date) {
        const existingDateIndex = leadsByDate.findIndex(item => item.date === date);
        if (existingDateIndex >= 0) {
          leadsByDate[existingDateIndex].count += 1;
        } else {
          leadsByDate.push({ date, count: 1 });
        }
      }
      
      // Process location
      const location = card.location?.city || 'Unknown';
      locationMap.set(location, (locationMap.get(location) || 0) + 1);
      
      // Process browser
      let browserName = 'Unknown';
      if (typeof card.browser === 'string') {
        browserName = card.browser;
      } else if (card.browser && typeof card.browser === 'object' && 'name' in card.browser) {
        browserName = card.browser.name as string || 'Unknown';
      }
      browserMap.set(browserName, (browserMap.get(browserName) || 0) + 1);
      
      // Process campaign, set, and ad
      if (card.campanha) {
        campaignMap.set(card.campanha, (campaignMap.get(card.campanha) || 0) + 1);
      }
      if (card.conjunto) {
        setMap.set(card.conjunto, (setMap.get(card.conjunto) || 0) + 1);
      }
      if (card.anuncio) {
        adMap.set(card.anuncio, (adMap.get(card.anuncio) || 0) + 1);
      }
    });
    
    // Sort dates chronologically
    leadsByDate.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Convert maps to sorted arrays
    const topLocations = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
    
    const topBrowsers = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
    
    // Convert and sort campaign, set, and ad data
    const topCampaigns = Array.from(campaignMap.entries())
      .map(([name, count]) => ({ 
        name, 
        count,
        percentage: (count / currentCount) * 100
      }))
      .sort((a, b) => b.count - a.count);
    
    const topConjuntos = Array.from(setMap.entries())
      .map(([name, count]) => ({ 
        name, 
        count,
        percentage: (count / currentCount) * 100
      }))
      .sort((a, b) => b.count - a.count);
    
    const topAnuncios = Array.from(adMap.entries())
      .map(([name, count]) => ({ 
        name, 
        count,
        percentage: (count / currentCount) * 100
      }))
      .sort((a, b) => b.count - a.count);
    
    // Create data for Sankey diagram
    const nodeNames = new Set<string>();
    const links: { source: string; target: string; value: number }[] = [];
    
    // Add nodes and links for campaigns to sets
    currentCards.forEach(card => {
      if (card.fonte) nodeNames.add(card.fonte);
      if (card.campanha) nodeNames.add(card.campanha);
      if (card.conjunto) nodeNames.add(card.conjunto);
      if (card.anuncio) nodeNames.add(card.anuncio);
      
      // Add links
      if (card.fonte && card.campanha) {
        const existingLink = links.find(link => link.source === card.fonte && link.target === card.campanha);
        if (existingLink) {
          existingLink.value += 1;
        } else {
          links.push({ source: card.fonte, target: card.campanha, value: 1 });
        }
      }
      
      if (card.campanha && card.conjunto) {
        const existingLink = links.find(link => link.source === card.campanha && link.target === card.conjunto);
        if (existingLink) {
          existingLink.value += 1;
        } else {
          links.push({ source: card.campanha, target: card.conjunto, value: 1 });
        }
      }
      
      if (card.conjunto && card.anuncio) {
        const existingLink = links.find(link => link.source === card.conjunto && link.target === card.anuncio);
        if (existingLink) {
          existingLink.value += 1;
        } else {
          links.push({ source: card.conjunto, target: card.anuncio, value: 1 });
        }
      }
    });
    
    // Convert node names to indices for Sankey chart
    const nodeList = Array.from(nodeNames);
    const indexedLinks = links.map(link => ({
      source: nodeList.indexOf(link.source),
      target: nodeList.indexOf(link.target),
      value: link.value
    }));
    
    console.log("Estatísticas geradas com sucesso");
    
    // Create the stats object
    const stats: DashboardStats = {
      totalLeads: currentCount,
      variation: {
        value: Math.abs(currentCount - previousCount),
        percentage: Math.abs(percentageChange),
        trend
      },
      topCampaigns,
      topConjuntos,
      topAnuncios,
      leadsByDate,
      leadsByLocation: topLocations,
      leadsByBrowser: topBrowsers,
      sankeyData: {
        nodes: nodeList.map(name => ({ name })),
        links: indexedLinks
      }
    };
    
    return stats;
  } catch (error) {
    console.error("Erro ao gerar estatísticas do dashboard:", error);
    
    // Return default empty stats in case of error
    return {
      totalLeads: 0,
      variation: { value: 0, percentage: 0, trend: 'neutral' },
      topCampaigns: [],
      topConjuntos: [],
      topAnuncios: [],
      leadsByDate: [],
      leadsByLocation: [],
      leadsByBrowser: [],
      sankeyData: { nodes: [], links: [] }
    };
  }
}

// Function to export data to CSV
export function exportToCSV(data: Card[]) {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }
  
  try {
    // Define CSV headers
    const headers = [
      "ID", 
      "Nome", 
      "Telefone", 
      "Fonte", 
      "Campanha", 
      "Conjunto", 
      "Anúncio",
      "Palavra-chave",
      "Dispositivo",
      "Cidade",
      "Data de Criação"
    ];
    
    // Convert data to CSV rows
    const rows = data.map(card => [
      card.id,
      card.nome,
      card.numero_de_telefone,
      card.fonte || "",
      card.campanha || "",
      card.conjunto || "",
      card.anuncio || "",
      card.palavra_chave || "",
      card.dispositivo || "",
      card.location?.city || "",
      card.data_criacao ? new Date(card.data_criacao).toLocaleString() : ""
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting to CSV:", error);
  }
}
