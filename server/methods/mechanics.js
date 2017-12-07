const cf = require('../config/objects'); 

var mechanics = {
  warp : function(body){
    var  p = body.position;
    if(p[0] >  cf.world.width /2) p[0] = -cf.world.width/2;
    if(p[1] >  cf.world.height /2) p[1] = -cf.world.height/2;
    if(p[0] < -cf.world.width /2) p[0] =  cf.world.width/2;
    if(p[1] < -cf.world.height /2) p[1] =  cf.world.height/2;
    return(p)
  },
}

module.exports = mechanics;