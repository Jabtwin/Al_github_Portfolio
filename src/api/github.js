"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserRepos = fetchUserRepos;
exports.fetchReadme = fetchReadme;
const rest_1 = require("@octokit/rest");
const dotenv_1 = __importDefault(require("dotenv"));
const types_1 = require("../types");
dotenv_1.default.config();
const octokit = new rest_1.Octokit({
    auth: process.env.GITHUB_TOKEN,
});
async function fetchUserRepos(username) {
    const { data } = await octokit.repos.listForUser({
        username,
        type: 'owner',
        sort: 'updated',
        per_page: 100,
    });
    return data
        .filter((repo) => !repo.fork)
        .map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count || 0,
        fork: repo.fork,
        updated_at: repo.updated_at || '',
    }));
}
async function fetchReadme(owner, repo) {
    try {
        const { data } = await octokit.repos.getReadme({
            owner,
            repo,
            mediaType: {
                format: 'raw',
            },
        });
        const content = data;
        return content.substring(0, 2000);
    }
    catch (error) {
        return '';
    }
}
//# sourceMappingURL=github.js.map