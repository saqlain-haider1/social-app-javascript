const Publishable_Key = process.env.STRIPE_PUBLISHABLE_KEY;
const Secret_Key = process.env.STRIPE_SECRET_KEY;
const stripe = require('stripe')(Secret_Key);
const Subscription_Charges = process.env.STRIPE_SUBSCRIPTION || 2500;
const getStripe = function () {
  return stripe;
};

module.exports = { getStripe, Publishable_Key, Subscription_Charges };
