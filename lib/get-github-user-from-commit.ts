import * as GitHubApi from 'github'

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

    let user = commitInfo.author
    user.availablePaymentsMethods = await getGitHubUserPaymentMethods(user.login)

    return user

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
async function getGitHubUserPaymentMethods(githubUsername: string): Promise<{ paymentType: PaymentDestination, destination: string }[]> {

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