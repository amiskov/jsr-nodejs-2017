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
                sendFile(PUBLIC_DIR + '/index.html', res, 'text/html');
                return;
            }

            const mimeType = mime.lookup(filePath);

            sendFile(filePath, res, mimeType);

            break;
        }

        case 'POST': {
            if (fileExists(filePath)) {
                res.statusCode = 409;
                res.end('File ' + pathname + ' already exists.');

                return;
            }

            const file = fs.createWriteStream(filePath);
            const maxSize = 1024 * 1024;
            let size = 0;

            file
                .on('error', (err) => {
                    res.statusCode = 500;
                    res.end('Server error.');
                    console.error(err);
                })
                .on('close', () => {
                    res.statusCode = 200;
                    res.end('OK');
                });

            // Check file size
            req.on('data', (data) => {
                size += data.length;

                if (size > maxSize) {
                    res.statusCode = 413;
                    res.end('Resource stream exceeded limit (' + size + ' of ' + maxSize + ')');

                    req.destroy();

                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });

                }
            }).pipe(file);

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

function sendFile(filePath, res, mimeType) {
    const file = new fs.ReadStream(filePath);

    res.setHeader('Content-Type', mimeType);

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
        .pipe(res)
        .on('close', () => { // Это, то же самое, что ***
            file.destroy();
        });

    res.on('close', () => { // *** ...что и это, потому что .pipe(res) вернет res.
        file.destroy();
    });
}

function pathIsOk(pathname) {
    return !(pathname.slice(1).indexOf('/') !== -1 || pathname.indexOf(':') !== -1);
}

function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
}
