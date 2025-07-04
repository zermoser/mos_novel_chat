import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Heart, BookOpen, Star, Clock, Settings, PlusCircle, Edit, Trash2, X } from 'lucide-react';

// Interface definitions
interface Message {
    id: number;
    sender: string; // Changed to string to accommodate dynamic characters
    text: string;
    timestamp: Date;
    emotion?: 'happy' | 'sad' | 'love' | 'angry' | 'excited';
    reactions?: number;
    isRead?: boolean;
}

interface Character {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'typing' | 'offline';
    color: string; // Tailwind gradient classes
    personality: string;
}

const NovelChatApp: React.FC = () => {
    // Initial messages
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: 'system',
            text: '📖 เรื่องราวของเรากำลังจะเริ่มต้น...',
            timestamp: new Date(Date.now() - 300000),
            isRead: true
        },
        {
            id: 2,
            sender: 'maya',
            text: 'อเล็กซ์... เธอยังอยู่ที่นั่นมั้ย? 🌙',
            timestamp: new Date(Date.now() - 240000),
            emotion: 'sad',
            reactions: 0,
            isRead: true
        },
        {
            id: 3,
            sender: 'alex',
            text: 'มายา! ฉันคิดถึงเธอมากเลย ขอโทษที่หายไปนานนะ 💔',
            timestamp: new Date(Date.now() - 180000),
            emotion: 'love',
            reactions: 0,
            isRead: true
        },
        {
            id: 4,
            sender: 'maya',
            text: 'ฉันรอเธอมาตลอด... เหมือนดวงดาวที่รอให้พระจันทร์กลับมา ✨',
            timestamp: new Date(Date.now() - 120000),
            emotion: 'love',
            reactions: 0,
            isRead: true
        }
    ]);

    // Initial characters - now an array
    const [characters, setCharacters] = useState<Character[]>([
        {
            id: 'maya',
            name: 'มายา',
            avatar: '🌸',
            status: 'online',
            color: 'from-pink-400 to-rose-500',
            personality: 'นักเขียนสาวผู้เปี่ยมด้วยจินตนาการ'
        },
        {
            id: 'alex',
            name: 'อเล็กซ์',
            avatar: '�',
            status: 'online',
            color: 'from-blue-400 to-indigo-500',
            personality: 'นักดนตรีหนุ่มผู้ลึกลับ'
        },
        {
            id: 'system',
            name: 'ผู้เล่าเรื่อง',
            avatar: '📚',
            status: 'online',
            color: 'from-amber-400 to-orange-500',
            personality: 'ผู้บอกเล่าเรื่องราว'
        }
    ]);

    const [currentSpeaker, setCurrentSpeaker] = useState<string>('alex'); // Current speaker for user input
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false); // For AI typing indicator
    const [storyMode, setStoryMode] = useState(true); // Auto-advance story
    const [readingProgress, setReadingProgress] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(false); // Sound effects toggle
    const [showSettings, setShowSettings] = useState(false); // Settings modal visibility
    const [showAddCharacterModal, setShowAddCharacterModal] = useState(false); // Add character modal visibility
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null); // Character being edited
    const [newCharacter, setNewCharacter] = useState<Omit<Character, 'status'>>({ // New character form state
        id: '', name: '', avatar: '', color: '', personality: ''
    });
    const [isLoadingResponse, setIsLoadingResponse] = useState(false); // For LLM response loading

    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling to bottom

    // Emojis for message emotions
    const emotionEmojis = {
        happy: '😊',
        sad: '😢',
        love: '💕',
        angry: '😤',
        excited: '🎉'
    };

    // Story prompts for manual mode
    const storyPrompts = [
        'เล่าถึงความรู้สึกของเธอ',
        'พูดถึงความทรงจำที่สวยงาม',
        'แสดงความห่วงใย',
        'บอกความลับที่ซ่อนอยู่',
        'พูดถึงอนาคตที่ฝันไว้'
    ];

    // Function to scroll messages to the bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Helper to get character object by ID
    const getCharacterById = useCallback((id: string) => {
        return characters.find(char => char.id === id);
    }, [characters]);

    // LLM integration for generating responses
    const generateLLMResponse = useCallback(async (speakerId: string) => {
        setIsLoadingResponse(true);
        const character = getCharacterById(speakerId);
        if (!character) {
            console.error("Character not found for LLM response:", speakerId);
            setIsLoadingResponse(false);
            return "ฉันไม่แน่ใจว่าจะตอบว่าอะไรดี...";
        }

        const chatHistory = messages.slice(-5).map(msg => ({
            role: msg.sender === speakerId ? "model" : "user", // LLM's perspective
            parts: [{ text: msg.text }]
        }));

        const fullPrompt = `You are ${character.name}, a ${character.personality}. Respond to the last message in the chat history. Keep your response concise and in Thai. Incorporate your personality.
        
        Chat History:
        ${chatHistory.map(m => `${m.role}: ${m.parts[0].text}`).join('\n')}
        
        Your response:`;

        try {
            const payload = {
                contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            };
            const apiKey = ""; // Canvas will provide this
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setIsLoadingResponse(false);
                return text;
            } else {
                console.error("LLM response structure unexpected:", result);
                setIsLoadingResponse(false);
                return "ขออภัย ฉันไม่สามารถสร้างการตอบกลับได้ในขณะนี้";
            }
        } catch (error) {
            console.error("Error generating LLM response:", error);
            setIsLoadingResponse(false);
            return "เกิดข้อผิดพลาดในการสร้างการตอบกลับ";
        }
    }, [messages, getCharacterById]);

    // Function to generate an automated response (now using LLM)
    const generateAutoResponse = useCallback(async () => {
        const availableSpeakers = characters.filter(c => c.id !== 'system' && c.id !== currentSpeaker);
        if (availableSpeakers.length === 0) return;

        const otherSpeaker = availableSpeakers[Math.floor(Math.random() * availableSpeakers.length)];

        setIsTyping(true);
        const responseText = await generateLLMResponse(otherSpeaker.id);

        setTimeout(() => {
            const newMessage: Message = {
                id: Date.now(),
                sender: otherSpeaker.id,
                text: responseText,
                timestamp: new Date(),
                emotion: Math.random() > 0.7 ? 'love' : 'happy', // Random emotion for now
                reactions: 0,
                isRead: false
            };

            setMessages(prev => [...prev, newMessage]);
            setCurrentSpeaker(otherSpeaker.id); // Switch speaker after auto-response
            setIsTyping(false);

            // Mark as read after 2 seconds
            setTimeout(() => {
                setMessages(prev => prev.map(msg =>
                    msg.id === newMessage.id ? { ...msg, isRead: true } : msg
                ));
            }, 2000);
        }, 1000 + Math.random() * 2000); // Shorter delay after LLM response
    }, [currentSpeaker, characters, messages, generateLLMResponse]);

    // Effect for scrolling and reading progress
    useEffect(() => {
        scrollToBottom();
        const totalMessages = messages.length;
        const readMessages = messages.filter(msg => msg.isRead).length;
        setReadingProgress((readMessages / totalMessages) * 100);
    }, [messages]);

    // Auto-continue story in story mode
    useEffect(() => {
        if (storyMode && messages.length > 0 && !isTyping && !isLoadingResponse) {
            const lastMessage = messages[messages.length - 1];
            // Only generate auto-response if the last message was not from the current speaker (user's turn) or system
            if (lastMessage.sender !== currentSpeaker && lastMessage.sender !== 'system') {
                const timer = setTimeout(() => {
                    generateAutoResponse();
                }, 5000 + Math.random() * 5000); // More realistic delay

                return () => clearTimeout(timer);
            }
        }
    }, [messages, storyMode, isTyping, isLoadingResponse, currentSpeaker, generateAutoResponse]);

    // Handle sending a message
    const handleSendMessage = (text: string) => {
        if (!text.trim() || isTyping || isLoadingResponse) return;

        const newMessage: Message = {
            id: Date.now(),
            sender: currentSpeaker,
            text: text.trim(),
            timestamp: new Date(),
            emotion: 'happy', // Default emotion for user-sent messages
            reactions: 0,
            isRead: true
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');

        if (soundEnabled) {
            // Play a subtle send message sound
            const audio = new Audio('https://www.soundjay.com/buttons/button-1.mp3'); // Placeholder sound
            audio.play().catch(e => console.error("Error playing sound:", e));
        }

        // In manual mode, switch speaker after user sends a message
        if (!storyMode) {
            const otherSpeakers = characters.filter(c => c.id !== 'system' && c.id !== currentSpeaker);
            if (otherSpeakers.length > 0) {
                const nextSpeaker = otherSpeakers[Math.floor(Math.random() * otherSpeakers.length)];
                setCurrentSpeaker(nextSpeaker.id);
            }
        }
    };

    // Handle message reactions
    const handleReaction = (messageId: number) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, reactions: (msg.reactions || 0) + 1 }
                : msg
        ));
    };

    // Format timestamp for display
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get character's Tailwind gradient classes
    const getCharacterGradient = (senderId: string) => {
        return getCharacterById(senderId)?.color || 'from-gray-400 to-gray-500';
    };

    // Handle adding a new character
    const handleAddCharacter = () => {
        if (!newCharacter.id || !newCharacter.name || !newCharacter.avatar || !newCharacter.color || !newCharacter.personality) {
            // Using a custom modal/message box instead of alert()
            // For simplicity, using console.log here, but in a real app, you'd show a UI message
            console.log('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        if (characters.some(char => char.id === newCharacter.id)) {
            console.log('ID ตัวละครนี้มีอยู่แล้ว กรุณาใช้ ID อื่น');
            return;
        }

        setCharacters(prev => [...prev, { ...newCharacter, status: 'online' }]);
        setNewCharacter({ id: '', name: '', avatar: '', color: '', personality: '' });
        setShowAddCharacterModal(false);
    };

    // Handle editing an existing character
    const handleEditCharacter = () => {
        if (!editingCharacter || !editingCharacter.name || !editingCharacter.avatar || !editingCharacter.color || !editingCharacter.personality) {
            console.log('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        setCharacters(prev => prev.map(char =>
            char.id === editingCharacter.id ? { ...editingCharacter, status: char.status } : char
        ));
        setEditingCharacter(null);
        setShowAddCharacterModal(false); // Close modal after editing
    };

    // Handle deleting a character
    const handleDeleteCharacter = (id: string) => {
        // Using a custom modal/message box instead of window.confirm()
        // For simplicity, directly performing action after a "virtual" confirmation
        if (true) { // In a real app, this would be replaced by a custom confirmation UI
            setCharacters(prev => prev.filter(char => char.id !== id));
            // If the deleted character was the current speaker, switch to another
            if (currentSpeaker === id) {
                const remainingSpeakers = characters.filter(c => c.id !== 'system' && c.id !== id);
                if (remainingSpeakers.length > 0) {
                    setCurrentSpeaker(remainingSpeakers[0].id);
                } else {
                    setCurrentSpeaker('system'); // Fallback if no other characters
                }
            }
        }
    };

    // Prepare character options for the selector, excluding 'system'
    const selectableCharacters = characters.filter(char => char.id !== 'system');

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white font-inter antialiased">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/30 backdrop-blur-lg p-4 border-b border-white/10 shadow-xl">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-3xl">📚</div>
                            <div>
                                <h1 className="font-extrabold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-300 drop-shadow-lg">
                                    Novel Chat
                                </h1>
                                <p className="text-sm text-purple-200 mt-0.5 opacity-90">เรื่องราวแห่งความรักที่เลือกได้</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowSettings(true)}
                                className="p-2 rounded-full text-purple-200 hover:bg-white/15 transition-colors duration-200 shadow-md transform hover:scale-110"
                                aria-label="Settings"
                            >
                                <Settings size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Reading Progress */}
                    <div className="mt-4">
                        <div className="flex items-center space-x-2 text-xs text-purple-200 opacity-80">
                            <BookOpen size={16} />
                            <span>ความคืบหน้า: {readingProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2 mt-1.5 shadow-inner">
                            <div
                                className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${readingProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Characters Status */}
            <div className="sticky top-[calc(6rem+1.5rem)] z-10 p-3 bg-black/20 border-b border-white/10 shadow-lg">
                <div className="max-w-lg mx-auto flex justify-around items-center flex-wrap gap-y-3">
                    {selectableCharacters.map((char) => (
                        <div key={char.id} className="flex flex-col items-center space-y-1 w-24">
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${char.color} flex items-center justify-center text-3xl shadow-lg ring-2 ring-white/20`}>
                                    {char.avatar}
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-purple-900 ${char.status === 'online' ? 'bg-green-400' : char.status === 'typing' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'}`}></div>
                            </div>
                            <div className="text-sm font-semibold text-white/90 truncate w-full text-center">{char.name}</div>
                            <div className="text-[10px] text-purple-200 text-center leading-tight opacity-80">{char.personality}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar max-w-lg mx-auto w-full">
                {messages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                        <div className={`flex items-end space-x-2 ${msg.sender === currentSpeaker && msg.sender !== 'system'
                            ? 'justify-end' // User's messages
                            : 'justify-start' // Other characters' messages
                            }`}>
                            {/* Avatar for others' messages */}
                            {msg.sender !== currentSpeaker && msg.sender !== 'system' && (
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getCharacterGradient(msg.sender)} flex items-center justify-center text-lg mb-1 flex-shrink-0 shadow-md`}>
                                    {getCharacterById(msg.sender)?.avatar}
                                </div>
                            )}

                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-xl transition-all duration-300 ease-out transform ${msg.sender === 'system'
                                ? 'bg-amber-500/20 border border-amber-300/30 text-amber-100 text-center mx-auto rounded-lg' // System messages
                                : msg.sender === currentSpeaker
                                    ? `bg-gradient-to-br ${getCharacterGradient(msg.sender)} text-white rounded-br-none` // User's message style
                                    : 'bg-white/10 border border-white/20 text-white rounded-bl-none' // Other characters' message style
                                } ${msg.sender !== 'system' ? 'hover:scale-[1.02]' : ''}`}>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-medium text-white/80">
                                        {getCharacterById(msg.sender)?.name}
                                    </span>
                                    {msg.emotion && (
                                        <span className="text-sm">{emotionEmojis[msg.emotion]}</span>
                                    )}
                                    {!msg.isRead && msg.sender !== currentSpeaker && msg.sender !== 'system' && (
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="Unread"></div>
                                    )}
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <div className="flex items-center justify-between mt-2 text-white/60">
                                    <span className="text-xs">
                                        <Clock size={12} className="inline-block mr-1" />
                                        {formatTime(msg.timestamp)}
                                    </span>
                                    {msg.sender !== 'system' && (
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleReaction(msg.id)}
                                                className="flex items-center space-x-1 p-1 rounded-full hover:bg-white/20 transition-colors"
                                                aria-label="Add reaction"
                                            >
                                                <Heart size={14} className="text-red-400" />
                                                <span className="text-xs">{msg.reactions || 0}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Avatar for current speaker's messages */}
                            {msg.sender === currentSpeaker && msg.sender !== 'system' && (
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getCharacterGradient(msg.sender)} flex items-center justify-center text-lg mb-1 flex-shrink-0 shadow-md`}>
                                    {getCharacterById(msg.sender)?.avatar}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {(isTyping || isLoadingResponse) && (
                    <div className="flex items-end space-x-2 justify-start">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getCharacterGradient(currentSpeaker === selectableCharacters[0]?.id ? selectableCharacters[1]?.id : selectableCharacters[0]?.id)} flex items-center justify-center text-lg mb-1`}>
                            {getCharacterById(currentSpeaker === selectableCharacters[0]?.id ? selectableCharacters[1]?.id : selectableCharacters[0]?.id)?.avatar}
                        </div>
                        <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl rounded-bl-sm shadow-inner">
                            <div className="flex space-x-1">
                                <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 z-10 p-4 bg-black/30 border-t border-white/10 backdrop-blur-lg shadow-top-lg">
                <div className="max-w-lg mx-auto">
                    {/* Quick Story Prompts */}
                    {!storyMode && ( // Only show prompts in manual mode
                        <>
                            <div className="flex items-center space-x-2 mb-3 text-purple-200 opacity-80">
                                <Star size={18} className="text-yellow-400" />
                                <span className="text-sm font-medium">แรงบันดาลใจ</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {storyPrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInput(prompt)}
                                        className="px-3 py-1.5 bg-purple-500/20 border border-purple-300/30 text-purple-200 rounded-full text-xs hover:bg-purple-500/30 transition-colors shadow-sm active:scale-95"
                                        disabled={isTyping || isLoadingResponse}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Character Selector */}
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-white/80">พูดในนาม:</span>
                        <div className="flex flex-wrap gap-2">
                            {selectableCharacters.map((char) => (
                                <button
                                    key={char.id}
                                    onClick={() => setCurrentSpeaker(char.id)}
                                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ease-in-out shadow-md flex items-center space-x-1
                                        ${currentSpeaker === char.id
                                            ? `bg-gradient-to-br ${char.color} text-white transform scale-105 ring-2 ring-purple-300`
                                            : 'bg-white/15 text-white/70 hover:bg-white/25'
                                        }`}
                                    disabled={isTyping || isLoadingResponse}
                                >
                                    <span>{char.avatar}</span> <span>{char.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Field and Send Button */}
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSendMessage(input);
                                }
                            }}
                            placeholder={`พิมพ์ข้อความในนามของ ${getCharacterById(currentSpeaker)?.name}...`}
                            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isTyping || isLoadingResponse}
                        />
                        <button
                            onClick={() => handleSendMessage(input)}
                            disabled={!input.trim() || isTyping || isLoadingResponse}
                            className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl transform hover:scale-105 active:scale-95"
                            aria-label="Send message"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-purple-800 to-indigo-800 p-6 rounded-xl shadow-2xl w-full max-w-md relative border border-purple-700">
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            aria-label="Close settings"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-white text-center">ตั้งค่า</h2>

                        {/* General Settings */}
                        <div className="mb-6 bg-purple-700/30 p-4 rounded-lg shadow-inner">
                            <h3 className="text-lg font-semibold mb-3 text-purple-200">ทั่วไป</h3>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-white/80">โหมดเนื้อเรื่องอัตโนมัติ:</span>
                                <button
                                    onClick={() => setStoryMode(!storyMode)}
                                    className={`px-4 py-2 rounded-full text-sm transition-colors shadow-md
                                        ${storyMode ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                                >
                                    {storyMode ? 'เปิด' : 'ปิด'}
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/80">เปิด/ปิดเสียง:</span>
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className={`px-4 py-2 rounded-full text-sm transition-colors shadow-md
                                        ${soundEnabled ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                                >
                                    {soundEnabled ? 'เปิด' : 'ปิด'}
                                </button>
                            </div>
                        </div>

                        {/* Character Management */}
                        <div className="mb-6 bg-indigo-700/30 p-4 rounded-lg shadow-inner">
                            <h3 className="text-lg font-semibold mb-3 text-indigo-200">จัดการตัวละคร</h3>
                            <button
                                onClick={() => {
                                    setEditingCharacter(null);
                                    setNewCharacter({ id: '', name: '', avatar: '', color: '', personality: '' });
                                    setShowAddCharacterModal(true);
                                }}
                                className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold transition-colors shadow-md mb-4"
                            >
                                <PlusCircle size={18} />
                                <span>เพิ่มตัวละครใหม่</span>
                            </button>

                            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                {characters.filter(c => c.id !== 'system').map((char) => (
                                    <div key={char.id} className="flex items-center justify-between bg-white/10 p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${char.color} flex items-center justify-center text-lg`}>
                                                {char.avatar}
                                            </div>
                                            <div>
                                                <div className="font-medium">{char.name}</div>
                                                <div className="text-xs text-white/70 truncate w-32">{char.personality}</div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingCharacter(char);
                                                    setNewCharacter(char); // Pre-fill form for editing
                                                    setShowAddCharacterModal(true);
                                                }}
                                                className="p-1.5 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 transition-colors"
                                                aria-label={`Edit ${char.name}`}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCharacter(char.id)}
                                                className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
                                                aria-label={`Delete ${char.name}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-md font-semibold transition-colors shadow-lg"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Edit Character Modal */}
            {showAddCharacterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-purple-700 to-indigo-700 p-6 rounded-xl shadow-2xl w-full max-w-sm relative border border-purple-600">
                        <button
                            onClick={() => setShowAddCharacterModal(false)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            aria-label="Close add/edit character modal"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-white text-center">
                            {editingCharacter ? 'แก้ไขตัวละคร' : 'เพิ่มตัวละครใหม่'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="characterId" className="block text-sm font-medium text-white/80 mb-1">ID (ไม่ซ้ำกัน):</label>
                                <input
                                    type="text"
                                    id="characterId"
                                    value={newCharacter.id}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    disabled={!!editingCharacter} // Disable ID editing for existing characters
                                    placeholder="เช่น maya, alex"
                                />
                            </div>
                            <div>
                                <label htmlFor="characterName" className="block text-sm font-medium text-white/80 mb-1">ชื่อ:</label>
                                <input
                                    type="text"
                                    id="characterName"
                                    value={newCharacter.name}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    placeholder="เช่น มายา, อเล็กซ์"
                                />
                            </div>
                            <div>
                                <label htmlFor="characterAvatar" className="block text-sm font-medium text-white/80 mb-1">อวตาร (Emoji):</label>
                                <input
                                    type="text"
                                    id="characterAvatar"
                                    value={newCharacter.avatar}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, avatar: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    maxLength={2} // Emojis are often 1-2 characters
                                    placeholder="เช่น 🌸, 🎭"
                                />
                            </div>
                            <div>
                                <label htmlFor="characterColor" className="block text-sm font-medium text-white/80 mb-1">สี (Tailwind gradient):</label>
                                <input
                                    type="text"
                                    id="characterColor"
                                    value={newCharacter.color}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, color: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    placeholder="เช่น from-pink-400 to-rose-500"
                                />
                                <p className="text-xs text-white/60 mt-1">
                                    ตัวอย่าง: <span className="font-mono">from-pink-400 to-rose-500</span>, <span className="font-mono">from-blue-400 to-indigo-500</span>
                                </p>
                            </div>
                            <div>
                                <label htmlFor="characterPersonality" className="block text-sm font-medium text-white/80 mb-1">บุคลิก:</label>
                                <textarea
                                    id="characterPersonality"
                                    value={newCharacter.personality}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, personality: e.target.value })}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-400 h-20 resize-none"
                                    placeholder="เช่น นักเขียนสาวผู้เปี่ยมด้วยจินตนาการ"
                                />
                            </div>
                        </div>
                        <button
                            onClick={editingCharacter ? handleEditCharacter : handleAddCharacter}
                            className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-md font-semibold transition-colors shadow-lg"
                        >
                            {editingCharacter ? 'บันทึกการแก้ไข' : 'เพิ่มตัวละคร'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NovelChatApp;