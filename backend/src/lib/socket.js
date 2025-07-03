import {Server} from "socket.io";
import http from "http";
import express from "express";


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? "https://your-frontend-domain.com" // replace with your real domain
      : "http://localhost:5173",
    credentials: true,
  },
});


export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}


//used to store online users
const userSocketMap = {}; //{userID: socketId}

io.on("connection",(socket)=>{
    console.log("A user connected",socket.id);
 
    const userId = socket.handshake.query.userId;
    if(userId){
       userSocketMap[userId] = socket.id; 
    }

    //io.emit() is used to send events to all the connected clients.
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
     // now listen for shareKey from sender
       socket.on("shareKey", ({ key, to }) => {
    console.log(`Received shareKey from ${userId} to ${to}`);
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveKey", { key });
      console.log(`Key sent to ${to} (socket ${receiverSocketId})`);
    } else {
      console.log(`Receiver ${to} is not online, cannot share key`);
      // Optionally store key for future delivery
    }
  });
    socket.on("disconnect",()=>{
        console.log("A user disconnected",socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});
export { io,app,server};




