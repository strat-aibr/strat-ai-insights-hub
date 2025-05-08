
import { Button } from "@/components/ui/button";
import ClientLinkGenerator from "@/components/dashboard/ClientLinkGenerator";
import { User } from "@/types";
import { Download, RefreshCcw } from "lucide-react";
import { exportToCSV } from "@/lib/api";
import { Card as CardType } from "@/types";

interface DashboardHeaderProps {
  title: string;
  isAdmin: boolean;
  users: User[];
  currentClient?: User;
  leads: CardType[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function DashboardHeader({
  title,
  isAdmin,
  users,
  currentClient,
  leads,
  isLoading,
  onRefresh,
}: DashboardHeaderProps) {
  const handleExportData = () => {
    exportToCSV(leads);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {currentClient && (
          <p className="text-muted-foreground mt-1">
            Cliente: {currentClient.name}
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap justify-end">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex gap-1"
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </Button>

        <Button
          variant="outline"
          onClick={handleExportData}
          disabled={leads.length === 0}
          className="flex gap-1"
        >
          <Download className="h-4 w-4" />
          <span>Exportar CSV</span>
        </Button>

        {isAdmin && <ClientLinkGenerator users={users} />}
      </div>
    </div>
  );
}
