import express from "express";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "dotenv";
import randomMathQuestion from "random-math-question";
import User from "./model.js";
import { count } from "console";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

config();
const connectionUrl = process.env.MONGO_URL;
app.use(cors());

mongoose.connect(connectionUrl);

function generateQuestion() {
  return randomMathQuestion.get({
    numberRange: "1-10",
    amountOfNumber: "2-2",
    operations: ["*", "+", "-"],
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
}

let currentQuestion = generateQuestion();
let currentAnswer = currentQuestion.answer;
let isAnswered = false;
let timeoutId;
const nextQuestionDelay = 3000;

let activeUsers = 0;

// socket.io stuff
io.on("connection", async (socket) => {
  console.log("A new user has connected", socket.id);
  activeUsers++;

  io.emit("active-users", { count: activeUsers });

  const user = await User.findOneAndUpdate(
    { socketId: socket.id },
    { socketId: socket.id },
    { upsert: true, new: true }
  );

  socket.on("request-question", () => {
    socket.emit("new-question", { question: currentQuestion.question });
  });

  socket.on("user-name", async (username) => {
    console.log(username);
    await User.findOneAndUpdate({ socketId: socket.id }, { name: username });
  });

  socket.on("user-answer", async (answer) => {
    if (!isAnswered && answer == currentAnswer) {
      isAnswered = true;

      await User.findOneAndUpdate(
        { socketId: socket.id },
        { $inc: { highScore: 1 } }
      );

      // finds name of winner
      async function winnnerName(id) {
        const user = await User.findOne({ socketId: id });
        if (user) {
          return user.name;
        } else {
          return null;
        }
      }

      const winnerNameFromDb = await winnnerName(socket.id);
      console.log(winnerNameFromDb);
      

      // notify users
      io.emit("winner-announcement", {
        winner: winnerNameFromDb || socket.id,
        countdown: nextQuestionDelay / 1000,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        // next round question
        currentQuestion = generateQuestion();
        currentAnswer = currentQuestion.answer;
        isAnswered = false;

        // new question
        io.emit("new-question", { question: currentQuestion.question });
      }, nextQuestionDelay);
    }
    console.log(`user ${socket.id} sent this answer: ${answer}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    activeUsers--;
    io.emit("active-users", { count: activeUsers });
  });
});

app.get('/', (req,res)=>{
  res.send('server is running')
})

server.listen(9000, () => console.log("server running on port 9000"));
