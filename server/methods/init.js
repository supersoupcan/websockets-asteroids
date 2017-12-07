const p2 = require('p2');
const randomColor = require('randomcolor');

const cf = require('../config/objects');
const levels = require('../config/levels');

const tools = require('./tools');

var init = {
  world : function(){
    var world = new p2.World({
      gravity : [0, 0]
    });
    world.defaultContactMaterial.friction = 0.1;
    return world;
  },
  player : function(uuid){
    return {
      uuid : uuid,
      input : {
        up: false, 
        left : false, 
        space: false, 
        right: false
      },
      color : randomColor({luminosity: 'light'}),
      upgrades : {
        thrust : 0,
        control : 0,
        velocity : 0,
        range : 0,
        fireRate : 0,
      },
      state : {
        inGame : false,
        isReady : false,
        isDead : true
      },
      score : 0,
      lives : 0,
      storeIndex : 0,
      nextInput : 0,
    }
  },
  ship : function(player){
    player.isDead = false;
    var ship = new p2.Body({
      position : player.position,
      mass : cf.ship.mass,
      damping: 0,
      angularDamping: 0
    });
    
    var vertices = cf.ship.vertices.map(vertice => {
      return([vertice[0]*cf.ship.unit, vertice[1] * cf.ship.unit])
    })
    
    ship.addShape(new p2.Convex(
      {
        vertices: vertices,
        collisionGroup : cf.ship.collision,
        collisionMask : 
          cf.asteroid.collision | cf.ship.collision 
          | cf.alien.collision | cf.alienBullet.collision,
        collisionResponse : false
    }));
    
    ship.info = {
      uuid : player.uuid,
      type : 'SHIP',
      color: player.color
    };
    
    ship.lastShootTime = 0;
    ship.upgrades = player.upgrades;
      
    return(ship);
  },
  asteroid : function(position, level){
    var radius = tools.getRadius(levels[level].asteroid.stages, level);
    var vx = tools.rand() * levels[level].asteroid.startVelocity,
        vy = tools.rand() * levels[level].asteroid.startVelocity,
        va = tools.rand() * levels[level].asteroid.startAngularVelocity;
        
    var asteroid = new p2.Body({
      mass : cf.asteroid.mass * 2,
      position,
      velocity : [vx, vy],
      angularVelocity : va,
      damping : 0,
      angularDamping : 0,
    });
    
    asteroid.info = {
      type : "ASTEROID",
      stage : levels[level].asteroid.stages,
      radius : radius
    };
    
    asteroid.addShape(init.asteroidShape(radius));
    return asteroid;
  },
  asteroidSplit : function(asteroid, s, magnitude, theta, level){
    const radius = tools.getRadius(asteroid.info.stage - 1, level);
    const angle = theta + s * (2* Math.PI / cf.asteroid.splits);
      const vx = magnitude * Math.cos(angle);
      const vy = magnitude * Math.sin(angle);
      const va = asteroid.angularVelocity;
      const x = asteroid.position[0] + Math.cos(angle)*radius;
      const y = asteroid.position[1] + Math.sin(angle)*radius;
      
      var asteroidBody = new p2.Body({
        mass : cf.asteroid.mass * (asteroid.info.stage - 1),
        position : [x, y],
        velocity : [vx, vy],
        angularVelocity : va,
        damping : 0,
        angularDamping : 0,
      });
      
      asteroidBody.info = {
        type : "ASTEROID",
        stage : asteroid.info.stage - 1,
        radius : radius
      };
      
      asteroidBody.addShape(init.asteroidShape(radius));
      
      return asteroidBody;
  },
  asteroidShape : function(radius){
    var slices = [];
    var verts = [];
    
    const numberOfVerts = 
      cf.asteroid.minVerts 
      + Math.floor(Math.random() * cf.asteroid.randVerts);
    
    const piDiv = 2 * Math.PI / numberOfVerts;
    
    for (var a = 0; a < numberOfVerts; a++){
      slices.push(Math.random() * piDiv + piDiv * a);
    }
    
    slices.forEach(slice => {
      verts.push([
        Math.cos(slice)*radius,
        Math.sin(slice)*radius
      ]);
    });
    
    var shape = new p2.Convex({
      vertices : verts,
      collisionGroup : cf.asteroid.collision,
      collisionMask : 
        cf.ship.collision | cf.asteroid.collision 
        | cf.bullet.collision | cf.alien.collision
        | cf.alienBullet.collision
    });
    
    return shape;
  },
  bullet : function(ship){
    const angle = ship.angle + Math.PI /2;
    var bullet = new p2.Body({
    angularDamping: 0,
    mass : cf.bullet.mass,
    position : [
      cf.ship.radius * Math.cos(angle) + ship.position[0],
      cf.ship.radius * Math.sin(angle) + ship.position[1]
    ],
    damping : 0,
    velocity : [
      cf.upgrades.velocity.values[ship.upgrades.velocity] * Math.cos(angle) + ship.velocity[0],  
      cf.upgrades.velocity.values[ship.upgrades.velocity] * Math.sin(angle) + ship.velocity[1]
      ]
    });
  
    var bulletShape = new p2.Circle({
      radius : cf.bullet.radius,
      collisionGroup : cf.bullet.collision,
      collisionMask : cf.asteroid.collision | cf.alien.collision,
      collisionResponse : false,
    });
  
    bullet.addShape(bulletShape);
    
    bullet.info = {
      type : "BULLET",
      owner : ship.info.uuid,
      color : ship.info.color
    };
    
    const bulletLifeTime = cf.upgrades.range.values[ship.upgrades.range] / 
      cf.upgrades.velocity.values[ship.upgrades.velocity];
      
    bullet.dieTime = ship.lastShootTime + bulletLifeTime;
    
    return bullet;
  },
  alien : function(level){
    const xPosition  = tools.coinFlip() ? cf.world.width/2 : -cf.world.width/2;
    const yPosition = (cf.world.height/2) * tools.rand();
    const alienLvl = levels[level].alien;
    var alien = new p2.Body({
      position : [xPosition, yPosition],
      mass : cf.alien.mass,
      damping: 0,
      angularDamping: 0,
      velocity : [
        xPosition > 0 
        ? alienLvl.shipVelocity : -alienLvl.shipVelocity,
        0,
      ],
    })
  
    var vertices = cf.alien.vertices.map(vertice => {
      return([vertice[0]*alienLvl.scale, vertice[1] * alienLvl.scale])
    })
    
    alien.addShape(new p2.Convex({
      vertices : vertices,
      collisionGroup : cf.alien.collision,
      collisionMask : 
        cf.asteroid.collision | cf.ship.collision 
        | cf.bullet.collision | cf.alien.collision
        | cf.alienBullet.collision,
      collisionResponse : false
    }))
    
    alien.info = {
      type : 'ALIEN',
      scale : alienLvl.scale,
      direction: xPosition > 0 ? 1 : -1,
      lastShootTime : 0,
      aim : Math.floor(Math.random() * 4)
    }
    return alien;
  },
  alienBullet : function(alien, target, level){
    const alienLvl = levels[level].alien;
    var aim;
    if(target){
      aim = target;
    }else{
      aim = ((alien.info.aim % 4) * (2 * Math.PI/4)) + (2 * Math.PI / 8);
    }
    
    var alienBullet = new p2.Body({
      angularDamping: 0,
      damping : 0,
      mass : cf.alienBullet.mass,
      position : [
        alien.position[0] + Math.cos(aim) * alien.info.scale*4,
        alien.position[1] + Math.sin(aim) * alien.info.scale*4
      ],
      velocity : [
        (Math.cos(aim) * alienLvl.bulletVelocity) + alien.velocity[0],
        (Math.sin(aim) * alienLvl.bulletVelocity) + alien.velocity[1]
      ]
    })
  
    var vertices = cf.alienBullet.vertices.map(vertice => {
      return([vertice[0]*cf.alienBullet.scale, vertice[1] * cf.alienBullet.scale])
    })
    
    var alienBulletShape = new p2.Convex({
      vertices : vertices,
      collisionGroup : cf.alienBullet.collision,
      collisionMask : cf.asteroid.collision | cf.ship.collision | cf.alien.collision,
      collisionResponse : false,
    })
    
    alienBullet.addShape(alienBulletShape);
    const lifeTime = alienLvl.bulletRange/alienLvl.bulletVelocity;
    
    alienBullet.info = {
      type : "ALIENBULLET",
      dieTime : alien.info.lastShootTime + lifeTime
    }
    return alienBullet;
  }
};

module.exports = init;

