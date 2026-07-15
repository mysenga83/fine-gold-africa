import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260704/Gemini_Generated_Image_485gui485gui485g(1).png';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/dashboard';

  const form = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    if (error) {
      toast.error(error.message || 'Sign in failed. Check your credentials.');
    } else {
      toast.success('Welcome back to Fine Gold Africa');
      navigate(from, { replace: true });
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
        {/* Glass card */}
        <div className="glass-panel p-8 md:p-10">
          {/* Corner accents */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary/60" />
          <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary/60" />
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary/60" />
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary/60" />

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={LOGO_URL} alt="Fine Gold Africa" className="h-16 w-auto object-contain" />
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl text-foreground mb-2">Secure Portal</h1>
            <p className="text-sm text-muted-foreground">Sign in to your trading account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                rules={{ required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } }}
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
                rules={{ required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-semibold tracking-widest uppercase text-xs h-12 hover:bg-primary/90 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In to Portal'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              New to Fine Gold Africa?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Open an Account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 tracking-wide">
          <Link to="/" className="hover:text-foreground transition-colors">← Return to Platform</Link>
        </p>
      </div>
    </div>
  );
}
