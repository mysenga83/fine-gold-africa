import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260704/Gemini_Generated_Image_485gui485gui485g(1).png';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  companyName: string;
}

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'individual' | 'corporate'>('individual');

  const form = useForm<RegisterForm>({
    defaultValues: { email: '', password: '', confirmPassword: '', fullName: '', companyName: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName, role, data.companyName || undefined);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } else {
      toast.success('Account created. Welcome to Fine Gold Africa.');
      navigate('/kyc');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Background geometric pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-primary"
              style={{
                width: `${200 + i * 150}px`,
                height: `${200 + i * 150}px`,
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 15}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel p-8 md:p-10">
          <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary/60" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary/60" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary/60" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary/60" />

          <div className="flex justify-center mb-6">
            <img src={LOGO_URL} alt="Fine Gold Africa" className="h-14 w-auto object-contain" />
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl text-foreground mb-1">Open Account</h1>
            <p className="text-sm text-muted-foreground">Join Africa's premier gold exchange</p>
          </div>

          {/* Account type selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('individual')}
              className={`p-3 border text-sm flex flex-col items-center gap-2 transition-all ${
                role === 'individual' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-xs tracking-widest uppercase">Individual</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('corporate')}
              className={`p-3 border text-sm flex flex-col items-center gap-2 transition-all ${
                role === 'corporate' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-xs tracking-widest uppercase">Corporate</span>
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                rules={{ required: 'Full name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your full legal name" className="bg-background border-border text-foreground h-11 px-3" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === 'corporate' && (
                <FormField
                  control={form.control}
                  name="companyName"
                  rules={{ required: role === 'corporate' ? 'Company name is required' : false }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Registered company name" className="bg-background border-border text-foreground h-11 px-3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="you@company.com" className="bg-background border-border text-foreground h-11 px-3" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                rules={{ required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min 8 characters"
                          className="bg-background border-border text-foreground h-11 px-3 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{ required: 'Please confirm your password' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">Confirm Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="••••••••" className="bg-background border-border text-foreground h-11 px-3" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-12 hover:bg-primary/90 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Secure Account'}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-xs text-muted-foreground text-center">
            After registration, you will be guided through KYC verification required for trading.
          </p>

          <div className="mt-5 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">Sign In</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/" className="hover:text-foreground transition-colors">← Return to Platform</Link>
        </p>
      </div>
    </div>
  );
}
