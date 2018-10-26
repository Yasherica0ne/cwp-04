const net = require('net');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const port = 8124;

const clientStartStr = 'REMOTE';
const serverAcceptStr = 'ACK';
const serverDeclineStr = 'DEC';
const copyTask = 'COPY';
const encodeTask = 'ENCODE';
const decodeTask = 'DECODE';
const getNextTask = 'getNextTask';
let seed = 0;
const password = 'HardPassword';

function EncryptFile(dirTarget, dirDest) {
    const cipher = crypto.createCipher('aes192', password);

    const input = fs.createReadStream(dirTarget);
    const output = fs.createWriteStream(dirDest);

    input.pipe(cipher).pipe(output);
}

function DecryptFile(dirTarget, dirDest) {
    const decipher = crypto.createDecipher('aes192', password);

    const input = fs.createReadStream(dirTarget);
    const output = fs.createWriteStream(dirDest);

    input.pipe(decipher).pipe(output);
}

function CopyFile(dirTarget, dirDest) {
    const input = fs.createReadStream(dirTarget);
    const output = fs.createWriteStream(dirDest);

    input.pipe(output);
}

const server = net.createServer((client) => {
    client.id = Date.now() + seed++;
    console.log('Client connected id: ' + client.id + '\r\n');
    let isStartingConnection = true;
    client.setEncoding('utf8');

    client.on('data', (data) => {
        if (isStartingConnection) {
            if (data === clientStartStr) {
                client.write(serverAcceptStr);
                isStartingConnection = false;
            }
            else {
                client.write(serverDeclineStr);
                client.write('close');
            }
        }
        else {
            const req = data.split(' ');
            const task = req.shift();
            switch (task) {
                case copyTask:
                    CopyFile(...req);
                    break;
                case encodeTask:
                    EncryptFile(...req);
                    break;
                case decodeTask:
                    DecryptFile(...req);
                    break;
            }
            client.write(getNextTask);
        }
    });

    client.on('end', () => console.log(`Client id: ${client.id} disconnected\r\n`));

});

server.listen(port, () => {
    console.log(`Server listening on localhost: ${port}\r\n`);
});