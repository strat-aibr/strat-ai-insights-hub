export interface User {
  id: string;
  name: string;
  email: string;
  instancia?: string;
  created_at?: string;
  role?: string; // Adding the role property
}

export interface Card {
  id: string;
  nome: string;
  numero_de_telefone: string;
  user_id: string;
  fonte: string;
  campanha: string;
  conjunto: string;
  anuncio: string;
  palavra_chave: string;
  browser: string;
  location: {
    city: string;
    country?: string;
    region?: string;
  };
  dispositivo: string;
  data_criacao: string;
}

export interface FilterParams {
  userId: string | null;
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
  variation: MetricVariation;
  topCampaigns: TopItem[];
  topConjuntos: TopItem[];
  topAnuncios: TopItem[];
  leadsByDate: { date: string; count: number }[];
  leadsByLocation: { location: string; count: number }[];
  leadsByBrowser: { browser: string; count: number }[];
  sankeyData: {
    nodes: { name: string }[];
    links: { source: number; target: number; value: number }[];
  };
}
