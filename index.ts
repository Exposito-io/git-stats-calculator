import * as git from 'simple-git'
import { gitLsFiles } from './lib/git-ls-files'
import { gitLsTree } from './lib/git-ls-tree'
import * as BlameJs from 'blamejs'
import { gitBlame, LineInfo } from './lib/git-blame'
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
                if (!stats.has(blame.author)) {
                    stats.set(blame.author, {
                        author: {
                            name: blame.author,
                            email: blame.authorMail,
                            commitSample: blame.commit
                        },
                        linesOfCode: 0,
                        files: []
                    })
                }

                let stat = stats.get(blame.author)
                stat.linesOfCode++
                
                if (!stat.files.includes(blame.filename))
                    stat.files.push(blame.filename)

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




console.log('fawe')

gitStats({ dir: './'})
.then(stats => {
    stats.forEach((value, key) => {
        console.log(`${key}:  ${value.linesOfCode}  |  ${value.files.length}`)
    }) 
})
.catch(err => {
    console.log(err)
})

/*
gitBlame({ file: 'package.json' })
.then(result => {
    //for(let file of files) {
        console.log(result)
    //}
})
.catch(err => {
    console.log(err)
})*/

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