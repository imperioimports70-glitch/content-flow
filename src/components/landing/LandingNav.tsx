import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useDelayedNavigate } from "@/hooks/useDelayedNavigate";
import { Loader2 } from "lucide-react";

const LandingNav = () => {
  const { delayedNavigate, isNavigating } = useDelayedNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="text-base font-semibold text-foreground tracking-tight">
          ContentFlow.ai
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={isNavigating}
            onClick={() => delayedNavigate("/auth/login")}
          >
            {isNavigating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
          </Button>
          <Button
            size="sm"
            disabled={isNavigating}
            onClick={() => delayedNavigate("/auth/register")}
          >
            {isNavigating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta"}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
