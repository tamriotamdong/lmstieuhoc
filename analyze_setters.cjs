const fs = require('fs');

const content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
const lines = content.split('\n');

// 1. Find all useState declarations and extract the setter names
const setters = [];
lines.forEach(line => {
  const match = line.match(/const\s+\[\s*[^,]+,\s*([a-zA-Z0-9_]+)\s*\]\s*=\s*useState/);
  if (match) {
    setters.push(match[1]);
  }
});

console.log(`Found ${setters.length} state setters in AdminPanel.tsx.`);

// 2. Scan every line of the file for usage of these setters
lines.forEach((line, index) => {
  const lineNum = index + 1;
  const trimmed = line.trim();
  
  setters.forEach(setter => {
    // Check if the line contains the setter name followed by a parenthesis
    const regex = new RegExp(`\\b${setter}\\s*\\(`);
    if (regex.test(trimmed)) {
      // It is called! Let's see if it is in a safe context or not.
      
      // Safe conditions:
      const isInsideArrowFunction = trimmed.includes('=>');
      const isClickOrChange = trimmed.startsWith('onClick') || 
                              trimmed.startsWith('onChange') || 
                              trimmed.startsWith('onSubmit') ||
                              trimmed.startsWith('onSelect') ||
                              trimmed.startsWith('onHover') ||
                              trimmed.startsWith('onClose') ||
                              trimmed.startsWith('onConfirm');
      const isComment = trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*');
      
      if (!isInsideArrowFunction && !isClickOrChange && !isComment) {
        // Let's check backwards for a function declaration or useEffect
        let isInsideSafeBlock = false;
        for (let i = index; i >= Math.max(0, index - 50); i--) {
          const prevLine = lines[i].trim();
          if (prevLine.includes('useEffect') || 
              prevLine.includes('useState') ||
              prevLine.startsWith('const handle') || 
              prevLine.startsWith('const on') || 
              prevLine.startsWith('function ') ||
              prevLine.includes('setTimeout') ||
              prevLine.includes('Promise') ||
              prevLine.includes('async ') ||
              prevLine.includes('then(')
          ) {
            isInsideSafeBlock = true;
            break;
          }
        }
        
        if (!isInsideSafeBlock) {
          console.log(`SUSPICIOUS CALL: Line ${lineNum} calls '${setter}': ${trimmed}`);
        }
      }
    }
  });
});
console.log('Deep analysis completed.');
