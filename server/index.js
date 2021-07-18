var express = require('express');
var cors = require('cors');
var http = require('http');
var Server = require('socket.io').Server;
var app = express();
app.use(cors());
app.use(express.json());
app.post('/loot', function (req, res) {
    res.send(buttonsData);
});
var server = http.createServer(app);
var io = new Server(server, {
    cors: '*'
});
io.on('connection', function (socket) {
    socket.emit('connected', buttonsData, isPlaying, buttonsData[emptyIndex].color);
    socket.on('buttonClicked', function (clickedIndx) {
        if (!isPlaying)
            return;
        if (Math.abs(clickedIndx - emptyIndex) === 4 || (Math.abs(clickedIndx - emptyIndex) === 1 && Math.floor(clickedIndx / 4) === Math.floor(emptyIndex / 4))) {
            var tempData = buttonsData[clickedIndx];
            buttonsData[clickedIndx] = buttonsData[emptyIndex];
            buttonsData[emptyIndex] = tempData;
            buttonsData[clickedIndx].color = averageColors(buttonsData[clickedIndx].color, tempData.color);
            io.emit('moveButtons', { clickedIndx: clickedIndx, emptyIndex: emptyIndex, backgroundColor: buttonsData[clickedIndx].color });
            emptyIndex = clickedIndx;
            if (isGameOver()) {
                isPlaying = false;
                setTimeout(shuffle, 30000);
                io.emit('gameOver');
            }
        }
    });
});
var PORT = 4919;
var buttonsData;
var emptyIndex;
var isPlaying;
server.listen(PORT, function () {
    console.log("Listening on port: " + PORT);
    shuffle();
});
var TextAndColor = /** @class */ (function () {
    function TextAndColor(text, color) {
        this.text = text;
        this.color = color;
    }
    return TextAndColor;
}());
function shuffle() {
    isPlaying = true;
    buttonsData = [];
    emptyIndex = 15;
    var arr = Array.from({ length: 15 }, function (_, index) { return index + 1; });
    while (arr.length !== 0) {
        var randomIndx = Math.floor(Math.random() * arr.length);
        buttonsData.push(new TextAndColor(String(arr[randomIndx]), randomHexColor()));
        arr.splice(randomIndx, 1);
    }
    buttonsData.push(new TextAndColor('0', '#FFFFFF'));
    io.emit('shuffle', buttonsData);
}
function randomHexColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function isGameOver() {
    for (var i = 0; i < 2; i++) {
        if (buttonsData[i].text != String(i + 1))
            return false;
    }
    return true;
}
function averageColors(colorA, colorB) {
    var _a = colorA.match(/\w\w/g).map(function (c) { return parseInt(c, 16); }), rA = _a[0], gA = _a[1], bA = _a[2];
    var _b = colorB.match(/\w\w/g).map(function (c) { return parseInt(c, 16); }), rB = _b[0], gB = _b[1], bB = _b[2];
    var r = Math.round(rA + (rB - rA) * 0.5).toString(16).padStart(2, '0');
    var g = Math.round(gA + (gB - gA) * 0.5).toString(16).padStart(2, '0');
    var b = Math.round(bA + (bB - bA) * 0.5).toString(16).padStart(2, '0');
    return '#' + r + g + b;
}
