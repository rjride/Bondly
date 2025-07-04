import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {getMessages, getUserForSidebar, sendMessage,deleteMessage,updateMessage,uploadFile} from "../controller/message.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";


const router = express.Router();

router.get("/users",protectRoute,getUserForSidebar)
router.get("/:id",protectRoute,getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.delete("/delete/:id", protectRoute, deleteMessage);
router.put("/update/:id", protectRoute, updateMessage);
router.post("/upload-file", protectRoute, uploadMiddleware, uploadFile);




export default router;