// src/lib/stripe.ts - Stripe Configuration & Helpers
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
})

// Stripe Price IDs (these need to be created in Stripe Dashboard)
export const STRIPE_PRICES = {
  creator: {
    monthly: process.env.STRIPE_PRICE_CREATOR_MONTHLY || 'price_creator_monthly',
    yearly: process.env.STRIPE_PRICE_CREATOR_YEARLY || 'price_creator_yearly',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly', 
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
  }
} as const

// Stripe helper functions
export const stripeHelpers = {
  // Create customer
  async createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'casi_platform',
          ...metadata,
        },
      })
      return customer
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw error
    }
  },

  // Create subscription
  async createSubscription(
    customerId: string,
    priceId: string,
    trialPeriodDays: number = 7,
    metadata?: Record<string, string>
  ) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialPeriodDays,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          source: 'casi_platform',
          ...metadata,
        },
      })
      return subscription
    } catch (error) {
      console.error('Error creating Stripe subscription:', error)
      throw error
    }
  },

  // Create billing portal session
  async createBillingPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })
      return session
    } catch (error) {
      console.error('Error creating billing portal session:', error)
      throw error
    }
  },

  // Create checkout session
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    trialPeriodDays: number = 7,
    metadata?: Record<string, string>
  ) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          trial_period_days: trialPeriodDays,
          metadata: {
            source: 'casi_platform',
            ...metadata,
          },
        },
        metadata: {
          source: 'casi_platform',
          ...metadata,
        },
      })
      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  },

  // Get subscription
  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['customer', 'items.data.price'],
      })
      return subscription
    } catch (error) {
      console.error('Error retrieving subscription:', error)
      throw error
    }
  },

  // Update subscription
  async updateSubscription(subscriptionId: string, priceId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: priceId,
          },
        ],
      })
      return updatedSubscription
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, immediately: boolean = false) {
    try {
      if (immediately) {
        const subscription = await stripe.subscriptions.cancel(subscriptionId)
        return subscription
      } else {
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })
        return subscription
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  },

  // Get customer
  async getCustomer(customerId: string) {
    try {
      const customer = await stripe.customers.retrieve(customerId)
      return customer
    } catch (error) {
      console.error('Error retrieving customer:', error)
      throw error
    }
  },

  // List customer subscriptions
  async getCustomerSubscriptions(customerId: string) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        expand: ['data.items.data.price'],
      })
      return subscriptions
    } catch (error) {
      console.error('Error retrieving customer subscriptions:', error)
      throw error
    }
  },

  // Get usage for metered billing (future feature)
  async getUsageRecords(subscriptionItemId: string) {
    try {
      const usageRecords = await stripe.subscriptionItems.listUsageRecords(
        subscriptionItemId,
        { limit: 100 }
      )
      return usageRecords
    } catch (error) {
      console.error('Error retrieving usage records:', error)
      throw error
    }
  },

  // Report usage for metered billing (future feature)
  async reportUsage(
    subscriptionItemId: string,
    quantity: number,
    timestamp?: number
  ) {
    try {
      const usageRecord = await stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
          quantity,
          timestamp: timestamp || Math.floor(Date.now() / 1000),
          action: 'increment',
        }
      )
      return usageRecord
    } catch (error) {
      console.error('Error reporting usage:', error)
      throw error
    }
  },
}

// Utility functions for pricing
export const pricingUtils = {
  // Get tier info from price ID
  getTierFromPriceId(priceId: string): { tier: string; billing: 'monthly' | 'yearly' } | null {
    for (const [tier, prices] of Object.entries(STRIPE_PRICES)) {
      if (prices.monthly === priceId) return { tier, billing: 'monthly' }
      if (prices.yearly === priceId) return { tier, billing: 'yearly' }
    }
    return null
  },

  // Get viewer limit for tier
  getViewerLimit(tier: string): number {
    switch (tier) {
      case 'creator': return 100
      case 'pro': return 2000
      case 'enterprise': return -1 // unlimited
      default: return 0
    }
  },

  // Get price for tier and billing cycle
  getPrice(tier: string, billing: 'monthly' | 'yearly'): string | null {
    const tierPrices = STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES]
    return tierPrices ? tierPrices[billing] : null
  },

  // Format price for display
  formatPrice(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  },

  // Calculate savings for yearly billing
  calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): {
    amount: number
    percentage: number
  } {
    const yearlyMonthlyEquivalent = monthlyPrice * 12
    const savings = yearlyMonthlyEquivalent - yearlyPrice
    const percentage = Math.round((savings / yearlyMonthlyEquivalent) * 100)
    
    return {
      amount: savings,
      percentage,
    }
  },
}

// Webhook signature verification
export const verifyStripeWebhook = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw error
  }
}
