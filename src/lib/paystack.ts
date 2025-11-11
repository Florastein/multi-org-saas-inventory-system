import PaystackSDK from 'paystack-sdk';
import crypto from 'crypto';

const paystack = new PaystackSDK.Paystack(process.env.PAYSTACK_SECRET_KEY!);

export const paystackApi = paystack;

// Verify webhook signature
export const verifyWebhookSignature = (
  payload: string,
  signature: string
): boolean => {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');
  return hash === signature;
};

// Initialize transaction
export const initializeTransaction = async (
  email: string,
  amount: number, // in pesewas
  metadata: Record<string, any> = {},
  planCode?: string
) => {
  const params: any = {
    email,
    amount,
    metadata,
    currency: 'GHS',
  };

  if (planCode) {
    params.plan = planCode;
  }

  return paystack.transaction.initialize(params);
};

// Verify transaction
export const verifyTransaction = async (reference: string) => {
  return paystack.transaction.verify({
    reference,
  });
};

// Charge authorization (recurring billing)
export const chargeAuthorization = async (
  authorizationCode: string,
  email: string,
  amount: number, // in pesewas
  metadata: Record<string, any> = {}
) => {
  return paystack.transaction.chargeAuthorization({
    authorization_code: authorizationCode,
    email,
    amount,
    metadata,
  });
};

// Create subscription
export const createSubscription = async (
  email: string,
  planCode: string,
  authorizationCode?: string,
  metadata: Record<string, any> = {}
) => {
  const params: any = {
    customer: email,
    plan: planCode,
    metadata,
  };

  if (authorizationCode) {
    params.authorization = authorizationCode;
  }

  return paystack.subscription.create(params);
};

// Create subscription plan on Paystack
export const createSubscriptionPlan = async (
  name: string,
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannually' | 'annually',
  amount: number, // in pesewas for GHS
  description?: string
) => {
  return paystack.plan.create({
    name,
    interval,
    amount,
    description,
    currency: 'GHS',
  });
};