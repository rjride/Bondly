import CryptoJS from "crypto-js";

export function decryptMessageText(encryptedText) {
  try {
    const SECRET_KEY = import.meta.env.VITE_CHAT_SECRET_KEY || "default_key";
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    // If decryption fails, originalText will be empty
    if (!originalText) return encryptedText;

    return originalText;
  } catch (err) {
    console.error("Decryption failed", err);
    return encryptedText;  // Return encrypted text instead of [Decryption error]
  }
}
