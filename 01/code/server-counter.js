const {Server} = require('http');

let i = 0;

new Server((req, res) => {
    ++i; // будет увеличиваться с каждым запросом
    res.end(i.toString()); // Must be string
}).listen(3000);

console.log('Listening localhost:3000');