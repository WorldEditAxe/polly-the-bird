import { createServer, IncomingMessage, ServerResponse } from "node:http"

const requestCb = async (req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200)
        .write("Hi! I have no idea how you got here, but this is the server hosting Polly, the world's best birb bot.")
    
    res.end()
}

const server = createServer(requestCb)
server.listen(8080)