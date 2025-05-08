
import { type Card } from "@/types";

// Function to export data to CSV
export function exportToCSV(data: Card[]) {
  if (!data || data.length === 0) {
    console.error("No data to export");
    return;
  }
  
  try {
    // Define CSV headers
    const headers = [
      "ID", 
      "Nome", 
      "Telefone", 
      "Fonte", 
      "Campanha", 
      "Conjunto", 
      "Anúncio",
      "Palavra-chave",
      "Dispositivo",
      "Cidade",
      "Data de Criação"
    ];
    
    // Convert data to CSV rows
    const rows = data.map(card => [
      card.id,
      card.nome,
      card.numero_de_telefone,
      card.fonte || "",
      card.campanha || "",
      card.conjunto || "",
      card.anuncio || "",
      card.palavra_chave || "",
      card.dispositivo || "",
      card.location?.city || "",
      card.data_criacao ? new Date(card.data_criacao).toLocaleString() : ""
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting to CSV:", error);
  }
}
