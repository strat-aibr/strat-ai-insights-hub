
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFilter from "@/components/dashboard/DashboardFilter";
import MetricsCards from "@/components/dashboard/MetricsCards";
import ChartsSection from "@/components/dashboard/ChartsSection";
import LeadsTable from "@/components/dashboard/LeadsTable";
import { Card, DashboardStats, FilterParams, User } from "@/types";
import { fetchCards, fetchDashboardStats, fetchUsers } from "@/lib/api";
import { exportToCSV } from "@/lib/api";
import { getDefaultDateRange } from "@/lib/date-utils";
import { toast } from "sonner";

interface DashboardProps {
  user: User;
  isAdmin: boolean;
  token?: string;
  onLogout: () => void;
}

export default function Dashboard({ user, isAdmin, token, onLogout }: DashboardProps) {
  console.log("Dashboard initializing with user:", user);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Card[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Initialize with default filters
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({
    userId: null, // Start with null to fetch all data initially
    dateRange: getDefaultDateRange(),
  });
  
  // Filter option state
  const [sources, setSources] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<string[]>([]);
  const [sets, setSets] = useState<string[]>([]);
  const [ads, setAds] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  
  const [currentClient, setCurrentClient] = useState<User | undefined>(
    !isAdmin ? user : undefined
  );

  const loadData = useCallback(async () => {
    console.log("Iniciando carregamento de dados...", { user, isAdmin, userId: user?.id });
    
    setIsLoading(true);
    setLoadError(null);
    
    try {
      console.log("Carregando dados do dashboard...");
      
      // Always try to load users list regardless of admin status for debugging
      console.log("Buscando lista de usuários");
      const usersData = await fetchUsers();
      setUsers(usersData);
      console.log("Usuários carregados:", usersData.length);

      // Use a simple filter object for initial data load
      const simpleFilters: FilterParams = {
        userId: null, // Null to get all data initially
        dateRange: getDefaultDateRange(),
      };
      
      console.log("Buscando leads com filtros simplificados:", simpleFilters);
      const leadsData = await fetchCards(simpleFilters);
      setLeads(leadsData);
      console.log("Leads carregados:", leadsData.length);
      
      // Load stats with the same simple filters
      console.log("Buscando estatísticas");
      const statsData = await fetchDashboardStats(simpleFilters);
      setStats(statsData);
      console.log("Estatísticas carregadas:", statsData?.totalLeads || 0, "total de leads");
      
      // Extract filter options from leads data
      if (leadsData.length > 0) {
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
      }

      if (leadsData.length === 0) {
        toast.info("Nenhum lead encontrado. Verifique filtros ou permissões de banco de dados.");
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      setLoadError("Falha ao carregar dados. Verifique as permissões do banco de dados e conexão com o Supabase.");
      toast.error("Erro ao carregar os dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    console.log("Dashboard useEffect disparado", { user });
    loadData();
  }, [loadData]);

  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Filtros alterados:", newFilters);
    setCurrentFilters(newFilters);
    
    // Reload data with new filters
    const loadFilteredData = async () => {
      setIsLoading(true);
      try {
        const leadsData = await fetchCards(newFilters);
        setLeads(leadsData);
        
        const statsData = await fetchDashboardStats(newFilters);
        setStats(statsData);
      } catch (error) {
        console.error("Erro ao aplicar filtros:", error);
        toast.error("Erro ao aplicar filtros");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFilteredData();
  };

  const handleResetFilters = () => {
    console.log("Resetando filtros");
    const defaultFilters = {
      userId: null, // null to get all data
      dateRange: getDefaultDateRange(),
    };
    setCurrentFilters(defaultFilters);
    handleFilterChange(defaultFilters);
  };

  const handleExportData = () => {
    exportToCSV(leads);
  };

  console.log("Dashboard renderizando com estado:", { 
    isLoading, 
    usersCount: users.length, 
    leadsCount: leads.length, 
    hasStats: !!stats,
    currentClient,
    loadError 
  });

  return (
    <DashboardLayout user={user} onLogout={onLogout}>
      <DashboardHeader
        title="Dashboard"
        isAdmin={isAdmin}
        users={users}
        currentClient={currentClient}
        leads={leads}
        isLoading={isLoading}
        onRefresh={loadData}
      />
      
      {loadError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Erro ao carregar dados</p>
          <p>{loadError}</p>
          <p className="mt-2 text-sm">
            Verifique se você desabilitou RLS nas tabelas "TRACKING | USERS" e "TRACKING | CARDS".
          </p>
        </div>
      )}
      
      <DashboardFilter
        users={users}
        isAdmin={isAdmin}
        currentUserId={!isAdmin && user?.id !== undefined ? user.id : undefined}
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
      
      <LeadsTable leads={leads} onExport={handleExportData} />
    </DashboardLayout>
  );
}
