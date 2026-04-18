#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const flagPath = path.join(os.homedir(), '.claude', '.hivemind-active');

let input = '';
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = (data.prompt || '').trim().toLowerCase();

    if (prompt.startsWith('/hm-compress')) {
      const level = prompt.split(/\s+/)[1] || 'heavy';
      if (['normal', 'lite', 'heavy', 'ultra'].includes(level)) {
        fs.mkdirSync(path.dirname(flagPath), { recursive: true });
        fs.writeFileSync(flagPath, level);
      }
    }

    if (/\bstop hivemind\b/i.test(prompt)) {
      try { fs.unlinkSync(flagPath); } catch (e) {}
    }
  } catch (e) {}
});
