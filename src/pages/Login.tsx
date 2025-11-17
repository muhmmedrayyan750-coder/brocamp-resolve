import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'student' | 'admin'>('student');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // Try to sign in first
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If user doesn't exist, sign them up
      if (error?.message?.includes('Invalid login credentials')) {
        const signUpResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (signUpResult.error) throw signUpResult.error;
        data = signUpResult.data;
        
        // Assign role for new user
        if (data.user) {
          await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: loginType });
        }
      } else if (error) {
        throw error;
      }

      // Check if user has role assigned
      if (data.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();

        if (!roleData) {
          // Assign role if missing
          await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: loginType });
        }

        toast.success('Login successful!');
        
        // Navigate based on role
        if (roleData?.role === 'admin' || loginType === 'admin') {
          navigate('/admin');
        } else {
          navigate('/student');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Brototype Logo" className="h-16" />
          </div>
          <CardTitle className="text-2xl">Welcome to BrocampSupport</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={loginType} onValueChange={(v) => setLoginType(v as 'student' | 'admin')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="student" className="space-y-4">
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                handleLogin={handleLogin}
              />
            </TabsContent>
            
            <TabsContent value="admin" className="space-y-4">
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                handleLogin={handleLogin}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const LoginForm = ({ email, setEmail, password, setPassword, loading, handleLogin }: any) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="brocampstudent@test.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type="password"
        placeholder="brocampstudent"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
    </div>

    <Button onClick={handleLogin} disabled={loading || !email || !password} className="w-full">
      {loading ? 'Loading...' : 'Login / Sign Up'}
    </Button>
  </>
);

export default Login;
