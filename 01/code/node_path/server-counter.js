const {Server} = require('http');
// import counter from './counter';
import counter from 'counter'; // NODE_PATH=. node server-counter.js

// Такой же счетчик, только вынесли обработчик в отдельный модуль
new Server(counter).listen(3000);

console.log('Listening localhost:3000');
