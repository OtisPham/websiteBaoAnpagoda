const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pagodaAppDir = 'c:\\Users\\ADMIN\\Desktop\\pagoda-app';
const pagodaWebDir = 'c:\\Users\\ADMIN\\Desktop\\pagodaweb';

// 1. Update pagoda-app package.json
const pkgPath = path.join(pagodaAppDir, 'package.json');
console.log('Reading:', pkgPath);
const pkgContent = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkgContent.dependencies = pkgContent.dependencies || {};
pkgContent.dependencies['expo-print'] = '~14.0.3';
pkgContent.dependencies['expo-sharing'] = '~13.0.1';
pkgContent.dependencies['react-native-webview'] = '13.12.5';

fs.writeFileSync(pkgPath, JSON.stringify(pkgContent, null, 2) + '\n', 'utf8');
console.log('Successfully updated pagoda-app package.json');

// 2. Copy modules.d.ts
const srcFile = path.join(pagodaWebDir, 'src', 'types', 'modules.d.ts');
const destDir = path.join(pagodaAppDir, 'src', 'types');
const destFile = path.join(destDir, 'modules.d.ts');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}
fs.copyFileSync(srcFile, destFile);
console.log(`Copied ${srcFile} to ${destFile}`);

// 3. Run tsc in pagoda-app
console.log('--- Running npx tsc --noEmit in pagoda-app ---');
try {
  const outApp = execSync('npx tsc --noEmit', { cwd: pagodaAppDir, encoding: 'utf8' });
  console.log('pagoda-app tsc output:', outApp || 'ZERO ERRORS');
} catch (err) {
  console.error('pagoda-app tsc failed:\n', err.stdout || err.message);
  process.exit(1);
}

// 4. Run tsc in pagodaweb
console.log('--- Running npx tsc --noEmit in pagodaweb ---');
try {
  const outWeb = execSync('npx tsc --noEmit', { cwd: pagodaWebDir, encoding: 'utf8' });
  console.log('pagodaweb tsc output:', outWeb || 'ZERO ERRORS');
} catch (err) {
  console.error('pagodaweb tsc failed:\n', err.stdout || err.message);
  process.exit(1);
}

console.log('ALL TASKS COMPLETED SUCCESSFULLY!');
