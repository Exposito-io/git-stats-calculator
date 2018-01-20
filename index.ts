import { getGithubStats, Stats } from './lib/get-github-stats'
import { getGithubLastCommit } from './lib/get-github-last-commit'
import { getGitHubUserPaymentMethods } from './lib/get-github-user-from-commit'
import * as dbFactory from 'mongo-factory'
import { Collection } from 'mongodb'
import config from './config'
import * as Queue from 'bull'

let repoStatsQueue = new Queue('repo-stats', 'redis://127.0.0.1:6379')

async function processQueue() {
    return new Promise((res, rej) => {
        repoStatsQueue.process(async (job, done) => {
            console.log(`processing job: ${job.data.owner}/${job.data.repo}`)
            let results = await Promise.all([calculateStats({ owner: job.data.owner, repo: job.data.repo }), timeout(8000)])
            //let stats = await calculateStats({ owner: job.data.owner, repo: job.data.repo })
            let stats = results[0]
            
            done(null, stats)
        })
    })
}


function timeout(ms: number) {
    return new Promise(res => {
        setTimeout(() => res(), ms)
    })
}


async function calculateStats(params: { owner: string, repo: string }): Promise<Stats> {
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
        return results
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

processQueue()
.then(() => {
    console.log('done')
})