
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List, LayoutGrid, LogOut } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const auth = getAuth();

    const handleSignOut = async () => {
        await auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
             <div className="flex min-h-screen w-full items-center justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    if (!user) {
         router.push('/login');
         return null;
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <Sidebar>
                    <SidebarContent>
                        <SidebarHeader>
                            <h2 className="text-xl font-semibold text-primary">Admin Panel</h2>
                        </SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Link href="/admin" passHref>
                                    <SidebarMenuButton isActive={pathname === '/admin'}>
                                        <List />
                                        <span>Registrations</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <Link href="/admin/categories" passHref>
                                    <SidebarMenuButton isActive={pathname.startsWith('/admin/categories')}>
                                        <LayoutGrid />
                                        <span>Categories</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start">
                            <LogOut className="mr-2 h-4 w-4" /> Sign Out
                        </Button>
                    </SidebarFooter>
                </Sidebar>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
                     <div className="md:hidden mb-4">
                        <SidebarTrigger />
                    </div>
                    {children}
                </main>
            </div>
        </SidebarProvider>
    );
}
