import config from '../config/config';
import { apiRequest } from './apiRequest';

const { PAYSTACK_SECRET_KEY, PAYSTACK_BASE_URL } = config

if (!PAYSTACK_SECRET_KEY || !PAYSTACK_BASE_URL)
  throw new Error("PAYSTACK_SECRET_KEY and PAYSTACK_BASE_URL must be specified in the environment variables.");

let conf = {
  baseURL: PAYSTACK_BASE_URL,
  withCredentials: true,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
}

// Define the available HTTP methods
type HttpMethod = "get" | "post" | "patch" | "delete" | "put";

export const callPayStackApi = async (
    route: string,
    method: HttpMethod,
    data?: any) => {
    return await apiRequest(route, method, data, conf)
}

/**
 * Initialize a Paystack transaction
 * @param email User email
 * @param amount Amount in kobo (Paystack requires this)
 * @param reference Unique payment reference
 */
export const initializePayment = async (email: string, amount: number, reference: string) => {
  return await callPayStackApi(`/transaction/initialize`, "post", {
    email,
    amount,
    reference,
  })
};

/**
 * Verify a Paystack transaction
 * @param reference Unique payment reference
 */
export const verifyPayment = async (reference: string) => {
  return await callPayStackApi(`/transaction/verify/${reference}`, "get")
};