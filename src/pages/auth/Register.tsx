import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { registerSchema, type RegisterFormValues } from "@/lib/auth-schemas";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nomeCompleto: "",
      nomeAgencia: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          nome_completo: values.nomeCompleto,
          nome_agencia: values.nomeAgencia,
        },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session?.access_token) {
      const { error: fnError } = await supabase.functions.invoke("provision-tenant", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      if (fnError) {
        toast.error(fnError.message);
      }
    }
    toast.success("Conta criada! Verifique o e-mail se a confirmação estiver ativa.");
    navigate("/dashboard", { replace: true });
  };

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="card-surface p-8 rounded-xl space-y-6">
            <FormField
              control={form.control}
              name="nomeCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-label">Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nomeAgencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-label">Nome da agência</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da sua agência" className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-label">Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="seu@email.com" className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-label">Senha</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" placeholder="••••••••" className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-label">Confirmar senha</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" placeholder="••••••••" className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Criando…" : "Criar conta grátis"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/auth/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
