function clientData(o, players, messages, inStore, level){
  var data = {
    ships : o.ships.map(ship => {
      return {
        position : ship.position,
        angle : ship.angle,
        uuid : ship.info.uuid,
        color : ship.info.color
      }
    }),
    asteroids : o.asteroids.map(asteroid => {
      return {
        position : asteroid.position,
        angle : asteroid.angle,
        vertices : asteroid.shapes[0].vertices,
        radius : asteroid.info.radius
      }
    }),
    bullets : o.bullets.map(bullet => {
      return {
        position : bullet.position,
        color : bullet.info.color
      };
    }),
    players : players.map(player => {
      var toReturn = {
        color : player.color,
        score : player.score,
        number : player.number,
        lives : player.lives
      }
      if(inStore){
        toReturn.inGame = player.state.inGame;
        toReturn.upgrades = player.upgrades;
        toReturn.index = player.storeIndex;
      }
      return toReturn;
    }),
    level : level,
    aliens : o.aliens.map(alien => {
      return {
        position : alien.position,
        scale : alien.info.scale
      };
    }),
    alienBullets : o.alienBullets.map(alienBullet => {
      return {
        position : alienBullet.position
      };
    }),
    messages : messages,
    store : inStore,
  }
  
  return(data);
}

module.exports = clientData; 