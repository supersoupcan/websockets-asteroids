const express = require('express');

const path = require('path');
const p2 = require('p2');

const cf = require('./config/objects');
const levels = require('./config/levels');

const init = require('./methods/init');
const tools = require('./methods/tools');
const mechanics = require('./methods/mechanics');

const clientData = require('./methods/clientData');
const quadraticEquation = require('solve-quadratic-equation');

//CREATE//
var app = express();
const websocket = require('express-ws')(app);
var wsServer = websocket.getWss('');

var state = {
  isWaiting : true,
  isStarted : false,
  inStore : false,
  inputDelay : false,
}

var players = [];
var messages = {};
var level = -1;

var world = init.world();
var physicsLoop = setInterval(animate, 1000/cf.world.timeStep);

function deleteShip(uuid){
  var ships = world.bodies.filter(body => body.info.type === 'SHIP');
  ships.forEach(ship => {
    if(ship.info.uuid === uuid){
      world.removeBody(ship);
    }
  });
  var index = players.findIndex(player => 
    player.uuid === uuid);
  players.splice(index, 1);
  
  givePosition();
}

function givePosition(){
  players.forEach((player, index) => {
    var position;
    const x = cf.game.spawnX,
          y = cf.game.spawnY;
    switch(index){
      case 0 : {
        position = [-x, y];
        break;
      }
      case 1 : {
        position = [x, y];
        break;
      }
      case 2 : {
        position = [-x, -y];
        break;
      }
      case 3 : {
        position = [x, -y];
        break;
      }
    }
    player.number = index;
    player.position = position;
  })
}

function awardScore(points, uuid){
  var player = players[players.findIndex(player => player.uuid === uuid)];
  player.score += points;
}

function emptyWorld(){
  for(var i = world.bodies.length -1; i >= 0; i--){
    world.removeBody(world.bodies[i]);
  }
}

function upgradeShip(){
  emptyWorld();
  state.inStore = true;
  messages.title = "STORE";
  var wait = 0;
  var timer = setInterval(() => {
    wait += 1;
    if(wait === 1){
      delete messages.title;
      state.inputDelay = false;
    }else if(players.every(player => player.state.isReady || !player.state.inGame)){
      delete messages.title;
      clearInterval(timer);
      state.inStore = false;
      players.forEach(player => {
        player.state.isReady = false;
        player.storeIndex = 0;
        if(player.state.inGame){
          world.addBody(init.ship(player))
        }
      })
      nextLevel();
    }
  }, 1000);
}

function nextLevel(){
  level += 1;
  var wait = cf.game.wait.level;
  messages.title = "Level " + (level + 1);
  var timer = setInterval(() => {
    wait -= 1;
    if(wait === 4){
      delete messages.title;
    }else if(wait < 4 && wait > 0){
      messages.countdown = wait;
    }else if (wait === 0){
      messages.countdown = "GO"
      var positions = [];
      const clearence = 2*tools.getRadius(3, level); //? what are the values supposed to be here
      
      //UNIQUELY CHECK EACH ASTEROID SPACE IS EMPTY, TO PREVENT CLIPPING ISSUES
      for(var i=0; i < levels[level].asteroid.total; i++){
        var newPosition;
        do{
           newPosition = tools.randEdgePosition();
        }
        while(!tools.isEmptySpace(positions, newPosition, clearence));
        positions.push(newPosition);
      }
      
      var asteroids = [];
      positions.forEach(position => {
        asteroids.push(init.asteroid(position, level));
      })
      
      asteroids.forEach(asteroid => {
        world.addBody(asteroid);
      });
    }else if(wait === -1){
      state.isStarted = true;
      clearInterval(timer);
      delete messages.countdown;
    }
  }, 1000)
}

function gameOver(){
  var wait = cf.game.wait.gameOver;
  var timer = setInterval(() => {
    wait -= 1;
    if(wait === cf.game.wait.gameOver - 2){
      messages.title = "GAME OVER";
    }else if(wait === cf.game.wait.gameOver - 4){
      delete messages.title;
    }else if(wait < 10 && wait > 0){
      messages.countdown = wait;
    }else if (wait === 0){
      delete messages.countdown;
      clearInterval(timer);
      emptyWorld();
      level = -1;
      state.isWaiting = true;
    }
  }, 1000)
}

function asteroidHit(asteroid, uuid){
  world.removeBody(asteroid);
  if(uuid){
    awardScore(cf.asteroid.score[asteroid.info.stage-1], uuid);
  }
  
  if (asteroid.info.stage > 1){
    const magnitude = Math.sqrt(
      Math.pow(asteroid.velocity[0],2) 
      + Math.pow(asteroid.velocity[1],2)
    )
    const theta = Math.atan2(asteroid.velocity[1], asteroid.velocity[0]);
    
    for(var s = 0; s < levels[level].asteroid.splits; s++){
      world.addBody(init.asteroidSplit(asteroid, s, magnitude, theta, level));
    }
  }
}

function alienHit(alien, uuid){
  world.removeBody(alien);
  if(uuid){
    awardScore(cf.alien.score, uuid)
  }
}

function upgrade(player){
  var key;
  switch(player.storeIndex){
    case 0 : {
      key = "thrust";
      break;
    }
    case 1 : {
      key = "control";
      break;
    }
    case 2 : {
      key = "velocity";
      break;
    }
    case 3 : {
      key = "range";
      break;
    }
    case 4 : {
      key = "fireRate";
      break;
    }
  }
  if(player.storeIndex <= 4){
    if(player.score >= cf.upgrades[key].price[player.upgrades[key]]){
      player.score -= cf.upgrades[key].price[player.upgrades[key]]
       player.upgrades[key] += 1;
    }
  }else if (player.storeIndex === 5){
    if(player.score >= cf.upgrades.lives.price){
      player.score -= cf.upgrades.live.price;
      player.lives += 1;
    }
  }else if (player.storeIndex === 6){
    player.state.isReady = true;
  }
}

function shipDeath(ship){
  world.removeBody(ship);
  const index = players.findIndex(player => player.uuid === ship.info.uuid);
  players[index].state.isDead = true;
}

world.on('postStep', function(){
  //INPUT LOGIC
  if(state.inStore && !state.inputDelay){
    players.forEach(player => {
      if(world.time > player.nextInput && !player.state.isReady){
        if(player.input.up && player.storeIndex !== 0){
          player.storeIndex -= 1;
          player.nextInput = world.time + 0.1;
        }else if(player.input.down && player.storeIndex !== 6){
          player.storeIndex += 1;
          player.nextInput = world.time + 0.1;
        }else if(player.input.space){
          player.nextInput = world.time + 0.25;
          upgrade(player);
        }
      }
    })
  }else{
    var ships = world.bodies.filter(body => body.info.type === 'SHIP');
    ships.forEach(ship => {
      const index = players.findIndex(player => player.uuid === ship.info.uuid);
      const input = players[index].input;
      const gas = input.up === false ? 0 : 1;
      const turnLeft = input.left === false ? 0 : 1;
      const turnRight = input.right === false ? 0 : 1;
    
      if(input.space 
      && world.time > ship.lastShootTime 
      + cf.upgrades.fireRate.values[ship.upgrades.fireRate]){
        ship.lastShootTime = world.time;
        world.addBody(init.bullet(ship));
      }

      //ACCELERATION
      ship.applyForceLocal([0, cf.upgrades.thrust.values[ship.upgrades.thrust] * gas]);

      //STEERING AND STABILITY FORMULA
      ship.angularVelocity = (turnLeft - turnRight) * cf.upgrades.control.values[ship.upgrades.control];
      
      //if adding sheild later...
      //ship.angularVelocity*(1 - cf.ship.stability) + (turnLeft - turnRight) * cf.ship.turnSpeed;
    });
  }
});

world.on("beginContact", function(evt){
  //COLLISION LOGIC
  var o = tools.organize([evt.bodyA, evt.bodyB]);
  if(o.asteroids.length === 1 && o.bullets.length === 1){
    asteroidHit(o.asteroids[0], o.bullets[0].info.owner);
    world.removeBody(o.bullets[0]);
  }else if(o.asteroids.length === 1 && o.ships.length === 1){
    asteroidHit(o.asteroids[0], o.ships[0].info.uuid);
    shipDeath(o.ships[0]);
  }else if(o.ships.length === 2){
    o.ships.forEach(ship => {
      shipDeath(ship);
    })
  }else if(o.aliens.length === 1 && o.ships.length === 1){
    alienHit(o.aliens[0], o.ships[0].info.uuid);
    shipDeath(o.ships[0]);
  }else if(o.bullets.length === 1 && o.aliens.length === 1){
    alienHit(o.aliens[0], o.bullets[0].info.owner);
    world.removeBody(o.bullets[0]);
  }else if(o.aliens.length === 1 && o.asteroids.length === 1){
    asteroidHit(o.asteroids[0], null);
    alienHit(o.aliens[0], null);
  }else if(o.aliens.length === 2){
    o.aliens.forEach(alien => {
      alienHit(alien, null);
    })
  }else if(o.alienBullets.length === 1 && o.ships.length === 1){
    shipDeath(o.ships[0]);
    world.removeBody(o.alienBullets[0]);
  }else if(o.alienBullets.length === 1 && o.aliens.length === 1){
    alienHit(o.aliens[0], null);
    world.removeBody(o.alienBullets[0]);
  }else if (o.alienBullets.length === 1 && o.asteroids.length === 1){
    asteroidHit(o.asteroids[0], null);
    world.removeBody(o.alienBullets[0]);
  }
})

function animate(){
  world.step(1/cf.world.timeStep);
  world.bodies.forEach(body => {
    body.position = mechanics.warp(body);
  });
  
  var o = tools.organize(world.bodies);
  
  //CHECK OBJECT TIMERS AND PROCESS AI LOGIC
  o.bullets.forEach(bullet => {
    if(bullet.dieTime < world.time){
      world.removeBody(bullet);
    }
  })
  o.alienBullets.forEach(bullet => {
    if(bullet.info.dieTime < world.time){
      world.removeBody(bullet);
    }
  })
  
  o.aliens.forEach(alien => {
    var pivot = Math.floor(Math.random()*cf.alien.pivotChance);
    var targets = [];
    const cfLevel = levels[level].alien;
    if(alien.info.lastShootTime + cfLevel.fireRate <= world.time){
      // aiming script
      o.ships.forEach(ship => {
        // with help from https://www.gamedev.net/forums/topic/393267-intersection-of-velocity-vectors/
        // USE P1 + V1*t = P2 + V2*t
        // REARRANGE to solve for V2
        // SUBSITUTE 1/t for q  
        // SUBSITUTE in V2.V2 = |U2|^2
        // SOLVE for q using parabolic equation
        // SOLVE for V2
        
        const px = ship.position[0] - alien.position[0];
        const py = ship.position[1] - alien.position[1];
        const v1x = alien.velocity[0] - ship.velocity[0];
        const v1y = alien.velocity[1] - ship.velocity[1] ;
        
        //|P1-P2|^2 * q^2 - 2* V1 . (P1-P2) * q + |V1|^2 - (u2)^2 = 0
        // ------q2------   --------q1---------   -------q0----- 
        
        const q2 = Math.pow(px, 2) +  Math.pow(py, 2);
        const q1 = -1*((2*v1x * px) + (2*v1y * py));
        const q0 = (Math.pow(v1x, 2) + Math.pow(v1y, 2)) - Math.pow(cfLevel.bulletVelocity, 2);
        var roots = quadraticEquation(q2, q1, q0);
        
        roots.forEach(root => {
          const time = 1/root;
          if (time >= 0 && time < cfLevel.bulletRange/cfLevel.bulletVelocity){
          const v2x = (px / time) - v1x;
          const v2y = (py / time) - v1y;
          
          const theta = Math.atan2(v2y, v2x);
          targets.push(theta);
          }
        })
      })
      alien.info.lastShootTime = world.time;
      if(targets.length === 0){
        world.addBody(init.alienBullet(alien, null, level));
        alien.info.aim += 1;
      }else{
        const randomTarget = targets[Math.floor(Math.random() * targets.length)];
        world.addBody(init.alienBullet(alien, randomTarget, level));
      }
    }
    if(pivot <= 2){
      switch(pivot){
        case 0 : {
          alien.velocity = [
            cfLevel.shipVelocity*Math.cos(45) * alien.info.direction,
            cfLevel.shipVelocity*Math.sin(45),
          ]
          break;
        }
        case 1 : {
          alien.velocity = [
            cfLevel.shipVelocity*Math.cos(-45) * alien.info.direction,
            cfLevel.shipVelocity*Math.sin(-45)
          ]
          break;
        }
        case 2 : {
          alien.velocity = [
            cfLevel.shipVelocity * alien.info.direction,
            0
          ]
          break;
        }
      }
    }
  })
  
  //WS BROADCAST WORLD STATE DATA TO ClIENT
  var data = clientData(o, players, messages, state.inStore, level);
  wsServer.clients.forEach(client => {
    if (client.readyState === 1){
      client.send(
        JSON.stringify({
          type : "UPDATE",
          payload : data
        })
      );
    }
  })
  
  //SPAWN ALIEN SHIPS
  if(state.isStarted && o.aliens.length < levels[level].alien.max){
    if(Math.floor(Math.random() * levels[level].alien.spawnChance) === 0){
      world.addBody(init.alien(level));
    }
  }
  
  //GAME STATE LOGIC
  var totalLives = 0;
  players.forEach(player => {
    if(player.state.isDead && player.state.inGame && player.lives > 0){
      //ATTEMPT OT SPAWN NEW SHIP
      if(tools.isEmptySpace(
        world.bodies.map(body => body.position),
        player.position,
        cf.ship.safeClearence
      )){
        player.lives -= 1;
        world.addBody(init.ship(player));
        player.state.isDead = false;
      }
    }else if(player.lives === 0 && player.state.isDead && player.state.inGame){
      player.state.inGame = false;
    }
    
    totalLives += player.lives;
  });

  if((state.isWaiting && players.length > 0) && !state.isStarted){
    console.log('starting game');
    players.forEach(player => {
      player.score = 0;
      player.lives = cf.game.lives;
      player.storeIndex = 0;
      player.upgrades = {
        thrust : 0,
        control : 0,
        velocity : 0,
        range : 0,
        fireRate : 0
      };
      player.state.inGame = true;
    });
    state.isWaiting = false;
    level = -1;
    nextLevel();
  }else if(state.isStarted && o.asteroids.length === 0){
    state.isStarted = false;
    upgradeShip();
  }else if(players.every(player => player.state.isDead) && totalLives === 0 && state.isStarted){
    state.isStarted = false;
    gameOver();
  }
}

app.ws('/wss', (ws, req) => {
  ws.send(
    JSON.stringify({
      type : "GET_CONFIG", 
      payload : cf
    })
  );
  console.log('initiating new player');
  players.push(init.player(req.query.uuid));
  givePosition();
  
  ws.on('message', function(msgStr){
    const msg = JSON.parse(msgStr);
    switch(msg.type){
      case "UPDATE" : {
        var playerIndex = players.findIndex(player => {
          return(player.uuid === req.query.uuid);
        });
        players[playerIndex].input = msg.payload;
        break;
      }
    }
  });
  ws.on('close', function(){
    deleteShip(req.query.uuid);
  });
});

//SERVE STATIC FILES//
app.use(express.static(path.join(__dirname, '../client/static')));

//GLOBAL ROUTE SINGLE PAGE APPLICATION
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'));
});

//SERVE API//
module.exports = app;