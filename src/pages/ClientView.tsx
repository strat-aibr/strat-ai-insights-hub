
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardFilter from "@/components/dashboard/DashboardFilter";
import MetricsCards from "@/components/dashboard/MetricsCards";
import ChartsSection from "@/components/dashboard/ChartsSection";
import LeadsTable from "@/components/dashboard/LeadsTable";
import { Card, DashboardStats, FilterParams, User } from "@/types";
import { fetchCards, fetchDashboardStats } from "@/lib/api";
import { exportToCSV } from "@/lib/api";
import { getDefaultDateRange } from "@/lib/date-utils";
import { toast } from "sonner";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default function ClientView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userIdParam = searchParams.get("userId");
  
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<User | null>(null);
  const [leads, setLeads] = useState<Card[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({
    userId: userIdParam ? Number(userIdParam) : null,
    dateRange: getDefaultDateRange(),
    hideOrganic: false,
  });
  
  // Filter option state
  const [sources, setSources] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [sets, setSets] = useState<string[]>([]);
  const [ads, setAds] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  
  useEffect(() => {
    const validateToken = async () => {
      // This would be a real token validation against Supabase
      // For now, we'll simulate it for demonstration
      
      if (!token) {
        toast.error("Link inválido");
        navigate("/login");
        return;
      }
      
      try {
        // Simulated token validation and client data fetch
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Convert the ID to a number to match our User type
        const clientId = userIdParam ? Number(userIdParam) : null;
        if (!clientId) {
          throw new Error("Invalid client ID");
        }
        
        // Mock client data (would come from token validation)
        const clientData: User = {
          id: clientId,
          name: "Cliente via Token",
          email: "cliente-token@example.com",
        };
        
        setClient(clientData);
        setCurrentFilters({
          ...currentFilters,
          userId: clientId
        });
      } catch (error) {
        console.error("Token validation error:", error);
        toast.error("Link inválido ou expirado");
        navigate("/login");
      }
    };
    
    validateToken();
  }, [token, navigate, userIdParam, currentFilters]);
  
  useEffect(() => {
    const loadData = async () => {
      if (!client) return;
      
      setIsLoading(true);
      try {
        // Load leads based on filters
        const leadsData = await fetchCards(currentFilters);
        setLeads(leadsData);
        
        // Load stats
        const statsData = await fetchDashboardStats(currentFilters);
        setStats(statsData);
        
        // Extract filter options from leads data
        const uniqueSources = Array.from(new Set(leadsData.map(lead => lead.fonte).filter(Boolean)));
        const uniqueCampaigns = Array.from(new Set(leadsData.map(lead => lead.campanha).filter(Boolean)));
        const uniqueSets = Array.from(new Set(leadsData.map(lead => lead.conjunto).filter(Boolean)));
        const uniqueAds = Array.from(new Set(leadsData.map(lead => lead.anuncio).filter(Boolean)));
        const uniqueKeywords = Array.from(new Set(leadsData.map(lead => lead.palavra_chave).filter(Boolean)));
        
        setSources(uniqueSources);
        setCampaigns(uniqueCampaigns);
        setSets(uniqueSets);
        setAds(uniqueAds);
        setKeywords(uniqueKeywords);
      } catch (error) {
        console.error("Error loading client data:", error);
        toast.error("Erro ao carregar os dados");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [client, currentFilters]);
  
  const handleFilterChange = (newFilters: FilterParams) => {
    // Ensure we keep the client ID from the token
    setCurrentFilters({
      ...newFilters,
      userId: client?.id || null
    });
  };
  
  const handleResetFilters = () => {
    setCurrentFilters({
      userId: client?.id || null,
      dateRange: getDefaultDateRange(),
      hideOrganic: false,
    });
  };
  
  const handleExportData = () => {
    exportToCSV(leads);
  };
  
  const handleLogout = () => {
    navigate("/login");
  };
  
  if (!client) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-lg">Validando acesso...</div>
      </div>
    );
  }
  
  return (
    <DashboardLayout user={client} onLogout={handleLogout}>
      <DashboardHeader
        title={`Dashboard - ${client.name}`}
        isAdmin={false}
        users={[]}
        currentClient={client}
        leads={leads}
        isLoading={isLoading}
        onRefresh={() => handleFilterChange(currentFilters)}
      />
      
      <DashboardFilter
        users={[]}
        isAdmin={false}
        currentUserId={client.id}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        availableSources={sources}
        availableCampaigns={campaigns}
        availableSets={sets}
        availableAds={ads}
        availableKeywords={keywords}
      />
      
      {stats && <MetricsCards stats={stats} />}
      
      {stats && <ChartsSection stats={stats} />}
      
      <LeadsTable 
        leads={leads} 
        onExport={handleExportData} 
        onFilterChange={handleFilterChange}
        filters={currentFilters}
      />
    </DashboardLayout>
  );
}
