
const dev = process.env.NEXT_PUBLIC_SERVER;
export const server = dev;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export const backendURL = process.env.NEXT_PUBLIC_BASEURL_API;