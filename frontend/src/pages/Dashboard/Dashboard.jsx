import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import React, { useState } from 'react'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import MonthlySummary from '../../components/dashboard/MonthlySummary'
import TransactionForm from '../../components/transaction/TransactionForm'
import TransactionList from '../../components/transaction/TransactionList'
import api from '../../lib/api/apiClient'

export const Dashboard = () => {

    const [showForm, setShowForm] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState(null)

    const handleFormClose = () => {
        setShowForm(false)
        setEditingTransaction(null)
    }

    const handleAddClick = () => {
        setShowForm(true)
    }

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction)
        setShowForm(true)
    }

    // The backend paginates: GET /transactions returns { total, page, pages, transactions }.
    const transactionsQuery = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            const response = await api.get('/transactions', { params: { limit: 100 } })
            return response.data
        },
        retry: 1,
    })

    if (transactionsQuery.isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader className='animate-spin' />
            </div>
        )
    }

    if (transactionsQuery.isError) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <p className='text-destructive'>Error loading transactions: {transactionsQuery.error.message}</p>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-background'>
            <DashboardHeader />

            <main className='max-w-7xl mx-auto px-4 py-8 space-y-6'>
                <MonthlySummary onAddTransaction={handleAddClick} />

                <div>
                    <TransactionList
                        transactions={transactionsQuery.data?.transactions || []}
                        onEdit={handleEdit}
                    />
                </div>
            </main>

            <TransactionForm
                transaction={editingTransaction}
                open={showForm || !!editingTransaction}
                onOpenChange={handleFormClose}
            />
        </div>
    )
}
