
"use server";

import { z } from "zod";
import { db, storage } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

const registrationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  categoryId: z.string().min(1, { message: "Please select a category." }),
  signature: z.string().min(1, { message: "Signature is required." }),
  photo: z.string().min(1, { message: "Photo is required." }),
});

async function uploadImage(dataUrl: string, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
}

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
    const { signature, photo, ...formData } = validatedFields.data;
    
    // Generate unique filenames
    const photoFileName = `${uuidv4()}.jpeg`;
    const signatureFileName = `${uuidv4()}.png`;

    // Upload images to Firebase Storage
    const photoURL = await uploadImage(photo, `photos/${photoFileName}`);
    const signatureURL = await uploadImage(signature, `signatures/${signatureFileName}`);

    // Save registration data to Firestore
    await addDoc(collection(db, "registrations"), {
        ...formData,
        photoURL,
        signatureURL,
        createdAt: serverTimestamp(),
    });

    return { 
      message: `Thank you for registering, ${validatedFields.data.name}!`, 
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
