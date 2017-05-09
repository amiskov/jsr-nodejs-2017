'use strict';

const url = require('url');
const fs = require('fs');
const mime = require('mime');
const {Server} = require('http');

const FILES_DIR = __dirname + '/files';
const PUBLIC_DIR = __dirname + '/public';

new Server((req, res) => {
    const pathname = decodeURI(url.parse(req.url).pathname);

    if (!pathIsOk(pathname)) {
        res.statusCode = 400;
        res.end('Wrong path.');
        return;
    }

    const filePath = FILES_DIR + pathname;

    switch (req.method) {
        case 'GET': {
            if (pathname === '/') {
                sendFile(PUBLIC_DIR + '/index.html', res);
                return;
            }

            sendFile(filePath, res);
            break;
        }

        case 'POST': {
            const options = {
                flags: 'wx' // открыть файл на запись и бросить исключение, если он существует
            };
            const maxSize = 1024 * 1024;
            let size = 0;

            // Проверяем размер присылаемого файла по заголовку `content-length`
            if (req.headers['content-length'] > maxSize) {
                res.statusCode = 413;
                res.end('Content-Length exceeded limit: ' + size + ' of ' + maxSize);

                break; // дальше не идем
            }

            const file = fs.createWriteStream(filePath, options);

            file
                .on('error', (err) => {
                    if (err.code === 'EEXIST') {
                        res.statusCode = 409;
                        res.end('File ' + pathname + ' already exists.');
                        console.error(err);
                    } else {
                        res.statusCode = 500;
                        res.end('Something went wrong...');
                        console.error(err);
                    }
                })
                // Событие `close` для файлового потока — это нормально.
                // Его и надо использовать, когда операция с файлом завершена. Файл просто закрылся.
                // Это у res событие `close` будет на обрыве.
                .on('close', () => {
                    res.statusCode = 200;
                    res.end('OK');
                });

            // Check file size
            req
                .on('data', (data) => {
                    size += data.length;

                    if (size > maxSize) {
                        res.statusCode = 413;
                        res.end('Resource stream exceeded limit (' + size + ' of ' + maxSize + ')');

                        // Уничтожаем файловый поток, а не поток запроса.
                        // Поток `req` уничтожится сразу при вызове `res.end()`, потому что это одно подключение.
                        file.destroy();

                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                    }
                })
                .on('close', () => { // обрыв `req`
                    file.destroy();
                })
                .pipe(file);

            break;
        }

        case 'DELETE': {
            fs.unlink(filePath, (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        res.statusCode = 404;
                        res.end('File not found.');
                        console.log(`Файл ${err.path} не найден.`);
                    } else {
                        res.statusCode = 500;
                        res.end('Something went wrong...');
                        console.error(err);
                    }
                } else {
                    res.end('Successfully deleted ' + pathname);
                }
            });

            break;
        }

        default:
            res.statusCode = 502;
            res.end('Not implemented');
    }

}).listen(3000);

function sendFile(filePath, res) {
    const file = new fs.ReadStream(filePath);

    file
        .on('error', (err) => {
            if (err.code === 'ENOENT') {
                res.statusCode = 404;
                res.end('File not found.');
                console.log(`File ${err.path} not found.`);
            } else {
                res.statusCode = 500;
                res.end('Server error.');
                console.error(err);
            }
        })
        .on('open', () => { // Вот тут нужно хедеры выставлять
            // Файл открылся, ошибок нет, значит можно ставить заголовки
            const mimeType = mime.lookup(filePath);

            res.writeHead(200, {
                'Content-Type': mimeType,
                'Content-Disposition': (mimeType === 'text/html') ? 'inline' : 'attachment'
            });
        })
        .pipe(res); // вернет `res`! Поэтому `pipe` нужно вызывать в конце!

    res.on('close', () => { // можно зачейнить после pipe(res), будет то же самое.
        // Если про это забыть, то страшного ничего не будет. Но это не лишнее - закрыть файл при обрыве.
        file.destroy();
    });

}

function pathIsOk(pathname) {
    return !(pathname.slice(1).indexOf('/') !== -1 || pathname.indexOf(':') !== -1);
}

