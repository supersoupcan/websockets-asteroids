const cf = require('../config/objects');
const levels = require('../config/levels');

var tools = {
  rand : function(){
    return Math.random()-0.5;
  },
  coinFlip : function(){
    return Math.floor(Math.random()*2)
  },
  isEmptySpace : function(positions, posToCheck, clearence){
    return positions.every(position => {
      const xSafe = Math.abs(posToCheck[0] - position[0]) > clearence;
      const ySafe = Math.abs(posToCheck[1] - position[1]) > clearence;
      return (xSafe || ySafe);
    })
  },
  randEdgePosition : function(){
    var x, y;
    if(Boolean(tools.coinFlip())){
      x = Boolean(tools.coinFlip()) ? 
        (cf.world.width/2) - cf.world.buffer + (cf.world.buffer*tools.rand()) :
        (cf.world.width/-2) + cf.world.buffer + (cf.world.buffer*tools.rand());
      y = tools.rand() * cf.world.height;
    }else{
      y = Boolean(tools.coinFlip()) ? 
        (cf.world.height/2) - cf.world.buffer + (cf.world.buffer*tools.rand()) : 
        (cf.world.height/-2) + cf.world.buffer; (cf.world.buffer*tools.rand());
      x = tools.rand() * cf.world.width;
    }
    return [x, y];
  },
  getRadius : function(stage, level){
    const radiusCf = levels[level].asteroid.radius;
    const radius = radiusCf[2]*Math.pow(stage, 2) + radiusCf[1]*stage + radiusCf[0];
    return radius;
  },
  organize : function(arr){
    var organized = {
      asteroids : [],
      ships : [],
      bullets : [],
      aliens : [],
      alienBullets : []
    };
    
    arr.forEach(body => {
      switch(body.info.type){
        case "ASTEROID" : {
          organized.asteroids.push(body);
          break;
        }
        case "SHIP" : {
          organized.ships.push(body);
          break;
        }
        case "BULLET" : {
          organized.bullets.push(body);
          break;
        }
        case "ALIEN" : {
          organized.aliens.push(body);
          break;
        }
        case "ALIENBULLET" : {
          organized.alienBullets.push(body);
          break;
        }
      }
    })
    return organized;
  }
}

module.exports = tools;