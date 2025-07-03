import {create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import {toast} from "react-hot-toast";
import {io} from "socket.io-client";
import CryptoJS from "crypto-js";  

// const BASE_URL =  import.meta.env.MODE ==="development"?"http://localhost:5001/api": "/";
const SOCKET_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5001"
  : window.location.origin;


export const useAuthStore = create((set,get)=>({
    authUser: null,
     isSigningUp: false,
     isLogingIn: false,
     isUpdatingProfile: false,
    isChekingAuth: true,
    onlineUsers: [],
    socket:null,


    checkAuth: async()=>{
        try {
        const res = await axiosInstance.get("/auth/check");

        set({authUser:res.data});
        get().connectSocket();

        } catch(error){
            console.log("Error in checkAuth:",error);
          set({authUser:null});
        } finally{
            set({isChekingAuth:false});
        }
    },

    signup: async(data)=>{
        set ({isSigningUp:true});
    try{
    const res =  await axiosInstance.post("/auth/signup",data);
     set({ authUser: res.data});
    toast.success("Account created successfully");
        get().connectSocket();
    }catch(error){
    toast.error(error.response.data.message);
    console.log("error in signup:",error);
    }finally{
        set({isSigningUp:false});
    }
    },
    login: async(data)=>{
     set({isLogingIn: true});
     try{
        const res = await axiosInstance.post("/auth/login",data);
        set({authUser:res.data});
        toast.success("Logged in successfully");
        get().connectSocket();
     }catch(error){
        toast.error(error.response.data.message);
     }finally{
        set({ isLogingIn:false});
     }
    },

    logout: async ()=>{
        try{
   await axiosInstance.post("/auth/logout");
   set({authUser:null});
   toast.success("logged out successfully");
   get().disconnectSocket();
        }catch(error){
   toast.error(error.response.data.message);
        }
    },

    updateProfile: async(data)=>{
        set({isUpdatingProfile:true});
        try{
          const res = await axiosInstance.put("/auth/update-profile",data);
          set({authUser:res.data});
          toast.success("profile updated successfully");
        }catch(error){
            console.log("error in update profile:",error);
            toast.error(error.response.data.message);
        }finally{
           set({isUpdatingProfile:false});
        }
    },

    connectSocket: ()=>{
        const {authUser} = get();
        if(!authUser || get().socket?.connected)return ;
    
    const socket = io(SOCKET_URL, {
  query: {
    userId: authUser._id,
  },
  withCredentials: true,
});

      socket.connect();
      set({socket:socket});
      socket.on("getOnlineUsers",(userIds)=>{
      set({ onlineUsers: userIds});
      });
      //  Key exchange on connect
    const existingKey = localStorage.getItem("chat_secret_key");
    if (!existingKey) {
      const newKey = CryptoJS.lib.WordArray.random(16).toString();
      localStorage.setItem("chat_secret_key", newKey);
      // Send key to server to forward to selected user.
      socket.emit("shareKey", { key: newKey });
    }

    // Receive key sent by other user
    socket.on("receiveKey", ({ key }) => {
      console.log("Received secret key from chat partner");
      localStorage.setItem("chat_secret_key", key);
    });
    },

    disconnectSocket: ()=>{
     if(get().socket?.connect) get().socket.disconnect();
    },


}));