import CryptoJS from "crypto-js";

export function decryptMessageText(encryptedText) {
  try {
    if (!encryptedText) return "";

    // OPTIONAL: basic check for CryptoJS prefix (not foolproof but reduces noise)
    if (!encryptedText.startsWith("U2Fsd")) {
      //console.warn("Skipping decryption for non-encrypted text:", encryptedText.slice(0, 30));
      return encryptedText;
    }

    const SECRET_KEY = import.meta.env.VITE_CHAT_SECRET_KEY || "default_key";
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);

    if (!originalText) {
      console.warn("Decryption failed or empty text");
      return "";
    }

    return originalText;
  } catch (err) {
    console.error("Decryption failed", err);
    return "";
  }
}
