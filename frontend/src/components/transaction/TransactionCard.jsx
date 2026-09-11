import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '../ui/button';

import { ArrowDownCircle, ArrowUpCircle, Calendar, Edit2, Loader, MoreVertical, Trash } from 'lucide-react';
import { toast } from "sonner"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api/apiClient';
import { extractErrorMessages } from '../../util/errorUtils';

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})

const TransactionCard = ({ transaction, onEdit }) => {

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const isIncome = transaction.type === 'income';

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await api.delete(`/transactions/${transaction._id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-summary'] });
            toast.success('Transaction deleted successfully');
        },
        onError: (error) => {
            toast.error(`Error deleting transaction: ${extractErrorMessages(error)}`);
        }
    })

    const handleDeleteConfirm = async () => {
        try {
            await deleteMutation.mutateAsync();
            setShowDeleteDialog(false);
        } catch (error) {
            console.error("Error confirming delete:", error);
        }
    }

    return (
        <>
            <Card className="w-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                        {isIncome
                            ? <ArrowUpCircle className="h-8 w-8 text-success shrink-0" />
                            : <ArrowDownCircle className="h-8 w-8 text-destructive shrink-0" />}
                        <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{transaction.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="secondary">{transaction.category}</Badge>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(transaction.date)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-semibold ${isIncome ? 'text-success' : 'text-destructive'}`}>
                            {isIncome ? '+' : '-'}{currencyFormatter.format(Math.abs(transaction.amount))}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(transaction)}>
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} variant="destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the transaction "{transaction.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                        >
                            {deleteMutation.isPending ? (
                                <span className="flex items-center gap-2">
                                    <Loader className="h-4 w-4 animate-spin" />
                                    Deleting...
                                </span>
                            ) : (
                                'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default TransactionCard
