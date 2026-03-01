import React, { useState, useRef, useEffect } from 'react';
import { Send, PanelLeft, Hand, UserCircle, BookOpen, ShieldAlert } from 'lucide-react';
import Message from './Message';
import mascotUrl from '../../asset/maskot.png';
import mascotIconChatUrl from '../../asset/maskot-icon-chat.png';

const CHIPS = [
    { icon: Hand, label: "Hi!" },
    { icon: UserCircle, label: "Kamu Siapa?" },
    { icon: BookOpen, label: "Client Protection" },
    { icon: ShieldAlert, label: "Anti-harassment" }
];

export default function ChatArea({ isOpen, toggleSidebar }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // We start with NO messages to show the welcome screen.
    const isWelcomeScreen = messages.length === 0;

    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const inputWrapperRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Shrink layout to visual viewport height when keyboard appears (no gap, no bounce)
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;

        const onResize = () => {
            document.documentElement.style.setProperty('--app-height', `${viewport.height}px`);
        };

        onResize(); // set initial value
        viewport.addEventListener('resize', onResize);
        return () => viewport.removeEventListener('resize', onResize);
    }, []);

    const handleInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    const handleSend = async (textToSubmit = input) => {
        if (!textToSubmit.trim() || isTyping) return;

        const userText = textToSubmit.trim();
        setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        setIsTyping(true);

        try {
            const res = await fetch("https://dip-utility-effect-copying.trycloudflare.com/webhook/peped-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: userText, sessionId: "user-demo-web-clean" })
            });

            const data = await res.json();
            const reply = data?.data?.reply || data?.output || "Maaf, aku sedang tidak konek ke server.";

            setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
        } catch (error) {
            setMessages((prev) => [...prev, { sender: 'ai', text: "⚠️ Gagal terhubung ke server." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const inputBox = (
        <div className="input-box">
            <textarea
                ref={textareaRef}
                rows="1"
                placeholder="Message Peped.."
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
            />
            <button
                className="send-btn"
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isTyping}
                title="Send Message"
            >
                <Send size={16} fill="currentColor" />
            </button>
        </div>
    );

    const suggestionChips = (
        <div className="suggestion-chips">
            {CHIPS.map((chip, i) => (
                <div key={i} className="chip" onClick={() => handleSend(chip.label)}>
                    <chip.icon size={16} className="chip-icon" />
                    {chip.label}
                </div>
            ))}
        </div>
    );

    return (
        <div className="main-content">
            <div className="top-bar">
                <button
                    className="hamburger-btn"
                    onClick={toggleSidebar}
                    title="Open sidebar"
                    style={{ visibility: isOpen ? 'hidden' : 'visible' }}
                >
                    <PanelLeft size={24} color="#1A1A2E" />
                </button>
                <span className="app-title">Peped</span>
            </div>

            {isWelcomeScreen ? (
                <div className="welcome-container">
                    <div className="mascot-area">
                        <div className="mascot-circle"></div>
                        <img src={mascotUrl} alt="Mascot" className="mascot-img" />
                    </div>
                    <h1 className="welcome-title" style={{ whiteSpace: 'pre-wrap' }}>
                        Haii A-Team! <br className="mobile-break" />Peped is here to save your day! 💅✨<br />What’s on your mind today?
                    </h1>

                    <div ref={inputWrapperRef} className="input-area-wrapper welcome-input" style={{ paddingTop: '20px', zIndex: 10 }}>
                        {inputBox}
                        <div className="chips-wrapper">
                            {suggestionChips}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="chat-container">
                        {messages.map((msg, idx) => (
                            <Message key={idx} text={msg.text} sender={msg.sender} />
                        ))}

                        {isTyping && (
                            <div className="message-wrapper ai">
                                <div className="avatar ai">
                                    <img src={mascotIconChatUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="bot" />
                                </div>
                                <div className="message-bubble" style={{ padding: '0 18px', background: 'transparent', boxShadow: 'none', border: 'none' }}>
                                    <div className="typing-indicator">
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                        <div className="typing-dot"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div ref={inputWrapperRef} className="input-area-wrapper">
                        {inputBox}
                    </div>
                </>
            )}
        </div>
    );
}
