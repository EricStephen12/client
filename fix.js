const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'analyze', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStart = `                                {!isChatMode && (
                                    <div className="w-full max-w-2xl mx-auto text-center space-y-8 py-20 animate-fade-in-up">
                                        <div className="text-6xl mb-6">🎉</div>
                                        <h3 className="text-3xl sm:text-4xl font-serif italic text-slate-900">Analysis Complete.</h3>
                                        <p className="text-slate-500 font-medium">Your video's DNA has been fully extracted. Ready to discuss strategy?</p>
                                        
                                        <button
                                            onClick={startChat}
                                            className="w-full py-6 sm:py-8 bg-slate-950 text-white rounded-xl sm:rounded-[2rem] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs hover:bg-lime-500 hover:text-slate-950 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-slate-950/20 flex items-center justify-center gap-4 sm:gap-6 group mx-auto"
                                        >
                                            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-lime-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                            Enter Strategy Lounge
                                            <span className="group-hover:translate-x-2 transition-transform">&rarr;</span>
                                        </button>
                                    </div>
                                )}`;

const rightBeforeThis = `                                                 {msg.role === 'assistant' && msg.type !== 'brief' && (`;

// We'll replace everything between targetStart and rightBeforeThis
const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(rightBeforeThis);

if (startIndex === -1 || endIndex === -1) {
    console.error("COULD NOT FIND START OR END", startIndex, endIndex);
    process.exit(1);
}

const replacement = targetStart + `
                                
                                {/* Strategy Lounge Chat */}
                                {isChatMode && (
                                    <div className="w-full max-w-7xl mx-auto bg-white border border-slate-100 xl:rounded-[2.5rem] xl:shadow-sm animate-fade-in flex flex-col xl:p-8" style={{ height: 'calc(100dvh - 120px)', minHeight: '600px' }}>
                                        <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pr-1 md:pr-4 custom-scrollbar">
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
`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Successfully fixed and widened chat!");
