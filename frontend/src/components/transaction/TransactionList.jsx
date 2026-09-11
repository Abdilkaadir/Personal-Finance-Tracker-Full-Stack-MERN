import { Receipt, Search } from 'lucide-react'
import React, { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import TransactionCard from './TransactionCard'

const TransactionGrid = ({ transactions, onEdit, emptyMessage }) => {

    if (transactions.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto max-w-md">
                    <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-sm font-medium text-foreground">No transactions found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((transaction) => (
                <TransactionCard
                    key={transaction._id}
                    transaction={transaction}
                    onEdit={onEdit}
                />
            ))}
        </div>
    )
}

const TransactionList = ({ transactions = [], onEdit }) => {

    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransactions = transactions.filter((t) => {
        const term = searchTerm.toLowerCase();
        return t.title.toLowerCase().includes(term) || t.category.toLowerCase().includes(term);
    })

    const categorized = {
        all: filteredTransactions,
        income: filteredTransactions.filter((t) => t.type === 'income'),
        expense: filteredTransactions.filter((t) => t.type === 'expense'),
    }

    const counts = {
        all: transactions.length,
        income: transactions.filter((t) => t.type === 'income').length,
        expense: transactions.filter((t) => t.type === 'expense').length,
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
                    <Input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all" className="flex items-center gap-2">
                        All
                        <Badge variant="secondary">{counts.all}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="income" className="flex items-center gap-2">
                        Income
                        <Badge variant="secondary">{counts.income}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="expense" className="flex items-center gap-2">
                        Expense
                        <Badge variant="secondary">{counts.expense}</Badge>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <TransactionGrid
                        transactions={categorized.all}
                        onEdit={onEdit}
                        emptyMessage="No transactions found. Add your first one to get started."
                    />
                </TabsContent>
                <TabsContent value="income">
                    <TransactionGrid
                        transactions={categorized.income}
                        onEdit={onEdit}
                        emptyMessage="No income transactions found."
                    />
                </TabsContent>
                <TabsContent value="expense">
                    <TransactionGrid
                        transactions={categorized.expense}
                        onEdit={onEdit}
                        emptyMessage="No expense transactions found."
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default TransactionList
