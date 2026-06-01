const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /#E46A28/gi, to: '#10B981' },
  { from: /#762C1B/gi, to: '#065F46' },
  { from: /#F4C056/gi, to: '#34D399' },
  { from: /#FFF9F2/gi, to: '#F9FAFB' },
  { from: /#FFF4E2/gi, to: '#F3F4F6' },
  { from: /#FEF0D4/gi, to: '#E5E7EB' },
  { from: /#FAFAF8/gi, to: '#FFFFFF' },
  { from: /#8B3520/gi, to: '#047857' },
  { from: /#2d1f17/gi, to: '#1F2937' },
  { from: /#1a1715/gi, to: '#111827' },
  { from: /#1A1715/gi, to: '#111827' },
  { from: /rgba\(228,\s*106,\s*40/g, to: 'rgba(16, 185, 129' },
  { from: /rgba\(118,\s*44,\s*27/g, to: 'rgba(6, 95, 70' },
  { from: /rgba\(244,\s*192,\s*86/g, to: 'rgba(52, 211, 153' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const rep of replacements) {
        if (content.match(rep.from)) {
          content = content.replace(rep.from, rep.to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'components'));
console.log('Done!');
