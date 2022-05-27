
import http from 'http'
import app from './fetchstatus.js'

const server = http.createServer(app)
let currentApp = app
server.listen(3001)

if (module.hot) {
 module.hot.accept('./fetchstatus', () => {
  server.removeListener('request', currentApp)
  server.on('request', app)
  currentApp = app
 })
}
