import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Brototype Logo" className="h-10" />
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-foreground hover:text-primary">
            About
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-primary">
            How it Works
          </Button>
          <Button 
            variant="outline" 
            className="border-primary/50 text-foreground hover:bg-primary/10"
            onClick={() => navigate("/auth")}
          >
            Login
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
