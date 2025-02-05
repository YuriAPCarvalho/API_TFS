import httpntlm from 'httpntlm'
import { USERNAME, PASSWORD, DOMAIN } from '../config.js'

export const post = ({ url, body, headers }, callback) => {
  httpntlm.post(
    {
      url,
      username: USERNAME,
      password: PASSWORD,
      domain: DOMAIN,
      headers,
      body,
    },
    callback
  )
}
