import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import logo from "@/assets/logo.png";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  admin_comment: string | null;
  created_at: string;
  categories: { name: string } | null;
  profiles: { name: string } | null;
}

const AdminDashboard = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!loading && (!user || userRole !== 'admin')) {
      navigate('/admin/login');
    }
  }, [user, userRole, loading, navigate]);

  useEffect(() => {
    if (user && userRole === 'admin') {
      fetchComplaints();
    }
  }, [user, userRole]);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from('complaints')
      .select('*, categories(name), profiles(name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComplaints(data);
    }
  };

  const handleUpdate = async (complaintId: string) => {
    const { error } = await supabase
      .from('complaints')
      .update({
        status: newStatus,
        admin_comment: newComment,
        admin_id: user?.id
      })
      .eq('id', complaintId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update complaint.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Complaint updated successfully.",
      });
      setEditingId(null);
      fetchComplaints();
    }
  };

  const startEditing = (complaint: Complaint) => {
    setEditingId(complaint.id);
    setNewStatus(complaint.status);
    setNewComment(complaint.admin_comment || "");
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">Manage and resolve student complaints</p>
          </div>

          <div className="space-y-4">
            {complaints.length === 0 ? (
              <Card className="p-12 text-center bg-card border-border">
                <p className="text-muted-foreground">No complaints to display.</p>
              </Card>
            ) : (
              complaints.map((complaint) => (
                <Card key={complaint.id} className="p-6 bg-card border-border">
                  {editingId === complaint.id ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{complaint.title}</h3>
                        <p className="text-muted-foreground mb-3">{complaint.description}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Textarea
                          placeholder="Add admin comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        />
                        
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdate(complaint.id)} className="bg-primary hover:bg-primary/90">
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{complaint.title}</h3>
                          <p className="text-muted-foreground mb-3">{complaint.description}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Student: {complaint.profiles?.name || 'N/A'}</span>
                            <span>Category: {complaint.categories?.name || 'N/A'}</span>
                            <span>Date: {new Date(complaint.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-semibold text-primary">{complaint.status}</span>
                          <Button onClick={() => startEditing(complaint)} size="sm">
                            Update
                          </Button>
                        </div>
                      </div>
                      {complaint.admin_comment && (
                        <div className="mt-4 p-4 bg-secondary/20 rounded-md">
                          <p className="text-sm font-semibold mb-1">Admin Comment:</p>
                          <p className="text-sm text-muted-foreground">{complaint.admin_comment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
