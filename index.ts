import { gitStats } from './lib/git-stats'





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