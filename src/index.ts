import { Command } from 'commander';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { processPortfolio } from './core/relevanceEngine';
import { generatePDF } from './core/pdfGenerator';
import dotenv from 'dotenv';

dotenv.config();

const program = new Command();

program
  .name('ai-portfolio')
  .description('CLI to generate an AI-tailored GitHub portfolio PDF')
  .version('1.0.0')
  .requiredOption('-u, --user <username>', 'GitHub username')
  .requiredOption('-j, --jd <path>', 'Path to the Job Description text file')
  .requiredOption('-o, --output <path>', 'Output path for the generated PDF');

program.parse();

const options = program.opts();

async function main() {
  const spinner = ora();
  
  try {
    spinner.start('Reading Job Description...');
    const jdPath = path.resolve(process.cwd(), options.jd);
    const jdContent = fs.readFileSync(jdPath, 'utf8');
    spinner.succeed('Job Description loaded.');
    
    spinner.start(`Fetching data and letting AI analyze projects for @${options.user}...`);
    const githubToken = process.env.GITHUB_TOKEN;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!githubToken || !geminiKey) {
      throw new Error("Missing API keys in .env");
    }
    const portfolioData = await processPortfolio(options.user, jdContent, githubToken, geminiKey);
    spinner.succeed(`AI analysis complete. Selected top ${portfolioData.projects.length} projects.`);
    
    spinner.start(`Generating beautiful PDF...`);
    const outputPath = path.resolve(process.cwd(), options.output);
    await generatePDF(portfolioData, outputPath);
    spinner.succeed(`Portfolio successfully generated at: ${outputPath}`);
    
  } catch (error: any) {
    spinner.fail(`Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

main();
