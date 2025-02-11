const dev = process.env.NEXT_PUBLIC_SERVER;
export const server = dev;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export const backendURL = process.env.NEXT_PUBLIC_BASEURL_API;
export const tfsURL = process.env.NEXT_PUBLIC_TFS_URL || 'http://tfs.sgi.ms.gov.br/tfs';
export const collection = process.env.NEXT_PUBLIC_COLLECTION || 'Global';
export const project = process.env.NEXT_PUBLIC_PROJECT || 'CSIS-G08';
export const contrato = process.env.NEXT_PUBLIC_CONTRACT || '056/2021 - 16811 - SEFAZ - MIL TEC';
export const USERNAME = process.env.NEXT_PUBLIC_USERNAME || '';
export const PASSWORD = process.env.NEXT_PUBLIC_PASSWORD || '';
export const DOMINIO = process.env.NEXT_PUBLIC_DOMAIN || 'FAZENDA';

console.log('Config:', {
  tfsURL,
  collection,
  project,
  DOMINIO,
  contrato
});