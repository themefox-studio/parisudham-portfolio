const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const dataFile = path.join(__dirname, 'data', 'database.json');
const outDir = path.join(__dirname, 'preview_build');

console.log('Cleaning preview_build directory...');
if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
}

console.log('Copying public files...');
fs.cpSync(publicDir, outDir, { recursive: true });

console.log('Generating static data...');
const dbRaw = fs.readFileSync(dataFile, 'utf8');
const dbObj = JSON.parse(dbRaw);
// Remove users array for security
delete dbObj.users;
const staticDataJs = `window.STATIC_DB = ${JSON.stringify(dbObj, null, 2)};`;
fs.writeFileSync(path.join(outDir, 'js', 'static-data.js'), staticDataJs);

console.log('Patching main.js to use static data...');
const mainJsPath = path.join(outDir, 'js', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');
mainJs = mainJs.replace(
    /async function fetchSiteData\(\) \{[\s\S]*?\n\}/,
    `async function fetchSiteData() {\n    return window.STATIC_DB || { categories: [], products: [], siteDetails: {} };\n}`
);
fs.writeFileSync(mainJsPath, mainJs);

console.log('Injecting static-data.js into HTML files...');
const files = fs.readdirSync(outDir);
files.forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(outDir, file);
        let html = fs.readFileSync(filePath, 'utf8');
        // Inject script right before main.js
        html = html.replace(
            '<script src="js/main.js"></script>',
            '<script src="js/static-data.js"></script>\n    <script src="js/main.js"></script>'
        );
        fs.writeFileSync(filePath, html);
    }
});

console.log('Static preview build completed successfully in "preview_build" folder!');
