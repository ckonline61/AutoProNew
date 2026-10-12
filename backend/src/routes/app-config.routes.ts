import { Router } from 'express';
import { appConfigController } from '../controllers/app-config.controller';

const router = Router();

// Public configuration endpoint
router.get('/public', appConfigController.getPublicConfig);

export default router;
