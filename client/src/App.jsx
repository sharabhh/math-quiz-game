import { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  const [socket, setSocket] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [winner, setWinner] = useState(null);
  const [highScore, setHighScore] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [username, setUsername] = useState("")

  const baseUrl = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    // establish a dual modality connection with backend
    const newSocket = io.connect(baseUrl);
    setSocket(newSocket);

    newSocket.emit("request-question");

    newSocket.on("new-question", (data) => {
      setNewQuestion(data?.question);
      setWinner(null); //winners will be reset
      setAnswer("");
      setCountdown(0);
    });

    newSocket.on("winner-announcement", (data) => {
      setWinner(data?.winner);
      setCountdown(data?.countdown);
      if (data?.winner === newSocket.id) {
        setHighScore((prev) => prev + 1);
      }
    });

    newSocket.on("active-users", (data) => {
      setActiveUsers(data.count);
    });

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  function handleChange(e) {
    const {name, value} = e.target

    if(name === "username"){
      setUsername(value)
    }else if(name=== "answer"){
      setAnswer(value)
    }
  }

  function handleClick() {
    if (socket) {
      socket.emit("user-name", username)
      // socket.emit("user-answer", answer);
      console.log(`submitted answer: ${answer} by ${username}`);
    } else {
      console.log("answer wasn't submitted");
    }
  }

  // console.log(winner, socket.id);

  return (
    <>
      <div className="container">
        <h1>active users: {activeUsers}</h1>
        <section className="dialogue-box">
          <h1>what is {newQuestion}?</h1>
          <input
            type="text"
            className="input-box"
            onChange={handleChange}
            name="username"
            value={username}
            placeholder="your name"
          />
          <input
            className="input-box"
            type="text"
            onChange={handleChange}
            name="answer"
            value={answer}
            placeholder="your answer"
          />
          <button onClick={handleClick} disabled={countdown > 0}>
            submit
          </button>
          {winner && (
            <p>{winner === socket?.id ? "You won!" : `${winner} won!`}</p>
          )}

          {countdown > 0 && <p>Next question in {countdown} seconds</p>}
          <p>Your high score: {highScore}</p>
        </section>
      </div>
    </>
  );
}

export default App;
