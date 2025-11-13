import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  categories: { name: string } | null;
}

const StudentDashboard = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    if (!loading && (!user || userRole !== 'student')) {
      navigate('/student/login');
    }
  }, [user, userRole, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*, categories(name)')
      .eq('student_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComplaints(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-500';
      case 'In Progress': return 'text-blue-500';
      case 'Resolved': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Brocamp Support Logo" className="h-10" />
          </Link>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Student <span className="text-primary">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">Manage your complaints and track their status</p>
            </div>
            <Link to="/student/complaint">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                <PlusCircle className="w-5 h-5" />
                Raise Complaint
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {complaints.length === 0 ? (
              <Card className="p-12 text-center bg-card border-border">
                <p className="text-muted-foreground mb-4">You haven't submitted any complaints yet.</p>
                <Link to="/student/complaint">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Submit Your First Complaint
                  </Button>
                </Link>
              </Card>
            ) : (
              complaints.map((complaint) => (
                <Card key={complaint.id} className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{complaint.title}</h3>
                      <p className="text-muted-foreground mb-3">{complaint.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Category: <span className="text-foreground">{complaint.categories?.name || 'N/A'}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Date: <span className="text-foreground">{new Date(complaint.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <div className={`font-semibold ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
