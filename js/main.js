//VARIABLES GLOBALES
const $canvas = document.querySelector("#myCanvas");
const $status = document.querySelector("#status")
const ctx = $canvas.getContext("2d");
const ctxStatus = $status.getContext("2d");

const startButton = document.querySelector("#playButton")
let frames = 0;
let teclas = {};
let velocity = .1;
let velocityBack = .5;
let allMoney = [];
let earnedMoney = [];
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
       this.x-=5;
       this.y+=5;
     }

     isTouching(obj) {
        return (
        this.x < obj.x + obj.width-10 &&
        this.x + this.width-10 > obj.x &&
        this.y < obj.y + obj.height-10 &&
        this.y + this.height-10 > obj.y)
      }
    damaged(){
        this.hp-=50;
    }
    // soldierDies(){
    //     if(this.hp === 0){
    //         window.alert('ESTAS MUERTO')
    //     }
    // }

}

class Bullet extends GameAssets {
    constructor(x, y, width, height, img){
        super(x, y, width, height, img)
        this.width = 20;
        this.height = 15;
        this.bulletStatus=true;
        this.image = new Image();
        this.image.src = "/media/else/fireBullet.png";
        this.audio = new Audio();
        this.audio.src = "https://freesound.org/data/previews/212/212607_1654571-lq.mp3"
    }
    draw(){
        this.x += 5;
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
        this.bulletStatus = false
    }
    shootSound(){
        this.audio.volume = 0.1;
        this.audio.play();
        this.audio.cloneNode();
    }
    
}
class Zombie extends GameAssets {
    constructor(x, y, width, height, img){
       super(x, y, width, height, img);
       this.liveStatus = true;
       this.image.src = "/media/zombie/zombieOne.png";
       this.healthZombie = 500;
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
    damaged(){
        this.healthZombie-=100;
    }

    dies(){
        if(this.healthZombie === 0){
            this.liveStatus = false
        }
    }

       
}

class Prizes extends GameAssets{
    constructor(x, y, width, height, img){
        super(x, y, width, height, img);
        this.isCollected = false;
       this.vx = 0;
        this.image = new Image;
        this.image.src = img;
}
   draw(){
    this.x -= this.vx + velocityBack;
     ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    
}

class Background extends GameAssets{
    constructor(x, y, width, height, img){
    super(x, y, width, height, img);
    this.vx = 0;
    this.width = width;
    this.height = height;
    }

    draw(){
        this.x -= this.vx + velocityBack;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

class Obstacle extends GameAssets {
    constructor (x, y, width, height, img){
        super(x, y, width, height, img);
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.y = Math.floor(Math.random()*370);
       // this.color = 'black';
    }
    draw(){
        this.x -= this.vx + velocityBack;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        //  ctx.fillRect( this.x, this.y, this.width, this.height)
        //  ctx.fillStyle = this.color;
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
//tesoros - gana puntos por conseguir la mayor cantidad
const money = "/media/else/bills.png"
//paredes u obstaculos
const boxes = "/media/obstacle1.png";
const obstacle1 = new Obstacle ( 120, 0, 100, 100, boxes )

//LOGICA DEL JUEGO
//si jugador topa con pared se tiene que mover a otro lado
//si zombie topa pared, se debe mover a otro lado
//si jugador toca borde izquierdo, el juego termina
//generar tesoros a lo largo del laberinto, si consigue la mayor cantidad posible, mayores puntos
//si zombie toca a jugador, jugador muere
//el jugador debe disparar 5 veces a zombie para que muera


// FUNCIONES DE APOYO
function startGame(){
    const startScreen = document.querySelector("#gameStart");
    startScreen.style.display = "none";
    setInterval(()=>{
        update();
    }, 1000/60);
}

function update(){
    frames++;
    checkKeys();
    checkObstacle();
    generateZombies();
    generateMoney();
    clearCanvas();
   
    background.draw();
    soldier.draw();
    obstacle1.draw();
    //soldier.soldierDies();
    drawZombies();
    printBullets();
    drawMoney();
    moneyGone()

    dieZombie(); 
    bulletIsGone();
    runScore();
    finalScore();
    healthSoldier();
    gameOver();
}
function checkKeys(){
    if(teclas.ArrowRight)soldier.moveRight();
    if(teclas.ArrowLeft)soldier.moveLeft();
    if(teclas.ArrowUp)soldier.moveUp();
    if(teclas.ArrowDown)soldier.moveDown();
    if(teclas.d){
        const bullet = new Bullet(soldier.x+50, soldier.y+30);
        if(frames % 10 === 0){
            bullets.push(bullet);
            bullet.shootSound();
        };
    }
    
}

function gameOver(){
    const soldierLife = soldier.hp === 0;
    const finEscenario = background.x === -2500 +$canvas.width;
    const endGame = document.querySelector('#endGame');
    const killedSoldier = document.querySelector('#killedSoldier');

    if(finEscenario){
        endGame.style.display = 'block';
        velocityBack = 0;
    }else if(soldierLife){
        killedSoldier.style.display = 'block';
        velocityBack = 0;
    }
}

function generateZombies() {
	if (frames % 150 === 0) {
		const y = Math.floor(Math.random() * 370);
		const enemy = new Zombie($canvas.width, y, 75, 75, zombie);
		allZombies.push(enemy);
        
	}
}

function generateMoney(){
     if(frames % 100 === 0){
         let x = Math.floor(Math.random()*2500);
         let y = Math.floor(Math.random()*370);
         const bills = new Prizes (x, y, 40, 40, money);
         allMoney.push(bills);
     }

}

function drawMoney(){
    allMoney.forEach((bills)=>{
        bills.draw();
        if(soldier.isTouching(bills)){
            bills.isCollected = true;
            earnedMoney.push(bills);
         };
    })
}

function moneyGone(){
    allMoney.forEach((bills, index)=>{
       if(bills.isCollected === true){
           allMoney.splice(index,1);
       }
    });
}

function drawZombies(){
    allZombies.forEach((zombie)=>zombie.draw());
    allZombies.forEach((zombie)=>{
        if(soldier.isTouching(zombie)){
              soldier.damaged();
              soldier.x -=50
            //   if(frames % 10 == 0 ){
            //       setInterval(soldier.draw(),1000)
            //   }
               };
    })
}


function printBullets(){
    bullets.forEach((bullet)=>{
        bullet.draw();
        
       allZombies.forEach((zombie)=>{
        if(zombie.isTouching(bullet) && bullet.isTouching(zombie)){
           zombie.damaged();
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
   allZombies.forEach((zombie)=>{
    zombie.dies();
       if(zombie.liveStatus === false){
        diedZombies.push(zombie);   
       }
   })
}

function bulletIsGone(){
    bullets.forEach((bullet, index)=>{
        if(bullet.bulletStatus === false){
            bullets.splice(index,10);
        }
    })
}

function runScore(){
    let scoreSoldier = diedZombies.length ;
    let numZombies= document.querySelector("#numZombies");
    ctxStatus.font = "25px sans-serif";
    ctxStatus.fillStyle = "orange";
    ctxStatus.fillText( `Died zombies:${scoreSoldier}`, 50, 50);
    numZombies.textContent = `${scoreSoldier}`;
}

function healthSoldier(){
    let hpSoldier = soldier.hp ;
    ctxStatus.font = "25px sans-serif";
    ctxStatus.fillStyle = "#00adef";
   ctxStatus.fillText( `HP:${hpSoldier}`, 250, 50);
}

function finalScore(){
    let totalNum = document.querySelector("#totalNum");
    let scoreTotal = 0;
    earnedMoney.forEach((bills)=>{
        scoreTotal +=10; 
    })
    diedZombies.forEach((zombieMuerto)=>{
        scoreTotal+=5 //por cada zombie Muerto son 5 puntos en el score
    });

    ctxStatus.font = "25px sans-serif";
    ctxStatus.fillStyle = "#fff";
    ctxStatus.fillText( `Score:${scoreTotal}`, 400, 50);
    totalNum.textContent = `${scoreTotal}`;
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

//startButton.addEventListener('click', startGame());

//