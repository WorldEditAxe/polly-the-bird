import * as express from 'express'

const server = express.default()
const port = 3000

server.get('/', (req, res) => res.send('{"status":"online","based":"true"}'))
server.listen(port)