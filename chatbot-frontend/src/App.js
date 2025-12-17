import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/messages")
      .then(res => res.json())
      .then(setMessages);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    await fetch("http://localhost:5000/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });

    const updated = await fetch("http://localhost:5000/messages")
      .then(res => res.json());

    setMessages(updated);
    setInput("");
  };

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">Hybrid Chatbot</div>

        <div className="chat-box">
          {messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.sender}`}>
              <div
                className="bubble"
                data-time={new Date(msg.timestamp).toLocaleString()}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="input-box">
          <input
            value={input}
            placeholder="Type a message..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
