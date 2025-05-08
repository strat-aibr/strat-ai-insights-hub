import { Card, DashboardStats, FilterParams, TopItem, User } from "@/types";
import { calculatePreviousPeriod, formatDateForAPI } from "./date-utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export async function fetchUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('TRACKING | USERS')
      .select('id, name, email, instancia, strat')
      
    if (error) throw error;
    
    // Transform the data to match our User type
    const users = data.map(user => ({
      id: user.id.toString(),
      name: user.name || '',
      email: user.email || '',
      instancia: user.instancia,
      // created_at field is not available in the database table
      role: user.strat ? 'admin' : 'client' // Assuming "strat" field indicates admin status
    }));
    
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("Não foi possível carregar a lista de usuários");
    return [];
  }
}

export async function fetchCards(filters: FilterParams): Promise<Card[]> {
  try {
    // Build query
    let query = supabase
      .from('TRACKING | CARDS')
      .select('*')
    
    // Apply filters
    if (filters.userId) {
      // Convert string userId to number for the database
      const userIdNumber = parseInt(filters.userId);
      if (!isNaN(userIdNumber)) {
        query = query.eq('user_id', userIdNumber);
      }
    }
    
    // Date range filter
    if (filters.dateRange.from && filters.dateRange.to) {
      const fromDate = formatDateForAPI(filters.dateRange.from);
      const toDate = formatDateForAPI(filters.dateRange.to);
      query = query.gte('data_criacao', fromDate).lte('data_criacao', toDate);
    }
    
    // Other filters
    if (filters.fonte) query = query.eq('fonte', filters.fonte);
    if (filters.campanha) query = query.eq('campanha', filters.campanha);
    if (filters.conjunto) query = query.eq('conjunto', filters.conjunto);
    if (filters.anuncio) query = query.eq('anuncio', filters.anuncio);
    if (filters.palavraChave) query = query.eq('palavra_chave', filters.palavraChave);
    
    // Text search (search across name and phone)
    if (filters.search) {
      query = query.or(`nome.ilike.%${filters.search}%,numero_de_telefone.ilike.%${filters.search}%`);
    }
    
    // Order by creation date (newest first)
    query = query.order('data_criacao', { ascending: false });
    
    // Execute query
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Type cast the data to match our Card type
    return (data as unknown) as Card[];
  } catch (error) {
    console.error("Error fetching cards:", error);
    toast.error("Não foi possível carregar os dados de leads");
    return [];
  }
}

export async function fetchDashboardStats(filters: FilterParams): Promise<DashboardStats> {
  try {
    // Fetch cards first to calculate stats
    const cards = await fetchCards(filters);
    
    // Calculate comparison period
    const prevPeriod = calculatePreviousPeriod(
      filters.dateRange.from,
      filters.dateRange.to
    );
    
    // Fetch previous period cards for comparison
    const previousPeriodFilters = { ...filters };
    previousPeriodFilters.dateRange = { from: prevPeriod.previousFrom, to: prevPeriod.previousTo };
    const previousCards = await fetchCards(previousPeriodFilters);
    
    // Calculate stats
    const totalLeads = cards.length;
    const previousTotalLeads = previousCards.length;
    
    // Calculate variation
    let variationValue = totalLeads - previousTotalLeads;
    let variationPercentage = previousTotalLeads === 0 
      ? (totalLeads > 0 ? 100 : 0) 
      : (variationValue / previousTotalLeads) * 100;
    
    const variation: MetricVariation = {
      value: variationValue,
      percentage: variationPercentage,
      trend: variationValue > 0 ? 'up' : variationValue < 0 ? 'down' : 'neutral'
    };
    
    // Group by campaign for top campaigns
    const campaignMap = new Map<string, number>();
    const conjuntoMap = new Map<string, number>();
    const anuncioMap = new Map<string, number>();
    const locationMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    const dateMap = new Map<string, number>();
    
    // Process cards data
    cards.forEach(card => {
      // Campaigns
      if (card.campanha) {
        campaignMap.set(card.campanha, (campaignMap.get(card.campanha) || 0) + 1);
      }
      
      // Conjuntos
      if (card.conjunto) {
        conjuntoMap.set(card.conjunto, (conjuntoMap.get(card.conjunto) || 0) + 1);
      }
      
      // Anúncios
      if (card.anuncio) {
        anuncioMap.set(card.anuncio, (anuncioMap.get(card.anuncio) || 0) + 1);
      }
      
      // Location
      if (card.location?.city) {
        const locationName = `${card.location.city}${card.location.region ? ', ' + card.location.region : ''}`;
        locationMap.set(locationName, (locationMap.get(locationName) || 0) + 1);
      }
      
      // Browser
      if (card.browser) {
        const browserName = typeof card.browser === 'string' ? card.browser : card.browser.name || 'Unknown';
        browserMap.set(browserName, (browserMap.get(browserName) || 0) + 1);
      }
      
      // Date
      if (card.data_criacao) {
        const date = new Date(card.data_criacao).toISOString().split('T')[0];
        dateMap.set(date, (dateMap.get(date) || 0) + 1);
      }
    });
    
    // Convert maps to sorted arrays
    const topCampaigns = mapToTopItems(campaignMap);
    const topConjuntos = mapToTopItems(conjuntoMap);
    const topAnuncios = mapToTopItems(anuncioMap);
    
    // Create date series (fill missing dates)
    const leadsByDate = createDateSeries(dateMap, filters.dateRange.from, filters.dateRange.to);
    
    // Location data
    const leadsByLocation = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
      
    // Browser data
    const leadsByBrowser = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Generate Sankey data
    const sankeyData = generateSankeyData(cards);
    
    return {
      totalLeads,
      variation,
      topCampaigns,
      topConjuntos,
      topAnuncios,
      leadsByDate,
      leadsByLocation,
      leadsByBrowser,
      sankeyData
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    toast.error("Não foi possível carregar as estatísticas do dashboard");
    
    // Return empty data structure
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

// Helper function to convert a map to an array of TopItems
function mapToTopItems(map: Map<string, number>): TopItem[] {
  const total = Array.from(map.values()).reduce((sum, count) => sum + count, 0);
  
  return Array.from(map.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);
}

// Helper function to create a date series with all dates in range
function createDateSeries(dateMap: Map<string, number>, from: Date, to: Date): { date: string; count: number }[] {
  const result = [];
  const currentDate = new Date(from);
  const endDate = new Date(to);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: dateMap.get(dateStr) || 0
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}

// Generate Sankey chart data
function generateSankeyData(cards: Card[]): {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
} {
  if (!cards || cards.length === 0) {
    return { nodes: [], links: [] };
  }
  
  // Create nodes and track their indices
  const nodeMap = new Map<string, number>();
  const nodes: { name: string }[] = [];
  
  // Helper to add node if not exists and get index
  const getNodeIndex = (name: string): number => {
    if (name === null || name === undefined || name === '') {
      name = 'Não definido';
    }
    
    if (!nodeMap.has(name)) {
      nodeMap.set(name, nodes.length);
      nodes.push({ name });
    }
    return nodeMap.get(name)!;
  };
  
  // Track links with a map using source-target as key
  const linkMap = new Map<string, number>();
  
  // Process cards to build links
  cards.forEach(card => {
    const fonte = card.fonte || 'Não definido';
    const campanha = card.campanha || 'Não definido';
    const conjunto = card.conjunto || 'Não definido';
    const anuncio = card.anuncio || 'Não definido';
    
    // Add links: fonte -> campanha -> conjunto -> anúncio
    const fontIdx = getNodeIndex(fonte);
    const campIdx = getNodeIndex(campanha);
    const conjIdx = getNodeIndex(conjunto);
    const anunIdx = getNodeIndex(anuncio);
    
    // Increment link values
    const link1Key = `${fontIdx}-${campIdx}`;
    linkMap.set(link1Key, (linkMap.get(link1Key) || 0) + 1);
    
    const link2Key = `${campIdx}-${conjIdx}`;
    linkMap.set(link2Key, (linkMap.get(link2Key) || 0) + 1);
    
    const link3Key = `${conjIdx}-${anunIdx}`;
    linkMap.set(link3Key, (linkMap.get(link3Key) || 0) + 1);
  });
  
  // Convert linkMap to array of links
  const links = Array.from(linkMap.entries()).map(([key, value]) => {
    const [source, target] = key.split('-').map(Number);
    return { source, target, value };
  });
  
  return { nodes, links };
}

// Let's keep the existing export function as it is
export function exportToCSV(cards: Card[], filename: string = "strat-ai-report-leads"): void {
  // Headers
  const headers = [
    "Data", "Nome", "Telefone", "Fonte", "Campanha", 
    "Conjunto", "Anúncio", "Palavra-chave", "Browser", "Localização", "Dispositivo"
  ];
  
  // Format data rows
  const rows = cards.map(card => [
    new Date(card.data_criacao).toLocaleDateString('pt-BR'),
    card.nome || "",
    card.numero_de_telefone || "",
    card.fonte || "",
    card.campanha || "",
    card.conjunto || "",
    card.anuncio || "",
    card.palavra_chave || "",
    card.browser ? (typeof card.browser === 'string' ? card.browser : card.browser.name) : "",
    card.location?.city ? `${card.location.city}${card.location.region ? ', ' + card.location.region : ''}` : "",
    card.dispositivo || ""
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
  
  // Create download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function generateClientLink(userId: string): Promise<string> {
  try {
    // Generate a token (this could be replaced with a more secure method in production)
    const token = btoa(`user-${userId}-${Date.now()}`);
    
    // In a real application, you would store this token in the database
    // For this example, we'll just return a link with the token
    const baseUrl = window.location.origin;
    return `${baseUrl}/strat-ai-report/view?token=${token}`;
  } catch (error) {
    console.error("Error generating client link:", error);
    toast.error("Não foi possível gerar o link para o cliente");
    return "";
  }
}
