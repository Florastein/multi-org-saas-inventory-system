'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PaystackCheckoutProps {
  email: string;
  amount: number; // in pesewas (GHS 100 = 10000 pesewas)
  planCode?: string;
  planName?: string;
  planId?: number;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function PaystackCheckout({
  email,
  amount,
  planCode,
  planName,
  planId,
  onSuccess,
  onError,
  children,
  className,
}: PaystackCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = useCallback(async () => {
    setLoading(true);
    try {
      // Step 1: Initialize transaction on backend
      const initResponse = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`,
        },
        body: JSON.stringify({
          email,
          amount,
          planCode,
          metadata: { 
            planName,
            planId,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(errorData.error || 'Failed to initialize transaction');
      }

      const { access_code, reference } = await initResponse.json();

      // Step 2: Load Paystack Inline JS dynamically
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        // @ts-ignore - Paystack Inline JS types
        const popup = new window.PaystackPop();
        popup.newTransaction({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          accessCode: access_code,
          onSuccess: async (transaction: { reference: string }) => {
            toast.loading('Verifying payment...');
            
            // Step 3: Verify transaction on backend
            const verifyResponse = await fetch(
              `/api/paystack/verify?reference=${transaction.reference}`,
              {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`,
                },
              }
            );

            if (!verifyResponse.ok) {
              throw new Error('Failed to verify transaction');
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.data.status === 'success') {
              toast.dismiss();
              toast.success('Payment successful!');
              
              // Create subscription if planId is provided
              if (planId) {
                const authCode = verifyData.data.authorization?.authorization_code;
                await fetch('/api/subscriptions/create', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`,
                  },
                  body: JSON.stringify({
                    planId,
                    paystackAuthorizationCode: authCode,
                  }),
                });
              }
              
              onSuccess?.(transaction.reference);
              router.push('/dashboard');
            } else {
              throw new Error('Payment verification failed');
            }
          },
          onCancel: () => {
            toast.error('Payment cancelled');
            setLoading(false);
          },
          onError: (error: any) => {
            console.error('Payment error:', error);
            toast.error(error.message || 'Payment failed');
            onError?.(error.message || 'Payment failed');
            setLoading(false);
          },
        });
      };

      script.onerror = () => {
        toast.error('Failed to load payment gateway');
        setLoading(false);
      };
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
      setLoading(false);
    }
  }, [email, amount, planCode, planName, planId, onSuccess, onError, router]);

  return (
    <Button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? 'Processing...' : children || `Pay GHS ${(amount / 100).toFixed(2)}`}
    </Button>
  );
}
