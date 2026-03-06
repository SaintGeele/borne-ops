const fetch = require('node-fetch');
(async () => {
  const base = process.env.X_API_BASE || 'https://api.twitter.com/2';
  console.log('Base:', base);
})();
