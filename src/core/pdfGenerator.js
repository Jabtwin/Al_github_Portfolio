"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
const puppeteer_1 = __importDefault(require("puppeteer"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const types_1 = require("../types");
async function generatePDF(data, outputPath) {
    const templatePath = path_1.default.join(__dirname, '../../templates/portfolio.hbs');
    const cssPath = path_1.default.join(__dirname, '../../templates/styles.css');
    const templateHtml = fs_1.default.readFileSync(templatePath, 'utf8');
    const cssContent = fs_1.default.readFileSync(cssPath, 'utf8');
    const template = handlebars_1.default.compile(templateHtml);
    const html = template({
        ...data,
        style: `<style>${cssContent}</style>`
    });
    const browser = await puppeteer_1.default.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
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
//# sourceMappingURL=pdfGenerator.js.map