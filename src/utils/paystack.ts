import axios from 'axios'; 

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';

/**
 * Initialize a Paystack transaction
 * @param email User email
 * @param amount Amount in kobo (Paystack requires this)
 * @param reference Unique payment reference
 */
export const initializePayment = async (email: string, amount: number, reference: string) => {
  return axios.post('https://api.paystack.co/transaction/initialize', {
    email,
    amount,
    reference,
  }, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Verify a Paystack transaction
 * @param reference Unique payment reference
 */
export const verifyPayment = async (reference: string) => {
  return axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
    }
  });
};