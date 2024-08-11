import React, { useState } from "react";
import "../App.css";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";

function ChatPage() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    function formatText(text) {
        const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith("```") && part.endsWith("```")) {
                const code = part.slice(3, -3).trim();
                return (
                    <SyntaxHighlighter key={index} language="html" style={solarizedlight}>
                        {code}
                    </SyntaxHighlighter>
                );
            } else if (part.startsWith("`") && part.endsWith("`")) {
                const code = part.slice(1, -1);
                return (
                    <code key={index} className="inline-code">
                        {code}
                    </code>
                );
            } else if (part.startsWith("**") && part.endsWith("**")) {
                const heading = part.slice(2, -2);
                return (
                    <p key={index} className="bold-text">
                        {heading}
                    </p>
                );
            } else if (part.startsWith("* ")) {
                const bullet = part.slice(2);
                return (
                    <div className="one-line">
                        <li key={index} className="bullet-point">
                            {bullet}
                        </li>
                    </div>
                );
            } else {
                return <p key={index}>{part}</p>;
            }
        });
    }
    const apiKey = import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT;

    async function GenerateAnswer() {
        setLoading(true);
        setAnswer("");
        setCopied(false);

        try {
            const response = await axios({
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
                method: "post",
                data: { contents: [{ parts: [{ text: question }] }] },
            });

            setTimeout(() => {
                setAnswer(
                    response["data"]["candidates"][0]["content"]["parts"][0]["text"]
                );
                setLoading(false);
            }, 5000);
        } catch (error) {
            console.error("Error generating answer:", error);
            setAnswer("Failed to generate answer. Please try again.");
            setLoading(false);
        }
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(answer).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <div className="page-container">
            <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
                <div className="sidebar-header">
                    <h1 className={collapsed ? "hidden" : ""}>Cypher Chatbot</h1>
                    <button className="menu-button" onClick={toggleSidebar}>
                        {collapsed ? <div className="menu-icon">M</div> : "Menu"}
                    </button>
                </div>
                <div className={`items ${collapsed ? "hidden" : ""}`}>
                    <ul>
                        <li>Home</li>
                        <li>Sign-In</li>
                        <li>Setting</li>
                        <li>About</li>
                    </ul>
                </div>
            </div>
            <div className="main-content">
                <div className="chat-container">
                    <h1>Customer Support Bot</h1>
                    <div className="text-area">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            cols="30"
                            rows="10"
                            disabled={loading}
                        />
                        <button onClick={GenerateAnswer} disabled={loading}>
                            Generate Answer
                        </button>
                    </div>
                    <div className="response-container">
                        {loading ? (
                            <div className="generating-text">
                                <div className="loading-spinner"></div>
                                <span>Generating answer...</span>
                            </div>
                        ) : (
                            <div>
                                {formatText(answer)}
                                {answer && (
                                    <button onClick={copyToClipboard} className="copy-button">
                                        {copied ? "Copied!" : "Copy"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;
