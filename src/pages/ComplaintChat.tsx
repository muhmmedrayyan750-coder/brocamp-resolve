import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Send, ArrowLeft } from 'lucide-react';
import logo from '@/assets/logo.png';

const ComplaintChat = () => {
  const { id } = useParams();
  const { user, role, loading: authLoading } = useAuth();
  const [complaint, setComplaint] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchComplaint();
      fetchMessages();
      subscribeToMessages();
    }
  }, [user, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchComplaint = async () => {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          categories(name),
          profiles:student_id(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setComplaint(data);
    } catch (error: any) {
      toast.error('Failed to fetch complaint');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id(name)
        `)
        .eq('complaint_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`complaint-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `complaint_id=eq.${id}`,
        },
        (payload) => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          complaint_id: id,
          sender_id: user?.id,
          content: newMessage.trim(),
        });

      if (error) throw error;

      // Notify the other party
      const recipientId = role === 'student' ? complaint?.admin_id : complaint?.student_id;
      if (recipientId) {
        await supabase.from('notifications').insert({
          user_id: recipientId,
          complaint_id: id,
          type: 'new_message',
          message: `New message in complaint: ${complaint?.title}`,
        });
      }

      setNewMessage('');
    } catch (error: any) {
      toast.error('Failed to send message');
    }
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
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-10" />
            <span className="font-semibold">Complaint Chat</span>
          </div>
          <Button 
            onClick={() => navigate(role === 'admin' ? '/admin' : '/student')} 
            variant="ghost" 
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-6 flex-1 flex flex-col max-w-4xl">
        {complaint && (
          <Card className="mb-4">
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
            <CardContent>
              <p className="text-sm">{complaint.description}</p>
              {complaint.admin_comment && (
                <div className="bg-muted p-3 rounded-md mt-4">
                  <p className="text-sm font-semibold">Admin Response:</p>
                  <p className="text-sm">{complaint.admin_comment}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[400px]">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-1">
                        {message.profiles?.name || 'User'}
                      </p>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintChat;
