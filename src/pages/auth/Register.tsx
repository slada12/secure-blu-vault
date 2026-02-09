import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Wallet, User, Phone, MapPin, Globe, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  homeAddress: z.string().min(5, 'Please enter your home address'),
  nationality: z.string().min(2, 'Please enter your nationality'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [nationality, setNationality] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = registerSchema.parse({ name, email, phone, dateOfBirth, homeAddress, nationality, password, confirmPassword });
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: validatedData.name,
            phone: validatedData.phone || null,
            date_of_birth: validatedData.dateOfBirth,
            home_address: validatedData.homeAddress,
            nationality: validatedData.nationality,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bank-card-gradient flex items-center justify-center shadow-button">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-display">Open an Account</h1>
              <p className="text-muted-foreground mt-1">Join NexusBank today</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Full name" className="input-bank pl-12" required />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address" className="input-bank pl-12" required />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (optional)" className="input-bank pl-12" />
            </div>

            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)}
                placeholder="Date of birth" className="input-bank pl-12" required />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="Home address" className="input-bank pl-12" required />
            </div>

            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)}
                placeholder="Nationality" className="input-bank pl-12" required />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                className="input-bank pl-12 pr-12" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password"
                className="input-bank pl-12" required />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 btn-gradient text-base font-semibold">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-5 h-5 ml-2" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
      <div className="text-center pb-6">
        <p className="text-xs text-muted-foreground">NexusBank v1.0</p>
      </div>
    </div>
  );
}
