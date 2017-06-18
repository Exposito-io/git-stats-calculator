import * as git from 'simple-git'
import * as BlameJs from 'blamejs'
import { parseBlame, LineInfo } from './lib/git-blame-parser'

export async function gitStats(opts?: GitStatsOptions) {

    opts = Object.assign(new GitStatsOptions(), opts)

    let files = await gitLsFiles(opts.dir)
    let stats = new Map<string, GitStat>()

    for (let file of files) {
        let blames = await gitBlame({ dir: opts.dir, file })

        for(let blame of blames) {
            if (!stats.has(blame.author)) {
                stats.set(blame.author, {
                    author: {
                        name: blame.author,
                        email: blame.authorMail,
                        commitSample: blame.commit
                    },
                    linesOfCode: 0,
                    commits: [],
                    files: []
                })
            }

            let stat = stats.get(blame.author)
            stat.linesOfCode++
            
            if (!stat.files.includes(blame.filename))
                stat.files.push(blame.filename)
            
            if (!stat.commits.includes(blame.commit))
                stat.commits.push(blame.commit)
        }

    }

    return stats
    
}

function gitLsFiles(dir: string = './'): Promise<string[]> {
    return new Promise((resolve, reject) => {
        git(dir).raw(['ls-files'], (err, result) => {    
            if (err)
                return reject(err)

            let files = result.split(/\r?\n/)
            // remove last line because it's empty
            files.pop()
            resolve(files)           
        })
    })
}

function gitBlame(opts: GitBlameOptions): Promise<LineInfo[]> {
    return new Promise((resolve, reject) => {
        opts = Object.assign(new GitStatsOptions(), opts)
        
        git(opts.dir).raw(['blame', opts.file, '--line-porcelain'], (err, result) => {    
            if (err)
                return reject(err)
            
            resolve(parseBlame(result))          
        })       
    })
}

export class GitAuthor {
    name: string
    email: string
    commitSample: string
}

export class GitStat {
    author: GitAuthor
    linesOfCode: number = 0
    commits: string[]
    files: string[]
}

export class GitStatsOptions {
    dir?: string = './'
    exclude?: string[]
    include?: string[]
}

export class GitBlameOptions {
    dir?: string = './'
    file: string

}


console.log('fawe')

gitStats()
.then(stats => {
    stats.forEach((value, key) => {
        console.log(`${key}:  ${value.linesOfCode}  |  ${value.commits.length}  |  ${value.files.length}`)
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