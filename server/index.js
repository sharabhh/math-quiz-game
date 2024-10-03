import express from "express";
import http from "http";
import path from "path";
import cors from "cors";
import { Server } from "socket.io";
import randomMathQuestion from "random-math-question";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.get("/", async (req, res) => {
  var mathQuestion = randomMathQuestion.get({
    numberRange: "1-10",
    amountOfNumber: "2-2",
    operations: [ "*", "+", "-"],
    nagative: {
      containsNagatives: false,
      negativeChance: "0%",
    },
    exponent: {
      containsExponent: false,
      exponentChance: "0%",
      // exponentRange: "1-10",
    },
  });
  res
    .status(200)
    .json({ question: mathQuestion.question, answer: mathQuestion.answer });
});

// socket.io stuff
io.on("connection", (socket) => {
  console.log("A new user has connected", socket.id);

  socket.on("user-answer", (message) => {
    console.log(`user ${socket.id} sent this answer: ${message}`, message);
  });
});

server.listen(9000, () => console.log("server running on port 9000"));
