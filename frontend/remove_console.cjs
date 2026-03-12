const fs = require('fs');
const path = require('path');

function removeConsoleLogs(directory) {
  try {
    if (!fs.existsSync(directory)) {
      console.log(`Directory does not exist: ${directory}`);
      return;
    }

    const items = fs.readdirSync(directory);
    
    items.forEach(item => {
      const fullPath = path.join(directory, item);
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (item === 'node_modules' || item.startsWith('.')) {
          return;
        }
        
        if (stat.isDirectory()) {
          removeConsoleLogs(fullPath);
        } else if (/\.(js|jsx|ts|tsx)$/.test(item)) {
          processFile(fullPath);
        }
      } catch (err) {
        // Skip files that can't be accessed
      }
    });
  } catch (error) {
    console.error('Error reading directory:', error.message);
  }
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Track if any changes were made
    let changes = false;
    
    // PATTERN 1: Standard console.log() - single line
    let newContent = content.replace(/console\.(log|debug|info|warn|error)\([^;)]*\);?/g, (match) => {
      changes = true;
      return '';
    });
    
    // PATTERN 2: Multiline console.log(
    newContent = newContent.replace(/console\.(log|debug|info|warn|error)\([\s\S]*?\);/g, (match) => {
      changes = true;
      return '';
    });
    
    // PATTERN 3: console.log without semicolon
    newContent = newContent.replace(/console\.(log|debug|info|warn|error)\([\s\S]*?\)(?=\s*[\n\r]|$)/g, (match) => {
      changes = true;
      return '';
    });
    
    // PATTERN 4: console.log with template literals
    newContent = newContent.replace(/console\.(log|debug|info|warn|error)\(`[\s\S]*?`\)/g, (match) => {
      changes = true;
      return '';
    });
    
    // PATTERN 5: console.log with concatenation
    newContent = newContent.replace(/console\.(log|debug|info|warn|error)\([^)]*\+[^)]*\)/g, (match) => {
      changes = true;
      return '';
    });
    
    // PATTERN 6: console.log with object/array
    newContent = newContent.replace(/console\.(log|debug|info|warn|error)\(\{[\s\S]*?\}\)/g, (match) => {
      changes = true;
      return '';
    });
    
    newContent = newContent.replace(/console\.(log|debug|info|warn|error)\(\[[\s\S]*?\]\)/g, (match) => {
      changes = true;
      return '';
    });
    
    // Clean up multiple empty lines
    newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (changes) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Cleaned: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    return false;
    
  } catch (error) {
    console.log(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

// Function to scan for remaining console.logs
function scanForRemainingConsoles(directory) {
  console.log('\n🔍 Scanning for any remaining console.log statements...\n');
  let remaining = [];
  
  function scan(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (item === 'node_modules' || item.startsWith('.')) return;
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (/\.(js|jsx|ts|tsx)$/.test(item)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('console.')) {
            // Find line numbers
            const lines = content.split('\n');
            lines.forEach((line, index) => {
              if (line.includes('console.')) {
                remaining.push({
                  file: path.relative(process.cwd(), fullPath),
                  line: index + 1,
                  code: line.trim()
                });
              }
            });
          }
        } catch (err) {
          // Skip
        }
      }
    });
  }
  
  // FIXED: Use the directory parameter, not 'dir' variable
  scan(directory);
  
  if (remaining.length > 0) {
    console.log(`Found ${remaining.length} remaining console statements:\n`);
    remaining.forEach(item => {
      console.log(`📄 ${item.file}:${item.line}`);
      console.log(`   ${item.code}\n`);
    });
  } else {
    console.log('✨ No remaining console statements found!');
  }
  
  return remaining;
}

// Main execution
console.log('Current directory:', process.cwd());
console.log('=' .repeat(50));

const srcPath = path.join(process.cwd(), 'src');
if (fs.existsSync(srcPath)) {
  console.log('\n🔍 Starting aggressive console.log removal...\n');
  removeConsoleLogs(srcPath);
  
  // Scan for any remaining
  const remaining = scanForRemainingConsoles(srcPath);
  
  if (remaining.length > 0) {
    console.log('\n⚠️  Some console statements could not be automatically removed.');
    console.log('These might be in comments, strings, or complex patterns.');
    console.log('Please check the files listed above.');
  } else {
    console.log('\n✅ All console statements have been removed successfully!');
  }
  
} else {
  console.log('❌ src folder not found!');
}