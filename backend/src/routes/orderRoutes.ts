import { Router } from 'express';
import { checkout, getMyOrders, checkoutSchema } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

// Order routes require authentication
router.use(authenticate);

router.post('/', validateBody(checkoutSchema), checkout);
router.get('/my-orders', getMyOrders);

export default router;
