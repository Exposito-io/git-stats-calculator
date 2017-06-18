import * as git from 'simple-git'
import { gitLsFiles } from './git-ls-files'
import { gitLsTree } from './git-ls-tree'
import { gitBlame, LineInfo } from './git-blame'
import * as async from 'promise-async'

export async function gitStats(opts?: GitStatsOptions) {

    opts = Object.assign(new GitStatsOptions(), opts)

    //let files = await gitLsFiles(opts.dir)
    let files = await gitLsTree(opts.dir)
    let stats = new Map<string, GitStat>()

    await async.eachLimit(files, 10, (file, done) => {

        gitBlame({ dir: opts.dir, file })
        .then(blames => {

            for(let blame of blames) {
                if (!stats.has(blame.authorMail)) {
                    stats.set(blame.authorMail, {
                        author: {
                            name: blame.author,
                            email: blame.authorMail,
                            commitSample: blame.commit
                        },
                        linesOfCode: 0,
                        files: []
                    })
                }

                let stat = stats.get(blame.authorMail)
                stat.linesOfCode++

                if (!stat.files.includes(file))
                    stat.files.push(file)

            }

            done()
        })
        .catch(err => {
            done()
        })

    })

    return stats
    
}





export class GitAuthor {
    name: string
    email: string
    commitSample: string
}

export class GitStat {
    author: GitAuthor
    linesOfCode: number = 0
    files: string[]
}

export class GitStatsOptions {
    dir?: string = './'
    exclude?: string[]
    include?: string[]
}