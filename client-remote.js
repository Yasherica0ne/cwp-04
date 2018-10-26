const net = require('net');
const port = 8124;

const client = new net.Socket();

const clientStartStr = 'REMOTE';
const serverAcceptStr = 'ACK';
const serverDeclineStr = 'DEC';
const copyTask = 'COPY';
const encodeTask = 'ENCODE';
const decodeTask = 'DECODE';
const getNextTask = 'getNextTask';
let paths = [];
let reqCounter = 0;

(function GetPaths() {
    paths = ['E:\\GitHub\\CWP\\cwp-04\\', 'E:\\GitHub\\CWP\\cwp-04\\'];
    //paths = process.argv[2];
})();

function GetQuery(task, target, dest) {
    const dirT = paths[0] + target;
    const dirD = paths[1] + dest;
    return `${task} ${dirT} ${dirD}`;
}

client.setEncoding('utf8');

client.connect(port, function () {
    console.log('Connected');
    client.write(clientStartStr);
});

client.on('data', function (data) {
    if (data === serverDeclineStr) {
        client.destroy();
    }
    else if (data === serverAcceptStr) {
        isStartingConnection = false;
        let query = GetQuery(copyTask, 'Files\\SomeFile.txt', 'CopiedFiles\\CopiedFile.txt');
        client.write(query);
    }
    else if (data === getNextTask) {
        switch (reqCounter) {
            case 0:
                query = GetQuery(encodeTask, 'Files\\SomeFile.txt', 'EncodedFiles\\EncodedFile.enc');
                client.write(query);
                break;
            case 1:
                query = GetQuery(decodeTask, 'EncodedFiles\\EncodedFile.enc', 'DecodedFiles\\DecodedFile.txt');
                client.write(query);
                break;
            case 2:
                client.destroy();
                break;
        }
        reqCounter++;
    }
});

client.on('close', function () {
    console.log('Connection closed');
});