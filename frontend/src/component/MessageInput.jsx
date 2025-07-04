import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X,Paperclip } from "lucide-react";
import { toast } from "react-hot-toast";
import CryptoJS from "crypto-js";

function MessageInput() {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
   const [docFile, setDocFile] = useState(null);
  const fileInputRef = useRef(null);
   const docInputRef = useRef(null);
  const { sendMessage, uploadFile } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
   const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/.test(file.type)) {
      toast.error("Please select a PDF or DOC file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }
    setDocFile(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
   const removeDoc = () => {
    setDocFile(null);
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!text.trim() && !imagePreview && !docFile) return;

  const SECRET_KEY = import.meta.env.VITE_CHAT_SECRET_KEY || "default key";

  let toastId = null; // To hold toast reference

  try {
    let encryptedText = "";
    if (text.trim()) {
      encryptedText = CryptoJS.AES.encrypt(text.trim(), SECRET_KEY).toString();
    }

    let fileUrl = null;
    if (docFile) {
      toastId = toast.loading("Uploading file...");

      const formData = new FormData();
      formData.append("file", docFile);

      const data = await uploadFile(formData);

      if (!data) {
        toast.error("Failed to upload file", { id: toastId });
        return;
      }

      fileUrl = data.url;
      toast.success("File uploaded successfully", { id: toastId });
    }

    await sendMessage({
      text: encryptedText,
      image: imagePreview,
      file: fileUrl,
    });

    setText("");
    removeImage();
    removeDoc();

    if (!docFile) {
      // If no docFile, show simple success (for text/image-only messages)
      toast.success("Message sent");
    }

  } catch (err) {
    console.error("Send failed", err);
    if (toastId) {
      toast.error("Failed to send message", { id: toastId });
    } else {
      toast.error("Failed to send message");
    }
  }
};

  //     await sendMessage({
  //       text: encryptedText,
  //       image: imagePreview,
  //     });

  //     setText("");
  //     removeImage();
  //   } catch (error) {
  //     console.error("Failed to send message:", error);
  //     toast.error("Failed to send message");
  //   }
  // };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-zinc-700" />
            <button onClick={removeImage} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center" type="button">
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      {docFile && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-zinc-400">{docFile.name}</span>
          <button onClick={removeDoc} className="btn btn-xs">Remove</button>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex flex-wrap gap-2 items-center">
        <input type="text" className="flex-1 min-w-0 input input-bordered rounded-lg input-sm sm:input-md" placeholder="Type a message..." value={text} onChange={(e) => setText(e.target.value)} />
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" ref={docInputRef} onChange={handleDocChange} />
        <button type="button" className="btn btn-circle text-zinc-400" onClick={() => fileInputRef.current?.click()}><Image size={20} /></button>
        <button type="button" className="btn btn-circle text-zinc-400" onClick={() => docInputRef.current?.click()}><Paperclip size={20} /></button>
        <button type="submit" className="btn btn-sm btn-circle" disabled={!text.trim() && !imagePreview && !docFile}><Send size={22} /></button>
      </form>
    </div>
  );
}
export default MessageInput;