import { Octokit } from '@octokit/rest';
import { Repo } from '../types';

export async function fetchUserRepos(username: string, token: string): Promise<Repo[]> {
  const octokit = new Octokit({ auth: token });
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
      language: repo.language || null,
      stars: repo.stargazers_count || 0,
      fork: repo.fork,
      updated_at: repo.updated_at || '',
    }));
}

export async function fetchReadme(owner: string, repo: string, token: string): Promise<string> {
  const octokit = new Octokit({ auth: token });
  try {
    const { data } = await octokit.repos.getReadme({
      owner,
      repo,
      mediaType: {
        format: 'raw',
      },
    });

    const content = data as unknown as string;
    return content.substring(0, 2000);
  } catch (error) {
    return '';
  }
}
