//VARIABLES GLOBALES
const $canvas = document.querySelector("#myCanvas");
const $status = document.querySelector("#status")
const ctx = $canvas.getContext("2d");
const ctxStatus = $status.getContext("2d");
const startButton = document.querySelector("#playButton");
const startScreen = document.querySelector("#gameStart");
let intervalId;
let gameIsOver = false;
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

class Music{
    constructor(){
    this.audio = new Audio();
       this.audio.src = "media/music.mp3";
    }
    playMusic(){
        this.audio.volume = 0.2;
        this.audio.play();
        this.audio.cloneNode();
    }
}

//soldado
class Character extends GameAssets{
    constructor(x, y, width, height, hp){
        super(x, y, width, height, hp);
        this.vx = 0;
        this.vy = 0;
        this.hp = 1000;
        this.img1 = new Image();
        this.img1.src = "/media/soldier/soldierStatic.png";
        this.audio = new Audio();
        this.audio.src = 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-little-robot-sound-factory/little_robot_sound_factory_Jingle_Win_Synth_03.mp3'
       
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
        ctx.drawImage(this.img1, this.x, this.y, this.width, this.height);
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
       this.x-=2;
       this.y+=2;
     }

     isTouching(obj) {
        return (
        this.x < obj.x + obj.width-15 &&
        this.x + this.width-15 > obj.x &&
        this.y < obj.y + obj.height-15 &&
        this.y + this.height-15 > obj.y)
      }
    damaged(){
        this.hp-=50;
    }
    moneyWin(){
        this.audio.volume = 0.2;
        this.audio.play();
        this.audio.cloneNode();
    }
    

}

class LifeSoldier extends GameAssets{
   constructor(x, y, width, height, img, hp){
       super(x, y, width, height, img, hp);
       this.animation = 0;
       this.img1 =new Image();
        this.img2 =new Image();
        this.img3 =new Image();
        this.img4 =new Image();
        this.img5 =new Image();
        this.img6 =new Image();
        this.img7 =new Image();
        this.img8 =new Image();
        this.img9 =new Image();
        this.img10 =new Image();
        this.img11 =new Image(); 
        this.img1.src ='media/else/status100.png';
        this.img2.src ='media/else/status90.png';
        this.img3.src ='media/else/status80.png';
        this.img4.src ='media/else/status70.png';
        this.img5.src ='media/else/status60.png';
        this.img6.src ='media/else/status50.png';
        this.img7.src ='media/else/status40.png';
        this.img8.src ='media/else/status30.png';
        this.img9.src ='media/else/status20.png';
        this.img10.src ='media/else/status10.png';
        this.img11.src ='media/else/status0.png';
   }
   draw(){
    ctxStatus.drawImage(this.image, this.x, this.y, this.width, this.height);
   }
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
        this.audio.src = "https://freesound.org/data/previews/212/212607_1654571-lq.mp3";
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
       this.audio = new Audio();
       this.audio.src = 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-23735/zapsplat_horror_monster_demon_screech_002_23962.mp3'
    }
    draw(){
        this.x-=2;
         ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    isTouching(obj) {
        return (
        this.x < obj.x + obj.width-10 &&
        this.x + this.width-10 > obj.x &&
        this.y < obj.y + obj.height-10 &&
        this.y + this.height-10 > obj.y)
    }
    damaged(){
        this.healthZombie-=100;
    }

    dies(){
        if(this.healthZombie === 0){
            this.liveStatus = false
            this.audio.volume = 0.2;
        this.audio.play();
        this.audio.cloneNode();
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
        this.y = Math.floor(Math.random()*350);
        this.x = Math.floor(Math.random()*1400);
       // this.color = 'black';
    }
    draw(){
        this.x -= this.vx + velocityBack;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        //  ctx.fillRect( this.x, this.y, this.width, this.height)
        //  ctx.fillStyle = this.color;
    }
}
class Walls extends GameAssets {
    constructor (x, y, width, height, img){
        super(x, y, width, height, img);
        this.width = width;
        this.height = height;
        this.vx = 0;
    }
    draw(){
        this.x -= this.vx + velocityBack;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

}

class Lines{
    constructor(x, y, width, height){
        this.x = x;
        this.y=y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.color = 'transparent';
    }
     draw(){
        this.x -= this.vx + velocityBack;
        ctx.fillRect( this.x, this.y, this.width, this.height)
        ctx.fillStyle = this.color;
     }
}



// INSTANCIAS DEL JUEGO
//fondo del laberinto
const firstBackground = "/media/level1-back.png";
const background = new Background(0, 0, 2500, 500, firstBackground); 

//soldado-jugador1
// const player1 = "/media/soldier/soldierStatic.png"
// const shooting = "/media/soldier/soldierShoot.png"
const soldier = new Character( 100,100, 90, 90);
//  const soldierShoot = new Character( 100,100, 90, 90, shooting);
const music = new Music();
//BARRAS DE VIDA
const lifeCien = "/media/else/status100.png";
const lifeNov = "/media/else/status90.png";
const lifeOch = "/media/else/status80.png";
const lifeSet = "/media/else/status70.png";
const lifeSes = "/media/else/status60.png";
const lifeCinc = "/media/else/status50.png";
const lifeCuar = "/media/else/status40.png";
const lifeTrei = "/media/else/status30.png";
const lifeVei = "/media/else/status20.png";
const lifeDiez = "/media/else/status10.png";
const lifeCero = "/media/else/status0.png";
const statusBar = new LifeSoldier(600, 20, 300, 50, lifeCien);
const statusNov = new LifeSoldier(600, 20, 300, 50, lifeNov);
const statusOch = new LifeSoldier(600, 20, 300, 50, lifeOch);
const statusSet = new LifeSoldier(600, 20, 300, 50, lifeSet);
const statusSes = new LifeSoldier(600, 20, 300, 50, lifeSes);
const statusCinc = new LifeSoldier(600, 20, 300, 50, lifeCinc);
const statusCuar = new LifeSoldier(600, 20, 300, 50, lifeCuar);
const statusTrei = new LifeSoldier(600, 20, 300, 50, lifeTrei);
const statusVei = new LifeSoldier(600, 20, 300, 50, lifeVei);
const statusDiez = new LifeSoldier(600, 20, 300, 50, lifeDiez);
const statusCero = new LifeSoldier(600, 20, 300, 50, lifeCero);

//zombie - enemigo
const zombie = "/media/zombie/zombieOne.png"
//tesoros - gana puntos por conseguir la mayor cantidad
const money = "/media/else/bills.png"
//paredes u obstaculos
const boxes = "/media/obstacle1.png";
const box2 = "/media/obstacle2.png";
const box3 = "/media/obstacle3.png";
const box4 = "/media/obstacle4.png";
const wall1 = "/media/pared1.png"
const wallsd = "media/paredesTodas.png"
const wallse = "media/paredLateral.png"
const wallsf = "media/muroFrontal.png"

const obstacle1 = new Obstacle ( 0, 0, 100, 100, boxes);
const obstacle2 = new Obstacle ( 0, 0, 100, 250, box2);
const obstacle3 = new Obstacle ( 0, 0, 100, 100, box3);
const obstacle4 = new Obstacle ( 0, 0, 100, 100, box4);
const walls = new Walls (1550, -40, 940, 600, wallsd );
const wallsb = new Walls (1540, -40, 940, 600, wallse );
const wallsFro = new Walls (1540, -40, 940, 600, wallsf );

const linea = new Lines( 1540, 40, 2, 150)
const linea2 = new Lines( 1560, 380, 2, 120)
const linea3 = new Lines( 1560, 380, 150, 2)
const linea4 = new Lines( 1680, 210, 600, 2)
const linea5 = new Lines( 1850, 230, 2, 150)
const linea6 = new Lines( 1980, 380, 2, 100)
const linea7 = new Lines( 1985, 380, 130, 2)
const linea8 = new Lines( 2350, 250, 70, 2)
const linea9 = new Lines( 2220, 390, 350, 2)
const meta = new Lines( 2450, 410, 150, 150)

//LOGICA DEL JUEGO
//si jugador topa con pared se tiene que mover a otro lado
//generar tesoros a lo largo del laberinto, si consigue la mayor cantidad posible, mayores puntos
//si zombie toca a jugador, jugador muere
//el jugador debe disparar 5 veces a zombie para que muera


// FUNCIONES DE APOYO
function startGame(){
    startScreen.style.display = "none";
    music.playMusic();
   if(intervalId)return;
    intervalId = setInterval(()=>{
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
    
    obstacle1.draw();
    obstacle2.draw();
    obstacle3.draw();
    obstacle4.draw();
    wallsFro.draw();
    meta.draw();
    soldier.draw();
    
    walls.draw(); 
    wallsb.draw(); 
    linea.draw();
    linea2.draw();
    linea3.draw();
    linea4.draw();
    linea5.draw();
    linea6.draw();
    linea7.draw();
    linea8.draw();
    linea9.draw();
    
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
            bullet.shootSound();
            
            bullets.push(bullet);
        };
    }
    
}

function gameOver(){
    const soldierLife = soldier.hp === 0;
    const finEscenario = background.x === -2500 +$canvas.width;
    const endGame = document.querySelector('#endGame');
    const killedSoldier = document.querySelector('#killedSoldier');

    if(finEscenario){
        velocityBack = 0;}
   if(soldierLife){
        killedSoldier.style.display = 'block';
        velocityBack = 0;
        clearInterval(intervalId);
    }else if(soldier.isTouching(meta)){
       endGame.style.display = 'block';
       clearInterval(intervalId);
    }
}

function restartGame(){
    window.location.reload();
}

function generateZombies() {
	if (frames % 120 === 0) {
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
            soldier.moneyWin();
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
    ctxStatus.font = "30px monospace";
    ctxStatus.fillStyle = "orange";
    ctxStatus.fillText( `Zombies muertos:${scoreSoldier}`, 50, 50);
    numZombies.textContent = `${scoreSoldier}`;
}

function healthSoldier(){
    let hpSoldier = soldier.hp ;
    if(hpSoldier >= 900){
        statusBar.draw();
    }else if(hpSoldier >= 800 && hpSoldier < 900){
        statusNov.draw();
    }else if(hpSoldier >= 700 && hpSoldier < 800){
        statusOch.draw();
    }else if(hpSoldier >= 600 && hpSoldier < 700){
        statusSet.draw();
    }else if(hpSoldier >= 500 && hpSoldier < 600){
        statusSes.draw();
    }else if(hpSoldier >= 400 && hpSoldier < 500){
        statusCinc.draw();
    }else if(hpSoldier >= 300 && hpSoldier < 400){
        statusCuar.draw();
    }else if(hpSoldier >= 200 && hpSoldier < 300){
        statusTrei.draw();
    }else if(hpSoldier >= 100 && hpSoldier < 200){
        statusVei.draw();
    }else if(hpSoldier > 0 && hpSoldier < 100){
        statusDiez.draw();
    }else if(hpSoldier === 0){
        statusCero.draw();
    }
    
   
}

function finalScore(){
    let totalNum = document.querySelector("#totalNum");
    let scoreTotal = 0;
    earnedMoney.forEach((bills)=>{
        scoreTotal += 5; 
    })
    diedZombies.forEach((zombieMuerto)=>{
        scoreTotal += 10 //por cada zombie Muerto son 5 puntos en el score
    });

    ctxStatus.font = "30px monospace";
    ctxStatus.fillStyle = "#fff";
    ctxStatus.fillText( `Puntaje:${scoreTotal}`, 400, 50);
    totalNum.textContent = `${scoreTotal}`;
}

function clearCanvas(){
    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    ctxStatus.clearRect(0, 0, $canvas.width, $canvas.height);
}

function checkObstacle(){
    if(soldier.isTouching(obstacle1)){
        soldier.stopWalking();
    }else if(soldier.isTouching(obstacle2)){
        soldier.stopWalking();
    }else if(soldier.isTouching(obstacle3)){
        soldier.stopWalking();
    }else if(soldier.isTouching(obstacle4)){
        soldier.stopWalking();
    }else if(soldier.isTouching(linea)){
        soldier.stopWalking();
    }else if(soldier.isTouching(linea2)){
        soldier.stopWalking();
    }else if(soldier.isTouching(linea3)){
        soldier.stopWalking();
    }else if(soldier.isTouching(linea4)){
        soldier.stopWalking();
    }else if(soldier.isTouching(linea5)){
        soldier.stopWalking();
    }else if(soldier.isTouching(linea6)){
        soldier.stopWalking();
    }else if(soldier.isTouching(linea7)){
        soldier.stopWalking();
    }else if(soldier.isTouching(linea8)){
        soldier.stopWalking();
    }else if(soldier.isTouching(linea9)){
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
