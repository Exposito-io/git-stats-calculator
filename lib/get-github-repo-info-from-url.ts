export function getGithubRepoInfoFromUrl(repoUrl: string) {
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