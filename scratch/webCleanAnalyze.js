const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/dashboard/analyze/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the two-column layout with just the Chat
const dashboardStart = content.indexOf('{/* Result Dashboard */}');
const chatStart = content.indexOf('{/* Strategy Lounge Chat */}');

if (dashboardStart !== -1 && chatStart !== -1) {
    const beforeDashboard = content.substring(0, dashboardStart);
    let restOfContent = content.substring(chatStart);

    // Make the chat full width by replacing its class
    restOfContent = restOfContent.replace(
        /className="w-full xl:w-1\/2 xl:sticky xl:top-24 bg-white border border-slate-100 xl:rounded-\[2\.5rem\] xl:shadow-sm animate-fade-in flex flex-col xl:p-8"/,
        `className="w-full max-w-4xl mx-auto bg-white border border-slate-100 xl:rounded-[2.5rem] xl:shadow-sm animate-fade-in flex flex-col xl:p-8"`
    );

    content = beforeDashboard + restOfContent;
}

// Remove the Action Buttons
const actionsRegex = /\{\/\* Director Actions \*\/\}\s*<div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-50">[\s\S]*?<\/div>\s*<\/div>/;
content = content.replace(actionsRegex, '');

// Save changes
fs.writeFileSync(file, content);
console.log("Updated analyze page to remove dashboard and action buttons.");
