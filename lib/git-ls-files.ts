import * as git from 'simple-git'

export function gitLsFiles(dir: string = './'): Promise<string[]> {
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