import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios"; // fixed path typo
import { useAuthStore } from "./useAuthStore";
import { decryptMessageText } from "../lib/decrypt";





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
      console.log("Fetching message for:",userId);
      const { data } = await axiosInstance.get(`/messages/${userId}`);
      console.log("Fetched messages:", data);
      set({ messages: data });
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
 
  subscribeToMessages: () =>{
    const {selectedUser} = get();
    if(!selectedUser)return ;
const socket = useAuthStore.getState().socket;

    socket.on("newMessage",(newMessage)=>{
      const ismessageSentFromSelectedUser = newMessage.senderId===selectedUser._id;
      if(!ismessageSentFromSelectedUser)return;
      // //Decrypt text
      // const SECRET_KEY = localStorage.getItem("chat_secret_key") || "default_key";
      // let decryptedText = "";
      // if (newMessage.text) {
      //   try {
      //     const bytes = CryptoJS.AES.decrypt(newMessage.text, SECRET_KEY);
      //     decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      //     console.log("Decrypted:", decryptedText);
      //   } catch (err) {
      //     console.error("Decryption failed", err);
      //     decryptedText = "[Decryption error]";
      //   }
      // }
      // newMessage.text = decryptedText;
      if(newMessage.text){
        newMessage.text = decryptMessageText(newMessage.text);
      }

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },


  unsubscribeFromMessages: ()=>{
   const socket = useAuthStore.getState().socket;
socket.off("newMessage");
  },

  //  SET SELECTED USER
  setSelectedUser: (user) => set({ selectedUser: user }),
}));
