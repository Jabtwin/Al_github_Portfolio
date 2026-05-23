export interface Repo {
    name: string;
    url: string;
    description: string | null;
    language: string | null;
    stars: number;
    fork: boolean;
    updated_at: string;
    readme?: string;
}
export interface AIResponseRepo {
    repo_name: string;
    match_score: number;
    tailored_summary: string;
    highlighted_skills: string[];
}
export interface AIResponse {
    selected_repos: AIResponseRepo[];
}
export interface PortfolioData {
    user: {
        username: string;
        name?: string;
        avatarUrl?: string;
    };
    projects: (Repo & AIResponseRepo)[];
}
//# sourceMappingURL=index.d.ts.map