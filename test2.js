var Queue = require('bull')

let repoStatsQueue = new Queue('repo-stats', 'redis://127.0.0.1:6379')

function processQueue() {
    return new Promise((res, rej) => {
        repoStatsQueue.process((job, done) => {
            console.log('processing job: ')
            console.log(job.data.name)
            //job.progress(100)
            done()
        })
    })
}

processQueue()
.then(() => {
    console.log('done')
})