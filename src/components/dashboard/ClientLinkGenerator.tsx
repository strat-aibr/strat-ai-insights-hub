
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateClientLink } from "@/lib/api";
import { User } from "@/types";
import { Copy, Link } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ClientLinkGeneratorProps {
  users: User[];
}

export default function ClientLinkGenerator({ users }: ClientLinkGeneratorProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleGenerateLink = async () => {
    if (!selectedUserId) return;
    
    setIsLoading(true);
    try {
      const link = await generateClientLink(selectedUserId);
      setGeneratedLink(link);
    } catch (error) {
      toast.error("Erro ao gerar link");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    
    navigator.clipboard.writeText(generatedLink);
    toast.success("Link copiado para a área de transferência");
  };

  const resetState = () => {
    setSelectedUserId(null);
    setGeneratedLink("");
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-1">
          <Link className="h-4 w-4" />
          <span>Gerar Link para Cliente</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar link para cliente</DialogTitle>
          <DialogDescription>
            Crie um link seguro para que o cliente possa acessar seu dashboard.
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Selecione o cliente</Label>
              <Select 
                value={selectedUserId ? String(selectedUserId) : ""} 
                onValueChange={(value) => setSelectedUserId(Number(value))}
              >
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link">Link do cliente</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="link"
                  value={generatedLink}
                  readOnly
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                Este link permite acesso apenas aos dados deste cliente.
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          {!generatedLink ? (
            <Button
              type="submit"
              onClick={handleGenerateLink}
              disabled={!selectedUserId || isLoading}
            >
              {isLoading ? "Gerando..." : "Gerar Link"}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => resetState()}>
                Gerar outro link
              </Button>
              <Button onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Link
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
