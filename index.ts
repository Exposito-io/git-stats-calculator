import { gitStats, GitStat } from './lib/git-stats'
import * as GitHubApi from 'github'
import { getGithubUserFromCommit } from './lib/get-github-user-from-commit'
import { PaymentDestination } from 'models'
import * as fs from 'fs-extra'
import * as simplegit from 'simple-git'

const configRepoPath = './repos'

let github = new GitHubApi()

export async function getGithubStats(repoUrl: string) {
    let repo = getGithubRepoInfoFromUrl(repoUrl)
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

    return stats
    
}

export { GitStat }






function getGithubRepoInfoFromUrl(repoUrl: string) {
    if (typeof repoUrl !== 'string')
        throw('Invalid URL')

    // Remove first and last /
    if (repoUrl[0] === '/')
        repoUrl = repoUrl.substr(1, repoUrl.length - 1)

    if (repoUrl[repoUrl.length - 1] === '/')
        repoUrl = repoUrl.substr(0, repoUrl.length - 1)

    let parts = repoUrl.split('/')

    if (parts.length !== 2)
        throw('Invalid URL')

    
    return { 
        owner: parts[0], 
        repo: parts[1] 
    }
}









console.log('fawe')

/*
gitStats({ dir: './'})
.then(stats => {
    stats.forEach((value, key) => {
        console.log(`${key}:  ${value.linesOfCode}  |  ${value.files.length}`)
    }) 
})
.catch(err => {
    console.log(err)
})*/
getGithubStats('macor161/ts-money')
.then(result => {
    //for(let file of files) {
        console.log(result)
    //}
})
.catch(err => {
    console.log(err)
})

/*
getGithubUserFromCommit({ 
    owner: 'macor161',
    repo: 'ts-money',
    commit: '814aee8581f3159babb059e543259962c942d09f'
})
.then(result => {
    //for(let file of files) {
        console.log(result)
    //}
})
.catch(err => {
    console.log(err)
})*/

/*
gitLsFiles()
.then(files => {
    for(let file of files) {
        console.log(files)
    }
})
.catch(err => {
    console.log(err)
})*/