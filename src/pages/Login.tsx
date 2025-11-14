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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'student' | 'admin'>('student');
  const navigate = useNavigate();

  const sendOTP = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          channel: 'sms',
        },
      });

      if (error) throw error;

      setOtpSent(true);
      toast.success('OTP sent to your phone number!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      // Check if user has role assigned
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user?.id)
        .single();

      if (!roleData) {
        // Assign role based on login type
        await supabase
          .from('user_roles')
          .insert({ user_id: data.user?.id, role: loginType });
      }

      toast.success('Login successful!');
      
      // Navigate based on role
      if (roleData?.role === 'admin' || loginType === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
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
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                otp={otp}
                setOtp={setOtp}
                otpSent={otpSent}
                loading={loading}
                sendOTP={sendOTP}
                verifyOTP={verifyOTP}
              />
            </TabsContent>
            
            <TabsContent value="admin" className="space-y-4">
              <LoginForm
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                otp={otp}
                setOtp={setOtp}
                otpSent={otpSent}
                loading={loading}
                sendOTP={sendOTP}
                verifyOTP={verifyOTP}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const LoginForm = ({ phoneNumber, setPhoneNumber, otp, setOtp, otpSent, loading, sendOTP, verifyOTP }: any) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="phone">Phone Number</Label>
      <Input
        id="phone"
        type="tel"
        placeholder="+919876543210"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        disabled={otpSent || loading}
      />
    </div>

    {otpSent && (
      <div className="space-y-2">
        <Label htmlFor="otp">Enter OTP</Label>
        <Input
          id="otp"
          type="text"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={loading}
          maxLength={6}
        />
      </div>
    )}

    {!otpSent ? (
      <Button onClick={sendOTP} disabled={loading || !phoneNumber} className="w-full">
        {loading ? 'Sending...' : 'Send OTP'}
      </Button>
    ) : (
      <div className="space-y-2">
        <Button onClick={verifyOTP} disabled={loading || !otp} className="w-full">
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
        <Button onClick={sendOTP} variant="outline" className="w-full">
          Resend OTP
        </Button>
      </div>
    )}
  </>
);

export default Login;
