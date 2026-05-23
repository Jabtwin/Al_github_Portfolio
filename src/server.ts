import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { processPortfolio } from './core/relevanceEngine';
import { generatePDF } from './core/pdfGenerator';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from 'public' and project root
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../')));

app.post('/api/generate', async (req, res) => {
  const { username, githubToken, geminiKey, jd } = req.body;

  if (!username || !githubToken || !geminiKey || !jd) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const portfolioData = await processPortfolio(username, jd, githubToken, geminiKey);
    
    const outputDir = path.join(__dirname, '../../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const outputPath = path.join(outputDir, `${username}_portfolio.pdf`);
    await generatePDF(portfolioData, outputPath);
    
    res.download(outputPath, `${username}_Portfolio.pdf`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
    });

  } catch (error: any) {
    console.error('Generation Error:', error);
    res.status(500).send(error.message || 'Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
