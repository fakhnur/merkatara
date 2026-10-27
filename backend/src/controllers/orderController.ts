import { Response } from 'express';
import { z } from 'zod';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { AuthenticatedRequest } from '../middleware/auth';

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        name: z.string().min(1),
        price: z.number().positive('Price must be positive'),
        quantity: z.number().int().positive('Quantity must be at least 1'),
      })
    )
    .min(1, 'Cart must contain at least one item'),
  shippingAddress: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
  }),
});

export const checkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  if (req.user.role === 'admin') {
    res.status(403).json({
      success: false,
      message: 'Administrator accounts cannot place orders. Please use a customer account.',
    });
    return;
  }

  const { items, shippingAddress } = req.body;

  // Step 1: Verify all products exist and have sufficient stock
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: `Product "${item.name}" was not found in catalog.`,
      });
      return;
    }

    if (product.stock < item.quantity) {
      res.status(400).json({
        success: false,
        message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`,
      });
      return;
    }
  }

  // Step 2: Atomically deduct stock from inventory
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  // Step 3: Calculate total and save completed order
  const totalAmount = items.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    user: req.user.id,
    items: items.map((item: { productId: string; name: string; price: number; quantity: number }) => ({
      product: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    totalAmount,
    shippingAddress,
    status: 'completed',
  });

  res.status(201).json({
    success: true,
    message: 'Order completed successfully and stock updated.',
    data: order,
  });
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
};
