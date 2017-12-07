const levels = [
  {
    asteroid : {
      total : 3,
      stages : 3,
      splits : 3,
      splitBuffer : 0,
      startVelocity : 1,
      startAngularVelocity : 0.5,
      radius : [0.1, 0.02, 0.028],
    },
    alien : {
      max : 2,
      spawnChance : 1500,
      pivotChance : 2500,
      scale : 0.1,
      fireRate : 2,
      shipVelocity : 0.5,
      bulletVelocity : 0.6,
      bulletRange : 3,
    }
  },
  {
    asteroid : {
      total : 1,
      stages : 4,
      splits : 3,
      splitBuffer : 0,
      startVelocity : 2,
      startAngularVelocity : 0.75,
      radius : [0.1, 0.03, 0.020],
    },
    alien : {
      max : 2,
      spawnChance : 1500,
      pivotChance : 2500,
      scale : 0.09,
      fireRate : 1.5,
      shipVelocity : 0.6,
      bulletVelocity : 0.7,
      bulletRange : 3,
    }
  },
  {
    asteroid : {
      total : 5,
      stages : 2,
      splits : 8,
      splitBuffer : 0,
      startVelocity : 3,
      startAngularVelocity : 0.5,
      radius : [0.2, 0.02, 0.02],
    },
    alien : {
      max : 0,
      spawnChance : 1500,
      pivotChance : 2500,
      scale : 0.1,
      fireRate : 2,
      shipVelocity : 0.5,
      bulletVelocity : 0.6,
      bulletRange : 3,
    }
  },
  {
    asteroid : {
      total : 5,
      stages : 2,
      splits : 8,
      splitBuffer : 0,
      startVelocity : 2,
      startAngularVelocity : 0.5,
      radius : [0.2, 0.02, 0.02],
    },
    alien : {
      max : 10,
      spawnChance : 500,
      pivotChance : 1000,
      scale : 0.08,
      fireRate : 2,
      shipVelocity : 0.8,
      bulletVelocity : 1,
      bulletRange : 3,
    }
  },
]

module.exports = levels;