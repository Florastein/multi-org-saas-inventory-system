"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package, Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleDemoLogin = (email: string, password: string) => {
    setFormData({ email, password });
  };

  const demoAccounts = [
    { email: 'admin@acme.com', password: 'password123', role: 'Admin' },
    { email: 'manager@acme.com', password: 'password123', role: 'Manager' },
  ];

  return (
    <div 
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4"
      role="main"
      aria-label="Login page"
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="bg-primary rounded-lg p-3"
              aria-hidden="true"
            >
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your inventory management account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            {error && (
              <Alert 
                variant="destructive" 
                role="alert"
                aria-live="polite"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@acme.com"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                disabled={isLoading}
                autoComplete="email"
                aria-describedby="email-description"
                className="transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="pr-10 transition-colors"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div 
              className="text-sm text-muted-foreground bg-muted p-3 rounded-md border"
              role="region"
              aria-label="Demo accounts"
            >
              <p className="font-semibold mb-2">Demo accounts:</p>
              <div className="space-y-2">
                {demoAccounts.map((account, index) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoLogin(account.email, account.password)}
                    disabled={isLoading}
                    className="w-full text-left text-xs p-2 rounded border border-dashed border-gray-300 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Use demo ${account.role.toLowerCase()} account`}
                  >
                    <span className="font-medium">{account.role}:</span>{' '}
                    {account.email} / {account.password}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !formData.email || !formData.password}
              aria-live="polite"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
            
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-primary hover:underline font-medium transition-colors"
                aria-disabled={isLoading}
                tabIndex={isLoading ? -1 : 0}
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}