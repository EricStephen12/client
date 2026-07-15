const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/components/PricingSection.tsx');
let content = fs.readFileSync(file, 'utf8');

const creatorFeaturesRegex = /features: \[\s*'30 Studio Scans \/ mo',\s*'30 Strategy Briefs \/ mo',\s*'Creative Lounge Access',\s*'Standard Report Suite',\s*'Community Support'\s*\]/;
const studioFeaturesRegex = /features: \[\s*'250 Studio Scans \/ mo',\s*'250 Strategy Briefs \/ mo',\s*'Priority AI Speed',\s*'Advanced PDF Exports',\s*'Direct Strategy Response'\s*\]/;

const newCreatorFeatures = `features: [
                '30 Studio Scans / mo',
                'Up to 5 minute videos',
                '30 Strategy Briefs / mo',
                'Creative Lounge Access',
                'Standard Report Suite'
            ]`;

const newStudioFeatures = `features: [
                '250 Studio Scans / mo',
                'Up to 30 minute videos',
                '250 Strategy Briefs / mo',
                'Priority AI Speed',
                'Advanced PDF Exports'
            ]`;

if (creatorFeaturesRegex.test(content) && studioFeaturesRegex.test(content)) {
    content = content.replace(creatorFeaturesRegex, newCreatorFeatures);
    content = content.replace(studioFeaturesRegex, newStudioFeatures);
    fs.writeFileSync(file, content);
    console.log("Updated PricingSection.tsx successfully.");
} else {
    console.log("Failed to find feature lists.");
}
