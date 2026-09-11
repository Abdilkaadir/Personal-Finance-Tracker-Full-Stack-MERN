const { z } = require('zod');

const createTransactionSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    amount: z.number({ invalid_type_error: 'Amount must be a number' }),
    type: z.enum(['income', 'expense']),
    category: z.string().min(1, 'Category is required'),
    date: z.string().optional(), // ISO date string, defaults to now if omitted
  }),
});

const updateTransactionSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    amount: z.number().optional(),
    type: z.enum(['income', 'expense']).optional(),
    category: z.string().min(1).optional(),
    date: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Transaction id is required'),
  }),
});

module.exports = { createTransactionSchema, updateTransactionSchema };
