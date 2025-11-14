import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, MessageSquare, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';

const StudentDashboard = () => {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || role !== 'student')) {
      navigate('/login');
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchComplaints();
      subscribeToComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          categories(name),
          profiles:student_id(name)
        `)
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToComplaints = () => {
    const channel = supabase
      .channel('student-complaints')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `student_id=eq.${user?.id}`,
        },
        () => fetchComplaints()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10" />
            <span className="font-semibold">Student Dashboard</span>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Complaints</h1>
          <Button onClick={() => navigate('/student/new-complaint')}>
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </Button>
        </div>

        <div className="grid gap-4">
          {complaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No complaints yet. Click "New Complaint" to submit one.
              </CardContent>
            </Card>
          ) : (
            complaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{complaint.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {complaint.categories?.name}
                      </p>
                    </div>
                    <Badge className={getStatusColor(complaint.status)}>
                      {complaint.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{complaint.description}</p>
                  {complaint.admin_comment && (
                    <div className="bg-muted p-3 rounded-md mb-4">
                      <p className="text-sm font-semibold">Admin Response:</p>
                      <p className="text-sm">{complaint.admin_comment}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/student/complaint/${complaint.id}`)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Chat
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
