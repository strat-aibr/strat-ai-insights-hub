
export interface User {
  id: number;
  name: string;
  email: string;
  instancia?: string;
  created_at?: string;
  role?: string;
  strat?: string | boolean;
}

export interface Card {
  id: number;
  nome: string;
  numero_de_telefone: string;
  user_id: number;
  fonte: string;
  campanha: string | null;
  conjunto: string | null;
  anuncio: string | null;
  palavra_chave: string | null;
  browser: string | {
    name?: string;
    [key: string]: any;
  };
  location: {
    city: string;
    country?: string;
    region?: string;
  };
  dispositivo: string;
  data_criacao: string;
}

export interface FilterParams {
  userId: number | null;
  dateRange: {
    from: Date;
    to: Date;
  };
  fonte?: string;
  campanha?: string;
  conjunto?: string;
  anuncio?: string;
  palavraChave?: string;
  search?: string;
  hideOrganic?: boolean;
}

export interface MetricVariation {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface TopItem {
  name: string;
  count: number;
  percentage: number;
}

export interface DashboardStats {
  totalLeads: number;
  trackedLeads: number;
  organicLeads: number;
  averagePerDay: number;
  variation: MetricVariation;
  topCampaigns: TopItem[];
  topConjuntos: TopItem[];
  topAnuncios: TopItem[];
  leadsByDate: { date: string; count: number }[];
  leadsByLocation: { location: string; count: number }[];
  leadsByDevice: { device: string; count: number }[];
  sankeyData: {
    nodes: { name: string }[];
    links: { source: number; target: number; value: number }[];
  };
}
