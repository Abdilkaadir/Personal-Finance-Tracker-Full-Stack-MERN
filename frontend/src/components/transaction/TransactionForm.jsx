import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader, Plus } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../lib/api/apiClient'
import { extractErrorMessages } from '../../util/errorUtils'

const TRANSACTION_TYPES = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
];

const todayISO = () => new Date().toISOString().split('T')[0];

const TransactionForm = ({ transaction, open = true, onOpenChange }) => {

    const [formValues, setFormValues] = useState({
        title: '',
        amount: '',
        type: 'expense',
        category: '',
        date: todayISO(),
    })
    const [showNewCategory, setShowNewCategory] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [validationError, setValidationError] = useState(null)

    const queryClient = useQueryClient()

    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/categories')
            return response.data
        },
    })

    useEffect(() => {
        if (transaction) {
            setFormValues({
                title: transaction.title || '',
                amount: transaction.amount !== undefined ? String(Math.abs(transaction.amount)) : '',
                type: transaction.type || 'expense',
                category: transaction.category || '',
                date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : todayISO(),
            });
        } else {
            setFormValues({
                title: '',
                amount: '',
                type: 'expense',
                category: '',
                date: todayISO(),
            });
        }
        setShowNewCategory(false);
        setNewCategoryName('');
        setValidationError(null);
    }, [transaction, open])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormValues({ ...formValues, [name]: value })
    }

    const handleTypeChange = (value) => {
        setFormValues({ ...formValues, type: value })
    }

    const handleCategoryChange = (value) => {
        setFormValues({ ...formValues, category: value })
    }

    const handleCancel = () => {
        onOpenChange?.(false)
    }

    const createCategoryMutation = useMutation({
        mutationFn: async (name) => {
            const response = await api.post('/categories', { name, type: formValues.type })
            return response.data
        },
        onSuccess: (category) => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            setFormValues((prev) => ({ ...prev, category: category.name }))
            setShowNewCategory(false)
            setNewCategoryName('')
            toast.success('Category created')
        },
        onError: (error) => {
            toast.error(`Error creating category: ${extractErrorMessages(error)}`)
        },
    })

    const handleAddCategory = () => {
        const name = newCategoryName.trim()
        if (!name) return
        createCategoryMutation.mutate(name)
    }

    const createTransactionMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/transactions', data)
            return response.data
        },
        onSuccess: () => {
            toast.success('Transaction added successfully')
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
            onOpenChange?.(false)
        },
        onError: (error) => {
            toast.error(`Error adding transaction: ${extractErrorMessages(error)}`)
            setValidationError(extractErrorMessages(error))
        },
    })

    const updateTransactionMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.put(`/transactions/${transaction._id}`, data)
            return response.data
        },
        onSuccess: () => {
            toast.success('Transaction updated successfully')
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            queryClient.invalidateQueries({ queryKey: ['monthly-summary'] })
            onOpenChange?.(false)
        },
        onError: (error) => {
            toast.error(`Error updating transaction: ${extractErrorMessages(error)}`)
            setValidationError(extractErrorMessages(error))
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!formValues.title.trim()) {
            setValidationError('Title is required')
            return
        }
        if (!formValues.amount || Number.isNaN(Number(formValues.amount))) {
            setValidationError('A valid amount is required')
            return
        }
        if (!formValues.category) {
            setValidationError('Category is required')
            return
        }

        // Expenses are stored as negative amounts, income as positive.
        const magnitude = Math.abs(Number(formValues.amount))
        const signedAmount = formValues.type === 'expense' ? -magnitude : magnitude

        const data = {
            title: formValues.title.trim(),
            amount: signedAmount,
            type: formValues.type,
            category: formValues.category,
            date: formValues.date ? new Date(formValues.date).toISOString() : undefined,
        }

        if (transaction) {
            updateTransactionMutation.mutate(data)
        } else {
            createTransactionMutation.mutate(data)
        }
    }

    const isLoading = createTransactionMutation.isPending || updateTransactionMutation.isPending
    const categories = categoriesQuery.data || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        {transaction ? 'Edit Transaction' : 'Add Transaction'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {transaction ? 'Update the details below.' : 'Fill in the details below to add a new income or expense.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {validationError && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {validationError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={formValues.type} onValueChange={handleTypeChange}>
                            <SelectTrigger className="w-full" id="type">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {TRANSACTION_TYPES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            name="title"
                            type="text"
                            value={formValues.title}
                            onChange={handleInputChange}
                            placeholder="e.g. Groceries"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formValues.amount}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="category">Category *</Label>
                            <button
                                type="button"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                onClick={() => setShowNewCategory((v) => !v)}
                            >
                                <Plus className="h-3 w-3" /> New category
                            </button>
                        </div>
                        {showNewCategory ? (
                            <div className="flex gap-2">
                                <Input
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Category name"
                                />
                                <Button type="button" onClick={handleAddCategory} disabled={createCategoryMutation.isPending}>
                                    {createCategoryMutation.isPending ? <Loader className="h-4 w-4 animate-spin" /> : 'Add'}
                                </Button>
                            </div>
                        ) : (
                            <Select value={formValues.category} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="w-full" id="category">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formValues.date}
                            onChange={handleInputChange}
                        />
                    </div>

                    <DialogFooter className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader className="h-4 w-4 animate-spin" />
                                    {transaction ? 'Updating...' : 'Adding...'}
                                </span>
                            ) : (
                                transaction ? 'Update Transaction' : 'Add Transaction'
                            )}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    )
}

export default TransactionForm
