
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatDate, getDefaultDateRange } from "@/lib/date-utils";
import { FilterParams, User } from "@/types";
import { CalendarIcon, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface DashboardFilterProps {
  users: User[];
  isAdmin: boolean;
  currentUserId?: string;
  onFilterChange: (filters: FilterParams) => void;
  onReset: () => void;
  availableSources: string[];
  availableCampaigns: string[];
  availableSets: string[];
  availableAds: string[];
  availableKeywords: string[];
}

export default function DashboardFilter({
  users,
  isAdmin,
  currentUserId,
  onFilterChange,
  onReset,
  availableSources,
  availableCampaigns,
  availableSets,
  availableAds,
  availableKeywords
}: DashboardFilterProps) {
  const [filters, setFilters] = useState<FilterParams>({
    userId: currentUserId || null,
    dateRange: getDefaultDateRange(),
    search: "",
  });
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: filters.dateRange.from,
    to: filters.dateRange.to,
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      const newDateRange = {
        from: range.from,
        to: range.to || range.from,
      };
      setDateRange(newDateRange);
      setFilters({ ...filters, dateRange: newDateRange });
    }
  };

  const handleReset = () => {
    const defaultFilters = {
      userId: currentUserId || null,
      dateRange: getDefaultDateRange(),
      search: "",
    };
    setFilters(defaultFilters);
    setDateRange({
      from: defaultFilters.dateRange.from,
      to: defaultFilters.dateRange.to,
    });
    onReset();
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <span className="font-medium">Filtros:</span>
            
            {isAdmin && (
              <Select
                value={filters.userId || "all"}
                onValueChange={(value) => 
                  setFilters({ ...filters, userId: value === "all" ? null : value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal w-56"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                      </>
                    ) : (
                      formatDate(dateRange.from)
                    )
                  ) : (
                    <span>Escolha um período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <Select
            value={filters.fonte || ""}
            onValueChange={(value) => 
              setFilters({ ...filters, fonte: value !== "" ? value : undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as fontes</SelectItem>
              {availableSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.campanha || ""}
            onValueChange={(value) => 
              setFilters({ ...filters, campanha: value !== "" ? value : undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Campanha" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as campanhas</SelectItem>
              {availableCampaigns.map((campaign) => (
                <SelectItem key={campaign} value={campaign}>
                  {campaign}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.conjunto || ""}
            onValueChange={(value) => 
              setFilters({ ...filters, conjunto: value !== "" ? value : undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Conjunto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os conjuntos</SelectItem>
              {availableSets.map((set) => (
                <SelectItem key={set} value={set}>
                  {set}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filters.anuncio || ""}
            onValueChange={(value) => 
              setFilters({ ...filters, anuncio: value !== "" ? value : undefined })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Anúncio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os anúncios</SelectItem>
              {availableAds.map((ad) => (
                <SelectItem key={ad} value={ad}>
                  {ad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar nome ou telefone"
              value={filters.search || ""}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value || undefined })
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
