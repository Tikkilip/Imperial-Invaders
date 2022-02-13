//canvas settings
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

//scoreboard
const scoreElement = document.getElementById("scoreElement");

//sounds tuning
const music = document.getElementById("music");
music.volume = 0.2;

const tieShoot = document.getElementById("tie_shoot");
tieShoot.volume = 0.2;

const xWingShoot = document.getElementById("x-wing_shoot");
xWingShoot.volume = 0.2;

const xWingExplode = document.getElementById("x-wing_explode");
xWingExplode.volume = 0.4;

//start btn
const startMenu = document.getElementById("start_menu");
const startBtn = document.getElementById("start_btn");
startBtn.addEventListener("click", () => {
  startMenu.style.display = "none";
  animate();
});

//game over menu
const gameOverMenu = document.getElementById("game-over_menu");
const playAgainBtn = document.getElementById("play-again_btn");
const finalScore = document.getElementById("final_score");
playAgainBtn.addEventListener("click", () => {
  window.location.reload();
});

//classes
class Player {
  constructor() {
    (this.velocity = {
      x: 0,
      y: 0,
    }),
      (this.rotation = 0),
      (this.opacity = 1);

    const image = new Image();
    image.src = "./img/x-wing.png";
    image.onload = () => {
      const scale = 0.03;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20,
      };
    };
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(player.position.x + player.width / 2, player.position.y + player.height / 2);

    ctx.rotate(this.rotation);

    ctx.translate(-player.position.x - player.width / 2, -player.position.y - player.height / 2);

    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);

    ctx.restore();
  }

  update() {
    if (this.image) {
      this.draw();
      this.position.x += this.velocity.x;
    }
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 4;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#66ff00";
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;

    this.width = 3;
    this.height = 10;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Particle {
  constructor({ position, velocity, radius, color, fades }) {
    this.position = position;
    this.velocity = velocity;

    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.fades) {
      this.opacity -= 0.01;
    }
  }
}

class Invader {
  constructor({ position }) {
    (this.velocity = {
      x: 0,
      y: 0,
    }),
      (this.position = {
        x: position.x,
        y: position.y,
      });

    const image = new Image();
    image.src = "./img/tie-fighter.png";
    image.onload = () => {
      const scale = 0.07;
      this.image = image;
      this.width = image.width * scale;
      this.height = image.height * scale;
      this.position = {
        x: position.x,
        y: position.y,
      };
    };
  }

  draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
  }

  update({ velocity }) {
    if (this.image) {
      this.draw();
      this.position.x += velocity.x;
      this.position.y += velocity.y;
    }
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height / 2,
        },
        velocity: {
          x: 0,
          y: 5,
        },
      })
    );
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };
    this.velocity = {
      x: 3,
      y: 0,
    };
    this.invaders = [];

    const columns = Math.floor(Math.random() * 10 + 5);
    const rows = Math.floor(Math.random() * 5 + 2);

    this.width = columns * 30;

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
          new Invader({
            position: {
              x: x * 30,
              y: y * 30,
            },
          })
        );
      }
    }
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 30;
    }
  }
}

//variables, arrays and objects for data holding
const player = new Player();
const projectiles = [];
const grids = [new Grid()];
const invaderProjectiles = [];
const pacrticles = [];
const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  space: {
    pressed: false,
  },
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let game = {
  over: false,
  active: true,
};
let score = 0;

//particles func
for (let i = 0; i < 100; i++) {
  pacrticles.push(
    new Particle({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
      },
      velocity: {
        x: 0,
        y: 0.3,
      },
      radius: Math.random() * 2,
      color: "white",
    })
  );
}

function createParticles({ object, color, fades }) {
  for (let i = 0; i < 15; i++) {
    pacrticles.push(
      new Particle({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 3,
        color: color || "orange",
        fades,
      })
    );
  }
}

//animate func
function animate() {
  if (!game.active) {
    gameOverMenu.style.display = "block";
    finalScore.innerHTML = `Your score: ${score}`;
    return;
  }
  music.play();
  requestAnimationFrame(animate);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
      }, 0);
    } else {
      invaderProjectile.update();
    }

    //projectile hits player
    if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height - 50 && invaderProjectile.position.x + invaderProjectile.width >= player.position.x && invaderProjectile.position.x <= player.position.x + player.width) {
      xWingExplode.play();
      navigator.vibrate(50);

      setTimeout(() => {
        invaderProjectiles.splice(index, 1);
        player.opacity = 0;
        game.over = true;
      }, 0);
      setTimeout(() => {
        game.active = false;
        music.pause();
        music.currentTime = 0;
      }, 2000);
      createParticles({
        object: player,
        color: "white",
        fades: true,
      });
    }
  });

  pacrticles.forEach((particle, i) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width;
      particle.position.y = -particle.radius;
    }

    if (particle.opacity <= 0) {
      setTimeout(() => {
        pacrticles.splice(i, 1);
      }, 0);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    } else {
      projectile.update();
    }
  });

  grids.forEach((grid, gridIndex) => {
    grid.update();

    //spawning projectiles
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles);
      tieShoot.play();
    }

    grid.invaders.forEach((invader, i) => {
      invader.update({ velocity: grid.velocity });

      //projectiles hit enemy
      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find((invader2) => invader2 === invader);
            const projectileFound = projectiles.find((projectile2) => projectile2 === projectile);

            //remove invader and a projectile
            if (invaderFound && projectileFound) {
              score += 100;
              scoreElement.innerHTML = score;

              createParticles({
                object: invader,
                fades: true,
              });

              grid.invaders.splice(i, 1);
              projectiles.splice(j, 1);

              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1];

                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                grid.position.x = firstInvader.position.x;
              } else {
                grids.splice(gridIndex, 1);
              }
            }
          }, 0);
        }
      });
    });
  });

  if (keys.a.pressed && player.position.x >= 0) {
    player.velocity.x = -7;
    player.rotation = -0.15;
  } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
    player.velocity.x = 5;
    player.rotation = 0.15;
  } else {
    player.velocity.x = 0;
    player.rotation = 0;
  }

  //spawning enemies
  if (frames % randomInterval === 0) {
    grids.push(new Grid());
    randomInterval = Math.floor(Math.random() * 500 + 500);
    frames = 0;
  }

  frames++;
}

//event listeners for movement
addEventListener("keydown", ({ key }) => {
  if (game.over) return;
  switch (key) {
    case "a":
      keys.a.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
    case " ":
      projectiles.push(
        new Projectile({
          position: {
            x: player.position.x + player.width / 2,
            y: player.position.y,
          },
          velocity: {
            x: 0,
            y: -5,
          },
        })
      );

      xWingShoot.play();
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      keys.a.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
    case " ":
      break;
  }
});

//button coltrols tuning
const leftBtn = document.getElementById("left_btn");
const shootBtn = document.getElementById("shooot_btn");
const rightBtn = document.getElementById("right_btn");

leftBtn.addEventListener("touchstart", () => {
  if (game.over) return;
  keys.a.pressed = true;
});
leftBtn.addEventListener("touchend", () => {
  keys.a.pressed = false;
});

rightBtn.addEventListener("touchstart", () => {
  if (game.over) return;
  keys.d.pressed = true;
});
rightBtn.addEventListener("touchend", () => {
  keys.d.pressed = false;
});

shootBtn.addEventListener("touchstart", () => {
  if (game.over) return;
  projectiles.push(
    new Projectile({
      position: {
        x: player.position.x + player.width / 2,
        y: player.position.y,
      },
      velocity: {
        x: 0,
        y: -5,
      },
    })
  );
});
