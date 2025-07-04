import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Heart, Clock, Settings, PlusCircle, Edit, Trash2, X } from 'lucide-react';

// Interface definitions
interface Message {
    id: number;
    sender: string;
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

    // Initial characters
    const [characters, setCharacters] = useState<Character[]>([
        {
            id: 'maya',
            name: 'มายา',
            avatar: '🌸',
            status: 'online',
            color: 'from-pink-300 to-rose-400',
            personality: 'นักเขียนสาวผู้เปี่ยมด้วยจินตนาการ'
        },
        {
            id: 'alex',
            name: 'อเล็กซ์',
            avatar: '🎭',
            status: 'online',
            color: 'from-blue-300 to-indigo-400',
            personality: 'นักดนตรีหนุ่มผู้ลึกลับ'
        },
        {
            id: 'system',
            name: 'ผู้เล่าเรื่อง',
            avatar: '📚',
            status: 'online',
            color: 'from-amber-300 to-orange-400',
            personality: 'ผู้บอกเล่าเรื่องราว'
        }
    ]);

    const [currentSpeaker, setCurrentSpeaker] = useState<string>('alex');
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showAddCharacterModal, setShowAddCharacterModal] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
    const [newCharacter, setNewCharacter] = useState<Omit<Character, 'status'>>({
        id: '', name: '', avatar: '', color: '', personality: ''
    });
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Default values for new character form
    const defaultCharacterValues = {
        id: 'new-character',
        name: 'ตัวละครใหม่',
        avatar: '😊',
        color: 'from-green-300 to-teal-400',
        personality: 'บุคลิกอ่อนโยนและเป็นมิตร'
    };

    // Color options for characters
    const colorOptions = [
        { name: 'ชมพู', value: 'from-pink-300 to-rose-400' },
        { name: 'น้ำเงิน', value: 'from-blue-300 to-indigo-400' },
        { name: 'เขียว', value: 'from-green-300 to-teal-400' },
        { name: 'ม่วง', value: 'from-purple-300 to-violet-400' },
        { name: 'ส้ม', value: 'from-orange-300 to-red-400' },
        { name: 'เหลือง', value: 'from-yellow-300 to-amber-400' },
        { name: 'เทา', value: 'from-gray-300 to-slate-400' }
    ];

    // Emojis for message emotions
    const emotionEmojis = {
        happy: '😊',
        sad: '😢',
        love: '💕',
        angry: '😤',
        excited: '🎉'
    };

    // Function to scroll messages to the bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Helper to get character object by ID
    const getCharacterById = useCallback((id: string) => {
        return characters.find(char => char.id === id);
    }, [characters]);

    // Effect for scrolling and reading progress
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle sending a message
    const handleSendMessage = (text: string) => {
        if (!text.trim() || isTyping || isLoadingResponse) return;

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
            const audio = new Audio('/sound/sendPop.mp3');
            audio.play().catch(e => console.error("Error playing sound:", e));
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
        return getCharacterById(senderId)?.color || 'from-gray-300 to-slate-400';
    };

    // Handle adding a new character
    const handleAddCharacter = () => {
        if (!newCharacter.id || !newCharacter.name || !newCharacter.avatar || !newCharacter.color || !newCharacter.personality) {
            console.log('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        if (characters.some(char => char.id === newCharacter.id)) {
            console.log('ID ตัวละครนี้มีอยู่แล้ว กรุณาใช้ ID อื่น');
            return;
        }

        setCharacters(prev => [...prev, { ...newCharacter, status: 'online' }]);
        setNewCharacter(defaultCharacterValues);
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
        setShowAddCharacterModal(false);
    };

    // Handle deleting a character
    const handleDeleteCharacter = (id: string) => {
        if (true) {
            setCharacters(prev => prev.filter(char => char.id !== id));
            if (currentSpeaker === id) {
                const remainingSpeakers = characters.filter(c => c.id !== 'system' && c.id !== id);
                if (remainingSpeakers.length > 0) {
                    setCurrentSpeaker(remainingSpeakers[0].id);
                } else {
                    setCurrentSpeaker('system');
                }
            }
        }
    };

    // Open add character modal with default values
    const openAddCharacterModal = () => {
        setEditingCharacter(null);
        setNewCharacter(defaultCharacterValues);
        setShowAddCharacterModal(true);
    };

    // Prepare character options for the selector, excluding 'system'
    const selectableCharacters = characters.filter(char => char.id !== 'system');

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800 font-inter antialiased">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg p-4 border-b border-gray-200 shadow-sm">
                <div className="max-w-lg mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-3xl">📚</div>
                            <div>
                                <h1 className="font-bold text-2xl text-gray-800">
                                    Novel Chat
                                </h1>
                                <p className="text-sm text-gray-600">เรื่องราวแห่งความรักที่เลือกได้</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowSettings(true)}
                                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                                aria-label="Settings"
                            >
                                <Settings size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto w-full">
                {messages.map((msg) => (
                    <div key={msg.id} className="space-y-2">
                        <div className={`flex items-end space-x-2 ${msg.sender === currentSpeaker && msg.sender !== 'system'
                            ? 'justify-end'
                            : 'justify-start'
                            }`}>
                            {/* Avatar for others' messages */}
                            {msg.sender !== currentSpeaker && msg.sender !== 'system' && (
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getCharacterGradient(msg.sender)} flex items-center justify-center text-lg mb-1 flex-shrink-0 shadow-sm border border-white`}>
                                    {getCharacterById(msg.sender)?.avatar}
                                </div>
                            )}

                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ease-out ${msg.sender === 'system'
                                ? 'bg-amber-50 border border-amber-200 text-amber-800 text-center mx-auto rounded-lg'
                                : msg.sender === currentSpeaker
                                    ? `bg-gradient-to-br ${getCharacterGradient(msg.sender)} text-white rounded-br-sm`
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                                }`}>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs font-medium opacity-70">
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
                                <div className="flex items-center justify-between mt-2 opacity-60">
                                    <span className="text-xs">
                                        <Clock size={12} className="inline-block mr-1" />
                                        {formatTime(msg.timestamp)}
                                    </span>
                                    {msg.sender !== 'system' && (
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => handleReaction(msg.id)}
                                                className="flex items-center space-x-1 p-1 rounded-full hover:bg-black/10 transition-colors"
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
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getCharacterGradient(msg.sender)} flex items-center justify-center text-lg mb-1 flex-shrink-0 shadow-sm border border-white`}>
                                    {getCharacterById(msg.sender)?.avatar}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Typing Indicator */}
                {(isTyping || isLoadingResponse) && (
                    <div className="flex items-end space-x-2 justify-start">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getCharacterGradient(currentSpeaker === selectableCharacters[0]?.id ? selectableCharacters[1]?.id : selectableCharacters[0]?.id)} flex items-center justify-center text-lg mb-1 border border-white`}>
                            {getCharacterById(currentSpeaker === selectableCharacters[0]?.id ? selectableCharacters[1]?.id : selectableCharacters[0]?.id)?.avatar}
                        </div>
                        <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 z-10 p-4 bg-white/80 border-t border-gray-200 backdrop-blur-lg">
                <div className="max-w-lg mx-auto">
                    {/* Character Selector */}
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-gray-600">พูดในนาม:</span>
                        <div className="flex flex-wrap gap-2">
                            {selectableCharacters.map((char) => (
                                <button
                                    key={char.id}
                                    onClick={() => setCurrentSpeaker(char.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 ease-in-out flex items-center space-x-1 border
                                        ${currentSpeaker === char.id
                                            ? `bg-gradient-to-br ${char.color} text-white border-transparent shadow-md`
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
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
                            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isTyping || isLoadingResponse}
                        />
                        <button
                            onClick={() => handleSendMessage(input)}
                            disabled={!input.trim() || isTyping || isLoadingResponse}
                            className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                            aria-label="Send message"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative border">
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                            aria-label="Close settings"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">ตั้งค่า</h2>

                        {/* General Settings */}
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-gray-700">ทั่วไป</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">เปิด/ปิดเสียง:</span>
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className={`px-4 py-2 rounded-full text-sm transition-colors shadow-md
                ${soundEnabled ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                >
                                    {soundEnabled ? 'เปิด' : 'ปิด'}
                                </button>
                            </div>
                        </div>

                        {/* Character Management */}
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-gray-700">จัดการตัวละคร</h3>
                            <button
                                onClick={openAddCharacterModal}
                                className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold transition-colors shadow-md mb-4"
                            >
                                <PlusCircle size={18} />
                                <span>เพิ่มตัวละครใหม่</span>
                            </button>

                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {characters.filter(c => c.id !== 'system').map((char) => (
                                    <div key={char.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${char.color} flex items-center justify-center text-lg`}>
                                                {char.avatar}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">{char.name}</div>
                                                <div className="text-xs text-gray-600 truncate w-32">{char.personality}</div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setEditingCharacter(char);
                                                    setNewCharacter(char);
                                                    setShowAddCharacterModal(true);
                                                }}
                                                className="p-1.5 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-600 transition-colors"
                                                aria-label={`Edit ${char.name}`}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCharacter(char.id)}
                                                className="p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
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
                            className="w-full mt-6 bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-md font-semibold transition-colors shadow-lg"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Edit Character Modal */}
            {showAddCharacterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm relative border border-gray-300">
                        <button
                            onClick={() => setShowAddCharacterModal(false)}
                            className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                            aria-label="Close add/edit character modal"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                            {editingCharacter ? 'แก้ไขตัวละคร' : 'เพิ่มตัวละครใหม่'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="characterId" className="block text-sm font-medium text-gray-700 mb-1">ID (ไม่ซ้ำกัน):</label>
                                <input
                                    type="text"
                                    id="characterId"
                                    value={newCharacter.id}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    disabled={!!editingCharacter}
                                    placeholder="เช่น maya, alex"
                                />
                            </div>
                            <div>
                                <label htmlFor="characterName" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ:</label>
                                <input
                                    type="text"
                                    id="characterName"
                                    value={newCharacter.name}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="เช่น มายา, อเล็กซ์"
                                />
                            </div>
                            <div>
                                <label htmlFor="characterAvatar" className="block text-sm font-medium text-gray-700 mb-1">อวตาร (Emoji):</label>
                                <input
                                    type="text"
                                    id="characterAvatar"
                                    value={newCharacter.avatar}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, avatar: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    maxLength={2}
                                    placeholder="เช่น 🌸, 🎭"
                                />
                            </div>
                            <div>
                                <label htmlFor="characterColor" className="block text-sm font-medium text-gray-700 mb-1">สี:</label>
                                <select
                                    id="characterColor"
                                    value={newCharacter.color}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, color: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    {colorOptions.map((color, index) => (
                                        <option key={index} value={color.value}>
                                            {color.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="characterPersonality" className="block text-sm font-medium text-gray-700 mb-1">บุคลิก:</label>
                                <textarea
                                    id="characterPersonality"
                                    value={newCharacter.personality}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, personality: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 h-20 resize-none"
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
        </div>)
}

export default NovelChatApp;