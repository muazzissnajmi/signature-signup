
"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Mail, Phone, User, PenSquare, Info, Camera } from "lucide-react";

import { submitRegistration } from "@/app/actions";
import { SignaturePad } from "@/components/signature-pad";
import { PhotoCapture } from "@/components/photo-capture";
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
import { getCategories } from "@/app/actions";
import type { Category } from "@/app/actions";


const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number.").max(15),
  categoryId: z.string({ required_error: "Please select a category."}).min(1, "Please select a category."),
});

export function RegistrationForm() {
  const [isPending, startTransition] = useTransition();
  const [signature, setSignature] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
        const result = await getCategories();
        if (result.success && result.data) {
            setCategories(result.data);
        } else {
            toast({
                variant: "destructive",
                title: "Failed to load categories",
                description: result.message,
            });
        }
    };
    fetchCategories();
  }, [toast]);


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

    if (!photo) {
      toast({
          variant: "destructive",
          title: "Photo Required",
          description: "Please provide your photo before submitting.",
      });
      return;
    }

    startTransition(async () => {
      // Find the category name to pass to the action
      const categoryName = categories.find(c => c.id === values.categoryId)?.name || values.categoryId;
      const result = await submitRegistration({ ...values, categoryId: categoryName, signature, photo });
      
      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset();
        setSignature(null);
        setPhoto(null);
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
    setIsSignatureModalOpen(false);
  };

  const handleSavePhoto = (data: string) => {
    setPhoto(data);
    setIsPhotoModalOpen(false);
  };
  

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
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Participant Photo</h3>
                <div className="p-4 border-dashed border-2 rounded-lg flex flex-col items-center justify-center gap-4 min-h-[150px] aspect-square">
                  {photo ? (
                    <>
                      <Image src={photo} alt="Participant photo" width={300} height={300} className="bg-white rounded-md shadow-inner object-cover w-full h-full" />
                      <Button type="button" variant="outline" onClick={() => setIsPhotoModalOpen(true)}>
                        <Camera className="mr-2 h-4 w-4" /> Retake Photo
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground text-center">Your photo is required for your ID badge.</p>
                      <Button type="button" variant="secondary" onClick={() => setIsPhotoModalOpen(true)}>
                        <Camera className="mr-2 h-4 w-4" /> Add Photo
                      </Button>
                    </>
                  )}
                </div>
                {!photo && form.formState.isSubmitted && (
                    <p className="text-sm font-medium text-destructive">Photo is required.</p>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Signature</h3>
                <div className="p-4 border-dashed border-2 rounded-lg flex flex-col items-center justify-center gap-4 min-h-[150px] aspect-square">
                  {signature ? (
                    <>
                      <Image src={signature} alt="User signature" width={300} height={150} className="bg-white rounded-md shadow-inner" />
                      <Button type="button" variant="outline" onClick={() => setIsSignatureModalOpen(true)}>
                        <PenSquare className="mr-2 h-4 w-4" /> Redraw Signature
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground">Your signature is required.</p>
                      <Button type="button" variant="secondary" onClick={() => setIsSignatureModalOpen(true)}>
                        <PenSquare className="mr-2 h-4 w-4" /> Add Signature
                      </Button>
                    </>
                  )}
                </div>
                {!signature && form.formState.isSubmitted && (
                    <p className="text-sm font-medium text-destructive">Signature is required.</p>
                )}
              </div>
          </div>


          <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90" disabled={isPending || categories.length === 0}>
            {isPending ? "Submitting..." : "Submit Registration"}
          </Button>
        </form>
      </Form>
      
      <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Provide Your Signature</DialogTitle>
            <DialogDescription>
              Please sign in the box below. Click "Save" when you are finished.
            </DialogDescription>
          </DialogHeader>
          <SignaturePad onSave={handleSaveSignature} onClear={() => setSignature(null)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Capture Your Photo</DialogTitle>
            <DialogDescription>
              Use your camera to take a photo or upload a file. This will be used for your participant badge.
            </DialogDescription>
          </DialogHeader>
          <PhotoCapture onSave={handleSavePhoto} />
        </DialogContent>
      </Dialog>
    </>
  );
}
