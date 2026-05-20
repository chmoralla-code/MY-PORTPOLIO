const fs = require('fs');
const content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

function findMatches(query) {
  console.log(`\n--- Matches for "${query}" ---`);
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(query.toLowerCase())) {
      console.log(`${idx + 1}: ${line.trim()}`);
    }
  });
}

findMatches('avatar');
findMatches('profile_avatar');
findMatches('upload');
findMatches('update');
