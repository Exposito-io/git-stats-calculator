import { gitStats, GitStat } from './git-stats'
import * as GitHubApi from 'github'
import * as dbFactory from 'mongo-factory'
import { getGithubUserFromCommit } from './get-github-user-from-commit'
import { PaymentDestination } from 'models'
import * as fs from 'fs-extra'
import * as simplegit from 'simple-git'
import config from '../config'
import { getGithubLastCommit } from './get-github-last-commit'

const configRepoPath = config.reposPath

let github = new GitHubApi()
github.authenticate({
    token: config.githubToken,
    type: 'oauth'
})

export async function getGithubStats(repo: { owner: string, repo: string }): Promise<Stats> {
    let repoPath = `${configRepoPath}/${repo.owner}/${repo.repo}`
    let repoInfo = (await github.repos.get({ owner: repo.owner, repo: repo.repo })).data
    let git

    if (!fs.existsSync(repoPath)) {
        await fs.mkdirs(`${configRepoPath}`)
        git = simplegit(`${configRepoPath}`)
        await git.clone(repoInfo.clone_url, `${repo.owner}/${repo.repo}`, [ '--bare' ])
    }

    git = simplegit(repoPath)
    
    await git.fetch('origin', 'master')

    let authorStats = await gitStats({ dir: repoPath })

    for(let stat of authorStats) {
        let githubUser = await getGithubUserFromCommit({ 
            owner: repoInfo.owner.login,
            repo: repoInfo.name,
            commit: stat.commitSample 
        })

        stat.availablePaymentMethods = githubUser.availablePaymentsMethods
        stat.image = githubUser.avatar_url
    }

    return { 
        owner: repo.owner,
        repo: repo.repo,
        authors: authorStats.map(author => { delete author.commitSample; return author }),
        totalLinesOfCode: authorStats.reduce((totalLines, author) => totalLines + author.linesOfCode, 0),
        totalFileCount: authorStats.reduce((totalFiles, author) => totalFiles + author.fileCount, 0),
        lastCommit: (await getGithubLastCommit({ owner: repo.owner, repo: repo.repo })).sha
    }
    
}

export class Stats {
    owner: string
    repo: string
    authors: any[]
    totalLinesOfCode: number
    totalFileCount: number
    lastCommit: string
}






