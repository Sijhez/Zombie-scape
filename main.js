//VARIABLES GLOBALES
const $canvas = document.querySelector("#myCanvas");
const $status = document.querySelector("#status")
const ctx = $canvas.getContext("2d");
const ctxStatus = $status.getContext("2d");
let frames = 0;
let teclas = {};
let velocity = .1;
const bullets = [];
let allZombies = [];
let diedZombies = [];
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
    constructor(x, y, width, height, img, hp){
        super(x, y, width, height, img,hp);
        this.vx = 0;
        this.vy = 0;
        this.hp = 1000;
       
    } 
    draw(){
        this.x += this.vx;
        this.y += this.vy;
        //estas funciones impiden que el soldado se salga del recuadro de juego
        if(this.y+this.height < $canvas.height - 380 ){
            this.y = 120 - this.height ;
        }else if(this.y+this.height > $canvas.height - 1){
            this.y =  395 ;
        }else if(this.x +this.width > $canvas.width){
            this.x = $canvas.width-90;
        }else if(this.x + this.width <-$canvas.width+($canvas.width+90)){
            this.x = 10;
        }
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
        return (
        this.x < obj.x + obj.width &&
        this.x + this.width > obj.x &&
        this.y < obj.y + obj.height &&
        this.y + this.height > obj.y)
      }
    damaged(){
        this.hp-=1;
    }

}

class Bullet extends GameAssets {
    constructor(x, y, width, height, img){
        super(x, y, width, height, img)
        this.width = 20;
        this.height = 15;
        this.image = new Image();
        this.image.src = "/media/else/fireBullet.png";
        //this.audio = new Audio();
        //this.audio.src = "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-69838/cartoon_anime_laser_shoot_hard_fast_001_71523.mp3"
    }
    draw(){
        this.x +=5;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    isTouching(obj) {
        return (
        this.x < obj.x + obj.width &&
        this.x + this.width > obj.x &&
        this.y < obj.y + obj.height &&
        this.y + this.height > obj.y)
    }
    bulletGone(){
       console.log('bala se va')
    }
    
}
class Zombie extends GameAssets {
    constructor(x, y, width, height, img){
       super(x, y, width, height, img);
       this.liveStatus = true;
       this.image.src = "/media/zombie/zombieOne.png";
    }
    draw(){
        this.x-=2;
         ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    isTouching(obj) {
        return (
        this.x < obj.x + obj.width &&
        this.x + this.width > obj.x &&
        this.y < obj.y + obj.height &&
        this.y + this.height > obj.y)
    }
    dies(){
        this.liveStatus = false
    }

       
}

class Background extends GameAssets{
    constructor(x, y, width, height, img){
    super(x, y, width, height, img);
    this.width = width;
    this.height = height;
    }

    draw(){
        this.x -=.3;
         ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Obstacle extends GameAssets {
    constructor (x, y, width, height, img){
        super(x, y, width, height, img);
        this.width = width;
        this.height = height;
        this.color = 'black';
    }
    draw(){
        this.x -=.3;
         //ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
         ctx.fillRect( this.x, this.y, this.width, this.height)
         ctx.fillStyle = this.color;
    }
}



// INSTANCIAS DEL JUEGO
//fondo del laberinto
const firstBackground = "/media/level1-back.png";
//soldado-jugador1
const player1 = "/media/soldier/soldierStatic.png"
const background = new Background(0, 0, 2500, 500, firstBackground); 

const soldier = new Character( 100,100, 90, 90, player1)
//zombie - enemigo
const zombie = "/media/zombie/zombieOne.png"
//const enemy = new Zombie($canvas.width, 50, 75, 75, zombie)
//tesoros - gana puntos por conseguir la mayor cantidad
//paredes u obstaculos
//const boxes = "/media/obstacle1.png";
const obstacle1 = new Obstacle ( 120, 275, 100, 100)

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
    generateZombies();
    clearCanvas();
   
    background.draw();
    soldier.draw();
    obstacle1.draw();
    drawZombies();
    printBullets();
    dieZombie(); 
    runScore();
    healthSoldier();
}
function checkKeys(){
    if(teclas.ArrowRight)soldier.moveRight();
    if(teclas.ArrowLeft)soldier.moveLeft();
    if(teclas.ArrowUp)soldier.moveUp();
    if(teclas.ArrowDown)soldier.moveDown();
    if(teclas.d){
        const bullet = new Bullet(soldier.x+50, soldier.y+30);
        bullets.push(bullet);
    }
    
}



function generateZombies() {
	if (frames % 200 === 0) {
		const y = Math.floor(Math.random() * 370);
		const enemy = new Zombie($canvas.width, y, 75, 75, zombie);
		allZombies.push(enemy);
        
	}
}

function drawZombies(){
    allZombies.forEach((zombie)=>zombie.draw());
    allZombies.forEach((zombie)=>{
        if(soldier.isTouching(zombie)){
              soldier.damaged();
               };
    })
}


function printBullets(){
    bullets.forEach((bullet)=>{
       bullet.draw();
       allZombies.forEach((zombie)=>{
        
        if(zombie.isTouching(bullet) && bullet.isTouching(zombie)){
           zombie.dies();
           diedZombies.push(zombie);
           bullet.bulletGone();
        }
       })
       
    })
}

function dieZombie(){
   allZombies.forEach((zombie,index)=>{
       if(zombie.liveStatus === false){
        allZombies.splice(index,1);
       }
   });
}

function runScore(){
    let scoreSoldier = diedZombies.length ;
    ctxStatus.font = "25px sans-serif";
    ctxStatus.fillStyle = "orange";
   ctxStatus.fillText( `Died zombies:${scoreSoldier}`, 50, 50);
}

function healthSoldier(){
    let hpSoldier = soldier.hp ;
    ctxStatus.font = "25px sans-serif";
    ctxStatus.fillStyle = "#fff";
   ctxStatus.fillText( `HP:${hpSoldier}`, 250, 50);
}


function clearCanvas(){
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    ctxStatus.clearRect(0, 0, $canvas.width, $canvas.height);
}

function checkObstacle(){
    if(soldier.isTouching(obstacle1)){
        soldier.stopWalking();
    };
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