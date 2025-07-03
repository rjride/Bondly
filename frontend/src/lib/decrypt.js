import CryptoJS from "crypto-js";

export function decryptMessageText(encryptedText) {
  try {
    const SECRET_KEY = localStorage.getItem("chat_secret_key") || "default_key";
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) return "[Decryption error]";
    return originalText;
  } catch (err) {
    console.error("Decryption failed", err);
    return "[Decryption error]";
  }
}