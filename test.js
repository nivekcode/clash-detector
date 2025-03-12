const fs = require('fs');
const path = require('path');
const cssTree = require('css-tree');

const stylesFolderPath = path.join(__dirname, 'stylesheets');

const processCSSFiles = async () => {
    try {
        const files = await fs.readdirSync(stylesFolderPath);
        const cssFiles = files.filter(file => file.endsWith('.css'));

        if (cssFiles.length < 2) {
            console.error('Need at least two CSS files to compare.');
            return;
        }

        const allSelectors = [];

        cssFiles.map((filePath) => {
            const buffer = fs.readFileSync(path.join(stylesFolderPath, filePath));
            const content = buffer.toString();
            const ast = cssTree.parse(content);

            const selectors = [];

            cssTree.walk(ast, function (node) {
                if (node.type === 'Selector') {
                    selectors.push(cssTree.generate(node)); // Convert back to CSS string
                }
            });

            allSelectors.push(selectors);
        });

        console.log('Matches', getMatches(allSelectors));
    } catch (err) {
        console.error('Error processing CSS files:', err.message);
    }
};

function getMatches(allSelectors) {
    const selecotrsFromFirstFile = allSelectors[0];
    const selecotrsFromSecondFile = allSelectors[1];

    const matches = [];

    for(const firstFileSelector of selecotrsFromFirstFile){
        if(selecotrsFromSecondFile.includes(firstFileSelector)){
            matches.push(firstFileSelector);
        }
    }
    return matches;
}

// Run the script
processCSSFiles();
