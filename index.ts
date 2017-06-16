import * as git from 'simple-git'

export async function gitStats(opts: GitStatsOptions) {
    opts = Object.assign(new GitStatsOptions(), opts)

    git(opts.dir).raw(
    [
        'config',
        '--global',
        'advice.pushNonFastForward',
        'false'
    ], (err, result) => {
    
        // err is null unless this command failed
        // result is the raw output of this command
    
    })
}

export class GitStatsOptions {
    dir?: string = './'
    exclude?: string[]
    include?: string[]
}