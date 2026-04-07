import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="text-lg font-semibold text-foreground tracking-tight">
            ContentFlow.ai
          </Link>
          <h1 className="text-title-md text-foreground">Entrar na sua conta</h1>
        </div>
        <div className="card-surface p-8 rounded-xl space-y-6">
          <div className="space-y-2">
            <label className="text-label">Email</label>
            <Input type="email" placeholder="seu@email.com" className="bg-background" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-label">Senha</label>
              <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <Input type="password" placeholder="••••••••" className="bg-background" />
          </div>
          <Button className="w-full" size="lg">Entrar</Button>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/auth/register" className="text-primary hover:underline">Criar conta grátis</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
