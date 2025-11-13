import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";
import ComplaintsList from "@/components/ComplaintsList";

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== "admin") {
      navigate("/student");
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10" />
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <ComplaintsList userId={user?.id} isAdmin={true} />
      </div>
    </div>
  );
};

export default AdminDashboard;
