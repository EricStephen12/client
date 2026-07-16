const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'analyze', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStart = `                                {/* Strategy Lounge Chat */}`;
const startIndex = content.indexOf(targetStart);

if (startIndex === -1) {
    console.error("COULD NOT FIND START");
    process.exit(1);
}

const newEnding = `                                {/* Strategy Lounge Chat */}
                                {isChatMode && (
                                    <div className="w-full flex flex-col animate-fade-in relative z-20" style={{ minHeight: 'calc(100vh - 220px)' }}>
                                        <div className="flex-1 w-full pb-8">
                                            <div className="max-w-7xl mx-auto w-full space-y-4 md:space-y-6">
                                                {messages.map((msg, idx) => (
                                                    <div key={idx} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                                                        <div className={\`max-w-[95%] sm:max-w-[90%] md:max-w-[85%] p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-sm \${msg.type === 'brief'
                                                            ? 'bg-gradient-to-br from-slate-950 to-lime-950 text-white border-2 sm:border-4 border-lime-500/20'
                                                            : msg.role === 'user'
                                                                ? 'bg-slate-900 text-white rounded-tr-none'
                                                                : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                                                            }\`}>
                                                            {msg.type === 'brief' && (
                                                                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-white/10">
                                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-lime-500 text-slate-950 rounded-lg sm:rounded-xl flex items-center justify-center font-serif italic text-lg sm:text-xl shadow-lg">B</div>
                                                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-lime-400">Director Brief Forged</span>
                                                                </div>
                                                            )}
                                                            <p className={\`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap \${msg.type === 'brief' ? 'font-serif text-gray-100' : ''}\`}>{msg.content}</p>
                                                            {msg.type === 'brief' && msg.raw && (
                                                                <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-4">
                                                                    <button
                                                                        onClick={() => generateHookVariations(msg.raw)}
                                                                        disabled={isSending}
                                                                        className="px-6 py-3 bg-lime-600 hover:bg-lime-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md hover:shadow-lime-500/20 disabled:opacity-50 active:scale-95 flex items-center gap-2 cursor-pointer"
                                                                    >
                                                                        ⚡ Generate Hook Variations
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {msg.role === 'assistant' && msg.type !== 'brief' && (
                                                                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-50 flex gap-4 sm:gap-6 items-center">
                                                                    <button 
                                                                        onClick={() => handleFeedback(idx, 'up')}
                                                                        className={\`hover:scale-110 transition-transform \${msg.feedback === 'up' ? 'text-lime-500' : 'text-slate-400'}\`}
                                                                    >
                                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={msg.feedback === 'up' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708C19.746 10 20.5 10.852 20.5 11.852c0 .324-.078.636-.231.912l-2.455 4.39A2.5 2.5 0 0115.656 18H10V10z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 18H5a2 2 0 01-2-2v-4a2 2 0 012-2h5v8z" /></svg>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleFeedback(idx, 'down')}
                                                                        className={\`hover:scale-110 transition-transform \${msg.feedback === 'down' ? 'text-red-400' : 'text-slate-400'}\`}
                                                                    >
                                                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill={msg.feedback === 'down' ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.292C4.254 14 3.5 13.148 3.5 12.148c0-.324.078-.636.231-.912l2.455-4.39A2.5 2.5 0 018.344 6H14v8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 6h5a2 2 0 012 2v4a2 2 0 01-2 2h-5V6z" /></svg>
                                                                    </button>
                                                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">Director Feedback</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {isSending && (
                                                    <div className="flex justify-start">
                                                        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-[2.5rem] rounded-tl-none border border-slate-100 shadow-sm flex gap-2">
                                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-lime-500 rounded-full animate-bounce" />
                                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-lime-500 rounded-full animate-bounce delay-75" />
                                                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-lime-500 rounded-full animate-bounce delay-150" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="sticky bottom-4 lg:bottom-8 mt-auto z-40 pointer-events-none pb-4 lg:pb-0">
                                            <div className="pointer-events-auto max-w-5xl mx-auto relative group bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/50 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)] focus-within:ring-2 focus-within:ring-lime-200 transition-all">
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <input
                                                        type="text"
                                                        value={chatInput}
                                                        onChange={(e) => setChatInput(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') sendMessage();
                                                        }}
                                                        placeholder="Discuss strategy with your Creative Director..."
                                                        className="flex-1 bg-transparent border-none rounded-3xl px-6 py-4 text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-0"
                                                        disabled={isSending}
                                                    />
                                                    <div className="flex items-center justify-end gap-2 px-2 pb-2 sm:px-0 sm:pb-0">
                                                        <button
                                                            onClick={forgeDirectorBrief}
                                                            disabled={isSending || messages.length < 1}
                                                            title="Forge Director Brief"
                                                            className="p-4 bg-lime-50 text-lime-600 rounded-2xl hover:bg-lime-100 transition-colors disabled:opacity-30 flex items-center justify-center"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={sendMessage}
                                                            disabled={isSending || !chatInput.trim()}
                                                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-lime-600 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                                                        >
                                                            Send
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="px-5 pb-3 pt-1 flex items-center gap-3">
                                                    <div className={\`w-1.5 h-1.5 rounded-full \${isRoastMode ? 'bg-red-500 animate-pulse' : 'bg-lime-500'}\`} />
                                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                                        {isRoastMode ? 'Roast Mode' : 'Creative Lounge'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
            </div>
        </>
    );
}
`;

content = content.substring(0, startIndex) + newEnding;

fs.writeFileSync(filePath, content, 'utf8');
console.log("Chat layout fixed to standard document flow with sticky input.");
