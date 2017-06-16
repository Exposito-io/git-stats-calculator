import * as git from 'simple-git'
import * as BlameJs from 'blamejs'
import { parseBlame } from './lib/git-blame-parser'

export async function gitStats(opts?: GitStatsOptions) {

    return new Promise((resolve, reject) => {

        opts = Object.assign(new GitStatsOptions(), opts)

    })
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

function gitBlame(opts: GitBlameOptions) {
    return new Promise((resolve, reject) => {
        opts = Object.assign(new GitStatsOptions(), opts)
        
        git(opts.dir).raw(['blame', opts.file, '--line-porcelain'], (err, result) => {    
            if (err)
                return reject(err)
            
            resolve(parseBlame(result))          
        })       
    })
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


gitBlame({ file: 'package.json' })
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