"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Mail, Phone, User, PenSquare, Info } from "lucide-react";

import { submitRegistration } from "@/app/actions";
import { SignaturePad } from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const categories = [
    { id: "cat1", name: "General Admission", description: "Access to all general areas and talks. Does not include workshops." },
    { id: "cat2", name: "VIP Pass", description: "Includes all General Admission benefits, plus access to the VIP lounge and exclusive workshops." },
    { id: "cat3", name: "Student Discount", description: "Special discounted rate for currently enrolled students. Valid student ID required at check-in." },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number.").max(15),
  categoryId: z.string({ required_error: "Please select a category."}).min(1, "Please select a category."),
});

export function RegistrationForm() {
  const [isPending, startTransition] = useTransition();
  const [signature, setSignature] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      categoryId: "",
    },
  });

  const watchedCategoryId = form.watch("categoryId");
  const selectedCategory = categories.find(cat => cat.id === watchedCategoryId);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!signature) {
      toast({
        variant: "destructive",
        title: "Signature Required",
        description: "Please provide your signature before submitting.",
      });
      return;
    }

    startTransition(async () => {
      const result = await submitRegistration({ ...values, signature });
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset();
        setSignature(null);
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: result.message || "An unexpected error occurred.",
        });
      }
    });
  };

  const handleSaveSignature = (data: string) => {
    setSignature(data);
    setIsModalOpen(false);
  };
  
  const handleClearSignature = () => {
    setSignature(null);
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="John Doe" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="you@example.com" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="tel" placeholder="(123) 456-7890" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedCategory && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{selectedCategory.name} Details</AlertTitle>
                    <AlertDescription>
                        {selectedCategory.description}
                    </AlertDescription>
                </Alert>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Signature</h3>
            <div className="p-4 border-dashed border-2 rounded-lg flex flex-col items-center justify-center gap-4 min-h-[150px]">
              {signature ? (
                <>
                  <Image src={signature} alt="User signature" width={300} height={100} className="bg-white rounded-md shadow-inner" />
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(true)}>
                    <PenSquare className="mr-2 h-4 w-4" /> Redraw Signature
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">Your signature is required.</p>
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(true)}>
                    <PenSquare className="mr-2 h-4 w-4" /> Add Signature
                  </Button>
                </>
              )}
            </div>
            {!signature && form.formState.isSubmitted && (
                 <p className="text-sm font-medium text-destructive">Signature is required.</p>
            )}
          </div>

          <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90" disabled={isPending}>
            {isPending ? "Submitting..." : "Submit Registration"}
          </Button>
        </form>
      </Form>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Provide Your Signature</DialogTitle>
            <DialogDescription>
              Please sign in the box below. Click "Save" when you are finished.
            </DialogDescription>
          </DialogHeader>
          <SignaturePad onSave={handleSaveSignature} onClear={handleClearSignature} />
        </DialogContent>
      </Dialog>
    </>
  );
}
