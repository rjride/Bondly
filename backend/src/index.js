// const express = require("express");
import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import {connectDB} from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";


dotenv.config()
const app = express();


const PORT = process.env.PORT

app.use(express.json()); //use to allow the server to json data out of body. 
app.use(cookieParser()); // allow to parse the cookies
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true,
})
);

 app.use("/api/auth", authRoutes);
 app.use("/api/message", messageRoutes);


app.listen(PORT, ()=>{
    console.log("server is running on port: " +PORT); 
    connectDB();
});