const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to fix trailing spaces and ensure file ends with newline
function fixFileIssues(filePath) {
  console.log(`Fixing file: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix trailing spaces
  content = content.replace(/[ \t]+$/gm, '');

  // Ensure file ends with a newline
  if (!content.endsWith('\n')) {
    content += '\n';
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

// Function to recursively find all TypeScript files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules' && file !== 'build' && file !== 'dist') {
      findTsFiles(filePath, fileList);
    } else if (
      stat.isFile() &&
      (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

try {
  // Run manual fixes first
  console.log('Fixing issues manually...');
  const srcPath = path.join(__dirname, 'src');
  const files = findTsFiles(srcPath);

  files.forEach(file => {
    fixFileIssues(file);
  });

  // Then run eslint
  console.log('\nRunning ESLint --fix...');
  execSync('npx eslint . --fix', { stdio: 'inherit' });

  console.log('\nAll fixes applied. Run npm run lint to verify.');
} catch (error) {
  console.error('Error:', error.message);
}
