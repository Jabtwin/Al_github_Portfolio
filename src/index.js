"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const ora_1 = __importDefault(require("ora"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const relevanceEngine_1 = require("./core/relevanceEngine");
const pdfGenerator_1 = require("./core/pdfGenerator");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const program = new commander_1.Command();
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
    const spinner = (0, ora_1.default)();
    try {
        spinner.start('Reading Job Description...');
        const jdPath = path_1.default.resolve(process.cwd(), options.jd);
        const jdContent = fs_1.default.readFileSync(jdPath, 'utf8');
        spinner.succeed('Job Description loaded.');
        spinner.start(`Fetching data and letting AI analyze projects for @${options.user}...`);
        const portfolioData = await (0, relevanceEngine_1.processPortfolio)(options.user, jdContent);
        spinner.succeed(`AI analysis complete. Selected top ${portfolioData.projects.length} projects.`);
        spinner.start(`Generating beautiful PDF...`);
        const outputPath = path_1.default.resolve(process.cwd(), options.output);
        await (0, pdfGenerator_1.generatePDF)(portfolioData, outputPath);
        spinner.succeed(`Portfolio successfully generated at: ${outputPath}`);
    }
    catch (error) {
        spinner.fail(`Error: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map