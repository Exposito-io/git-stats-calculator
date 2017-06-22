import { gitStats, GitStat } from './git-stats'
import * as GitHubApi from 'github'
import * as dbFactory from 'mongo-factory'
import { getGithubUserFromCommit } from './get-github-user-from-commit'
import { PaymentDestination } from 'models'
import * as fs from 'fs-extra'
import * as simplegit from 'simple-git'
import config from '../config'

const configRepoPath = config.reposPath

let github = new GitHubApi()

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

    let stats = await gitStats({ dir: repoPath })

    for(let s of stats) {
        let stat = s[1]
        let githubUser = await getGithubUserFromCommit({ 
            owner: repoInfo.owner.login,
            repo: repoInfo.name,
            commit: stat.author.commitSample 
        })

        stat.author.availablePaymentMethods = githubUser.availablePaymentsMethods
    }

    return { 
        owner: repo.owner,
        repo: repo.repo,
        authors: Array.from(stats.values()),
        lastCommit: ''
    }
    
}

export class Stats {
    owner: string
    repo: string
    authors: any[]
    lastCommit: string
}






