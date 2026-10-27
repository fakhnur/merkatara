import { Request, Response } from 'express';
import { z } from 'zod';
import { Product } from '../models/Product';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  description: z.string().min(5, 'Description must be at least 5 characters long'),
  price: z.number().positive('Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  imageUrl: z.string().url('Invalid image URL').or(z.string().min(1)),
  rating: z.number().min(0).max(5).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { search, category } = req.query;
  const filter: Record<string, unknown> = {};

  if (category && typeof category === 'string' && category !== 'All') {
    filter.category = category;
  }

  if (search && typeof search === 'string') {
    filter.name = { $regex: search, $options: 'i' };
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: products.length, data: products });
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }
  res.json({ success: true, data: product });
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }
  res.json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found' });
    return;
  }
  res.json({ success: true, message: 'Product deleted successfully' });
};
