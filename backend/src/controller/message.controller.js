import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUserForSidebar = async(req,res)=>{
    try{
        const loggedInUser = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUser}}).select("-password");

        res.status(200).json(filteredUsers)
    }catch(error){
        console.error("Error in getUsersForSidebar:",error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const getMessages = async(req,res) =>{
   try{
     const {id:userToChatId} = req.params
     const myId = req.user._id;
  console.log("authUser (from token):", req.user._id);
console.log("Chat with:", req.params.id);


     const  message = await Message.find({
        $or:[
           { senderId: req.user._id, receiverId: req.params.id },
    { senderId: req.params.id, receiverId: req.user._id }
           ]
     }).sort({createdAt:1}); // shows oldest to newest

     res.status(200).json(message)
   }catch(error){
     console.log("Error in getMessages controller:",error.message);
     res.status(500).json({error: "Internal Server error"});
   }
};

export const sendMessage = async(req,res)=>{
  try{
     const { text, image} = req.body;
     const {id: receiverId } = req.params;
     const senderId = req.user._id;

     let imageUrl;
     if(image){
        // upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
     }

     const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
     });

     await newMessage.save();

     //todo: real time functionality socket.io 

     res.status(201).json(newMessage);

  }catch(error){
     console.log("Error in sendMessage controller:" ,error.message);
     res.status(500).json({message:"Internal Server Error"});
  }
};