import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios"; // fixed path typo
import { useAuthStore } from "./useAuthStore";
import { decryptMessageText } from "../lib/decrypt";
import CryptoJS from "crypto-js";




export const useChatStore = create((set,get) => ({
  messages: [],
  users: [],
  selectedUser:null,

  isUsersLoading: false,
  isMessagesLoading: false,

  //  GET USERS
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const { data } = await axiosInstance.get("/messages/users");
      set({ users: data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  //  GET MESSAGES
  getMessages: async (userId) => {
  set({ isMessagesLoading: true });
  try {
    console.log("Fetching message for:", userId);
    const { data } = await axiosInstance.get(`/messages/${userId}`);
    console.log("Fetched messages:", data);

    // Decrypt each message
    const decryptedMessages = data.map(msg => {
      if (msg.text) {
        msg.text = decryptMessageText(msg.text);
      }
      return msg;
    });

    set({ messages: decryptedMessages });
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to load messages");
  } finally {
    set({ isMessagesLoading: false });
  }
},

  sendMessage: async (messageData)=>{
  const {selectedUser,messages} =  get();
  try{
   const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData);
   const decryptedText = res.data.text ? decryptMessageText(res.data.text) : "";
res.data.text = decryptedText;
   set({messages:[...messages,res.data]});
  }catch(error){
    toast.error(error.response.data.message);
  }
  },
deleteMessage: async (messageId) => {
  const { messages } = get();
  try {
    await axiosInstance.delete(`/messages/delete/${messageId}`);
    set({
      messages: messages.filter(m => m._id !== messageId),
    });
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to delete message");
  }
},
updateMessage: async (messageId, newText) => {
  const SECRET_KEY = import.meta.env.VITE_CHAT_SECRET_KEY || "default_key";
  //const { messages } = get();
    // Encrypt text before sending
  const encryptedText = CryptoJS.AES.encrypt(newText.trim(), SECRET_KEY).toString();

  try {
    const res = await axiosInstance.put(`/messages/update/${messageId}`, { text: encryptedText });
    console.log(res);
    // Update local messages state with decrypted text
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, text: newText } : msg
      ),
    }));
  } catch (err) {
    console.error("Update message failed:", err);
    toast.error("Failed to update message");
  }
},
subscribeToMessages: () => {
  const { selectedUser } = get();
  if (!selectedUser) return;
  const socket = useAuthStore.getState().socket;

  socket.on("newMessage", (newMessage) => {
    if (newMessage.senderId !== selectedUser._id) return;
    newMessage.text = decryptMessageText(newMessage.text);
    set({
      messages: [...get().messages, newMessage],
    });
  });

  socket.on("messageDeleted", ({ messageId }) => {
    set({
      messages: get().messages.filter(m => m._id !== messageId),
    });
  });

 socket.on("messageUpdated", (updatedMsg) => {
  const decryptedText = decryptMessageText(updatedMsg.text);

  set((state) => ({
    messages: state.messages.map((msg) =>
      msg._id === updatedMsg.messageId ? { ...msg, text: decryptedText } : msg
    ),
  }));
});
},
  unsubscribeFromMessages: ()=>{
   const socket = useAuthStore.getState().socket;
socket.off("newMessage");
  },

  //  SET SELECTED USER
  setSelectedUser: (user) => set({ selectedUser: user }),
}));
