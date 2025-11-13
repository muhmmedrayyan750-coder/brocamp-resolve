import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCircle, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const LoginSelection = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Brocamp Support Logo" className="h-10" />
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Choose Your <span className="text-primary">Login Type</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Select whether you're a student or an administrator
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Student Login Card */}
            <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 group">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <UserCircle className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Student Login</h2>
                  <p className="text-muted-foreground">
                    Access your dashboard to submit and track complaints
                  </p>
                </div>
                <Link to="/student/login" className="block">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Login as Student
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Admin Login Card */}
            <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-300 group">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Admin Login</h2>
                  <p className="text-muted-foreground">
                    Manage complaints and help students resolve issues
                  </p>
                </div>
                <Link to="/admin/login" className="block">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Login as Admin
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginSelection;
