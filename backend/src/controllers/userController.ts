import { Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export const getUsers = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: users });
};

export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (req.user?.role !== 'admin' && req.user?.id !== id) {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }

  const user = await User.findById(id).select('-password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, data: user });
};

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (req.user?.role !== 'admin' && req.user?.id !== id) {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }

  // Prevent non-admin users from elevating their role
  if (req.user?.role !== 'admin' && req.body.role) {
    delete req.body.role;
  }

  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, message: 'User updated successfully', data: user });
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (req.user?.id === id) {
    res.status(400).json({ success: false, message: 'Cannot delete your own admin account' });
    return;
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  res.json({ success: true, message: 'User deleted successfully' });
};
