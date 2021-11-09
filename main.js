//VARIABLES GLOBALES
const $canvas = document.querySelector("#myCanvas")
const ctx = $canvas.getContext("2d");
let frames = 0;
let teclas = {};
let velocity = .1;
const bullets = [];
// CLASES DEL JUEGO
//generico
class GameAssets{
    constructor(x, y, width, height, img){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = new Image();
        this.image.src = img;
    }
    draw(){
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

//soldado
class Character extends GameAssets{
    constructor(x, y, width, height, img){
        super(x, y, width, height, img);
        this.vx = 0;
        this.vy = 0;
        this.color = '#5d5d5d';
    } 
    draw(){
        this.x += this.vx;
        this.y += this.vy;
         ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    
    moveLeft(){
       this.vx-=velocity;
    }
    moveRight(){
        this.vx+=velocity;
     }
     moveUp(){
        this.vy-=velocity;
     }
     moveDown(){
        this.vy+=velocity;
     }
     stop(evento){
         switch(evento.key){
             case 'ArrowUp':
             case 'ArrowDown':
                 this.vy = 0;
                 break;
            case 'ArrowLeft':
            case 'ArrowRight':
                this.vx = 0;
                break;   
         }
     }
     
     stopWalking(){
       this.vx=0
     }

     isTouching(obj) {
        return (this.x <= obj.x + obj.width &&
        this.x + this.width >= obj.x &&
        this.y <= obj.y + obj.height &&
        this.y + this.height >= obj.y)
      }

}

class Bullet extends GameAssets {
    constructor(x, y){
        super(x,y)
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.color = 'orange';
        //this.audio = new Audio();
        //this.audio.src = "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-69838/cartoon_anime_laser_shoot_hard_fast_001_71523.mp3"
    }
    draw(){
        this.x +=5;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    // shootSound(){
    //     this.audio.volume = 0.2;
    //     this.audio.play();
    // }

}

class Background extends GameAssets{
    constructor(x, y, width, height, img){
    super(x, y, width, height, img);
    this.width = width;
    this.height = height;
    }

    draw(){
        //this.x -=.3;
         ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Obstacle extends GameAssets {
    constructor (x, y, width, height, img){
        super(x, y, width, height, img);
        this.width = width;
        this.height = height;
    }
    draw(){
        //this.x -=.3;
         ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// INSTANCIAS DEL JUEGO
//fondo del laberinto
const firstBackground = "/media/level1-back.png";
//soldado-jugador1
const player1 = "/media/soldier/soldierStatic.png"
const background = new Background(0, 0, 2500, 500, firstBackground); 

const soldier = new Character( 20,$canvas.height -80, 90, 90, player1)
//zombie - enemigo
//tesoros - gana puntos por conseguir la mayor cantidad
//paredes u obstaculos
const boxes = "/media/obstacle1.png";
const obstacle1 = new Obstacle ( 120, 275, 130, 130, boxes)


//LOGICA DEL JUEGO
//si jugador topa con pared se tiene que mover a otro lado
//si zombie topa pared, se debe mover a otro lado
//si jugador toca borde izquierdo, el juego termina
//generar tesoros a lo largo del laberinto, si consigue la mayor cantidad posible, mayores puntos
//si zombie toca a jugador, jugador muere
//el jugador debe disparar 5 veces a zombie para que muera


// FUNCIONES DE APOYO
function startGame(){
    setInterval(()=>{
        update();
    }, 1000/60);
}

function update(){
    frames++;
    checkKeys();
    checkObstacle();
    clearCanvas();
    
    background.draw();
    soldier.draw();
    obstacle1.draw();
    printBullets(); 
}
function checkKeys(){
    if(teclas.ArrowRight)soldier.moveRight();
    if(teclas.ArrowLeft)soldier.moveLeft();
    if(teclas.ArrowUp)soldier.moveUp();
    if(teclas.ArrowDown)soldier.moveDown();
    if(teclas.c){
        const bullet = new Bullet(soldier.x, soldier.y+30);
        bullets.push(bullet);
    }
    
}
function printBullets(){
    bullets.forEach((bullet)=>{
        
            bullet.draw();
        
    })
}

function clearCanvas(){
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
}

function checkObstacle(){
    if(soldier.isTouching(obstacle1)){
        soldier.stopWalking();
    }
    
}


//USER INTERACTION
document.onkeydown = (event) =>{
     teclas[event.key]=true;
    
}
document.onkeyup = (evento)=>{
     teclas[evento.key] =false;
     soldier.stop(evento);
    
}

startGame();