
"use server";

import { z } from "zod";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Resend } from 'resend';
import { RegistrationConfirmationEmail } from '@/emails/registration-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

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
        photoURL: photo, // Store the photo data URI directly
        signatureURL: signature, // Store the signature data URI directly
        createdAt: serverTimestamp(),
    });

    try {
      await resend.emails.send({
        from: 'Signature Signup <onboarding@resend.dev>',
        to: formData.email,
        subject: 'Registration Confirmation',
        react: RegistrationConfirmationEmail({ name: formData.name }),
      });
    } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // We don't want to fail the whole registration if the email fails.
        // We'll just log the error and return a success message to the user.
    }

    return { 
      message: `Thank you for registering, ${validatedFields.data.name}! A confirmation has been sent to your email.`, 
      success: true,
    };

  } catch (error) {
    console.error("Registration submission error:", error);
    return {
        message: "An unexpected error occurred while submitting your registration. Please try again.",
        success: false,
    }
  }
}
