import { Octokit } from '@octokit/rest';

async function getAccessToken(): Promise<string> {
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }
  throw new Error('Set GITHUB_TOKEN environment variable.');
}

async function createRepo() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });

  const orgName = 'N-C-Group';
  const repoName = 'CaffiTrack-WebApp';

  try {
    await octokit.repos.get({ owner: orgName, repo: repoName });
    console.log('Repository already exists!');
    console.log(`URL: https://github.com/${orgName}/${repoName}`);
  } catch (e: any) {
    if (e.status === 404) {
      const { data: repo } = await octokit.repos.createInOrg({
        org: orgName,
        name: repoName,
        description: 'CaffiTrack Web App - Landing Page & Backend API for the CaffiTrack caffeine tracking mobile app',
        private: false,
        auto_init: false
      });
      console.log(`Repository created: ${repo.html_url}`);
    } else throw e;
  }
}

createRepo().catch(console.error);
