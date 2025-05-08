
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date-utils";
import { formatPhoneNumber, truncateText } from "@/lib/format-utils";
import { Card as CardType } from "@/types";
import { Download } from "lucide-react";
import { useState } from "react";
import { exportToCSV } from "@/lib/api";

interface LeadsTableProps {
  leads: CardType[];
  onExport: () => void;
}

export default function LeadsTable({ leads, onExport }: LeadsTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(leads.length / pageSize);
  
  const paginatedLeads = leads.slice((page - 1) * pageSize, page * pageSize);
  
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
  
  return (
    <Card className="card-dashboard animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Leads</h3>
        <Button variant="outline" onClick={onExport} className="flex gap-1">
          <Download className="h-4 w-4" />
          <span>Exportar</span>
        </Button>
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
                  <td className="table-cell">{truncateText(lead.nome, 20)}</td>
                  <td className="table-cell">{formatPhoneNumber(lead.numero_de_telefone)}</td>
                  <td className="table-cell">{truncateText(lead.fonte, 15)}</td>
                  <td className="table-cell">{truncateText(lead.campanha, 15)}</td>
                  <td className="table-cell">{truncateText(lead.conjunto, 15)}</td>
                  <td className="table-cell">{truncateText(lead.anuncio, 15)}</td>
                  <td className="table-cell">{truncateText(lead.palavra_chave, 20)}</td>
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
      
      {leads.length > pageSize && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, leads.length)} de {leads.length} leads
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
