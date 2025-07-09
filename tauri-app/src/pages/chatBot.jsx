import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { generateContent } from '../utils/model.jsx';
import TitleBar from '../components/titleBar/titleBar.jsx';
export default function ChatBotPage() {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleClear = () => {
    setUserInput('');
    setResponse([]);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setResponse([{ type: "system", message: "Please enter a prompt.." }]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await generateContent(userInput);
      setResponse(prevResponse => [
        ...prevResponse,
        { type: "user", message: userInput },
        { type: "bot", message: res() },
      ]);
      setUserInput('');
    } catch (err) {
      console.error("Error generating response:", err);
      setResponse(prevResponse => [
        ...prevResponse,
        { type: "system", message: "Failed to generate response" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
    <TitleBar />
    
    <div className="max-w-xl mx-auto mt-10 p-4 bg-base-200 rounded-lg shadow">
      {response.length === 0 ? (
        <h1 className="text-2xl font-bold text-center mb-6">Got Questions? Chatty's Got Answers.</h1>
      ) : (
        <div className="chat-history mb-4 space-y-2 text-base-content">
          {response.map((msg, index) => (
            <div
              key={index}
              className={`
                px-3 py-2 rounded
                ${msg.type === "user" ? "bg-base-100 text-right ml-auto max-w-[80%]" : ""}
                ${msg.type === "bot" ? "bg-base-100 text-left mr-auto max-w-[80%]" : ""}
                ${msg.type === "system" ? "bg-yellow-100 text-center text-yellow-800" : ""}
              `}
            >
              {/* If you want to allow basic HTML, use <div dangerouslySetInnerHTML={{__html: msg.message}} /> */}
              {msg.message}
            </div>
          ))}
          {isLoading && <div className="text-center text-base-content">Generating response...</div>}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <button onClick={handleClear} className="btn btn-outline btn-sm">
          Clear
        </button>
        <input
          type="text"
          value={userInput}
          onChange={handleUserInput}
          onKeyDown={handleKeyPress}
          placeholder="Type your message here..."
          className="flex-1 input input-bordered input-sm"
        />
        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-sm flex items-center gap-1"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
    </>
  );
}