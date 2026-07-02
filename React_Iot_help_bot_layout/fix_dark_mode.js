const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    let original = content;

    // A regex to match className="..." or className={`...`}
    // This is simple and handles most cases without curly braces inside the string
    content = content.replace(/className=(["'`])(.*?)\1/g, (match, quote, classes) => {
        let newClasses = classes;
        
        const replacements = [
            { search: 'bg-white', add: 'dark:bg-zinc-900', check: 'dark:bg-' },
            { search: 'bg-slate-50', add: 'dark:bg-zinc-800/80', check: 'dark:bg-' },
            { search: 'bg-slate-100', add: 'dark:bg-zinc-800', check: 'dark:bg-' },
            { search: 'border-slate-200', add: 'dark:border-zinc-800', check: 'dark:border-' },
            { search: 'border-slate-300', add: 'dark:border-zinc-700', check: 'dark:border-' },
            { search: 'text-slate-950', add: 'dark:text-white', check: 'dark:text-' },
            { search: 'text-slate-900', add: 'dark:text-slate-100', check: 'dark:text-' },
            { search: 'text-slate-800', add: 'dark:text-slate-200', check: 'dark:text-' },
            { search: 'text-slate-700', add: 'dark:text-slate-300', check: 'dark:text-' },
            { search: 'text-slate-600', add: 'dark:text-slate-400', check: 'dark:text-' },
            { search: 'text-slate-500', add: 'dark:text-slate-400', check: 'dark:text-' }
        ];

        replacements.forEach(({ search, add, check }) => {
            // Only add if the search string exists and a dark version isn't already there
            if (newClasses.includes(search) && !newClasses.includes(add) && !newClasses.includes(check)) {
                // regex with word boundaries to avoid replacing parts of other classes
                const regex = new RegExp(`\\b${search}\\b`, 'g');
                newClasses = newClasses.replace(regex, `${search} ${add}`);
            }
        });

        // if there's a dynamic template string like className={`...`} we need to handle it too
        // but the regex above already captures the backticks.
        return `className=${quote}${newClasses}${quote}`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf-8');
        console.log(`Updated dark mode classes in: ${path.basename(file)}`);
        modifiedCount++;
    }
});

console.log(`\nDone! Successfully updated ${modifiedCount} files with dark mode styling.`);
