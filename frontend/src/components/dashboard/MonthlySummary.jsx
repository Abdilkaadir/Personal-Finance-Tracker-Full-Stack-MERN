import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowDownCircle, ArrowUpCircle, Scale } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import api from '../../lib/api/apiClient'

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})

const MonthlySummary = ({ onAddTransaction }) => {

    const summaryQuery = useQuery({
        queryKey: ['monthly-summary'],
        queryFn: async () => {
            const response = await api.get('/transactions/monthly-summary')
            return response.data
        },
    })

    const summary = summaryQuery.data
    const monthLabel = summary
        ? new Date(summary.year, summary.month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : ''

    return (
        <Card className="border-0 border-l-4 border-l-primary shadow-sm bg-card">
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex flex-col items-start">
                        <CardTitle className="text-2xl">Welcome back!</CardTitle>
                        <CardDescription className="text-base">
                            {monthLabel ? `Here's your summary for ${monthLabel}.` : "Here's what's happening with your finances today."}
                        </CardDescription>
                    </div>
                    <Button onClick={onAddTransaction}>
                        Add Transaction
                    </Button>
                </div>
            </CardHeader>

            {summary && (
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 pt-0">
                    <div className="bg-card p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Income</p>
                            <ArrowUpCircle className="h-4 w-4 text-success" />
                        </div>
                        <p className="text-2xl font-bold text-success">
                            {currencyFormatter.format(summary.totalIncome)}
                        </p>
                    </div>

                    <div className="bg-card p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Expenses</p>
                            <ArrowDownCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <p className="text-2xl font-bold text-destructive">
                            {currencyFormatter.format(Math.abs(summary.totalExpense))}
                        </p>
                    </div>

                    <div className="bg-card p-4 rounded-lg border shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">Net (Balance)</p>
                            <Scale className={`h-4 w-4 ${summary.net >= 0 ? 'text-primary' : 'text-destructive'}`} />
                        </div>
                        <p className={`text-2xl font-bold ${summary.net >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            {currencyFormatter.format(summary.net)}
                        </p>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}

export default MonthlySummary
