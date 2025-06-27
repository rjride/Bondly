import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios"; // fixed path typo

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
   set({messages:[...messages,res.data]});
  }catch(error){
    toast.error(error.response.data.message);
  }
  },


  //  SET SELECTED USER
  setSelectedUser: (user) => set({ selectedUser: user }),
}));
