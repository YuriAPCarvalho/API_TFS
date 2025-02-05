import * as httpntlm from 'httpntlm'
import { USERNAME, PASSWORD, DOMAIN } from '../config'

interface HttpPostOptions {
  url: string
  body: string
  headers: Record<string, string>
}

export const post = ({ url, body, headers }: HttpPostOptions, callback: (err: any, res: any) => void) => {
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
