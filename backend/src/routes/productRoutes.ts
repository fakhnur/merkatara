import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductSchema,
  updateProductSchema,
} from '../controllers/productController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/role';
import { validateBody } from '../middleware/validate';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-protected routes
router.post('/', authenticate, requireAdmin, validateBody(createProductSchema), createProduct);
router.put('/:id', authenticate, requireAdmin, validateBody(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
