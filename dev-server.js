import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 CepatRetur Local Dev Server running on:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`=================================`);
});
