let canvas = document.querySelector("canvas");
let score = document.querySelector("#score");
let c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;
// colors
let { cos, sin, PI, random, floor, hypot } = Math;
const colors = ['#2185C5', '#7ECEFD', 'orange', '#FFF6E5', '#FF7F66'];
function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)]
};
//images
let invImage = new Image();

function createImage(src) {
  let image = new Image();
  image.src = src;
  return image;
};

var mouse = {
  x: undefined,
  y: undefined
}

// keyboard effects controller
let keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  s: {
    pressed: false,
  }
}
let lastKey = '';
////////////////////////////////////////////////////////////////////////////
// Classes
class Boundary {
  static width = 40;
  static height = 40;
  constructor({ position, image }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
    this.image = image
  }

  draw() {
    // c.fillStyle = 'blue';
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}
// player class
class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
  }

  draw() {
    c.beginPath();
    c.fillStyle = "yellow";
    c.arc(this.position.x, this.position.y, this.radius, 0, 2 * PI);
    c.fill();
    c.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
// pellet class
class Pellet {
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
  }

  draw() {
    c.beginPath();
    c.fillStyle = "white";
    c.arc(this.position.x, this.position.y, this.radius, 0, 2 * PI);
    c.fill();
    c.closePath();
  }
}
// ghost class
class Ghost {
  constructor({ position, velocity, color }) {
    this.position = position;
    this.velocity = velocity;
    this.color = color || 'red';
    this.radius = 15;
    this.prevCollisions = [];
    // this.collLength = this.prevCollisions.length;
  }

  draw() {
    c.beginPath();
    c.fillStyle = this.color;
    c.arc(this.position.x, this.position.y, this.radius, 0, 2 * PI);
    c.fill();
    c.closePath();
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
// end of classes
////////////////////////////////////////////////////////////////////////////
// instantiate 
let pellets = [];
let boundaries = [];
let ghosts = [new Ghost({
  position: {
    x: Boundary.width * 6 + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'red'
})];

let player = new Player({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2
  },
  velocity: {
    x: 0,
    y: 0
  }
})
/////////////////////////////////////////////////////////////////////////
// create map
const map = [
  ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
  ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
  ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
  ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
  ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
  ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

// Additional cases (does not include the power up pellet that's inserted later in the vid)
map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case '-':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeHorizontal.png')
          })
        )
        break
      case '|':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeVertical.png')
          })
        )
        break
      case '1':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner1.png')
          })
        )
        break
      case '2':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner2.png')
          })
        )
        break
      case '3':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner3.png')
          })
        )
        break
      case '4':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner4.png')
          })
        )
        break
      case 'b':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/block.png')
          })
        )
        break
      case '[':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capLeft.png')
          })
        )
        break
      case ']':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capRight.png')
          })
        )
        break
      case '_':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capBottom.png')
          })
        )
        break
      case '^':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capTop.png')
          })
        )
        break
      case '+':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/pipeCross.png')
          })
        )
        break
      case '5':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorTop.png')
          })
        )
        break
      case '6':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorRight.png')
          })
        )
        break
      case '7':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorBottom.png')
          })
        )
        break
      case '8':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/pipeConnectorLeft.png')
          })
        )
        break
      case '.':
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2
            }
          })
        )
        break
    }
  })
})

// end of map creation
/////////////////////////////////////////////////////////////////
//animation loop
let scoreVal = 0;
function checkCollision({ circle, bound }) {
  let padding = Boundary.width / 2 - circle.radius;
  return (
    circle.position.y - circle.radius + circle.velocity.y <= bound.position.y + bound.height && // top collision
    circle.position.x + circle.radius + circle.velocity.x >= bound.position.x && // right collision
    circle.position.y + circle.radius + circle.velocity.y >= bound.position.y && // bottom collision
    circle.position.x - circle.radius + circle.velocity.x <= bound.position.x + bound.width // left collision
  )
};
let p_dxy = 5;
let g_dxy = 5;
let frames = 0;
function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  if (keys.w.pressed && lastKey == 'w') {
    for (let i = 0; i < boundaries.length; i++) {
      if (checkCollision({
        circle: {
          ...player, velocity: {
            x: 0,
            y: -p_dxy
          }
        },
        bound: boundaries[i]
      })
      ) {
        player.velocity.y = 0;
        break;
      }
      else
        player.velocity.y = -p_dxy;
    }
  } else if (keys.a.pressed && lastKey == 'a') {
    for (let i = 0; i < boundaries.length; i++) {
      if (checkCollision({
        circle: {
          ...player, velocity: {
            x: -p_dxy,
            y: 0
          }
        },
        bound: boundaries[i]
      })
      ) {
        player.velocity.x = 0;
        break;
      }
      else
        player.velocity.x = -p_dxy;
    }
  } else if (keys.s.pressed && lastKey == 's') {
    for (let i = 0; i < boundaries.length; i++) {
      if (checkCollision({
        circle: {
          ...player, velocity: {
            x: 0,
            y: p_dxy
          }
        },
        bound: boundaries[i]
      })
      ) {
        player.velocity.y = 0;
        break;
      }
      else
        player.velocity.y = p_dxy;
    }
  } else if (keys.d.pressed && lastKey == 'd') {
    for (let i = 0; i < boundaries.length; i++) {

      if (checkCollision({
        circle: {
          ...player, velocity: {
            x: p_dxy,
            y: 0
          }
        },
        bound: boundaries[i]
      })
      ) {
        player.velocity.x = 0;
        break;
      }
      else
        player.velocity.x = p_dxy;

    }
  }
  // render pellets
  for (let i = pellets.length - 1; i > 0; i--) {
    let pellet = pellets[i];
    pellet.draw();
    if (hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < pellet.radius + player.radius) {
      // if player collid with pellet
      // increment score and remove pellet
      scoreVal += 25;
      score.innerHTML = scoreVal;
      pellets.splice(i, 1);
    }
  };

  boundaries.forEach(bound => {
    bound.draw();
    // when we collide with boundary
    if (checkCollision({
      circle: player,
      bound: bound
    })) {
      player.velocity.x = 0;
      player.velocity.y = 0;
    }
  });

  player.update();
  ghosts.forEach((ghost) => {
    ghost.update();

    let collisions = [];

    boundaries.forEach(bound => {
      let right = false, left = false, up = false, down = false;
      if (!collisions.includes('up') && checkCollision({
          circle: {
            ...ghost, velocity: {
              x: 0,
              y: -g_dxy
            }
          },
          bound: bound
        })
      ) {
        collisions.push('up');
        up == true;
      } else up == true;

      if (!collisions.includes('down') && checkCollision({
          circle: {
            ...ghost, velocity: {
              x: 0,
              y: g_dxy
            }
          },
          bound: bound
        })
      ) {
        collisions.push('down');
        down == true;
      } else down = true;

      if (!collisions.includes('right') && checkCollision({
          circle: {
            ...ghost, velocity: {
              x: g_dxy,
              y: 0
            }
          },
          bound: bound
        })
      ) {
        collisions.push('right');
        right == true;
      } else right == true;

      if (!collisions.includes('left') && checkCollision({
          circle: {
            ...ghost, velocity: {
              x: -g_dxy,
              y: 0
            }
          },
          bound: bound
        })
      ) {
        collisions.push('left');
        left == true;
      } else left == true;


      if (collisions.length > ghost.prevCollisions.length && frames < 5) {
        console.log("frame: ", frames);
        console.log(right, left, up, down);
        console.log("coll: ", collisions);
        console.log("prev: ", ghost.prevCollisions);
        if (JSON.stringify(ghost.prevCollisions) !== JSON.stringify(collisions) && false) {
          
          // console.log("colLen: ", collisions.length, "prevLen: ", ghost.collLength);
          // if (ghost.velocity.x > 0) {
          //     ghost.prevCollisions.push('right');
          // } else if (ghost.velocity.x < 0) {
          //   ghost.prevCollisions.push('left');
          // } else if (ghost.velocity.y > 0) {
          //   ghost.prevCollisions.push('down');
          // } else if (ghost.velocity.y < 0) {
          //   ghost.prevCollisions.push('up');
          // }

          let pathWays = collisions.filter(collision => {
            return !ghost.prevCollisions.includes(collision);
          });
          // if (ghost.velocity.x > 0) {
          //   pathWays.push('right');
          // } else if (ghost.velocity.x < 0) {
          //   pathWays.push('left');
          // } else if (ghost.velocity.y > 0) {
          //   pathWays.push('down');
          // } else if (ghost.velocity.y < 0) {
          //   pathWays.push('up');
          // }
          let direction = pathWays[floor(random() * pathWays.length)];
          console.log("path: ", pathWays);
          console.log("direction: ", direction);

          switch (direction) {
            case 'down':
              ghost.velocity.y = g_dxy;
              ghost.velocity.x = 0;
              break;

            case 'up':
              ghost.velocity.y = -g_dxy;
              ghost.velocity.x = 0;
              break;

            case 'right':
              ghost.velocity.y = 0;
              ghost.velocity.x = g_dxy;
              break;

            case 'left':
              ghost.velocity.y = -g_dxy;
              ghost.velocity.x = 0;
              break;
          }
        }
      }
      ghost.prevCollisions = collisions.splice();
      // console.log(collisions);
    });
  })
  // increment frames
  frames++;
}
animate();
addEventListener('keydown', ({ key }) => {

  switch (key) {
    case 'w':
      //go up
      keys.w.pressed = true
      lastKey = 'w'
      break;
    case 'a':
      //go left
      keys.a.pressed = true
      lastKey = 'a'
      break;

    case 's':
      //go down
      keys.s.pressed = true
      lastKey = 's'
      break;

    case 'd':
      //go right
      keys.d.pressed = true
      lastKey = 'd'
      break;
  }
})

addEventListener('keyup', ({ key }) => {

  switch (key) {
    case 'w':
      //go up
      keys.w.pressed = false
      break;
    case 'a':
      //go left
      keys.a.pressed = false
      break;

    case 's':
      //go down
      keys.s.pressed = false
      break;

    case 'd':
      //go right
      keys.d.pressed = false
      break;
  }
})
