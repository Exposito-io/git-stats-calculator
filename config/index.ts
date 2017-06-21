import { Config } from './default'

let env = process.env.NODE_ENV || 'default'
let ConfigImpl = require(`./${env}`)


export default new ConfigImpl.Config() as Config