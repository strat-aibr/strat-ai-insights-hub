
import { Card, DashboardStats, FilterParams, TopItem, User } from "@/types";
import { calculatePreviousPeriod, formatDateForAPI } from "./date-utils";
import { toast } from "sonner";

// This is a placeholder for the actual Supabase client
// When integrating with Supabase, these functions will be updated

export async function fetchUsers(): Promise<User[]> {
  try {
    // Will be replaced with actual Supabase query
    const response = await fetch("/api/users");
    if (!response.ok) throw new Error("Falha ao carregar usuários");
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("Não foi possível carregar a lista de usuários");
    return [];
  }
}

export async function fetchCards(filters: FilterParams): Promise<Card[]> {
  try {
    // Will be replaced with actual Supabase query
    const queryParams = new URLSearchParams();
    
    if (filters.userId) queryParams.append("userId", filters.userId);
    queryParams.append("from", formatDateForAPI(filters.dateRange.from));
    queryParams.append("to", formatDateForAPI(filters.dateRange.to));
    if (filters.fonte) queryParams.append("fonte", filters.fonte);
    if (filters.campanha) queryParams.append("campanha", filters.campanha);
    if (filters.conjunto) queryParams.append("conjunto", filters.conjunto);
    if (filters.anuncio) queryParams.append("anuncio", filters.anuncio);
    if (filters.palavraChave) queryParams.append("palavraChave", filters.palavraChave);
    if (filters.search) queryParams.append("search", filters.search);
    
    const response = await fetch(`/api/cards?${queryParams.toString()}`);
    if (!response.ok) throw new Error("Falha ao carregar leads");
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching cards:", error);
    toast.error("Não foi possível carregar os dados de leads");
    return [];
  }
}

export async function fetchDashboardStats(filters: FilterParams): Promise<DashboardStats> {
  try {
    // Will be replaced with actual Supabase query
    const queryParams = new URLSearchParams();
    
    if (filters.userId) queryParams.append("userId", filters.userId);
    queryParams.append("from", formatDateForAPI(filters.dateRange.from));
    queryParams.append("to", formatDateForAPI(filters.dateRange.to));
    if (filters.fonte) queryParams.append("fonte", filters.fonte);
    if (filters.campanha) queryParams.append("campanha", filters.campanha);
    if (filters.conjunto) queryParams.append("conjunto", filters.conjunto);
    if (filters.anuncio) queryParams.append("anuncio", filters.anuncio);
    if (filters.palavraChave) queryParams.append("palavraChave", filters.palavraChave);
    if (filters.search) queryParams.append("search", filters.search);
    
    const response = await fetch(`/api/stats?${queryParams.toString()}`);
    if (!response.ok) throw new Error("Falha ao carregar estatísticas");
    
    return await response.json();
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

export async function generateClientLink(userId: string): Promise<string> {
  try {
    // Will be replaced with actual Supabase function call
    const response = await fetch(`/api/generate-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) throw new Error("Falha ao gerar link para o cliente");
    
    const data = await response.json();
    return data.link;
  } catch (error) {
    console.error("Error generating client link:", error);
    toast.error("Não foi possível gerar o link para o cliente");
    return "";
  }
}

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
    card.browser || "",
    card.location?.city || "",
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
