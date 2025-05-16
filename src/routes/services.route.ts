import { Router } from 'express';
import { serviceController } from '../controllers';
import { authenticateRequest, validateRequest } from '../middlewares';
import { ServiceSchemas, ServiceFields } from '../validations';
import { loggerMiddleware } from '../middlewares/log.middleware';

const serviceRouter = Router();

/**
 * GET /
 * Fetch all services, optionally with providers
 */
serviceRouter.get(
  '/',
  [
    authenticateRequest,
    loggerMiddleware,
    validateRequest(ServiceSchemas, ServiceFields.FetchOurServices)
  ],
  serviceController.fetchOurServices
);

/**
 * GET /:category/plans
 * Fetch all plans for a service category (optionally by provider)
 */
serviceRouter.get(
  '/:category/plans',
  [
    authenticateRequest,
    loggerMiddleware,
    validateRequest(ServiceSchemas, ServiceFields.FetchOurPlans)
  ],
  serviceController.fetchOurPlans
);

/**
 * POST /data/plans/:provider/:planId/buy
 * Purchase data bundle
 */
serviceRouter.post(
  '/data/plans/:provider/:planId/buy',
  [
    authenticateRequest,
    loggerMiddleware,
    validateRequest(ServiceSchemas, ServiceFields.PurchaseData)
  ],
  serviceController.purchaseData
);

/**
 * POST /electricity/:provider/buy
 * Recharge electricity meter
 */
serviceRouter.post(
  '/electricity/:provider/buy',
  [
    authenticateRequest,
    loggerMiddleware,
    validateRequest(ServiceSchemas, ServiceFields.RechargeElectricity)
  ],
  serviceController.rechargeElectricity
);

/**
 * POST /cable/:provider/:planId/buy
 * Subscribe to cable TV
 */
serviceRouter.post(
  '/cable/:provider/:planId/buy',
  [
    authenticateRequest,
    loggerMiddleware,
    validateRequest(ServiceSchemas, ServiceFields.SubscribeCable)
  ],
  serviceController.subscribeCable
);

/**
 * POST /airtime/:provider/buy
 * Top up airtime
 */
serviceRouter.post(
  '/airtime/:provider/buy',
  [
    authenticateRequest,
    loggerMiddleware,
    validateRequest(ServiceSchemas, ServiceFields.TopUpAirtime)
  ],
  serviceController.topUpAirtime
);

export default serviceRouter;