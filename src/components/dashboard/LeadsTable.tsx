
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date-utils";
import { formatPhoneNumber, truncateText } from "@/lib/format-utils";
import { Card as CardType, FilterParams } from "@/types";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface LeadsTableProps {
  leads: CardType[];
  onExport: () => void;
  onFilterChange: (filters: Partial<FilterParams>) => void;
  filters: FilterParams;
}

export default function LeadsTable({ leads, onExport, onFilterChange, filters }: LeadsTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Apply hideOrganic filter locally to show the result immediately
  const filteredLeads = filters.hideOrganic 
    ? leads.filter(lead => 
        !(lead.fonte?.toLowerCase().includes('orgânico') || 
          lead.fonte?.toLowerCase().includes('organic'))
      ) 
    : leads;
  
  // Sort leads by date (descending)
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (!a.data_criacao) return 1;
    if (!b.data_criacao) return -1;
    return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
  });
  
  // Reset pagination when leads change or filters change
  useEffect(() => {
    setPage(1);
  }, [leads, filters.hideOrganic]);
  
  const totalPages = Math.ceil(sortedLeads.length / pageSize);
  const paginatedLeads = sortedLeads.slice((page - 1) * pageSize, page * pageSize);
  
  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleOrganiToggle = (checked: boolean) => {
    console.log("Toggling hideOrganic:", checked);
    onFilterChange({ hideOrganic: checked });
  };
  
  return (
    <Card className="card-dashboard animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Leads</h3>
        <div className="flex gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Switch 
              id="hide-organic" 
              checked={!!filters.hideOrganic} 
              onCheckedChange={handleOrganiToggle}
            />
            <Label htmlFor="hide-organic" className="text-sm">Esconder leads orgânicos</Label>
          </div>
          <Button variant="outline" onClick={onExport} className="flex gap-1">
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </div>
      
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="table-header">Data</th>
              <th className="table-header">Nome</th>
              <th className="table-header">Telefone</th>
              <th className="table-header">Fonte</th>
              <th className="table-header">Campanha</th>
              <th className="table-header">Conjunto</th>
              <th className="table-header">Anúncio</th>
              <th className="table-header">Palavra-chave</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedLeads.length > 0 ? (
              paginatedLeads.map((lead, index) => (
                <tr key={lead.id} className={index % 2 === 1 ? "table-row-alt" : ""}>
                  <td className="table-cell">{formatDateTime(lead.data_criacao)}</td>
                  <td className="table-cell">{truncateText(lead.nome || 'Sem nome', 20)}</td>
                  <td className="table-cell">{formatPhoneNumber(lead.numero_de_telefone)}</td>
                  <td className="table-cell">{truncateText(lead.fonte || '', 15)}</td>
                  <td className="table-cell">{truncateText(lead.campanha || '', 15)}</td>
                  <td className="table-cell">{truncateText(lead.conjunto || '', 15)}</td>
                  <td className="table-cell">{truncateText(lead.anuncio || '', 15)}</td>
                  <td className="table-cell">{truncateText(lead.palavra_chave || '', 20)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="table-cell text-center py-8 text-muted-foreground">
                  Nenhum lead encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {sortedLeads.length > pageSize && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {Math.min(sortedLeads.length, (page - 1) * pageSize + 1)} - {Math.min(page * pageSize, sortedLeads.length)} de {sortedLeads.length} leads
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={page === 1}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={page === totalPages}>
              Próximo
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
