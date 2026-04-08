import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema, type LoginFormValues } from "@/lib/auth-schemas";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const [submitting, setSubmitting] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="text-lg font-semibold text-foreground tracking-tight">
            ContentFlow.ai
          </Link>
          <h1 className="text-title-md text-foreground">Entrar na sua conta</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="card-surface p-8 rounded-xl space-y-6">
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
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-label">Senha</FormLabel>
                    <span className="text-xs text-muted-foreground">Esqueceu? Use recuperação no Supabase Auth</span>
                  </div>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" placeholder="••••••••" className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/auth/register" className="text-primary hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
