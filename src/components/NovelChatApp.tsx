import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, PlusCircle, Edit, Trash2, X, ChevronLeft, ChevronRight, Volume2, VolumeX, Users, AppWindow, Text } from 'lucide-react';

// Interface definitions
interface Message {
    id: number;
    sender: string;
    text: string;
    timestamp?: Date;
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

// Character avatar component
const CharacterAvatar = ({ character, size = "md" }: { character: Character; size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-base",
        md: "w-10 h-10 text-lg",
        lg: "w-12 h-12 text-xl"
    };

    return (
        <div className={`rounded-full bg-gradient-to-br ${character.color} flex items-center justify-center shadow-sm border-2 border-white ${sizeClasses[size]}`}>
            {character.avatar}
        </div>
    );
};

// Message bubble component
const MessageBubble = ({
    message,
    character,
    isCurrentSpeaker
}: {
    message: Message;
    character?: Character;
    isCurrentSpeaker: boolean;
}) => {
    // const formatTime = (date: Date) => {
    //     return date.toLocaleTimeString('th-TH', {
    //         hour: '2-digit',
    //         minute: '2-digit'
    //     });
    // };

    // Center system messages
    if (message.sender === 'system') {
        return (
            <div className="flex justify-center my-2">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 text-sm max-w-[90%] text-center">
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    {/* <div className="flex items-center justify-center mt-1 text-amber-700 text-xs">
                        <Clock size={12} className="inline-block mr-1" />
                        {formatTime(message.timestamp)}
                    </div> */}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-end space-x-2 ${isCurrentSpeaker ? 'justify-end' : 'justify-start'} my-2`}>
            {!isCurrentSpeaker && character && (
                <CharacterAvatar character={character} size="sm" />
            )}

            <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ease-out
        ${isCurrentSpeaker
                    ? `bg-gradient-to-br ${character?.color || 'from-blue-500 to-indigo-500'} text-white rounded-br-sm`
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                }`}
            >
                {character && (
                    <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs font-medium ${isCurrentSpeaker ? 'text-white/80' : 'text-gray-600'}`}>
                            {character.name}
                        </span>
                    </div>
                )}

                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>

                {/* <div className={`flex items-center justify-between mt-2 ${isCurrentSpeaker ? 'text-white/70' : 'text-gray-500'}`}>
                    <span className="text-[8px] flex items-center">
                        <Clock size={8} className="inline-block mr-1" />
                        {formatTime(message.timestamp)}
                    </span>
                </div> */}
            </div>

            {isCurrentSpeaker && character && (
                <CharacterAvatar character={character} size="sm" />
            )}
        </div>
    );
};

// Character selector component for mobile
const MobileCharacterSelector = ({
    characters,
    currentSpeaker,
    setCurrentSpeaker,
    disabled
}: {
    characters: Character[];
    currentSpeaker: string;
    setCurrentSpeaker: (id: string) => void;
    disabled: boolean;
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const idx = characters.findIndex(char => char.id === currentSpeaker);
        if (idx !== -1) setCurrentIndex(idx);
    }, [currentSpeaker, characters]);

    const handlePrev = () => {
        const newIndex = (currentIndex - 1 + characters.length) % characters.length;
        setCurrentIndex(newIndex);
        setCurrentSpeaker(characters[newIndex].id);
    };

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % characters.length;
        setCurrentIndex(newIndex);
        setCurrentSpeaker(characters[newIndex].id);
    };

    const currentChar = characters[currentIndex];

    return (
        <div className="flex items-center justify-between w-full mb-3">
            <button
                onClick={handlePrev}
                disabled={disabled}
                className="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-50"
            >
                <ChevronLeft size={18} />
            </button>

            <div className="flex items-center space-x-2 px-4">
                <CharacterAvatar character={currentChar} size="md" />
                <div>
                    <div className="font-medium text-gray-800">{currentChar.name}</div>
                    <div className="text-xs text-gray-600">{currentChar.personality}</div>
                </div>
            </div>

            <button
                onClick={handleNext}
                disabled={disabled}
                className="p-2 rounded-full bg-white border border-gray-200 disabled:opacity-50"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

// Color option component
const ColorOption = ({
    color,
    selected,
    onSelect
}: {
    color: { name: string; value: string };
    selected: boolean;
    onSelect: () => void;
}) => {
    return (
        <button
            onClick={onSelect}
            className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors
        ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
        >
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color.value}`}></div>
            <span className="text-sm">{color.name}</span>
        </button>
    );
};

// Main app component
const NovelChatApp: React.FC = () => {
    // Configurable app settings
    const [appConfig, setAppConfig] = useState({
        title: 'Novel Chat',
        subtitle: 'เรื่องหลอน ๆ ของ Dev นอนน้อย',
        systemName: 'ผู้เล่าเรื่อง',
        systemAvatar: '📚',
        systemColor: 'from-amber-400 to-orange-500'
    });

    // Initial messages
    const [messages, setMessages] = useState<Message[]>([]);

    // Initial characters
    const [characters, setCharacters] = useState<Character[]>([
        {
            id: '1',
            name: 'มอส',
            avatar: '👨‍💻',
            status: 'online',
            color: 'from-blue-400 to-indigo-500',
            personality: 'โปรแกรมเมอร์นอนน้อย'
        },
        {
            id: '2',
            name: 'มายา',
            avatar: '👩‍💻',
            status: 'online',
            color: 'from-pink-400 to-rose-500',
            personality: 'นักทดสอบระบบจอมระเบียบ'
        },
        {
            id: 'system',
            name: appConfig.systemName,
            avatar: appConfig.systemAvatar,
            status: 'online',
            color: appConfig.systemColor,
            personality: 'ผู้บอกเล่าเรื่องราว'
        }
    ]);

    const [currentSpeaker, setCurrentSpeaker] = useState<string>('1');
    const [input, setInput] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showAddCharacterModal, setShowAddCharacterModal] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
    const [newCharacter, setNewCharacter] = useState<Omit<Character, 'status'>>({
        id: '', name: '', avatar: '', color: '', personality: ''
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Default values for new character form
    const defaultCharacterValues = {
        id: 'new-character',
        name: 'ตัวละครใหม่',
        avatar: '😊',
        color: 'from-green-400 to-teal-500',
        personality: 'บุคลิกอ่อนโยนและเป็นมิตร'
    };

    // Color options for characters
    const colorOptions = [
        { name: 'ชมพู', value: 'from-pink-400 to-rose-500' },
        { name: 'น้ำเงิน', value: 'from-blue-400 to-indigo-500' },
        { name: 'เขียว', value: 'from-green-400 to-teal-500' },
        { name: 'ม่วง', value: 'from-purple-400 to-violet-500' },
        { name: 'ส้ม', value: 'from-orange-400 to-red-500' },
        { name: 'เหลือง', value: 'from-yellow-400 to-amber-500' },
        { name: 'เทา', value: 'from-gray-400 to-slate-500' }
    ];

    // Function to scroll messages to the bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Helper to get character object by ID
    const getCharacterById = (id: string) => {
        return characters.find(char => char.id === id);
    };

    useEffect(() => {
        if (messages.length === 0) {
            const initialMessage: Message = {
                id: 1,
                sender: 'system',
                text: '📖 เรื่องราวของเรากำลังจะเริ่มต้น...',
                // timestamp: new Date(Date.now() - 300000),
                isRead: true
            };
            setMessages([initialMessage]);
        }
    }, [messages.length]);

    // Effect for scrolling and reading progress
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update system character when config changes
    useEffect(() => {
        setCharacters(prev =>
            prev.map(char =>
                char.id === 'system'
                    ? {
                        ...char,
                        name: appConfig.systemName,
                        avatar: appConfig.systemAvatar,
                        color: appConfig.systemColor
                    }
                    : char
            )
        );
    }, [appConfig]);

    // Handle sending a message
    const handleSendMessage = (text: string) => {
        if (!text.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            sender: currentSpeaker,
            text: text.trim(),
            // timestamp: new Date(),
            isRead: true
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');
    };

    // Handle adding a new character
    const handleAddCharacter = () => {
        if (!newCharacter.id || !newCharacter.name || !newCharacter.avatar || !newCharacter.color || !newCharacter.personality) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        if (characters.some(char => char.id === newCharacter.id)) {
            alert('ID ตัวละครนี้มีอยู่แล้ว กรุณาใช้ ID อื่น');
            return;
        }

        setCharacters(prev => [...prev, { ...newCharacter, status: 'online' }]);
        setNewCharacter(defaultCharacterValues);
        setShowAddCharacterModal(false);
    };

    // Handle editing an existing character
    const handleEditCharacter = () => {
        if (!newCharacter.name || !newCharacter.avatar || !newCharacter.color || !newCharacter.personality) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        setCharacters(prev => prev.map(char =>
            char.id === editingCharacter?.id ? { ...newCharacter, status: char.status } : char
        ));
        setEditingCharacter(null);
        setNewCharacter(defaultCharacterValues);
        setShowAddCharacterModal(false);
    };

    // Handle deleting a character
    const handleDeleteCharacter = (id: string) => {
        if (id === 'system') {
            alert('ไม่สามารถลบผู้เล่าเรื่องได้');
            return;
        }

        const remainingCharacters = characters.filter(char => char.id !== id);
        if (remainingCharacters.length < 2) {
            alert('ต้องมีตัวละครอย่างน้อย 2 ตัว (รวมผู้เล่าเรื่อง)');
            return;
        }

        if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบตัวละครนี้?`)) {
            setCharacters(remainingCharacters);
            if (currentSpeaker === id) {
                const availableSpeakers = remainingCharacters.filter(c => c.id !== 'system');
                if (availableSpeakers.length > 0) {
                    setCurrentSpeaker(availableSpeakers[0].id);
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
    const selectableCharacters = characters;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800 font-inter antialiased">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg p-3 sm:p-4 border-b border-gray-200 shadow-sm">
                <div className="max-w-3xl mx-auto w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="text-2xl sm:text-3xl">📚</div>
                            <div>
                                <h1 className="font-bold text-xl sm:text-2xl text-gray-800">
                                    {appConfig.title}
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600">{appConfig.subtitle}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowSettings(true)}
                                className="p-1.5 sm:p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                                aria-label="Settings"
                            >
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 max-w-3xl mx-auto w-full space-y-2 sm:space-y-4">
                {messages.map((msg) => {
                    const character = getCharacterById(msg.sender);
                    const isCurrentSpeaker = msg.sender === currentSpeaker;

                    return (
                        <div key={msg.id} className="space-y-1 sm:space-y-2">
                            <MessageBubble
                                message={msg}
                                character={character}
                                isCurrentSpeaker={isCurrentSpeaker}
                            />
                        </div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 z-10 p-3 sm:p-4 bg-white/90 border-t border-gray-200 backdrop-blur-lg">
                <div className="max-w-3xl mx-auto">
                    {/* Mobile Character Selector */}
                    <MobileCharacterSelector
                        characters={selectableCharacters}
                        currentSpeaker={currentSpeaker}
                        setCurrentSpeaker={setCurrentSpeaker}
                        disabled={false}
                    />

                    {/* Input Field and Send Button */}
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
                            placeholder={`พิมพ์ข้อความในนามของ ${getCharacterById(currentSpeaker)?.name}...`}
                            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 placeholder-gray-500 text-sm shadow-sm"
                        />
                        <button
                            onClick={() => handleSendMessage(input)}
                            disabled={!input.trim()}
                            className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                            aria-label="Send message"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md relative border border-gray-300 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowSettings(false)}
                            className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                            aria-label="Close settings"
                        >
                            <X size={18} />
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">ตั้งค่า</h2>

                        {/* App Settings */}
                        <div className="mb-4 sm:mb-6 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                            <h3 className="text-md sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-700">การตั้งค่าแอพ</h3>
                            <div className="space-y-2">
                                <div>
                                    <label htmlFor="appTitle" className="text-sm text-gray-700 mb-1 flex items-center gap-1.5">
                                        <AppWindow size={14} />
                                        ชื่อแอพ:
                                    </label>
                                    <input
                                        id="appTitle"
                                        type="text"
                                        value={appConfig.title}
                                        onChange={(e) => setAppConfig({ ...appConfig, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="appSubtitle" className="text-sm text-gray-700 mb-1 flex items-center gap-1.5">
                                        <Text size={14} />
                                        คำอธิบาย:
                                    </label>
                                    <input
                                        id="appSubtitle"
                                        type="text"
                                        value={appConfig.subtitle}
                                        onChange={(e) => setAppConfig({ ...appConfig, subtitle: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Character Management */}
                        <div className="mb-4 sm:mb-6 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                            <h3 className="text-md sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-700 flex items-center gap-2">
                                <Users size={18} />
                                จัดการตัวละคร
                            </h3>

                            <button
                                onClick={openAddCharacterModal}
                                className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-colors shadow-md mb-3 text-sm sm:text-base"
                            >
                                <PlusCircle size={16} />
                                <span>เพิ่มตัวละครใหม่</span>
                            </button>

                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {characters.map((char) => (
                                    <div
                                        key={char.id}
                                        className="flex items-center justify-between bg-white p-2 sm:p-3 rounded-lg border border-gray-200 shadow-sm"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <CharacterAvatar character={char} size="sm" />
                                            <div>
                                                <div className="font-medium text-sm text-gray-800">{char.name}</div>
                                                <div className="text-xs text-gray-600 truncate w-32">{char.personality}</div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => {
                                                    setEditingCharacter(char);
                                                    setNewCharacter(char);
                                                    setShowAddCharacterModal(true);
                                                }}
                                                className="p-1 rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-600 transition-colors"
                                                aria-label={`Edit ${char.name}`}
                                            >
                                                <Edit size={14} />
                                            </button>
                                            {char.id !== 'system' && (
                                                <button
                                                    onClick={() => handleDeleteCharacter(char.id)}
                                                    className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                                                    aria-label={`Delete ${char.name}`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* General Settings */}
                        <div className="mb-4 sm:mb-6 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">เปิด/ปิดเสียง:</span>
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm rounded-full transition-colors shadow-md
        ${soundEnabled ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                        <span>{soundEnabled ? 'เปิด' : 'ปิด'}</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Character Modal */}
            {showAddCharacterModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-md relative border border-gray-300 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowAddCharacterModal(false)}
                            className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                            aria-label="Close add/edit character modal"
                        >
                            <X size={18} />
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">
                            {editingCharacter ? 'แก้ไขตัวละคร' : 'เพิ่มตัวละครใหม่'}
                        </h2>
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <label htmlFor="characterId" className="block text-sm text-gray-700 mb-1">ID (ไม่ซ้ำกัน):</label>
                                <input
                                    type="text"
                                    id="characterId"
                                    value={newCharacter.id}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, id: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                    disabled={!!editingCharacter}
                                    placeholder="เช่น maya, alex"
                                />
                            </div>
                            <div>
                                <label htmlFor="characterName" className="block text-sm text-gray-700 mb-1">ชื่อ:</label>
                                <input
                                    type="text"
                                    id="characterName"
                                    value={newCharacter.name}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                    placeholder="เช่น มายา, มอส"
                                />
                            </div>
                            <div>
                                <label htmlFor="characterAvatar" className="block text-sm text-gray-700 mb-1">อวตาร (Emoji):</label>
                                <input
                                    type="text"
                                    id="characterAvatar"
                                    value={newCharacter.avatar}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, avatar: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                                    maxLength={2}
                                    placeholder="เช่น 🌸, 🎭"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">สี:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {colorOptions.map((color, index) => (
                                        <ColorOption
                                            key={index}
                                            color={color}
                                            selected={newCharacter.color === color.value}
                                            onSelect={() => setNewCharacter({ ...newCharacter, color: color.value })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="characterPersonality" className="block text-sm text-gray-700 mb-1">บุคลิก:</label>
                                <textarea
                                    id="characterPersonality"
                                    value={newCharacter.personality}
                                    onChange={(e) => setNewCharacter({ ...newCharacter, personality: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm h-20 resize-none"
                                    placeholder="เช่น นักเขียนสาวผู้เปี่ยมด้วยจินตนาการ"
                                />
                            </div>
                        </div>
                        <button
                            onClick={editingCharacter ? handleEditCharacter : handleAddCharacter}
                            className="w-full mt-4 sm:mt-6 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-2 rounded-lg font-medium transition-colors shadow-lg text-sm sm:text-base"
                        >
                            {editingCharacter ? 'บันทึกการแก้ไข' : 'เพิ่มตัวละคร'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NovelChatApp;
