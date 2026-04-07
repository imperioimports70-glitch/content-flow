import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-16 section-divider">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div>
            <Link to="/" className="text-lg font-semibold text-foreground tracking-tight">
              ContentFlow.ai
            </Link>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Gestão de conteúdo com IA para agências e freelancers.
            </p>
          </div>
          <div className="flex gap-8">
            <Link to="/privacidade" className="text-sm text-muted-foreground hover:text-foreground">
              Política de Privacidade
            </Link>
            <Link to="/termos" className="text-sm text-muted-foreground hover:text-foreground">
              Termos de Uso
            </Link>
            <Link to="/lgpd" className="text-sm text-muted-foreground hover:text-foreground">
              LGPD
            </Link>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ContentFlow.ai. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Feito com ContentFlow.ai
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
