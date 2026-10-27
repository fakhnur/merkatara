import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserSchema,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/role';
import { validateBody } from '../middleware/validate';

const router = Router();

// All user management routes require authentication
router.use(authenticate);

router.get('/', requireAdmin, getUsers);
router.get('/:id', getUserById);
router.put('/:id', validateBody(updateUserSchema), updateUser);
router.delete('/:id', requireAdmin, deleteUser);

export default router;
