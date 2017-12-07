const config = {
  upgrades : {
    thrust : {
      values : [0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
      name : 'THRUST',
      price : [500, 1000, 2000, 4000, 8000, 16000, 32000],
    },
    fireRate : {
      values : [0.5, 0.375, 0.281, 0.21, 0.15, 0.11],
      name : "FIRE RATE",
      price : [500, 1000, 2000, 4000, 8000, 16000, 32000],
    },
    control : {
      values : [2.5, 2.75, 3, 3.25, 3.50, 4.75, 5],
      name : "CONTROL",
      price : [500, 1000, 2000, 4000, 8000, 16000, 32000],
    },
    velocity : {
      values : [2.5, 3.13, 3.9, 4.8],
      name : "BULLET VELOCITY",
      price : [500, 1000, 2000, 4000, 8000, 16000, 32000],
    },
    range : {
      values : [2, 3, 4, 5, 6, 7, 8, 9],
      name : "BULLET RANGE",
      price : [500, 1000, 2000, 4000, 8000, 16000, 32000],
    },
    lives : {
      price : 5000
    }
  },
  alien : {
    velocity : 1,
    padding : 0.05,
    max : 2,
    mass : 0.25,
    vertices : [[-1,2],[-2,1],[-5,0],[-2,-1],[-1,-2],[1,-2],[2, -1],[5,0],[2,1],[1,2]],
    scale : 0.08,
    collision : Math.pow(2,4),
    score : 200,
    fireRate : 2,
    pivotChance : 2500,
    spawnChance : 1500,
  },
  alienBullet : {
    vertices : [[1,0],[0,1],[-1,0],[0,-1]],
    scale : 0.04,
    velocity : 1.5,
    range : 3,
    mass : 0.01,
    collision : Math.pow(2,5),
  },
  ship : {
    safeClearence : 1,
    radius : 0.35,
    mass : 0.25,
    thrust : 0.5,
    turnSpeed : 0.05,
    stability : 0.005,
    collision : Math.pow(2,1),
    vertices : [[4, -2],[2, 1],[0, 6],[-2, 1],[-4, -2],[-1, -4],[1, -4]],
    unit : 0.04
  },
  bullet : {
    radius : 0.04,
    velocity : 2.5,
    mass : 0.01,
    collision : Math.pow(2,2),
  },
  levels : [],
  asteroid : {
    score : [100, 50, 20, 10, 5, 2, 1],
    velocity : 2,
    angularVelocity : 2,
    minVerts : 10,
    randVerts : 4,
    collision : Math.pow(2,3),
    mass : 3,
    radius : {
      sqaure: 0.028,
      mod : 0.02,
      constant : 0.1,
    },
    stages : 3,
    splits : 3,
    maxSpeed : 0.1,
  },
  world : {
    buffer : 1,
    width : 16,
    height : 9,
    timeStep : 60,
  },
  game : {
    wait : {
      gameOver : 15,
      level : 5,
      store : 30,
    },
    lives : 5,
    spawnX : 16/9, 
    spawnY : 1,
  }
}

module.exports = config;