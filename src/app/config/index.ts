
const dev = process.env.NEXT_PUBLIC_SERVER;
export const server = dev;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export const backendURL = process.env.NEXT_PUBLIC_BASEURL_API;
export const tfsURL = process.env.TFS_URL;
export const collection = process.env.COLLECTION || ''
export const project = process.env.PROJECT || ''
export const contrato = process.env.CONTRACT || ''
export const USERNAME = process.env.USERNAME || ''
export const PASSWORD = process.env.PASSWORD || ''
export const DOMINIO = process.env.DOMAIN || ''