import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, BookOpen, Star, Volume2 } from 'lucide-react';

interface Message {
    id: number;
    sender: 'maya' | 'alex' | 'system';
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
    color: string;
    personality: string;
}

const NovelChatApp: React.FC = () => {
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

    const [currentSpeaker, setCurrentSpeaker] = useState<'maya' | 'alex'>('alex');
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [storyMode, setStoryMode] = useState(true);
    const [readingProgress, setReadingProgress] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const characters: Record<string, Character> = {
        maya: {
            id: 'maya',
            name: 'มายา',
            avatar: '🌸',
            status: 'online',
            color: 'from-pink-400 to-rose-500',
            personality: 'นักเขียนสาวผู้เปี่ยมด้วยจินตนาการ'
        },
        alex: {
            id: 'alex',
            name: 'อเล็กซ์',
            avatar: '🎭',
            status: 'online',
            color: 'from-blue-400 to-indigo-500',
            personality: 'นักดนตรีหนุ่มผู้ลึกลับ'
        },
        system: {
            id: 'system',
            name: 'ผู้เล่าเรื่อง',
            avatar: '📚',
            status: 'online',
            color: 'from-amber-400 to-orange-500',
            personality: 'ผู้บอกเล่าเรื่องราว'
        }
    };

    const emotionEmojis = {
        happy: '😊',
        sad: '😢',
        love: '💕',
        angry: '😤',
        excited: '🎉'
    };

    const storyPrompts = [
        'เล่าถึงความรู้สึกของเธอ',
        'พูดถึงความทรงจำที่สวยงาม',
        'แสดงความห่วงใย',
        'บอกความลับที่ซ่อนอยู่',
        'พูดถึงอนาคตที่ฝันไว้'
    ];

    const autoResponses = {
        maya: [
            'ฉันเขียนนิยายเรื่องใหม่ เกี่ยวกับเรื่องราวของเรานะ ✍️',
            'ดวงดาวคืนนี้สวยจัง... เหมือนตอนที่เราดูกันครั้งแรก 🌟',
            'เธอรู้มั้ย? ทุกครั้งที่ฉันเขียน ฉันคิดถึงเธอเสมอ 💭',
            'บางทีความรักคือการรอคอย... และฉันยินดีที่จะรอเธอ 💝'
        ],
        alex: [
            'ฉันแต่งเพลงใหม่ให้เธอ... เกี่ยวกับความคิดถึง 🎵',
            'เสียงของเธอเหมือนดนตรีที่ไพเราะที่สุดในโลก 🎶',
            'ฉันจะกลับมาหาเธอ... เมื่อฉันเป็นคนที่ดีพอ 🌅',
            'ทุกคืนที่ฉันเดินทาง ฉันส่งใจไปหาเธอ 💫'
        ]
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        // Calculate reading progress
        const totalMessages = messages.length;
        const readMessages = messages.filter(msg => msg.isRead).length;
        setReadingProgress((readMessages / totalMessages) * 100);
    }, [messages]);

    // Auto-continue story in story mode
    useEffect(() => {
        if (storyMode && messages.length > 0) {
            const timer = setTimeout(() => {
                const lastMessage = messages[messages.length - 1];
                if (lastMessage.sender !== 'system' && !isTyping) {
                    generateAutoResponse();
                }
            }, 5000 + Math.random() * 5000);

            return () => clearTimeout(timer);
        }
    }, [messages, storyMode, isTyping]);

    const generateAutoResponse = () => {
        const otherSpeaker = currentSpeaker === 'maya' ? 'alex' : 'maya';
        const responses = autoResponses[otherSpeaker];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        setIsTyping(true);
        setTimeout(() => {
            const newMessage: Message = {
                id: Date.now(),
                sender: otherSpeaker,
                text: randomResponse,
                timestamp: new Date(),
                emotion: Math.random() > 0.7 ? 'love' : 'happy',
                reactions: 0,
                isRead: false
            };

            setMessages(prev => [...prev, newMessage]);
            setCurrentSpeaker(otherSpeaker);
            setIsTyping(false);

            // Mark as read after 2 seconds
            setTimeout(() => {
                setMessages(prev => prev.map(msg =>
                    msg.id === newMessage.id ? { ...msg, isRead: true } : msg
                ));
            }, 2000);
        }, 2000 + Math.random() * 3000);
    };

    const handleSendMessage = (text: string) => {
        if (!text.trim() || isTyping) return;

        const newMessage: Message = {
            id: Date.now(),
            sender: currentSpeaker,
            text: text.trim(),
            timestamp: new Date(),
            emotion: 'happy',
            reactions: 0,
            isRead: true
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');

        if (soundEnabled) {
            // Simulate message sound
            console.log('🔊 Message sent sound');
        }
    };

    const handleReaction = (messageId: number) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, reactions: (msg.reactions || 0) + 1 }
                : msg
        ));
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCharacterGradient = (sender: string) => {
        return characters[sender]?.color || 'from-gray-400 to-gray-500';
    };

    return (
        <div className="max-w-lg mx-auto h-screen flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">📖</div>
                        <div>
                            <h1 className="font-bold text-lg">Novel Chat</h1>
                            <p className="text-sm text-purple-200">เรื่องราวแห่งความรัก</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2 rounded-full ${soundEnabled ? 'bg-yellow-500' : 'bg-gray-500'}`}
                        >
                            <Volume2 size={16} />
                        </button>
                        <button
                            onClick={() => setStoryMode(!storyMode)}
                            className={`px-3 py-1 rounded-full text-xs ${storyMode ? 'bg-green-500' : 'bg-gray-500'}`}
                        >
                            {storyMode ? 'Auto' : 'Manual'}
                        </button>
                    </div>
                </div>

                {/* Reading Progress */}
                <div className="mt-2">
                    <div className="flex items-center space-x-2 text-xs">
                        <BookOpen size={12} />
                        <span>Progress: {readingProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                        <div
                            className="bg-gradient-to-r from-pink-400 to-purple-400 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${readingProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Characters Status */}
            <div className="p-3 bg-black/10 border-b border-white/10">
                <div className="flex justify-center space-x-6">
                    {Object.entries(characters).filter(([key]) => key !== 'system').map(([key, char]) => (
                        <div key={key} className="flex items-center space-x-2">
                            <div className="relative">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${char.color} flex items-center justify-center text-sm`}>
                                    {char.avatar}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                                <div className="text-xs font-medium">{char.name}</div>
                                <div className="text-xs text-purple-200">{char.personality}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                        <div className={`flex items-end space-x-2 ${msg.sender === currentSpeaker || msg.sender === 'system'
                                ? 'justify-end'
                                : 'justify-start'
                            }`}>
                            {msg.sender !== currentSpeaker && msg.sender !== 'system' && (
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getCharacterGradient(msg.sender)} flex items-center justify-center text-sm mb-1`}>
                                    {characters[msg.sender]?.avatar}
                                </div>
                            )}

                            <div className={`max-w-xs px-4 py-3 rounded-2xl backdrop-blur-sm ${msg.sender === 'system'
                                    ? 'bg-amber-500/20 border border-amber-300/30 text-amber-100 text-center mx-auto'
                                    : msg.sender === currentSpeaker
                                        ? `bg-gradient-to-br ${getCharacterGradient(msg.sender)} text-white rounded-br-sm shadow-lg`
                                        : 'bg-white/10 border border-white/20 text-white rounded-bl-sm'
                                }`}>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-medium">
                                        {characters[msg.sender]?.name}
                                    </span>
                                    {msg.emotion && (
                                        <span className="text-xs">
                                            {emotionEmojis[msg.emotion]}
                                        </span>
                                    )}
                                    {!msg.isRead && (
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    )}
                                </div>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs opacity-70">
                                        {formatTime(msg.timestamp)}
                                    </span>
                                    {msg.sender !== 'system' && (
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleReaction(msg.id)}
                                                className="flex items-center space-x-1 hover:bg-white/10 rounded-full px-2 py-1 transition-colors"
                                            >
                                                <Heart size={12} className="text-red-400" />
                                                <span className="text-xs">{msg.reactions}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {msg.sender === currentSpeaker && (
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getCharacterGradient(msg.sender)} flex items-center justify-center text-sm mb-1`}>
                                    {characters[msg.sender]?.avatar}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex items-end space-x-2 justify-start">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getCharacterGradient(currentSpeaker === 'maya' ? 'alex' : 'maya')} flex items-center justify-center text-sm mb-1`}>
                            {characters[currentSpeaker === 'maya' ? 'alex' : 'maya']?.avatar}
                        </div>
                        <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl rounded-bl-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Story Prompts */}
            <div className="p-4 bg-black/20 border-t border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                    <Star size={16} className="text-yellow-400" />
                    <span className="text-sm font-medium">แรงบันดาลใจ</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                    {storyPrompts.map((prompt, index) => (
                        <button
                            key={index}
                            onClick={() => setInput(prompt)}
                            className="px-3 py-1 bg-purple-500/20 border border-purple-300/30 text-purple-200 rounded-full text-xs hover:bg-purple-500/30 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>

                {/* Character Selector */}
                <div className="flex items-center space-x-2 mb-3">
                    <span className="text-sm">พูดในนาม:</span>
                    <div className="flex space-x-2">
                        {Object.entries(characters).filter(([key]) => key !== 'system').map(([key, char]) => (
                            <button
                                key={key}
                                onClick={() => setCurrentSpeaker(key as 'maya' | 'alex')}
                                className={`px-3 py-1 rounded-full text-xs transition-colors ${currentSpeaker === key
                                        ? `bg-gradient-to-br ${char.color} text-white`
                                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                {char.avatar} {char.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div className="flex items-center space-x-2">
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
                        placeholder="เขียนเรื่องราวของคุณ..."
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-white/50 backdrop-blur-sm"
                        disabled={isTyping}
                    />
                    <button
                        onClick={() => handleSendMessage(input)}
                        disabled={!input.trim() || isTyping}
                        className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NovelChatApp;