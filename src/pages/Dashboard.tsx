
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
  
  // Initialize with user ID from props, ensuring it's a number (0 is valid)
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({
    userId: user && (user.id !== undefined || user.id === 0) ? user.id : null,
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
    
    // Ensure there's a valid user
    if (!user || (user.id === undefined && user.id !== 0)) {
      console.error("ID do usuário está faltando, não é possível carregar dados", { user });
      toast.error("Erro de autenticação. Por favor, faça login novamente");
      onLogout();
      return;
    }

    setIsLoading(true);
    try {
      console.log("Carregando dados do dashboard...");
      
      // Only load users list if admin
      if (isAdmin) {
        console.log("Usuário é admin, buscando lista de usuários");
        const usersData = await fetchUsers();
        if (usersData.length > 0) {
          setUsers(usersData);
          console.log("Usuários carregados:", usersData.length);
        } else {
          console.warn("Nenhum usuário encontrado");
        }
      }

      // Update filters with user ID if not set
      const effectiveFilters = {
        ...currentFilters,
        userId: currentFilters.userId !== null ? currentFilters.userId : (user?.id || null),
      };
      
      console.log("Filtros efetivos:", effectiveFilters);

      // Load leads based on filters
      console.log("Buscando leads com filtros:", effectiveFilters);
      const leadsData = await fetchCards(effectiveFilters);
      setLeads(leadsData);
      console.log("Leads carregados:", leadsData.length);
      
      // Load stats
      console.log("Buscando estatísticas");
      const statsData = await fetchDashboardStats(effectiveFilters);
      setStats(statsData);
      console.log("Estatísticas carregadas:", statsData.totalLeads, "total de leads");
      
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
      
      // Update current client if changed
      if (currentFilters.userId !== null && users.length > 0) {
        const selectedClient = users.find(u => u.id === currentFilters.userId);
        setCurrentClient(selectedClient);
      } else if (!isAdmin) {
        setCurrentClient(user);
      } else {
        setCurrentClient(undefined);
      }

      if (leadsData.length === 0) {
        toast.info("Nenhum lead encontrado para os filtros selecionados");
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast.error("Erro ao carregar os dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, isAdmin, user, users, onLogout]);

  useEffect(() => {
    console.log("Dashboard useEffect disparado", { user });
    if (user && (user.id !== undefined || user.id === 0)) {
      loadData();
    }
  }, [loadData, user]);

  const handleFilterChange = (newFilters: FilterParams) => {
    console.log("Filtros alterados:", newFilters);
    setCurrentFilters(newFilters);
  };

  const handleResetFilters = () => {
    console.log("Resetando filtros");
    setCurrentFilters({
      userId: !isAdmin && user?.id !== undefined ? user.id : null,
      dateRange: getDefaultDateRange(),
    });
  };

  const handleExportData = () => {
    exportToCSV(leads);
  };

  console.log("Dashboard renderizando com estado:", { 
    isLoading, 
    usersCount: users.length, 
    leadsCount: leads.length, 
    hasStats: !!stats,
    currentClient 
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
