import { gitStats } from './lib/git-stats'
import * as GitHubApi from 'github'
import { PaymentDestination } from 'models'

let github = new GitHubApi()

export class GetUserFromCommitParams {
    owner: string
    repo: string
    commit: string
}
export async function getGithubUserFromCommit(params: GetUserFromCommitParams) {

    let commitInfo = await github.repos.getCommit({
        owner: params.owner,
        repo: params.repo,
        sha: params.commit
    })

    return commitInfo

}

const PAYMENT_FILE_NAMES = [
    { name: 'bitcoin-address', paymentType: PaymentDestination.BITCOIN_ADDRESS },
 //   'bitcoin-testnet-address',
    { name: 'ethereum-address', paymentType: PaymentDestination.ETHEREUM_ADDRESS },
 //   'ethereum-testnet-address',
    { name: 'exposito-wallet', paymentType: PaymentDestination.WALLET }
]


/**
 * Returns available payment methods to send
 * money to for a specific Github username
 * 
 * @param githubUsername 
 */
export async function getGitHubUserPaymentMethods(githubUsername: string): Promise<{ paymentType: PaymentDestination, destination: string }[]> {

    let gists = await github.gists.getForUser({
        username: githubUsername        
    })

    let expositoGists = gists.filter(gist => gist.description.ToLowerCase().trim() === 'exposito')
    let payments = []

    for(let gist of expositoGists) {

        let gistWithFiles = await github.gists.get({ id: gist.id })

        payments = payments.concat(gistWithFiles
            .filter(file => PAYMENT_FILE_NAMES.map(f => f.name).includes(file.filename.toLowerCase()))
            .filter(file => validatePaymentFileContent(file.filename.toLowerCase(), file.content))
            .map(file => ({ 
                paymentType: PAYMENT_FILE_NAMES.find(f => f.name === file.filename.toLowerCase()), 
                destination: file.content 
            }))
        )
    }

    return payments
}


function validatePaymentFileContent(filename: string, content: string) {
    // TODO
    return true
}


function getGithubRepoInfoFromUrl(repoUrl: string) {
    if (typeof repoUrl !== 'string')
        throw('Invalid URL')

    // Remove first and last /
    if (repoUrl[0] === '/')
        repoUrl = repoUrl.substr(1, repoUrl.length - 3)

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
})

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