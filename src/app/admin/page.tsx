
'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { collection, getDocs, orderBy, query, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import { Mail } from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendNotificationEmail } from '@/app/actions';


export default function AdminPage() {
  const { user, loading } = useAuth();
  const [registrations, setRegistrations] = useState<DocumentData[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      const fetchRegistrations = async () => {
        setIsLoadingData(true);
        try {
          const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRegistrations(data);
        } catch (error) {
          console.error("Error fetching registrations: ", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchRegistrations();
    }
  }, [user]);

  const handleSendEmail = (name: string, email: string) => {
    startTransition(async () => {
        const result = await sendNotificationEmail({ name, email });
        if(result.success) {
            toast({ title: 'Success', description: result.message });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
    });
  }

  if (loading || !user) {
    return (
        <div className="w-full">
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="w-full">
        <h1 className="text-3xl font-bold text-primary mb-8">Registrations</h1>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>A list of all participants who have registered.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Signature</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingData ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-12 w-24 rounded-md" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : registrations.length > 0 ? (
                  registrations.map(reg => (
                    <TableRow key={reg.id}>
                       <TableCell>
                        <Image src={reg.photoURL} alt="Participant photo" width={50} height={50} className="rounded-md object-cover" />
                       </TableCell>
                      <TableCell className="font-medium">{reg.name}</TableCell>
                      <TableCell>{reg.email}</TableCell>
                      <TableCell><Badge variant="secondary">{reg.categoryId}</Badge></TableCell>
                      <TableCell>
                        <Image src={reg.signatureURL} alt="Signature" width={100} height={50} className="rounded-md bg-white p-1 border" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleSendEmail(reg.name, reg.email)}
                            disabled={isPending}
                            aria-label="Send Email"
                        >
                            <Mail className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No registrations found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
