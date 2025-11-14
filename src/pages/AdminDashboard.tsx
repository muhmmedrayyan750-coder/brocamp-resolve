import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageSquare, LogOut } from 'lucide-react';
import logo from '@/assets/logo.png';

const AdminDashboard = () => {
  const { user, role, loading: authLoading, signOut } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [adminComment, setAdminComment] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
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
          profiles:student_id(name, phone_number)
        `)
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
      .channel('admin-complaints')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
        },
        () => fetchComplaints()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleUpdateComplaint = async (complaintId: string) => {
    if (!newStatus && !adminComment.trim()) {
      toast.error('Please provide status or comment');
      return;
    }

    try {
      const updateData: any = {
        admin_id: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (newStatus) {
        updateData.status = newStatus;
      }
      if (adminComment.trim()) {
        updateData.admin_comment = adminComment.trim();
      }

      const { error } = await supabase
        .from('complaints')
        .update(updateData)
        .eq('id', complaintId);

      if (error) throw error;

      // Create notification for student
      const complaint = complaints.find(c => c.id === complaintId);
      if (complaint) {
        await supabase.from('notifications').insert({
          user_id: complaint.student_id,
          complaint_id: complaintId,
          type: 'status_update',
          message: `Your complaint "${complaint.title}" has been updated by admin.`,
        });
      }

      toast.success('Complaint updated successfully');
      setSelectedComplaint(null);
      setAdminComment('');
      setNewStatus('');
      fetchComplaints();
    } catch (error: any) {
      toast.error('Failed to update complaint');
    }
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
            <span className="font-semibold">Admin Dashboard</span>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Complaints</h1>
          <div className="flex gap-2">
            <Badge variant="outline">{complaints.filter(c => c.status === 'pending').length} Pending</Badge>
            <Badge variant="outline">{complaints.filter(c => c.status === 'in_progress').length} In Progress</Badge>
            <Badge variant="outline">{complaints.filter(c => c.status === 'resolved').length} Resolved</Badge>
          </div>
        </div>

        <div className="grid gap-4">
          {complaints.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No complaints yet.
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
                        {complaint.categories?.name} • Student: {complaint.profiles?.name}
                      </p>
                    </div>
                    <Badge className={getStatusColor(complaint.status)}>
                      {complaint.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{complaint.description}</p>
                  
                  {complaint.attachment_url && (
                    <div>
                      {complaint.attachment_type?.startsWith('image/') ? (
                        <img src={complaint.attachment_url} alt="Attachment" className="max-w-md rounded-lg" />
                      ) : complaint.attachment_type?.startsWith('audio/') ? (
                        <audio controls src={complaint.attachment_url} className="w-full max-w-md" />
                      ) : null}
                    </div>
                  )}

                  {selectedComplaint?.id === complaint.id ? (
                    <div className="space-y-4 border-t pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Update Status</label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Admin Comment</label>
                        <Textarea
                          placeholder="Add your response or resolution details"
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateComplaint(complaint.id)}>
                          Update Complaint
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setSelectedComplaint(null);
                          setAdminComment('');
                          setNewStatus('');
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => {
                        setSelectedComplaint(complaint);
                        setNewStatus(complaint.status);
                        setAdminComment(complaint.admin_comment || '');
                      }}>
                        Manage
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/complaint/${complaint.id}`)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  )}

                  {complaint.admin_comment && selectedComplaint?.id !== complaint.id && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-semibold">Previous Comment:</p>
                      <p className="text-sm">{complaint.admin_comment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
