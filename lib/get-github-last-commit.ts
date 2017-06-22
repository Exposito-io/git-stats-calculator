import * as GitHubApi from 'github'

let github = new GitHubApi()


export async function getGithubLastCommit(params: { owner: string, repo: string }) {
    let commits = await github.repos.getCommits({ owner: params.owner, repo: params.repo, per_page: 1})
    return commits.data[0]
}