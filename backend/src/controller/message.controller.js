import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import {io} from "../lib/socket.js";
import fs from 'fs';



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
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto"
      
    });
    console.log("Uploaded local file path:", req.file?.path);
console.log("Cloudinary upload result:", result);


    // Delete local file after upload
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete local file:", err);
      else console.log("Deleted local file:", req.file.path);
    });

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};
export const updateMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.text = text;
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", {
        messageId: message._id,
        text: message.text,
      });
    }

    res.status(200).json(message);
  } catch (err) {
    console.error("Error in updateMessage:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await message.deleteOne();

    // Notify recipient via socket
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted", messageId });
  } catch (err) {
    console.error("Error in deleteMessage:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async(req,res)=>{
  try{
     const { text, image,file} = req.body;
     const {id: receiverId } = req.params;
     const senderId = req.user._id;

     let imageUrl;
     let fileUrl = file;
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
        file: fileUrl,
     });

     await newMessage.save();
     console.log("Saving message:", newMessage);


  // socket io for real time communication .
     const receiverSocketId = getReceiverSocketId(receiverId);
     if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage",newMessage);
     }

     res.status(201).json(newMessage);

  }catch(error){
     console.log("Error in sendMessage controller:" ,error.message);
     res.status(500).json({message:"Internal Server Error"});
  }
};