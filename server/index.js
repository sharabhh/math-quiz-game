import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("A new user has connected", socket.id);

  socket.on("user-answer", (message) => {
    console.log(`user ${socket.id} sent this answer: ${message}`, message);
  });
});

server.listen(9000, () => console.log("server running on port 9000"));
