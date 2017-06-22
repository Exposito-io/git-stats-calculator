import { getGithubStats, GitStat } from './lib/get-github-stats'
import * as dbFactory from 'mongo-factory'
import * as config from './config'


async function main() {
    try {
        let results = await getGithubStats({ owner: 'macor161', repo: 'ts-money' })
        console.log(results)
    } catch(e) {
        console.log('Error! ', e)
    }

}


main()



