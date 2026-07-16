const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update min-h-screen background
content = content.replace(
    `bg-gradient-to-br from-lime-50 via-lime-50 to-slate-50 text-gray-900`,
    `bg-gradient-to-br from-slate-950 to-lime-950 text-white`
);

// 2. Update nav
content = content.replace(
    `nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-lime-100 transition-all duration-300"`,
    `nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 transition-all duration-300"`
);

// 3. Update nav buttons and text
content = content.replace(
    /bg-slate-900 text-white/g,
    `bg-lime-500 text-slate-950`
);
content = content.replace(
    `hover:bg-lime-500 hover:text-slate-900`,
    `hover:bg-white hover:text-slate-950`
);

// 4. Update hero section background
content = content.replace(
    `border-lime-200 bg-white`,
    `border-white/10 bg-transparent`
);
content = content.replace(
    `border-b md:border-b-0 md:border-r border-lime-200`,
    `border-b md:border-b-0 md:border-r border-white/10`
);

// 5. Update text colors in hero
content = content.replace(
    `text-slate-900 mb-6 group-hover:text-lime-600`,
    `text-white mb-6 group-hover:text-lime-400`
);
content = content.replace(
    `text-gray-500`,
    `text-white/70`
);

// 6. Update section backgrounds
content = content.replace(
    `section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-white"`,
    `section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-transparent"`
);
content = content.replace(
    `section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-slate-50"`,
    `section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-transparent"`
);
content = content.replace(
    `section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-[#F8FAFC]"`,
    `section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 bg-transparent"`
);
content = content.replace(
    `bg-white p-8 sm:p-12 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group`,
    `bg-white/5 backdrop-blur-sm p-8 sm:p-12 rounded-2xl sm:rounded-[2.5rem] border border-white/10 shadow-sm hover:shadow-lime-500/10 transition-all group hover:border-lime-500/30`
);

// Replace specific text colors
content = content.replace(/text-slate-900/g, 'text-white');
content = content.replace(/text-slate-500/g, 'text-white/60');
content = content.replace(/text-slate-700/g, 'text-white/80');

// Replace specific borders
content = content.replace(/border-slate-100/g, 'border-white/10');
content = content.replace(/border-slate-200/g, 'border-white/10');

// Specific section backgrounds that were missed
content = content.replace(/bg-slate-50/g, 'bg-white/5');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Website updated to dark linear gradient theme.");
