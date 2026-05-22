import { Router } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import Stripe from 'stripe';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' as any });

// Create payment intent
router.post('/create-intent', authenticate, [
  body('amount').isFloat({ min: 1 }),
  body('type').isIn(['PLACEMENT_FEE','SUBSCRIPTION','SHIFT_PAYMENT']),
  body('payeeId').isUUID()
], async (req: any, res, next) => {
  try {
    const { amount, type, payeeId, description } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'usd',
      metadata: { payerId: req.user.id, payeeId, type, description }
    });

    await prisma.payment.create({
      data: {
        payerId: req.user.id, payeeId, type, amount,
        status: 'PENDING', stripePaymentId: paymentIntent.id, description
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) { next(error); }
});

// Get my payments
router.get('/my-payments', authenticate, async (req: any, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { OR: [{ payerId: req.user.id }, { payeeId: req.user.id }] },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments);
  } catch (error) { next(error); }
});

// Stripe webhook
router.post('/webhook', async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any;
      await prisma.payment.updateMany({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: 'COMPLETED' }
      });
    }

    res.json({ received: true });
  } catch (error) { next(error); }
});

export { router as paymentRouter };
