const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/dashboard/analyze/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add userName to analyze-video-url
const analyzeUrlRegex = /body: JSON\.stringify\(\{\s*videoUrl: queryUrl,\s*userId\s*\}\),/;
const analyzeUrlReplacement = `body: JSON.stringify({ videoUrl: queryUrl, userId, userName: user?.firstName || user?.username || 'Creator' }),`;
content = content.replace(analyzeUrlRegex, analyzeUrlReplacement);

// 2. Add userName to analyze-video (for upload tab if it exists)
// It might be FormData, so let's check. 
// For now, let's replace startChat logic.
const startChatRegex = /const startChat = async \(\) => \{[\s\S]*?finally \{\s*setIsSending\(false\);\s*\}\s*\};/;
const startChatReplacement = `const startChat = async () => {
        setIsChatMode(true);
        const firstName = user?.firstName || user?.username || 'there';
        const initialMsg = { role: 'assistant', content: \`Hey \${firstName}! I've just watched this video. Ask me anything about its hook, pacing, or psychology!\` };
        setMessages([initialMsg]);

        const savedId = await saveSessionState([initialMsg]);
        if (savedId) setSessionId(savedId);
    };`;

content = content.replace(startChatRegex, startChatReplacement);

// 3. Add userName to creative-director-chat POST
const chatRegex = /body: JSON\.stringify\(\{\s*messages: newMessages,\s*dna: result\.analysis,\s*userId,\s*isRoastMode\s*\}\)/;
const chatReplacement = `body: JSON.stringify({
                        messages: newMessages,
                        dna: result.analysis,
                        userId,
                        userName: user?.firstName || user?.username || 'Creator',
                        isRoastMode
                    })`;
content = content.replace(chatRegex, chatReplacement);

fs.writeFileSync(file, content);
console.log("Updated analyze page with chat personalization.");
