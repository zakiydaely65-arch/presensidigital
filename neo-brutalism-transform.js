const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove gradients
    content = content.replace(/bg-gradient-to-[a-z]+ from-[a-zA-Z0-9/-]+ (via-[a-zA-Z0-9/-]+ )?to-[a-zA-Z0-9/-]+/g, 'bg-white');
    
    // Replace rounded corners with none
    content = content.replace(/rounded-(xl|2xl|3xl|\[[a-zA-Z0-9.]+\])/g, 'rounded-none border-2 border-black');
    
    // Replace shadows with solid neo shadows
    content = content.replace(/shadow-(sm|md|lg|xl|2xl|inner|premium)/g, 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]');
    content = content.replace(/shadow-\[.*?\]/g, 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]');
    
    // Borders to solid black
    content = content.replace(/border-slate-[0-9]+/g, 'border-black');
    content = content.replace(/border-white(\/[0-9]+)?/g, 'border-black');
    content = content.replace(/border-indigo-[0-9]+/g, 'border-black');
    content = content.replace(/border-emerald-[0-9]+/g, 'border-black');
    content = content.replace(/border-amber-[0-9]+/g, 'border-black');
    content = content.replace(/border-rose-[0-9]+/g, 'border-black');
    
    // Specific text colors to black
    content = content.replace(/text-slate-[56789]00/g, 'text-black font-bold');
    content = content.replace(/text-primary/g, 'text-black font-black');
    
    // Backgrounds
    content = content.replace(/bg-slate-[5]0/g, 'bg-[#FF90E8]'); // Give it a neo brutalism pop color
    content = content.replace(/bg-indigo-50/g, 'bg-[#FFE600]');

    // Remove backdrop-blur
    content = content.replace(/backdrop-blur-(sm|md|lg|xl|2xl|\[.*?\])/g, '');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'app'));
