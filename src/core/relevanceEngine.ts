import { fetchUserRepos, fetchReadme } from '../api/github';
import { analyzeReposWithJD } from '../api/llm';
import { PortfolioData } from '../types';

export async function processPortfolio(username: string, jd: string, githubToken: string, geminiKey: string): Promise<PortfolioData> {
  const allRepos = await fetchUserRepos(username, githubToken);
  
  const recentRepos = allRepos.slice(0, 15);
  
  for (const repo of recentRepos) {
    repo.readme = await fetchReadme(username, repo.name, githubToken);
  }
  
  const aiResult = await analyzeReposWithJD(recentRepos, jd, geminiKey);
  
  const selectedRepos = aiResult.selected_repos
    .map(aiRepo => {
      const originalRepo = recentRepos.find(r => r.name === aiRepo.repo_name);
      if (!originalRepo) return null;
      return { ...originalRepo, ...aiRepo };
    })
    .filter(Boolean)
    .sort((a, b) => (b!.match_score - a!.match_score));
    
  return {
    user: {
      username,
    },
    projects: selectedRepos as any,
  };
}
