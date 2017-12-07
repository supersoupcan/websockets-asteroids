import React, { Component } from 'react';

export default class Game extends Component {
  constructor(props){
    super(props);
    this.state = {
      up : false,
      space : false,
      right : false,
      left : false,
      down : false,
      ticker : null,
      skins : [],
    },
    this.keyInput = this.keyInput.bind(this),
    this.updateServer = this.updateServer.bind(this)
  }
  
  componentWillMount(){
    window.addEventListener("keydown", (event) => this.keyInput(event, true));
    window.addEventListener("keyup", (event) => this.keyInput(event, false));
    var ticker = setInterval(this.updateServer, 1000/60);
    
    this.setState({
      ticker : ticker
    });
  }
  
  componentWillUnMount(){
    window.removeEventListener("keydown", this.keyInput);
    window.removeEventListener("keyup", this.keyInput);
    clearInterval(this.ticker);
  }
  
  componentDidMount(){
    //Load images into state;
    var src = [
      './images/0.png','./images/1.png', 
      './images/2.png', './images/4.png' 
    ]
    var images = [];
    var imagesLoaded = 0;
    
    for(var i=0; i < src.length; i++){
      var img = new window.Image();
      img.src = src[i];
      img.onload = () => {
        imagesLoaded += 1;
        if(imagesLoaded === src.length){
          this.setState({
            skins : images
          })
        }
      };
      images.push(img);
    }
    
    
    if(this.props.cf && this.props.game){
      this.updateCanvas();
    }
  }
  
  componentWillReceiveProps(){
    if(this.props.cf && this.props.game){
      this.updateCanvas();
    }
  }
  
  updateServer(){
    this.props.update({
      down : this.state.down,
      up : this.state.up,
      left : this.state.left,
      right : this.state.right,
      space : this.state.space,
    });
  }
  
  keyInput(event, bool){
    switch (event.keyCode) {
      case 65: // A
        this.setState({left : bool});
        break;
      case 87: // W
        this.setState({up : bool});
        break;
      case 83 : // S
        this.setState({down : bool});
        break;
      case 68: // D
        this.setState({right : bool});
        break;
      case 32: // SPACE
        this.setState({space : bool});
        break;
    }
  }
  
  updateCanvas(){
    function drawShip(ship){
      const x = ship.position[0];
      const y = ship.position[1];
      const angle = ship.angle
      const data = p.cf.ship.vertices;
      const radius = p.cf.ship.radius;
      
      ctx.save();
      
      ctx.translate(x,y); // Translate to the ship center
      ctx.rotate(angle); // Rotate to ship orientation
      
      ctx.beginPath();
      var vertices = p.cf.ship.vertices.map(vertice => {
        return([vertice[0]*p.cf.ship.unit, vertice[1] * p.cf.ship.unit])
      })
      
      vertices.forEach((vertex, index) => {
        if(index === 0){
          ctx.moveTo(vertex[0], vertex[1]);
        }else{
          ctx.lineTo(vertex[0], vertex[1]);
        }
      })
      
      ctx.closePath();
      ctx.fillStyle = ship.color;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(0,0.1);
      ctx.lineTo(-0.05,-0.05);
      ctx.lineTo(0, -0.1);
      ctx.lineTo(0.05,-0.05);
      ctx.lineTo(0,0.1);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.closePath();
      
      ctx.restore();
    }
 
    function drawAlien(alien){
      const x = alien.position[0];
      const y = alien.position[1];
      
      var vertices = p.cf.alien.vertices.map(vertice => {
        return([vertice[0]*alien.scale, vertice[1] * alien.scale]);
      });
      
      ctx.save();
      ctx.translate(x,y);
      ctx.beginPath();
      ctx.fillStyle = "white";
      vertices.forEach((vertex, index) => {
        if(index === 0){
          ctx.moveTo(vertex[0], vertex[1]);
        }else{
          ctx.lineTo(vertex[0], vertex[1]);             
        }
      })
      
      ctx.closePath();
      ctx.fill()
      
      ctx.beginPath();
      ctx.arc(0, 0, alien.scale/2, 0, 2*Math.PI);
      ctx.arc(1.5 * alien.scale, 0, alien.scale/3, 0, 2*Math.PI);
      ctx.arc(-1.5 * alien.scale, 0, alien.scale/3, 0, 2*Math.PI);
      ctx.closePath();
      ctx.fillStyle = "black";
      ctx.fill();
      
      ctx.restore();
    }
    
    function drawAlienBullet(alienBullet){
      const x = alienBullet.position[0];
      const y = alienBullet.position[1];
      
      var vertices = p.cf.alienBullet.vertices.map(vertice => {
        return([vertice[0]*p.cf.alienBullet.scale, vertice[1] * p.cf.alienBullet.scale]);
      });
      
      ctx.save();
      ctx.translate(x,y);
      
      ctx.beginPath();
      
      vertices.forEach((vertex, index) => {
        if(index === 0){
          ctx.moveTo(vertex[0], vertex[1]);
        }else{
          ctx.lineTo(vertex[0], vertex[1]);             
        }
      });
      
      ctx.closePath();
      
      ctx.fillStyle = "red";
      ctx.fill();
      
      ctx.restore();
    }
    
    function drawAsteroid(asteroid){
      const x = asteroid.position[0];
      const y = asteroid.position[1];
      const angle = asteroid.angle;
      const data = asteroid.vertices;
      
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(angle);
      ctx.beginPath();
      
      data.forEach((vertex, index) => {
        if(index === 0){
          ctx.moveTo(vertex[0], vertex[1]);
        }else{
          ctx.lineTo(vertex[0], vertex[1]);             
        }
      });
      ctx.clip();
      ctx.drawImage(s.skins[p.game.level],
        -asteroid.radius, -asteroid.radius, 
        asteroid.radius*2, asteroid.radius*2
      );
      ctx.closePath();
      ctx.restore();
    }
    
    function drawBullet(bullet){
      const x = bullet.position[0];
      const y = bullet.position[1];
      
      ctx.fillStyle = bullet.color;
      ctx.beginPath();
      ctx.arc(x, y, p.cf.bullet.radius, 0, 2*Math.PI);
      ctx.closePath();
      ctx.fill();
    }
    
    function drawBounds(){
      ctx.beginPath();
      
      //ctx.rect(-world.width/2, -world.height/2, 16, 9);
      ctx.fillStyle = "black";
      ctx.fill();
      
      //redo so that edges are always drawn as black;
      ctx.moveTo(-world.width/2, -world.height/2);
      ctx.lineTo(-world.width/2,  world.height/2);
      ctx.lineTo( world.width/2,  world.height/2);
      ctx.lineTo( world.width/2, -world.height/2);
      ctx.lineTo(-world.width/2, -world.height/2);
      ctx.closePath();
      ctx.stroke();
        
    }
    
    function renderStore(){
      if(p.game.store){
        console.log('inStore');
        p.game.players.forEach(player => {
            if (player.inGame){
            var xValues, yValues;
            switch(player.number){
              case 0 : {
                xValues = [-4.5, -4, -3.5];
                yValues = [-3, -2.5];
                break;
              }
              case 1 : {
                xValues = [3.5, 4, 4.5];
                yValues = [-3, -2.5];
                break;
              }
              case 2 : {
                xValues = [-4.5, -4, -3.5];
                yValues = [1.5, 2];
                break;
              }
              case 3 : {
                xValues = [3.5, 4, 4.5];
                yValues = [1.5, 2];
                break;
              }
            }
            ctx.textAlign = 'center';
            ctx.strokeStyle = player.color;
            ctx.fillStyle = player.color;
            ctx.font = "0.3px Anton";
            //ctx.rect(x*2, y*1, x*4, y*2.5);
            ctx.fillText('$' + player.score, xValues[1], yValues[0]);
            ctx.font = "0.2px Anton";
            var upgrades = Object.keys(player.upgrades);
            upgrades.forEach((upgrade, index) => {
              
            if(player.index === index){
              ctx.fillStyle = "white";
            }else{
              ctx.fillStyle = player.color;
            }
              ctx.textAlign = 'right';
              ctx.fillText(
                "UPGRADE " + 
                p.cf.upgrades[upgrade].name, xValues[0], yValues[1] + index*0.3
              );
              ctx.textAlign = 'center';
              ctx.fillText(
                player.upgrades[upgrade] + " => " + 
                (player.upgrades[upgrade] + 1), 
                xValues[1], yValues[1] + index*0.3
              );
              ctx.textAlign = 'left';
              ctx.fillText(
                "$" + p.cf.upgrades[upgrade].price[player.upgrades[upgrade]], 
                xValues[2], yValues[1] + index*0.3
              );
            });
            
            if(player.index === upgrades.length){
              ctx.fillStyle = "white";
            }else{
              ctx.fillStyle = player.color;
            }
            
            ctx.textAlign = 'right';
            ctx.fillText("EXTRA SHIP", xValues[0], yValues[1] + upgrades.length*0.3);
            ctx.textAlign = 'center';
            ctx.fillText(player.lives + " => " + (player.lives + 1), xValues[1], yValues[1] + upgrades.length*0.3);
            ctx.textAlign = 'left';
            ctx.fillText("$5000", xValues[2], yValues[1] + upgrades.length*0.3);
            
            if(player.index === upgrades.length + 1){
              ctx.fillStyle = "white";
            }else{
              ctx.fillStyle = player.color;
            }
            
            ctx.font = "0.3px Anton";
            ctx.textAlign = 'center';
            ctx.fillText("READY UP", xValues[1], yValues[1] + (upgrades.length + 1.5)*0.3);
          }
        })
        ctx.restore();
      }
    }
    
    function drawUI(player){
      var x, y, padding, shipx, shipxMod, shipy;
      
      ctx.strokeStyle = "white";
      
      padding = 0.05;
      var vertices = p.cf.ship.vertices.map(vertice => {
        return([vertice[0]*0.03, vertice[1] * 0.03])
      })
      
      switch(player.number){
        case 0 : {
          x = world.width/-2 + padding ;
          y = world.height/-2 + padding + 0.30;
          shipx = 0.125;
          shipxMod = 0.3;
          shipy = 0.18;
          ctx.textAlign = "left";
          break;
        }
        case 1 : {
          x = world.width/2 - padding;
          y = world.height/-2 + padding + 0.30;
          shipx = -0.125;
          shipxMod = -0.3;
          shipy = 0.18;
          ctx.textAlign = "right";
          break;
        }
        case 2 : {
          x = world.width/-2 + padding;
          y = world.height/2 - padding;
          shipx = 0.125;
          shipxMod = 0.3;
          shipy = -0.5;
          ctx.textAlign = "left";
          
          break;
        }
        case 3 : {
          x = world.width/2 - padding;
          y = world.height/2 - padding;
          shipx = -0.125;
          shipxMod = -0.3;
          shipy = -0.5;
          ctx.textAlign = "right";
          break;
        }
      }
      
      ctx.fillStyle = player.color;
      
      for(var i = 0; i < player.lives; i++){
        ctx.save();
        ctx.translate(x + shipx + i*shipxMod, y + shipy);
        ctx.beginPath();
      
        vertices.forEach((vertex, index) => {
          if(index === 0){
            ctx.moveTo(vertex[0], vertex[1]);
          }else{
            ctx.lineTo(vertex[0], vertex[1]);
          }
        })
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.fillText(player.score, x, y);
    }
      
    const p = this.props;
    const s = this.state;
    const world = p.cf.world;
    
    var zoom = p.height / world.height;
    if (p.width / world.height < zoom) zoom = p.width / world.width;
    
    const ctx = this.refs.canvas.getContext('2d');
    ctx.lineWidth = 2/zoom;
    ctx.strokeStyle = ctx.fillStyle = 'white';
    ctx.save();
    
    ctx.clearRect(0,0, p.width, p.height);
    ctx.translate(p.width/2, p.height/2);
    ctx.scale(zoom, -zoom);
    
    p.game.asteroids.forEach(asteroid => {
      drawAsteroid(asteroid);
    })
    
    p.game.bullets.forEach(bullet => {
      drawBullet(bullet);
    })
      
    p.game.ships.forEach((ship, index) => {
      drawShip(ship, index);
    })
    
    p.game.aliens.forEach(alien => {
      drawAlien(alien);
    })
    
    p.game.alienBullets.forEach(alienBullet => {
      drawAlienBullet(alienBullet);
    })
    

    //DRAW VARIOUS UI ELEMENTS
    ctx.scale(1, -1);
    
    ctx.globalAlpha=0.9;
    ctx.font = "0.3px Anton";
    
    p.game.players.forEach(player => {
      drawUI(player);
    })
    
    drawBounds();
    
    ctx.textAlign = "center";
    ctx.textBaseline="middle";
    ctx.fillStyle = "white";

    
    if(p.game.messages.hasOwnProperty('title')){
      ctx.font = '0.75px Anton';
      ctx.fillText(p.game.messages.title, 0, -2.25);
    }
    
    if(p.game.messages.hasOwnProperty('countdown')){
      ctx.font = "0.75px Anton";
      ctx.fillText(p.game.messages.countdown, 0, 0);
    }
    
    renderStore();
    ctx.restore();
  }
  
  render(){
    return(
      <canvas 
        ref='canvas' 
        width={this.props.width} 
        height={this.props.height} 
      />
    )
  }
}