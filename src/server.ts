import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { initSocket } from './lib/socket'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const port = process.env.SOCKET_PORT || 3001

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  // Initialize Socket.IO with our server
  initSocket(server)

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
