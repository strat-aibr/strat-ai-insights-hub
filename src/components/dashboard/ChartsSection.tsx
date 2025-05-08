
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

interface ChartsSectionProps {
  stats: DashboardStats;
}

export default function ChartsSection({ stats }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="sankey">Fluxo (Sankey)</TabsTrigger>
          <TabsTrigger value="location">Localização</TabsTrigger>
          <TabsTrigger value="browser">Navegadores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline" className="mt-0">
          <Card className="card-dashboard">
            <h3 className="text-lg font-medium mb-4">Leads por Dia</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.leadsByDate}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => value.split("T")[0].split("-").slice(1).reverse().join("/")}
                  />
                  <YAxis 
                    allowDecimals={false}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), "Leads"]} 
                    labelFormatter={(label) => {
                      // Format date nicely (assuming YYYY-MM-DD format)
                      const date = new Date(label);
                      return date.toLocaleDateString('pt-BR');
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--stratai-500)"
                    fill="var(--stratai-200)"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="sankey" className="mt-0">
          <Card className="card-dashboard">
            <h3 className="text-lg font-medium mb-4">Fluxo Fonte → Campanha → Conjunto → Anúncio</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <Sankey
                  data={stats.sankeyData}
                  nodePadding={50}
                  nodeWidth={10}
                  linkCurvature={0.5}
                  iterations={64}
                  link={{ stroke: "#d1d5db" }}
                  node={{ stroke: "#ffffff", strokeWidth: 1 }}
                >
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [`${value} leads`, name]}
                  />
                </Sankey>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="location" className="mt-0">
          <Card className="card-dashboard">
            <h3 className="text-lg font-medium mb-4">Leads por Localização</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.leadsByLocation}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="location" 
                    type="category" 
                    width={150}
                    tick={{fontSize: 12}}
                  />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), "Leads"]} />
                  <Legend />
                  <Bar dataKey="count" name="Leads" fill="var(--stratai-500)" radius={[0, 4, 4, 0]}>
                    {stats.leadsByLocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`var(--stratai-${500 - (index * 50) % 300})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="browser" className="mt-0">
          <Card className="card-dashboard">
            <h3 className="text-lg font-medium mb-4">Leads por Navegador</h3>
            <div className="h-[300px]">
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
                  <Bar dataKey="count" name="Leads" fill="var(--stratai-600)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
