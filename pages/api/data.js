// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from 'fs'
import path from 'path'
import getConfig from 'next/config'

export default (req, res) => {
  const { serverRuntimeConfig } = getConfig()

  const dir = path.join(serverRuntimeConfig.PROJECT_ROOT, './json');

  const response = fs.readFileSync(dir + "/newpdf.json");

  const data = JSON.parse(response)

  res.statusCode = 200
  res.json(data);
}

