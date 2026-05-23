"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPortfolio = processPortfolio;
const github_1 = require("../api/github");
const llm_1 = require("../api/llm");
const types_1 = require("../types");
async function processPortfolio(username, jd) {
    const allRepos = await (0, github_1.fetchUserRepos)(username);
    const recentRepos = allRepos.slice(0, 15);
    for (const repo of recentRepos) {
        repo.readme = await (0, github_1.fetchReadme)(username, repo.name);
    }
    const aiResult = await (0, llm_1.analyzeReposWithJD)(recentRepos, jd);
    const selectedRepos = aiResult.selected_repos
        .map(aiRepo => {
        const originalRepo = recentRepos.find(r => r.name === aiRepo.repo_name);
        if (!originalRepo)
            return null;
        return { ...originalRepo, ...aiRepo };
    })
        .filter(Boolean)
        .sort((a, b) => (b.match_score - a.match_score));
    return {
        user: {
            username,
        },
        projects: selectedRepos,
    };
}
//# sourceMappingURL=relevanceEngine.js.map