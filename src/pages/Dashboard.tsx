
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFilter from "@/components/dashboard/DashboardFilter";
import MetricsCards from "@/components/dashboard/MetricsCards";
import ChartsSection from "@/components/dashboard/ChartsSection";
import LeadsTable from "@/components/dashboard/LeadsTable";
import { Card, DashboardStats, FilterParams, User } from "@/types";
import { fetchCards, fetchDashboardStats, fetchUsers, exportToCSV } from "@/lib/api";
import { getDefaultDateRange } from "@/lib/date-utils";
import { toast } from "sonner";

interface DashboardProps {
  user: User;
  isAdmin: boolean;
  token?: string;
  onLogout: () => void;
}

export default function Dashboard({ user, isAdmin, token, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Card[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({
    userId: !isAdmin && user?.id ? user.id : null,
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
    if (!user?.id) {
      console.error("User ID is missing, cannot load data");
      toast.error("Erro de autenticação. Por favor, faça login novamente");
      onLogout();
      return;
    }

    setIsLoading(true);
    try {
      // Only load users list if admin
      if (isAdmin) {
        const usersData = await fetchUsers();
        setUsers(usersData);
      }

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
      
      // Update current client if changed
      if (currentFilters.userId && users.length > 0) {
        const selectedClient = users.find(u => u.id === currentFilters.userId);
        setCurrentClient(selectedClient);
      } else if (!isAdmin) {
        setCurrentClient(user);
      } else {
        setCurrentClient(undefined);
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Erro ao carregar os dados do dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, isAdmin, user, users, onLogout]);

  useEffect(() => {
    if (user && user.id) {
      loadData();
    }
  }, [loadData, user]);

  const handleFilterChange = (newFilters: FilterParams) => {
    setCurrentFilters(newFilters);
  };

  const handleResetFilters = () => {
    setCurrentFilters({
      userId: !isAdmin && user?.id ? user.id : null,
      dateRange: getDefaultDateRange(),
    });
  };

  const handleExportData = () => {
    exportToCSV(leads);
  };

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
        currentUserId={!isAdmin && user?.id ? user.id : undefined}
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
