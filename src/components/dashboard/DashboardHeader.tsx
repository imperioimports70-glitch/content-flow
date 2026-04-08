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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useClienteWorkspace } from "@/providers/ClienteWorkspaceProvider";

const DashboardHeader = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { clientes, clienteAtivoId, setClienteAtivoId, loading } = useClienteWorkspace();

  const initial = user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-card shrink-0">
      {loading ? (
        <span className="text-sm text-muted-foreground">Carregando clientes…</span>
      ) : clientes.length === 0 ? (
        <span className="text-sm text-muted-foreground">
          Nenhum cliente —{" "}
          <Link to="/dashboard/clients" className="text-primary underline">
            cadastre um workspace
          </Link>
        </span>
      ) : (
        <Select
          value={clienteAtivoId != null ? String(clienteAtivoId) : undefined}
          onValueChange={(v) => setClienteAtivoId(Number.parseInt(v, 10))}
        >
          <SelectTrigger className="w-[220px] bg-background" aria-label="Cliente ativo">
            <SelectValue placeholder="Selecione o cliente" />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="flex items-center gap-4">
        <button type="button" className="text-muted-foreground hover:text-foreground" aria-label="Notificações">
          <Bell className="w-4 h-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
            <div className="w-8 h-8 rounded-md bg-elevation flex items-center justify-center text-xs font-semibold text-foreground">
              {initial}
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={async () => {
                await signOut();
                navigate("/auth/login");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
