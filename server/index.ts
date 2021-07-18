const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/loot', (req,res) => {
    res.send(buttonsData);
});


const server = http.createServer(app);
const io = new Server(server,{
    cors:'*'
});

io.on('connection', (socket) => {
    socket.emit('connected',buttonsData,isPlaying,buttonsData[emptyIndex].color);

    socket.on('buttonClicked', (clickedIndx : number) => {
        if(!isPlaying) return;
        if(Math.abs(clickedIndx - emptyIndex) === 4 || (Math.abs(clickedIndx - emptyIndex) === 1 && Math.floor(clickedIndx/4) === Math.floor(emptyIndex/4))) {
            let tempData = buttonsData[clickedIndx];
            buttonsData[clickedIndx] = buttonsData[emptyIndex];
            buttonsData[emptyIndex] = tempData;
            buttonsData[clickedIndx].color = averageColors(buttonsData[clickedIndx].color, tempData.color);
            io.emit('moveButtons',{clickedIndx,emptyIndex,backgroundColor: buttonsData[clickedIndx].color});
            emptyIndex = clickedIndx;
            if(isGameOver()) {
                isPlaying = false;
                setTimeout(shuffle,30000);
                io.emit('gameOver');
            }
        }
    });
});


const PORT: number = 4919;

var buttonsData: Array<TextAndColor>;
var emptyIndex: number;
var isPlaying: boolean;
server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
    shuffle()
});


class TextAndColor {
    text: string;
    color: string;

    constructor(text: string,color: string) {
        this.text = text;
        this.color = color;
    }
}

function shuffle() : void {
    isPlaying = true;
    buttonsData = [];
    emptyIndex = 15;
    const arr = Array.from({length: 15}, (_, index) => index + 1);
    while(arr.length !== 0) {
        let randomIndx: number = Math.floor(Math.random() * arr.length);
        buttonsData.push(new TextAndColor(
            String(arr[randomIndx]),randomHexColor()
        ));
        arr.splice(randomIndx,1);
    }
    buttonsData.push(new TextAndColor('0','#FFFFFF'));
    io.emit('shuffle',buttonsData);
}

function randomHexColor() : string {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function isGameOver() : boolean {
    for(let i = 0; i < 2 ; i++) {
        if(buttonsData[i].text != String(i+1))
            return false;
    }
    return true;
}

function averageColors(colorA : string, colorB : string) : string {
    const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
    const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
    const r = Math.round(rA + (rB - rA) * 0.5).toString(16).padStart(2, '0');
    const g = Math.round(gA + (gB - gA) * 0.5).toString(16).padStart(2, '0');
    const b = Math.round(bA + (bB - bA) * 0.5).toString(16).padStart(2, '0');
    return '#' + r + g + b;
  }