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
  const [username, setUsername] = useState("");
  const [userExists, setUserExists] = useState(false);

  const baseUrl = import.meta.env.VITE_BACKEND_URL;

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
      setWinner(data?.winnerName);
      setCountdown(data?.countdown);
      if (data?.winnerId === newSocket.id) {
        setHighScore((prevScore)=> prevScore+1);
      }
      else{
        console.log('not verified');
        
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
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "username") {
      setUsername(value);
    } else if (name === "answer") {
      setAnswer(value);
    }
  }

  function handleClick() {
    if (socket) {
      socket.emit("user-answer", answer);
      console.log(`submitted answer: ${answer} by ${username}`);
    } else {
      console.log("answer wasn't submitted");
    }
  }

  function handleNameSubmit() {
    if (socket) {
      socket.emit("user-name", username);
      console.log(`username is: ${username}`);
      setUserExists(true);
    } else {
      console.log("username wasn't submitted");
    }
  }

  // console.log(winner, socket.id);

  return (
    <>
      <div className="container">
        <h1 className="active-users">active users: {activeUsers}</h1>
        {/* when user hasn't eneterd a name */}
        <section className="dialogue-box">
          {userExists ? (
            // when we have a name
            <>
              <h1 className="dialogue-heading">what is {newQuestion}?</h1>
              <input
                className="input-box"
                type="text"
                onChange={handleChange}
                name="answer"
                value={answer}
                placeholder="your answer"
              />
              <button
                className={
                  countdown > 0 ? `submit-btn disabled-btn` : `submit-btn`
                }
                onClick={handleClick}
                disabled={countdown > 0}
              >
                submit
              </button>
              {winner && (
                <p>{winner === socket?.id ? "You won!" : `${winner} won!`}</p>
              )}

              {countdown > 0 && <p>Next question in {countdown} seconds</p>}
              <p>Your high score: {highScore}</p>
            </>
          ) : (
            <>
              <h1 className="dialogue-heading">Join the Math Quiz</h1>
              <input
                type="text"
                className="input-box"
                onChange={handleChange}
                name="username"
                value={username}
                placeholder="Enter your name"
              />
              <button className="submit-btn" onClick={handleNameSubmit}>
                Join Quiz
              </button>
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default App;
