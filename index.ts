import { getGithubStats, Stats } from './lib/get-github-stats'
import { getGithubLastCommit } from './lib/get-github-last-commit'
import { getGitHubUserPaymentMethods } from './lib/get-github-user-from-commit'
import * as dbFactory from 'mongo-factory'
import { Collection } from 'mongodb'
import config from './config'



async function main(params: { owner: string, repo: string }) {
    try {
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
            // TODO
            let authors = stats.authors
            for(let i = 0; i < authors.length; i++) {
                //getGitHubUserPaymentMethods(authors[i].)
            }
        }
        return
        
    } catch(e) {
        console.log('Error! ', e)
    }

    return

}


main({ owner: 'macor161', repo: 'line-count-test' })
.then(() => console.log('done'))


