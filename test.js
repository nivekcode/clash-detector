const fs = require('fs').promises;
const path = require('path');

const stylesFolderPath = path.join(__dirname, 'stylesheets');

// Improved regex to correctly extract selectors and ignore @rules
const selectorRegex = /^([^{@]+)\s*\{/gm;

// Function to extract CSS selectors from CSS content
const extractSelectors = (cssContent) => {
    let selectors = [];
    let match;

    while ((match = selectorRegex.exec(cssContent)) !== null) {
        let rawSelector = match[1].trim();

        // Ignore empty selectors and @rules
        if (!rawSelector || rawSelector.startsWith('@')) continue;

        // Split multiple selectors (e.g., ".class1, .class2 {")
        let selectorList = rawSelector.split(',').map(sel => sel.trim());

        selectors.push(...selectorList);
    }

    console.log(`Extracted Selectors:`, selectors); // Debugging
    return selectors;
};

// Function to find matching selectors across multiple files
const findMatchingSelectors = (allSelectors) => {
    const selectorCount = new Map();

    // Count occurrences of each selector across all files
    allSelectors.flat().forEach(selector => {
        selectorCount.set(selector, (selectorCount.get(selector) || 0) + 1);
    });

    // Keep only selectors appearing in at least two files
    return [...selectorCount.entries()]
        .filter(([_, count]) => count > 1)
        .map(([selector]) => selector);
};

// Process all CSS files and find common selectors
const processCSSFiles = async () => {
    try {
        const files = await fs.readdir(stylesFolderPath);
        const cssFiles = files.filter(file => file.endsWith('.css'));

        if (cssFiles.length < 2) {
            console.error('Need at least two CSS files to compare.');
            return;
        }

        console.log(`Found ${cssFiles.length} CSS files:`, cssFiles);

        // Read all CSS files and extract selectors
        const allSelectors = await Promise.all(
            cssFiles.map(async (file) => {
                const filePath = path.join(stylesFolderPath, file);
                const cssContent = await fs.readFile(filePath, 'utf-8');
                return extractSelectors(cssContent);
            })
        );

        // Find common selectors
        const matchingSelectors = findMatchingSelectors(allSelectors);

        console.log('\nMatching selectors across files:', matchingSelectors.length ? matchingSelectors : 'None found');
    } catch (err) {
        console.error('Error processing CSS files:', err.message);
    }
};

// Run the script
processCSSFiles();
