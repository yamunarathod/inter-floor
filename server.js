const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');  // Import the 'path' module explicitly
const { SerialPort, ReadlineParser } = require('serialport');
const partialResponse = require('express-partial-response');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let Aport;
Aport = new SerialPort({ path: `com8`, baudRate: 115200 })
const parser = new ReadlineParser();

Aport.pipe(parser);

Aport.on('open', () => {
    console.log('Serial port opened');
});
parser.on('data', data => {
    console.log('Received serial data:', data);
    io.emit('serialData', data);
});
Aport.on('error', err => {
    console.error('Serial port error:', err.message);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.use(express.static(path.join(__dirname, 'public')));
app.use(partialResponse());

const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/display', (req, res) => {
    res.render('display');
});

io.on('connection', socket => {
    console.log('Client connected');

    // Example: Handle a custom event from the client
    socket.on('customEvent', data => {
        console.log('Received data from client:', data);
    });

    // Example: Listen for the serialData event and log it to the console
    socket.on('serialData', data => {
        console.log('Serial data from client:', data);
    });
});