import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  recommendMechanicSchema,
  estimatePriceSchema,
  smartSearchSchema,
} from '../validators/ai.validator';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

router.post(
  '/recommend-mechanic',
  validate(recommendMechanicSchema, 'body'),
  aiController.recommendMechanic
);

router.post(
  '/estimate-price',
  validate(estimatePriceSchema, 'body'),
  aiController.estimatePrice
);

router.get(
  '/insights',
  aiController.getInsights
);

router.get(
  '/search',
  validate(smartSearchSchema, 'query'),
  aiController.smartSearch
);

export default router;
