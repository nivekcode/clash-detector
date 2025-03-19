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


        const matchedSelectors = getMatches(allSelectors);

        console.log('Matches', matchedSelectors);

        cssFiles.map((filePath, index) => {
            const buffer = fs.readFileSync(path.join(stylesFolderPath, filePath));
            const content = buffer.toString();
            const ast = cssTree.parse(content);
            console.log(`Matches from file ${index}: `, getCssRulesForSelectors(matchedSelectors, ast));
        });
    } catch (err) {
        console.error('Error processing CSS files:', err.message);
    }
};

function getMatches(allSelectors) {
    const selecotrsFromFirstFile = allSelectors[0];
    const selecotrsFromSecondFile = allSelectors[1];

    const matches = [];

    for (const firstFileSelector of selecotrsFromFirstFile) {
        if (selecotrsFromSecondFile.includes(firstFileSelector)) {
            matches.push(firstFileSelector);
        }
    }
    return matches;
}

function getCssRulesForSelectors(selectors, ast) {
    const matchedRules = [];

    cssTree.walk(ast, {
        visit: 'Rule',
        enter(node) {
            if (node.prelude.type === 'SelectorList') {
                const selectorString = cssTree.generate(node.prelude);
                if (selectors.some(sel => selectorString.includes(sel))) {
                    const properties = cssTree.generate(node.block);
                    matchedRules.push(`${selectorString} ${properties}`);
                }
            }
        }
    });

    return matchedRules;
}

// Run the script
processCSSFiles();
