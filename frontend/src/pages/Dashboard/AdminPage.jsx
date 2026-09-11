import { useQuery } from '@tanstack/react-query'
import { Loader, ShieldCheck, Users, Receipt } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router'
import DashboardHeader from '../../components/dashboard/DashboardHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '../../lib/api/apiClient'

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})

export const AdminPage = () => {

    const navigate = useNavigate()

    const overviewQuery = useQuery({
        queryKey: ['adminOverview'],
        queryFn: async () => {
            const response = await api.get('/admin/overview')
            return response.data
        },
        retry: 1,
    })

    if (overviewQuery.isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader className='animate-spin' />
            </div>
        )
    }

    if (overviewQuery.isError) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <p className='text-destructive'>Error loading overview: {overviewQuery.error.message}</p>
            </div>
        )
    }

    const data = overviewQuery.data
    const incomeTotal = data.totalsByType.find((t) => t._id === 'income')?.total || 0
    const expenseTotal = data.totalsByType.find((t) => t._id === 'expense')?.total || 0

    return (
        <div className='min-h-screen bg-background'>
            <DashboardHeader />

            <main className='max-w-7xl mx-auto px-4 py-8 space-y-6'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='flex items-center gap-2'>
                        <ShieldCheck className='h-5 w-5 text-primary' />
                        <h2 className='text-2xl font-semibold text-foreground'>Admin Overview</h2>
                    </div>
                    <Button variant='outline' onClick={() => navigate('/dashboard')}>
                        Back to My Dashboard
                    </Button>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='bg-card p-4 rounded-lg border shadow-sm'>
                        <div className='flex items-center justify-between'>
                            <p className='text-sm font-medium text-muted-foreground'>Total Users</p>
                            <Users className='h-4 w-4 text-muted-foreground' />
                        </div>
                        <p className='text-2xl font-bold'>{data.totalUsers}</p>
                    </div>
                    <div className='bg-card p-4 rounded-lg border shadow-sm'>
                        <div className='flex items-center justify-between'>
                            <p className='text-sm font-medium text-muted-foreground'>Total Transactions</p>
                            <Receipt className='h-4 w-4 text-muted-foreground' />
                        </div>
                        <p className='text-2xl font-bold'>{data.totalTransactions}</p>
                    </div>
                    <div className='bg-card p-4 rounded-lg border shadow-sm'>
                        <p className='text-sm font-medium text-muted-foreground'>Total Income (all users)</p>
                        <p className='text-2xl font-bold text-success'>{currencyFormatter.format(incomeTotal)}</p>
                    </div>
                    <div className='bg-card p-4 rounded-lg border shadow-sm'>
                        <p className='text-sm font-medium text-muted-foreground'>Total Expenses (all users)</p>
                        <p className='text-2xl font-bold text-destructive'>{currencyFormatter.format(Math.abs(expenseTotal))}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Spending Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.topSpendingCategories.length === 0 ? (
                            <p className='text-sm text-muted-foreground'>No expense data yet.</p>
                        ) : (
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead className='text-left text-muted-foreground border-b'>
                                        <tr>
                                            <th className='py-2 font-medium'>Category</th>
                                            <th className='py-2 font-medium'>Total Spent</th>
                                            <th className='py-2 font-medium'>Transactions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.topSpendingCategories.map((cat) => (
                                            <tr key={cat.category} className='border-b last:border-0'>
                                                <td className='py-2 font-medium text-foreground'>{cat.category}</td>
                                                <td className='py-2 text-destructive'>{currencyFormatter.format(cat.totalSpent)}</td>
                                                <td className='py-2 text-muted-foreground'>{cat.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
