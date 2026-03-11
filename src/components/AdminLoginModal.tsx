import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
}

const AdminLoginModal = ({ open, onClose }: AdminLoginModalProps) => {
  const { login } = useAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setPassword("");
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-lg font-bold text-foreground">Acesso Admin</h2>
            <p className="text-sm text-muted-foreground mt-1">Digite a senha para editar</p>
          </div>
          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className={error ? "border-destructive" : ""}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">Senha incorreta</p>}
            <Button type="submit" className="w-full">Entrar</Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AdminToggleButton = () => {
  const { isAdmin, logout } = useAdmin();
  const [showLogin, setShowLogin] = useState(false);

  if (isAdmin) {
    return (
      <button
        onClick={logout}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sair do modo admin
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowLogin(true)}
        className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors shadow-lg"
        title="Modo Admin"
      >
        <Shield className="h-4 w-4" />
      </button>
      <AdminLoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default AdminLoginModal;
