import { PaymentDestination } from 'models'
import * as GitHubApi from 'github'
import * as _ from 'lodash'
import config from '../config'

let github = new GitHubApi()
github.authenticate({
    token: config.githubToken,
    type: 'oauth'
})

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

    let user = commitInfo.data.author //|| commitInfo.data.commit.author

    if (user)
        user.availablePaymentsMethods = await getGitHubUserPaymentMethods(user.login)
    else
        console.log('Null user data: ', commitInfo.data)
    
    return user

}

const PAYMENT_FILE_NAMES = [
    { name: 'bitcoin-address', paymentType: PaymentDestination.BITCOIN_ADDRESS },
 //   'bitcoin-testnet-address',
    { name: 'ethereum-address', paymentType: PaymentDestination.ETHEREUM_ADDRESS },
 //   'ethereum-testnet-address',
    { name: 'exposito-wallet', paymentType: PaymentDestination.EXPOSITO_WALLET }
]


/**
 * Returns available payment methods to send
 * money to for a specific Github username
 * 
 * @param githubUsername 
 */
export async function getGitHubUserPaymentMethods(githubUsername: string): Promise<{ paymentType: PaymentDestination, destination: string }[]> {

    try {
        let gists = (await github.gists.getForUser({
            username: githubUsername        
        })).data

        let expositoGists = gists.filter(gist => gist.description && gist.description.toLowerCase().trim() === 'exposito')
        let payments = []

        for(let gist of expositoGists) {

            let gistWithFiles = (await github.gists.get({ id: gist.id })).data

            payments = _(gistWithFiles.files)
                .pickBy(file => PAYMENT_FILE_NAMES.map(f => f.name).includes(file.filename.toLowerCase()))
                .pickBy(file => validatePaymentFileContent(file.filename.toLowerCase(), file.content))
                .map(file => ({ 
                    paymentType: PAYMENT_FILE_NAMES.find(f => f.name === file.filename.toLowerCase()).paymentType, 
                    destination: file.content 
                }))
                .value()
                .concat(payments)
            
        }

        return payments
    } catch(e) {
        console.log(`Error fetching payment methods for ${githubUsername}`, e)
        return []
    }
}


function validatePaymentFileContent(filename: string, content: string) {
    // TODO
    return true
}