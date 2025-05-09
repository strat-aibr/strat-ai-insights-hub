
import { Card } from "@/components/ui/card";
import { formatPercentage } from "@/lib/format-utils";
import { DashboardStats, TopItem } from "@/types";
import { ArrowDownRight, ArrowUpRight, ChevronRight, Minus } from "lucide-react";

interface MetricsCardsProps {
  stats: DashboardStats;
}

export default function MetricsCards({ stats }: MetricsCardsProps) {
  const { totalLeads, variation, topCampaigns, topConjuntos, topAnuncios } = stats;

  return (
    <div className="space-y-4 mb-6">
      {/* First row - Numeric metrics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-metric animate-fade-in">
          <div className="text-sm font-medium text-muted-foreground mb-1">Total de Leads</div>
          <div className="text-3xl font-bold">{totalLeads}</div>
          <div className="flex items-center mt-2">
            {variation.trend === "up" && (
              <ArrowUpRight className="h-4 w-4 text-success-dark mr-1" />
            )}
            {variation.trend === "down" && (
              <ArrowDownRight className="h-4 w-4 text-danger-dark mr-1" />
            )}
            {variation.trend === "neutral" && (
              <Minus className="h-4 w-4 text-muted-foreground mr-1" />
            )}
            <span
              className={
                variation.trend === "up"
                  ? "text-success-dark"
                  : variation.trend === "down"
                  ? "text-danger-dark"
                  : "text-muted-foreground"
              }
            >
              {variation.trend !== "neutral" && (variation.percentage > 0 ? "+" : "")}
              {formatPercentage(variation.percentage)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs. período anterior</span>
          </div>
        </Card>

        <Card className="card-metric animate-fade-in" style={{ animationDelay: `0.1s` }}>
          <div className="text-sm font-medium text-muted-foreground mb-1">Leads Pagos</div>
          <div className="text-3xl font-bold">
            {stats.leadsByBrowser.filter(item => item.browser !== "Organic").reduce((acc, item) => acc + item.count, 0)}
          </div>
          <div className="flex items-center mt-2">
            <span className="text-xs text-muted-foreground">
              {totalLeads > 0 
                ? `${Math.round((stats.leadsByBrowser.filter(item => item.browser !== "Organic").reduce((acc, item) => acc + item.count, 0) / totalLeads) * 100)}% do total`
                : '0% do total'}
            </span>
          </div>
        </Card>
        
        <Card className="card-metric animate-fade-in" style={{ animationDelay: `0.2s` }}>
          <div className="text-sm font-medium text-muted-foreground mb-1">Leads Orgânicos</div>
          <div className="text-3xl font-bold">
            {stats.leadsByBrowser.filter(item => item.browser === "Organic").reduce((acc, item) => acc + item.count, 0)}
          </div>
          <div className="flex items-center mt-2">
            <span className="text-xs text-muted-foreground">
              {totalLeads > 0 
                ? `${Math.round((stats.leadsByBrowser.filter(item => item.browser === "Organic").reduce((acc, item) => acc + item.count, 0) / totalLeads) * 100)}% do total`
                : '0% do total'}
            </span>
          </div>
        </Card>
        
        <Card className="card-metric animate-fade-in" style={{ animationDelay: `0.3s` }}>
          <div className="text-sm font-medium text-muted-foreground mb-1">Média por Dia</div>
          <div className="text-3xl font-bold">
            {stats.leadsByDate.length > 0 
              ? Math.round(totalLeads / stats.leadsByDate.length) 
              : 0}
          </div>
          <div className="flex items-center mt-2">
            <span className="text-xs text-muted-foreground">
              Nos últimos {stats.leadsByDate.length} dias
            </span>
          </div>
        </Card>
      </div>
      
      {/* Second row - Top items */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <TopItemCard 
          title="Top Campanhas" 
          items={topCampaigns.slice(0, 5)} 
          animationDelay={1} 
        />
        
        <TopItemCard 
          title="Top Conjuntos" 
          items={topConjuntos.slice(0, 5)} 
          animationDelay={2} 
        />
        
        <TopItemCard 
          title="Top Anúncios" 
          items={topAnuncios.slice(0, 5)} 
          animationDelay={3} 
        />
      </div>
    </div>
  );
}

interface TopItemCardProps {
  title: string;
  items: TopItem[];
  animationDelay: number;
}

function TopItemCard({ title, items, animationDelay }: TopItemCardProps) {
  return (
    <Card className="card-metric animate-fade-in" style={{ animationDelay: `${animationDelay * 0.1}s` }}>
      <div className="text-sm font-medium text-muted-foreground mb-2">{title}</div>
      <div className="space-y-1 flex-grow">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="truncate text-sm flex-1" title={item.name}>
                {idx + 1}. {item.name || "N/A"}
              </div>
              <div className="text-sm font-medium">{item.count}</div>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">Sem dados disponíveis</div>
        )}
      </div>
      {items.length > 0 && (
        <div className="mt-2 text-xs text-primary flex items-center">
          <span>Ver todos</span>
          <ChevronRight className="h-3 w-3 ml-1" />
        </div>
      )}
    </Card>
  );
}
