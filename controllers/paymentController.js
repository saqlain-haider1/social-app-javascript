const { mongoose } = require('mongoose');
const { getStripe, Subscription_Charges } = require('../config/stripe');
const User = require('../models/User');
const checkout = async (req, res) => {
  try {
    let stripe = getStripe();
    const { userId } = req.body;
    if (userId) {
      let user = await User.findById(userId);
      if (user) {
        // User found in database
        if (user.paid) {
          // User has already paid
          return res.status(200).json({
            success: true,
            message: 'User has already paid for the feed!',
          });
        } else {
          // User has not yet paid
          // Now create a stripe customer
          // creating strip customer
          const customer = await stripe.customers.create({
            name: user.firstName + ' ' + user.lastName,
            email: user.email,
          });

          // creating stripe token
          const card_Token = await stripe.tokens.create({
            card: {
              name: req.body.cardName || 'Visa',
              number: req.body.cardNumber || '4242424242424242',
              exp_month: req.body.expMonth || '06',
              exp_year: req.body.expYear || '25',
              cvc: req.body.cvc || '123',
            },
          });

          // creating payment source for customer by stripe
          const card = await stripe.customers.createSource(customer.id, {
            source: `${card_Token.id}`,
          });

          // Now Charge Cusomter for social feed
          await stripe.charges.create({
            amount: Subscription_Charges,
            currency: 'USD',
            card: card.id,
            customer: customer.id,
            description: 'Social Feed Payment',
          });

          // User paid for the feed
          await User.findByIdAndUpdate(user._id, { paid: true }, { new: true });
          //console.log(user);
          res.status(200).json({
            message: 'Social Feed Payment Successful',
            amount: `${Subscription_Charges / 100}$`,
          });
        }
      } else {
        throw new Error('User not found!');
      }
    } else {
      throw new Error('UserID is required');
    }
  } catch (error) {
    //console.log(error);
    res.status(404).json({ message: error.message });
  }
};
module.exports = { checkout };
