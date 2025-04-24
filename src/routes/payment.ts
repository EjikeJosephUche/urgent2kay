import express from 'express';
import { initialize, verify } from '../controllers/paymentController';

const router = express.Router();

/**
 * POST /payment/initialize
 * Initiates a new payment transaction with multiple providers
 */
router.post('/initialize', initialize);

/**
 * GET /payment/verify/:reference
 * Verifies payment after redirection from Paystack
 */
router.get('/verify/:reference', verify);

export default router;