import dotenv from 'dotenv'

dotenv.config()

export const TFS_URL = 'http://tfs.sgi.ms.gov.br/tfs'
export const COLLECTION = 'Global'
export const PROJECT = 'CSIS-G08'

export const USERNAME = process.env.USERNAME || ''
export const PASSWORD = process.env.PASSWORD || ''
export const DOMAIN = process.env.DOMAIN || ''
