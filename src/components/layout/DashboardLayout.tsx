
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

export default function DashboardLayout({
  children,
  user,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex justify-between items-center h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="text-xl font-bold bg-gradient-to-r from-stratai-600 to-stratai-800 bg-clip-text text-transparent">
              Strat AI Report
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              {user.email}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container py-6 px-4">
        {children}
      </main>
      
      <footer className="border-t bg-card">
        <div className="container py-4 px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Strat AI Report - Todos os direitos reservados
        </div>
      </footer>
    </div>
  );
}
