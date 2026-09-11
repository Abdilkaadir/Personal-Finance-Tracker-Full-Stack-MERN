import { Wallet, Camera, Loader } from 'lucide-react'
import React, { useRef } from 'react'
import { useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import useAuthStore from '../../lib/store/authStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import api from '../../lib/api/apiClient'
import { extractErrorMessages } from '../../util/errorUtils'

const DashboardHeader = () => {

    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    // The login/register response doesn't include the profile picture, so
    // fetch the full profile once the dashboard loads to get it (and to stay
    // in sync after an upload).
    const profileQuery = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await api.get('/auth/profile')
            return response.data
        },
    })

    const uploadMutation = useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('image', file);
            const response = await api.post('/upload/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Profile picture updated');
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (error) => {
            toast.error(`Error uploading picture: ${extractErrorMessages(error)}`);
        },
    })

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadMutation.mutate(file);
        }
        e.target.value = '';
    }

    const handleLogout = () => {
        if (confirm("Are you sure you want to logout?")) {
            clearAuth();
            queryClient.clear();
            navigate("/login", { replace: true });
        }
    }

    const initials = user?.name
        ? user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
        : 'U'

    return (
        <header className="bg-card border-b border-border shadow-sm">
            <div className="w-full px-4 py-4 flex items-center justify-between">

                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Wallet className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <h1 className="text-xl font-semibold text-foreground">Finance Tracker</h1>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        Welcome, <span className="font-medium text-foreground">{user?.name || "User"}</span>
                    </span>

                    <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="relative group cursor-pointer"
                        title="Update profile picture"
                        disabled={uploadMutation.isPending}
                    >
                        <Avatar size="lg">
                            <AvatarImage src={profileQuery.data?.profilePicture?.url || undefined} alt={user?.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            {uploadMutation.isPending
                                ? <Loader className="h-4 w-4 text-white animate-spin" />
                                : <Camera className="h-4 w-4 text-white" />}
                        </span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <Button variant={"outline"} onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default DashboardHeader
