import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { PortfolioData } from '../types';

export async function generatePDF(data: PortfolioData, outputPath: string): Promise<void> {
  const templatePath = path.join(__dirname, '../../templates/portfolio.hbs');
  const cssPath = path.join(__dirname, '../../templates/styles.css');
  
  const templateHtml = fs.readFileSync(templatePath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  const template = Handlebars.compile(templateHtml);
  
  const html = template({
    ...data,
    style: `<style>${cssContent}</style>`
  });
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '40px',
      right: '40px',
      bottom: '40px',
      left: '40px'
    }
  });
  
  await browser.close();
}
