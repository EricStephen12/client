const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/dashboard/page.tsx');
let content = fs.readFileSync(file, 'utf8');

const regex = /\{\[\s*\{\s*label: 'Scans Used',[\s\S]*?\]\.map\(\(stat, i\) => \(/;

const replacement = `{[
                                {
                                    label: 'Scans Used',
                                    value: (() => {
                                        const tier = profile?.plan_type || 'free';
                                        const scans = profile?.monthly_usage?.scans ?? 0;
                                        return \`\${scans} / \${getPlanLimit(tier)}\`;
                                    })(),
                                    subtext: (() => {
                                        const tier = profile?.plan_type || 'free';
                                        if (tier === 'studio') return 'Max 30m video length';
                                        if (tier === 'creator') return 'Max 5m video length';
                                        return 'Max 90s video length';
                                    })()
                                },
                                {
                                    label: 'Current Plan',
                                    value: getPlanLabel(profile?.plan_type || 'free'),
                                }
                            ].map((stat, i) => (`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    
    // Also need to render the subtext inside the map
    content = content.replace(/<p className="text-lg sm:text-2xl font-sans font-bold text-slate-900">\{stat\.value\}<\/p>/, 
    `<p className="text-lg sm:text-2xl font-sans font-bold text-slate-900">{stat.value}</p>\n                                    {stat.subtext && <p className="text-[10px] font-medium text-slate-500 mt-1">{stat.subtext}</p>}`);

    fs.writeFileSync(file, content);
    console.log("Updated dashboard/page.tsx successfully.");
} else {
    console.log("Failed to find target in dashboard/page.tsx");
}
