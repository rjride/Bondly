import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {getMessages, getUserForSidebar, sendMessage,deleteMessage,updateMessage} from "../controller/message.controller.js";

const router = express.Router();

router.get("/users",protectRoute,getUserForSidebar)
router.get("/:id",protectRoute,getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.delete("/delete/:id", protectRoute, deleteMessage);
router.put("/update/:id", protectRoute, updateMessage);



export default router;