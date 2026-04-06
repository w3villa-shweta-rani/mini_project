const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Plan configurations (duration in hours)
const PLANS = {
  Silver: {
    name: 'Silver Plan',
    price: 999, // in cents ($9.99)
    duration: 6, // hours
    features: [
      'Access to Silver gaming rooms',
      'Custom gaming profile badge',
      'Priority matchmaking',
      'Chat history 30 days',
    ],
  },
  Gold: {
    name: 'Gold Plan',
    price: 1999, // in cents ($19.99)
    duration: 12, // hours
    features: [
      'All Silver features',
      'Access to exclusive Gold tournaments',
      'Advanced analytics dashboard',
      'Unlimited chat history',
      '24/7 Priority support',
    ],
  },
};

/**
 * Create Stripe checkout session
 */
const resolveClientUrl = (clientOrigin) => {
  const raw = process.env.CLIENT_URL || process.env.FRONTEND_URL || clientOrigin || 'http://localhost:5173';
  return raw.replace(/\/$/, '');
};

const getClientPath = (path, clientUrl) => {
  const isLocalClient = /localhost|127\.0\.0\.1/.test(clientUrl);
  if (!isLocalClient) {
    // Production frontend uses HashRouter.
    return `/#${path}`;
  }
  return path;
};

const getSuccessQuery = (clientUrl) => {
  const isLocalClient = /localhost|127\.0\.0\.1/.test(clientUrl);
  return '?session_id={CHECKOUT_SESSION_ID}';
};

const getCancelQuery = (clientUrl) => {
  return '';
};

const createCheckoutSession = async (userId, userEmail, planType, clientOrigin) => {
  const plan = PLANS[planType];
  if (!plan) throw new Error('Invalid plan type');
  const clientUrl = resolveClientUrl(clientOrigin);
  const successUrl = `${clientUrl}${getClientPath('/payment/success', clientUrl)}${getSuccessQuery(clientUrl)}`;
  const cancelUrl = `${clientUrl}${getClientPath('/plans', clientUrl)}${getCancelQuery(clientUrl)}`;

  console.log('[PAYMENT][CHECKOUT][BUILD_URLS]', {
    nodeEnv: process.env.NODE_ENV,
    clientOrigin: clientOrigin || null,
    clientUrl,
    successUrl,
    cancelUrl,
    planType,
    userId: userId?.toString?.() || null,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
            description: plan.features.join(' • '),
            images: [],
          },
          unit_amount: plan.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: userId.toString(),
      planType,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  console.log('[PAYMENT][CHECKOUT][SESSION_CREATED]', {
    sessionId: session.id,
    sessionUrl: session.url,
    paymentStatus: session.payment_status,
    mode: session.mode,
    successUrl,
  });

  return session;
};

/**
 * Retrieve checkout session
 */
const retrieveSession = async (sessionId) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};

/**
 * Construct webhook event
 */
const constructWebhookEvent = (payload, signature, secret) => {
  return stripe.webhooks.constructEvent(payload, signature, secret);
};

/**
 * Get plan duration in hours
 */
const getPlanDuration = (planType) => {
  return PLANS[planType]?.duration || 0;
};

/**
 * Get plan details
 */
const getPlanDetails = (planType) => {
  return PLANS[planType] || null;
};

/**
 * Get all plans
 */
const getAllPlans = () => PLANS;

module.exports = {
  createCheckoutSession,
  retrieveSession,
  constructWebhookEvent,
  getPlanDuration,
  getPlanDetails,
  getAllPlans,
};
