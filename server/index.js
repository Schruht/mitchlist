var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer((request, response) => {
    console.log(`${new Date()} - Received equest for ${request.url}`);
    response.writeHead(404);
    response.end();
});

server.listen(8080, () => {
    console.log(`${new Date()} - Server is listening on port 8080.`);
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
})

const isAllowed = (origin) => {
    return true;
}

wsServer.on('request', (request) => {
    if (!isAllowed(request.origin)) {
        request.reject();
        console.log(`${new Date()} - Connection from origin ${request.origin} denied.`);
        return;
    }
    var connection = request.accept('mitchlist-protocol', request.origin);
    console.log(`${new Date()} - Connection accepted.`);
    connection.on('message', (message) => {
        if (message.type === 'utf8') {
            var data = message.utf8Data.split(' ');
            var [app, task, command] = messageObject[0].split('.');
            data.splice(0, 1);
            switch (app) {
                case 'itch':
                    switch (task) {
                        case 'room':
                            switch (command) {
                                case 'create':
                                    //Create room
                                    break;
                                case 'join':
                                    //Join room
                                    break;
                            }
                    }
            }
        }
    });
});