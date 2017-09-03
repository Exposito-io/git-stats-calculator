import { getGithubStats, Stats } from './lib/get-github-stats'
import { getGithubLastCommit } from './lib/get-github-last-commit'
import { getGitHubUserPaymentMethods } from './lib/get-github-user-from-commit'
import config from './config'
import * as dbFactory from 'mongo-factory'
import { Collection } from 'mongodb'


async function calculateStats(params: { owner: string, repo: string }) {
    let db = await dbFactory.getConnection(config.mongoUrl)
    let repoStatsCol = db.collection('repo-stats') as Collection

    let stats = await repoStatsCol.findOne(params) as Stats
    let lastCommit = await getGithubLastCommit(params)

    
    if (stats == null || stats.lastCommit !== lastCommit.sha) {
        let results = await getGithubStats(params)
        await repoStatsCol.updateOne({ owner: results.owner, repo: results.repo }, { $set: { 
            authors: results.authors,
            lastCommit: results.lastCommit,
            totalLinesOfCode: results.totalLinesOfCode,
            totalFileCount: results.totalFileCount
        } }, { upsert: true })
        console.log(results)
    }
    else {
        console.log(`${params.owner}/${params.repo} stats already up to date. Only updating payment methods`)

        // TODO: Update authors
        let authors = stats.authors
        for(let i = 0; i < authors.length; i++) {
            //getGitHubUserPaymentMethods(authors[i].)
        }
    }
    return
}

calculateStats({ owner: 'MikeMcl', repo: 'bignumber.js'})
.then(() => {
    console.log('done')
})