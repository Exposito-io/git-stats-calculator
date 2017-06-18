import * as git from 'simple-git'

export function gitBlame(opts: GitBlameOptions): Promise<LineInfo[]> {
    return new Promise((resolve, reject) => {
        opts = Object.assign(new GitBlameOptions(), opts)
        
        git(opts.dir).raw(['blame', 'master', '--line-porcelain', '--', opts.file], (err, result) => {    
            if (err)
                return reject(err)
            
            resolve(parseBlame(result))          
        })       
    })
}


function parseBlame(blame: string): LineInfo[] {
    let lines = blame.split('\n')
    let lineInfos = []

    
    let lineInfo = new LineInfo()

    for (let line of lines) {
        if (line === "\n" || line === "\r\n")
            continue

        // End of line info
        if (line[0] === "\t") {
            lineInfos.push(lineInfo)
            lineInfo = new LineInfo()
            continue
        }
        else {
            let parsedLine = parseLine(line.split(" "))
            
            if (parsedLine.type !== undefined)
                lineInfo[parsedLine.type] = parsedLine.value
        }
    }

    return lineInfos
}


/**
 * Parses and sets data from a line following a commit header
 *
 * @param {array} lineArr The current line split by a space
 */
function parseLine(lineArr: string[]) {
  var currentCommitData = { type: undefined, value: undefined }

  // Commit hash
  if (lineArr[0].length === 40 && lineArr.length > 1) {
    currentCommitData.type = 'commit'
    currentCommitData.value = lineArr[0]
  }
  else {
    switch(lineArr[0]) {
        case "":
        break

        case "author":
        currentCommitData.type = 'author'
        currentCommitData.value = lineArr.slice(1).join(" ")
        break

        case "author-mail":
        currentCommitData.type = 'authorMail'
        currentCommitData.value = lineArr[1];
        break;

        case "author-time":
        currentCommitData.type = 'authorTime'
        currentCommitData.value = lineArr[1];
        break;

        case "author-tz":
        currentCommitData.type = 'authorTz'
        currentCommitData.value = lineArr[1];
        break;

        case "committer":
        currentCommitData.type = 'committer'
        currentCommitData.value = lineArr.slice(1).join(" ");
        break;

        case "committer-mail":
        currentCommitData.type = 'committerMail'
        currentCommitData.value = lineArr[1];
        break;

        case "committer-time":
        currentCommitData.type = 'committerTime'
        currentCommitData.value = lineArr[1];
        break;

        case "committer-tz":
        currentCommitData.type = 'committerTz'
        currentCommitData.value = lineArr[1];
        break;

        case "summary":
        currentCommitData.type = 'summary'
        currentCommitData.value = lineArr.slice(1).join(" ");
        break;

        case "filename":
        currentCommitData.type = 'filename'
        currentCommitData.value = lineArr[1];
        break;

        case "previous":
        currentCommitData.type = 'previous'
        currentCommitData.value = lineArr.slice(1).join(" ");
        break;

        case "boundary":
        currentCommitData.type = 'boundary'
        currentCommitData.value = true
        break;

        default:
            throw('Unable to parse blame line: ' + lineArr)

    }
  }

  return currentCommitData
}

export class LineInfo {

    author: string
    authorMail: string
    authorTime: string
    authorTz: string
    commiter: string
    committerMail: string
    committerTime: string
    committerTz: string
    summary: string
    filename: string
    previous: string
    commit: string

}

export class GitBlameOptions {
    dir?: string = './'
    file: string

}