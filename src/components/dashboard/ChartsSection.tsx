
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/types";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  Sankey,
  Tooltip as RechartsTooltip,
} from "recharts";

// Array de cores para os gráficos
const CHART_COLORS = [
  "#9b87f5", // Primary Purple
  "#7E69AB", // Secondary Purple
  "#6E59A5", // Tertiary Purple
  "#0EA5E9", // Ocean Blue
  "#8B5CF6", // Vivid Purple
  "#F97316", // Bright Orange
  "#1EAEDB", // Bright Blue
  "#33C3F0", // Sky Blue
];

interface ChartsSectionProps {
  stats: DashboardStats;
}

export default function ChartsSection({ stats }: ChartsSectionProps) {
  // Validate Sankey data
  const hasSankeyData = stats.sankeyData && 
    stats.sankeyData.nodes && 
    stats.sankeyData.nodes.length > 0 && 
    stats.sankeyData.links && 
    stats.sankeyData.links.length > 0;

  // Prepare colored data for Sankey chart
  const coloredSankeyData = hasSankeyData ? {
    nodes: stats.sankeyData.nodes.map((node, index) => ({
      ...node,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    })),
    links: stats.sankeyData.links
  } : { nodes: [], links: [] };

  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="sankey">Fluxo (Sankey)</TabsTrigger>
          <TabsTrigger value="device">Dispositivos</TabsTrigger>
          <TabsTrigger value="browser">Navegadores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-0">
          <Card className="card-dashboard">
            <h3 className="text-lg font-medium mb-4">Leads por Dia</h3>
            <div className="h-[300px]">
              {stats.leadsByDate && stats.leadsByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.leadsByDate}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        if (!value) return '';
                        const parts = value.split("-");
                        if (parts.length < 3) return value;
                        return `${parts[2]}/${parts[1]}`;
                      }}
                    />
                    <YAxis 
                      allowDecimals={false}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), "Leads"]} 
                      labelFormatter={(label) => {
                        // Format date nicely (assuming YYYY-MM-DD format)
                        if (!label) return '';
                        try {
                          const date = new Date(label);
                          return date.toLocaleDateString('pt-BR');
                        } catch (e) {
                          return label;
                        }
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#9b87f5"
                      fill="#E5DEFF"
                      fillOpacity={0.8}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Não há dados suficientes para exibir o gráfico de timeline.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="sankey" className="mt-0">
          <Card className="card-dashboard">
            <h3 className="text-lg font-medium mb-4">Fluxo Fonte → Campanha → Conjunto → Anúncio</h3>
            <div className="h-[400px]">
              {hasSankeyData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <Sankey
                    data={coloredSankeyData}
                    nodePadding={50}
                    nodeWidth={10}
                    linkCurvature={0.5}
                    iterations={64}
                    link={{ 
                      stroke: "#d1d5db",
                      opacity: 0.8 
                    }}
                    node={{
                      stroke: "#ffffff",
                      strokeWidth: 1
                    }}
                  >
                    <RechartsTooltip
                      formatter={(value: number, name: string) => [`${value} leads`, name]}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        borderRadius: '4px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </Sankey>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Não há dados suficientes para exibir o gráfico de fluxo.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="device" className="mt-0">
          <Card className="card-dashboard">
            <h3 className="text-lg font-medium mb-4">Leads por Dispositivo</h3>
            <div className="h-[300px]">
              {stats.leadsByDevice && stats.leadsByDevice.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.leadsByDevice}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="device" />
                    <YAxis
                      allowDecimals={false}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip formatter={(value: number) => [value.toLocaleString(), "Leads"]} />
                    <Legend />
                    <Bar dataKey="count" name="Leads" fill="#9b87f5" radius={[4, 4, 0, 0]}>
                      {stats.leadsByDevice.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Não há dados de dispositivos disponíveis.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="browser" className="mt-0">
          <Card className="card-dashboard">
            <h3 className="text-lg font-medium mb-4">Leads por Navegador</h3>
            <div className="h-[300px]">
              {stats.leadsByBrowser && stats.leadsByBrowser.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.leadsByBrowser}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="browser" />
                    <YAxis
                      allowDecimals={false}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip formatter={(value: number) => [value.toLocaleString(), "Leads"]} />
                    <Legend />
                    <Bar dataKey="count" name="Leads" fill="#9b87f5" radius={[4, 4, 0, 0]}>
                      {stats.leadsByBrowser.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Não há dados de navegadores disponíveis.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
