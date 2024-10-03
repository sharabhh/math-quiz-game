import { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";

function App() {
  const [socket, setSocket] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const newSocket = io.connect("http://localhost:9000");
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  function handleChange(e) {
    setAnswer(e.target.value);
  }

  function handleClick() {
    if (socket) {
      socket.emit("user-answer", answer);
      console.log("submitted answer: ", answer);
    } else {
      console.log("answer wasn't submitted");
    }
  }
  return (
    <>
      <div className="container">
        <section className="dialogue-box">
          <h1>what is 1 + 1?</h1>
          <input
            className="input-box"
            type="text"
            onChange={handleChange}
            value={answer}
            placeholder="your answer"
          />
          <button onClick={handleClick}>submit</button>
        </section>
      </div>
    </>
  );
}

export default App;
