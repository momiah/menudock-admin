import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

// Upload an image to Firebase Storage and return its public download URL.
export async function uploadImage(path, file) {
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}
