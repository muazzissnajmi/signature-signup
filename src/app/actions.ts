
"use server";

import { z } from "zod";

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

  // Simulate saving data to a database
  console.log("Registration Submitted:", {
      ...validatedFields.data,
      photo: validatedFields.data.photo.substring(0, 50) + "...", // Don't log the full data URI
  });
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency

  return { 
    message: `Thank you for registering, ${validatedFields.data.name}!`, 
    success: true,
  };
}

    