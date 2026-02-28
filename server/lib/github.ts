import { Octokit } from '@octokit/rest';

async function getAccessToken(): Promise<string> {
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }
  throw new Error('GitHub not configured. Set GITHUB_TOKEN environment variable.');
}

export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}
