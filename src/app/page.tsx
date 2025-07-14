import { RegistrationForm } from '@/components/registration-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Participant Registration</CardTitle>
          <CardDescription className="text-lg">Please fill out the form below to register.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm />
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button asChild variant="ghost">
                <Link href="/admin">
                    Admin Panel <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
