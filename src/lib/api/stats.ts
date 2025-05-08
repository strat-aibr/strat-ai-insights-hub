
import { type Card, type DashboardStats, type FilterParams } from "@/types";
import { calculatePreviousPeriod } from "@/lib/date-utils";
import { fetchCards } from "./cards";

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
