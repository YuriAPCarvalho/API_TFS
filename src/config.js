import dotenv from 'dotenv'

dotenv.config()

export const TFS_URL = process.env.TFS_URL || ''
export const COLLECTION = process.env.COLLECTION || ''
export const PROJECT = process.env.PROJECT || ''

export const USERNAME = process.env.USERNAME || ''
export const PASSWORD = process.env.PASSWORD || ''
export const DOMAIN = process.env.DOMAIN || ''
