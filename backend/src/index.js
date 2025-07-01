// const express = require("express");
import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import {connectDB} from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {app,server} from "./lib/socket.js";
import path from "path";

dotenv.config();



const PORT = process.env.PORT
const __dirname = path.resolve();


app.use(express.json({ limit: '5mb' }));  // or higher if needed
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use(express.json()); //use to allow the server to json data out of body. 
app.use(cookieParser()); // allow to parse the cookies
app.use(cors({
    origin:"http://localhost:5173",
    credentials: true,
})
);

 app.use("/api/auth", authRoutes);
 app.use("/api/messages", messageRoutes);

 if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend")));
 
 
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
  });
}


server.listen(PORT, ()=>{
    console.log("server is running on port: " +PORT); 
    connectDB();
});  