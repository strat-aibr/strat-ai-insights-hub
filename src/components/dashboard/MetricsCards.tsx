
import { Card } from "@/components/ui/card";
import { DashboardStats } from "@/types";
import { ArrowDown, ArrowUp, Smartphone, Users, UsersRound } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

interface MetricsCardsProps {
  stats: DashboardStats;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  variation?: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

export default function MetricsCards({ stats }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Total de leads"
        value={stats.totalLeads}
        icon={<Users className="h-4 w-4" />}
        variation={stats.variation}
      />
      <MetricCard
        title="Leads traqueados"
        value={stats.trackedLeads}
        description="Leads não orgânicos"
        icon={<UsersRound className="h-4 w-4" />}
      />
      <MetricCard
        title="Leads orgânicos"
        value={stats.organicLeads}
        description="Sem campanha"
        icon={<Users className="h-4 w-4" />}
      />
      <MetricCard
        title="Média por dia"
        value={stats.averagePerDay}
        description="Período selecionado"
        icon={<Smartphone className="h-4 w-4" />}
      />
    </div>
  );
}

function MetricCard({ title, value, description, icon, variation }: MetricCardProps) {
  return (
    <Card className="p-4 card-dashboard animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="rounded-full bg-primary/10 p-2">{icon}</div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {variation && (
          <div className="flex items-center mt-1 text-xs">
            {variation.trend === 'up' ? (
              <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
            ) : variation.trend === 'down' ? (
              <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
            ) : null}
            <span
              className={
                variation.trend === 'up'
                  ? 'text-green-500'
                  : variation.trend === 'down'
                  ? 'text-red-500'
                  : ''
              }
            >
              {variation.percentage.toFixed(1)}% em comparação ao período anterior
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

export function MetricsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card className="p-4 card-dashboard" key={i}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        </Card>
      ))}
    </div>
  );
}
