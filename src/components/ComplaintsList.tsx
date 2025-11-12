import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ComplaintsListProps {
  userId: string;
  isAdmin: boolean;
}

const ComplaintsList = ({ userId, isAdmin }: ComplaintsListProps) => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState("");
  const [status, setStatus] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, [userId, isAdmin]);

  const fetchComplaints = async () => {
    setLoading(true);
    const query = supabase
      .from("complaints")
      .select("*, categories(name), profiles(name)")
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query.eq("student_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch complaints",
        variant: "destructive",
      });
    } else {
      setComplaints(data || []);
    }
    setLoading(false);
  };

  const handleUpdate = async (complaintId: string) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({
          status,
          admin_comment: adminComment,
          admin_id: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaintId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Complaint updated successfully",
      });

      setEditingId(null);
      setAdminComment("");
      setStatus("");
      fetchComplaints();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "In Progress":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      case "Resolved":
        return "bg-green-500/20 text-green-500 border-green-500/50";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/50";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading complaints...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        {isAdmin ? "All Complaints" : "My Complaints"}
      </h2>

      {complaints.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No complaints found
          </CardContent>
        </Card>
      ) : (
        complaints.map((complaint) => (
          <Card key={complaint.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{complaint.title}</CardTitle>
                  {isAdmin && (
                    <p className="text-sm text-muted-foreground">
                      Submitted by: {complaint.profiles?.name}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(complaint.status)}>
                  {complaint.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <p className="text-sm font-medium">{complaint.categories?.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{complaint.description}</p>
              </div>

              {complaint.admin_comment && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Admin Response</p>
                  <p className="text-sm">{complaint.admin_comment}</p>
                </div>
              )}

              {isAdmin && (
                <div className="pt-4 border-t border-border">
                  {editingId === complaint.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Admin Comment</label>
                        <Textarea
                          placeholder="Add your response..."
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdate(complaint.id)}>
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setAdminComment("");
                            setStatus("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setEditingId(complaint.id);
                        setStatus(complaint.status);
                        setAdminComment(complaint.admin_comment || "");
                      }}
                    >
                      Respond
                    </Button>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Submitted: {new Date(complaint.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ComplaintsList;
