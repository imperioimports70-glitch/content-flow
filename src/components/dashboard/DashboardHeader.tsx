import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const clients = [
  { id: "1", name: "Studio Design" },
  { id: "2", name: "Tech Corp" },
  { id: "3", name: "Café Aroma" },
  { id: "4", name: "FitLife Academia" },
];

const DashboardHeader = () => {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card shrink-0">
      <Select defaultValue="1">
        <SelectTrigger className="w-[220px] bg-background">
          <SelectValue placeholder="Selecione o cliente" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-elevation flex items-center justify-center text-xs font-semibold text-foreground">
              C
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><User className="w-4 h-4 mr-2" />Perfil</DropdownMenuItem>
            <DropdownMenuItem><Settings className="w-4 h-4 mr-2" />Configurações</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive"><LogOut className="w-4 h-4 mr-2" />Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
