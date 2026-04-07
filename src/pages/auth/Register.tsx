import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="text-lg font-semibold text-foreground tracking-tight">
            ContentFlow.ai
          </Link>
          <h1 className="text-title-md text-foreground">Criar sua conta</h1>
          <p className="text-sm text-muted-foreground">Teste grátis por 7 dias</p>
        </div>
        <div className="card-surface p-8 rounded-xl space-y-6">
          <div className="space-y-2">
            <label className="text-label">Nome completo</label>
            <Input placeholder="Seu nome" className="bg-background" />
          </div>
          <div className="space-y-2">
            <label className="text-label">Nome da agência</label>
            <Input placeholder="Nome da sua agência" className="bg-background" />
          </div>
          <div className="space-y-2">
            <label className="text-label">Email</label>
            <Input type="email" placeholder="seu@email.com" className="bg-background" />
          </div>
          <div className="space-y-2">
            <label className="text-label">Senha</label>
            <Input type="password" placeholder="••••••••" className="bg-background" />
          </div>
          <Button className="w-full" size="lg">Criar conta grátis</Button>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/auth/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
