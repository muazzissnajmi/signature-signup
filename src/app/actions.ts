
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Resend } from 'resend';
import { RegistrationConfirmationEmail } from '@/emails/registration-confirmation';
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);

// Schema for registration form submission
const registrationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  categoryId: z.string().min(1, { message: "Please select a category." }),
  signature: z.string().min(1, { message: "Signature is required." }),
  photo: z.string().min(1, { message: "Photo is required." }),
});

export async function submitRegistration(data: { name: string; email: string; phone: string; categoryId: string; signature: string; photo: string; }) {
  const validatedFields = registrationSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed. Please check your input.",
      success: false,
    };
  }

  try {
    const { photo, signature, ...formData } = validatedFields.data;

    await addDoc(collection(db, "registrations"), {
        ...formData,
        photoURL: photo, 
        signatureURL: signature, 
        createdAt: serverTimestamp(),
    });

    try {
      // For development, send email to a fixed, verified address to avoid Resend errors.
      const toEmail = process.env.NODE_ENV === 'development' 
        ? 'invictussevenfold@gmail.com' 
        : formData.email;

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: toEmail,
        subject: 'Registration Confirmation',
        react: RegistrationConfirmationEmail({ name: formData.name }),
      });
    } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
    }

    return { 
      message: `Thank you for registering, ${validatedFields.data.name}! A confirmation has been sent to your email.`, 
      success: true,
    };

  } catch (error) {
    console.error("Registration submission error:", error);
    return {
      message: error instanceof Error ? error.message : "An unexpected error occurred while submitting your registration. Please try again.",
        success: false,
    }
  }
}


// --- Category Actions ---

export type Category = {
    id: string;
    name: string;
    description: string;
}

const categorySchema = z.object({
    name: z.string().min(2, "Category name must be at least 2 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
});

export async function getCategories() {
    try {
        const q = query(collection(db, "categories"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const categories = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Category[];
        return { success: true, data: categories };
    } catch (error) {
        console.error("Error getting categories:", error);
        return { success: false, message: "Failed to fetch categories." };
    }
}

export async function addCategory(data: { name: string; description: string; }) {
    const validatedFields = categorySchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed.",
            success: false,
        };
    }
    
    try {
        await addDoc(collection(db, "categories"), validatedFields.data);
        revalidatePath("/admin/categories");
        revalidatePath("/");
        return { success: true, message: "Category added successfully." };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
}

export async function updateCategory(id: string, data: { name: string; description: string; }) {
     const validatedFields = categorySchema.safeParse(data);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed.",
            success: false,
        };
    }

    try {
        const categoryRef = doc(db, "categories", id);
        await updateDoc(categoryRef, validatedFields.data);
        revalidatePath("/admin/categories");
        revalidatePath("/");
        return { success: true, message: "Category updated successfully." };
    } catch (error) {
        return { success: false, message: "Failed to update category." };
    }
}

export async function deleteCategory(id: string) {
    try {
        await deleteDoc(doc(db, "categories", id));
        revalidatePath("/admin/categories");
        revalidatePath("/");
        return { success: true, message: "Category deleted successfully." };
    } catch (error) {
        return { success: false, message: "Failed to delete category." };
    }
}
