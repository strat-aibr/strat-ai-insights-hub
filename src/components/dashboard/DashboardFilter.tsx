
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
import { formatDate, getDefaultDateRange, predefinedDateRanges } from "@/lib/date-utils";
import { FilterParams, User } from "@/types";
import { CalendarIcon, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DashboardFilterProps {
  users: User[];
  isAdmin: boolean;
  currentUserId?: number;
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

  const [selectedDatePreset, setSelectedDatePreset] = useState("custom");
  const [showDateSelector, setShowDateSelector] = useState(false);

  // Update local filters when currentUserId prop changes
  useEffect(() => {
    if (currentUserId !== filters.userId) {
      setFilters(prev => ({
        ...prev,
        userId: currentUserId || null
      }));
    }
  }, [currentUserId]);

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
      setSelectedDatePreset("custom");
    }
  };

  const handleReset = () => {
    const defaultFilters = {
      userId: null,
      dateRange: getDefaultDateRange(),
      search: "",
    };
    setFilters(defaultFilters);
    setDateRange({
      from: defaultFilters.dateRange.from,
      to: defaultFilters.dateRange.to,
    });
    setSelectedDatePreset("custom");
    onReset();
  };

  const handleDatePresetChange = (value: string) => {
    setSelectedDatePreset(value);
    
    if (value !== "custom") {
      const presetIndex = predefinedDateRanges.findIndex(preset => preset.label === value);
      if (presetIndex >= 0) {
        const newDateRange = predefinedDateRanges[presetIndex].getValue();
        setDateRange(newDateRange);
        setFilters({ ...filters, dateRange: newDateRange });
        setShowDateSelector(false);
      }
    } else {
      setShowDateSelector(true);
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <span className="font-medium">Filtros:</span>
            
            {/* User ID filter dropdown - always show it, enabled for everyone */}
            <div className="z-10">
              <Select
                value={filters.userId ? String(filters.userId) : "all"}
                onValueChange={(value) => {
                  setFilters({
                    ...filters,
                    userId: value !== "all" ? Number(value) : null
                  });
                }}
              >
                <SelectTrigger className="w-40 bg-white">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {users && users.length > 0 && users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Popover open={showDateSelector} onOpenChange={setShowDateSelector}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal w-56"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime() ? (
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
                <div className="px-4 pt-3 pb-2">
                  <RadioGroup 
                    value={selectedDatePreset}
                    onValueChange={handleDatePresetChange}
                    className="flex flex-col gap-2"
                  >
                    {predefinedDateRanges.map((preset) => (
                      <div key={preset.label} className="flex items-center space-x-2">
                        <RadioGroupItem value={preset.label} id={`date-${preset.label}`} />
                        <Label htmlFor={`date-${preset.label}`}>{preset.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {selectedDatePreset === "Personalizado" && (
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    className={cn("p-3 pointer-events-auto")}
                  />
                )}
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
          <div className="z-10">
            <Select
              value={filters.fonte || "all_sources"}
              onValueChange={(value) => 
                setFilters({ ...filters, fonte: value !== "all_sources" ? value : undefined })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Fonte" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all_sources">Todas as fontes</SelectItem>
                {availableSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="z-10">
            <Select
              value={filters.campanha || "all_campaigns"}
              onValueChange={(value) => 
                setFilters({ ...filters, campanha: value !== "all_campaigns" ? value : undefined })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Campanha" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all_campaigns">Todas as campanhas</SelectItem>
                {availableCampaigns.map((campaign) => (
                  <SelectItem key={campaign} value={campaign}>
                    {campaign}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="z-10">
            <Select
              value={filters.conjunto || "all_sets"}
              onValueChange={(value) => 
                setFilters({ ...filters, conjunto: value !== "all_sets" ? value : undefined })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Conjunto" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all_sets">Todos os conjuntos</SelectItem>
                {availableSets.map((set) => (
                  <SelectItem key={set} value={set}>
                    {set}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="z-10">
            <Select
              value={filters.anuncio || "all_ads"}
              onValueChange={(value) => 
                setFilters({ ...filters, anuncio: value !== "all_ads" ? value : undefined })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Anúncio" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all_ads">Todos os anúncios</SelectItem>
                {availableAds.map((ad) => (
                  <SelectItem key={ad} value={ad}>
                    {ad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
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
