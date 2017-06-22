import { getGithubStats } from './lib/get-github-stats'
import { getGithubLastCommit } from './lib/get-github-last-commit'
import * as dbFactory from 'mongo-factory'
import { Collection } from 'mongodb'
import config from './config'



async function main(params: { owner: string, repo: string }) {
    try {
        let db = await dbFactory.getConnection(config.mongoUrl)
        let repoStatsCol = db.collection('repo-stats') as Collection

        let stats = await repoStatsCol.findOne(params)
        let lastCommit = await getGithubLastCommit(params)

        
        if (stats == null || stats.lastCommit !== lastCommit.sha) {
            let results = await getGithubStats(params)
            console.log(results)
        }
        else {
            console.log(`${params.owner}/${params.repo} stats already up to date`)
        }
        
        return
    } catch(e) {
        console.log('Error! ', e)
    }

}


main({ owner: 'macor161', repo: 'ts-money' })



