const {Server} = require('http');

const server = new Server();

// Чтобы увидеть все события, которые происходят при работе сервера,
// можно переопределить метод emit, добавив вывод в консоль:
const emit = server.emit;
server.emit = (...args) => {
    console.log(args[0]); // знаем, что первый аргумент стопудово событие
    return emit.apply(server, args);
};

server.on('request', (req, res) => {
    if (req.url === '/') {
        res.end('Hello World!');
    }
});

server.listen(3000);

