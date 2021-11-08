const $canvas = document.querySelector("#myCanvas")
const ctx = $canvas.getContext("2d");
let frames = 0;

class Character{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.vx = 0;
        this.vy = 0;
        this.color = '#5d5d5d';
    } 
    draw(){
        ctx.fillRect(this.x, this.y, this.width, this.height, this.color)
    }
}

const soldier = new Character( 50,$canvas.height -80  )

function startGame(){
    setInterval(()=>{
        update();
    }, 1000/60);
}

function update(){
    frames++;
    soldier.draw();
}
startGame();