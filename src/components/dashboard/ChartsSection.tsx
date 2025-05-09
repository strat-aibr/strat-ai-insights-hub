
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/types";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "../ui/skeleton";
import { Sankey, Tooltip as SankeyTooltip } from "recharts";

interface ChartsSectionProps {
  stats: DashboardStats;
}

export default function ChartsSection({ stats }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <DateChart data={stats.leadsByDate} />
      <DeviceChart data={stats.leadsByDevice} />
      <LocationChart data={stats.leadsByLocation} />
      <FlowChart data={stats.sankeyData} />
    </div>
  );
}

export function ChartsSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card className="p-6 card-dashboard" key={i}>
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-[250px] w-full" />
        </Card>
      ))}
    </div>
  );
}

function DateChart({ data }: { data: { date: string; count: number }[] }) {
  const chartData = data.map((item) => ({
    date: formatDate(item.date),
    value: item.count,
  }));

  return (
    <Card className="p-6 card-dashboard animate-fade-in">
      <h3 className="font-medium mb-6">Leads por Data</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            angle={-45}
            textAnchor="end"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorCount)"
            name="Leads"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

function DeviceChart({ data }: { data: { device: string; count: number }[] }) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];

  const chartData = data
    .filter((item) => item.count > 0) // Filter out zero values
    .map((item) => ({
      name: item.device,
      value: item.count,
    }));

  return (
    <Card className="p-6 card-dashboard animate-fade-in">
      <h3 className="font-medium mb-6">Leads por Dispositivo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

function LocationChart({
  data,
}: {
  data: { location: string; count: number }[];
}) {
  const chartData = data
    .slice(0, 10) // Only show top 10
    .map((item) => ({
      name: item.location,
      value: item.count,
    }));

  return (
    <Card className="p-6 card-dashboard animate-fade-in">
      <h3 className="font-medium mb-6">Top 10 Cidades</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickLine={false} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12 }}
            tickLine={false}
            width={60}
          />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" name="Leads" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function FlowChart({
  data,
}: {
  data: {
    nodes: { name: string }[];
    links: { source: number; target: number; value: number }[];
  };
}) {
  return (
    <Card className="p-6 card-dashboard animate-fade-in">
      <h3 className="font-medium mb-6">Fluxo de Conversão</h3>
      {data.nodes.length > 0 && data.links.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <Sankey
            data={data}
            nodePadding={50}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
            link={{ stroke: "#d9d9d9" }}
            node={{ stroke: "#a9a9a9", strokeWidth: 2 }}
          >
            <SankeyTooltip />
          </Sankey>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Sem dados suficientes para gerar o gráfico
        </div>
      )}
    </Card>
  );
}

// Helper function to format dates
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch (e) {
    return dateStr;
  }
}

// Helper function for pie chart labels
const RADIAN = Math.PI / 180;
function renderCustomizedLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}
