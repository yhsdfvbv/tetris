function Piece() {
  this.x;
  this.y;
  this.pos = 0;
  this.tetro;
  this.index;
  this.kickData;
  this.gravity = gravityUnit;
  this.lockDelay = 0;
  this.lockDelayLimit = 30;
  this.shiftDelay = 0;
  this.shiftDir;
  this.shiftReleased;
  this.arrDelay = 0;
  this.held = false;
  this.finesse = 0;
  this.dirty = false;
  this.dead = true;
}
/**
 * Removes last active piece, and gets the next active piece from the grab bag.
 */
Piece.prototype.new = function(index) {
  // TODO if no arguments, get next grabbag piece
  this.pos = 0;
  this.tetro = [];
  this.held = false;
  this.finesse = 0;
  this.dirty = true;
  this.dead = false;
  //TODO change this
  landed = false;

  // TODO Do this better. Make clone object func maybe.
  //for property in pieces, this.prop = piece.prop
  this.tetro = pieces[index].tetro;
  this.kickData = pieces[index].kickData;
  this.x = pieces[index].x;
  this.y = pieces[index].y;
  this.index = index;

  // TODO ---------------- snip

  //TODO Do this better. (make grabbag object)
  // Preview.next(); == grabbag.next()
  // Preview.draw();
  //preview.next();

  this.lockDelayLimit = setting['Lock Delay'][settings['Lock Delay']];
  if (settings.Gravity !== 0) {
    this.gravity = gravityArr[settings.Gravity - 1];
  } else if (gametype === 1) { //Marathon
    var level = ~~((lines)/10);
    if (level < 20) {
      this.gravity = [
        1/60, 1/30, 1/25, 1/20, 1/15, 1/12, 1/10, 1/8,  1/6,  1/6,
         1/4,  1/4,  1/3,  1/3,  1/3,  1/2,    1,   1,    2,    3
        ]
        [level];
    } else {
       this.gravity = 20;
       this.lockDelayLimit = ~~(30 * Math.pow(0.93, (Math.pow(level-20, 0.8)))); // magic!
    }
  } else {
    this.gravity = gravityUnit;
  }
  
  // Check for blockout.
  if (!this.moveValid(0, 0, this.tetro)) {
    gameState = 9;
    msg.innerHTML = 'BLOCK OUT!';
    menu(3);
  }
  
  piece.checkFall(); //real 20G !
}
Piece.prototype.rotate = function(direction) {

  // Rotates tetromino.
  var rotated = [];
  if (direction === -1) {
    for (var i = this.tetro.length - 1; i >= 0; i--) {
      rotated[i] = [];
      for (var row = 0; row < this.tetro.length; row++) {
        rotated[i][this.tetro.length - 1 - row] = this.tetro[row][i];
      }
    }
  } else {
    for (var i = 0; i < this.tetro.length; i++) {
      rotated[i] = [];
      for (var row = this.tetro.length - 1; row >= 0; row--) {
        rotated[i][row] = this.tetro[row][this.tetro.length - 1 - i];
      }
    }
  }

  // Goes thorugh kick data until it finds a valid move.
  var curPos = this.pos.mod(4);
  var newPos = (this.pos + direction).mod(4);

  for (var x = 0, len = this.kickData[0].length; x < len; x++) {
    if (this.moveValid(
    this.kickData[curPos][x][0] - this.kickData[newPos][x][0],
    this.kickData[curPos][x][1] - this.kickData[newPos][x][1],
    rotated
    )) {
      this.x += this.kickData[curPos][x][0] -
                this.kickData[newPos][x][0];
      this.y += this.kickData[curPos][x][1] -
                this.kickData[newPos][x][1];
      this.tetro = rotated;
      this.pos = newPos;
      // TODO make 180 rotate count as one or just update finess 180s
      //this.finesse++;
      break;
    }
  }
}
Piece.prototype.checkShift = function() {
  // Shift key pressed event.
  if (keysDown & flags.moveLeft && !(lastKeys & flags.moveLeft)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = -1;
    this.finesse++;
  } else if (keysDown & flags.moveRight && !(lastKeys & flags.moveRight)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 1;
    this.finesse++;
  }
  // Shift key released event.
  if (this.shiftDir === 1 &&
  !(keysDown & flags.moveRight) && lastKeys & flags.moveRight && keysDown & flags.moveLeft) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = -1;
  } else if (this.shiftDir === -1 &&
  !(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft && keysDown & flags.moveRight) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 1;
  } else if (
  !(keysDown & flags.moveRight) && lastKeys & flags.moveRight && keysDown & flags.moveLeft) {
    this.shiftDir = -1;
  } else if (
  !(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft && keysDown & flags.moveRight) {
    this.shiftDir = 1;
  } else if ((!(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft) ||
             (!(keysDown & flags.moveRight) && lastKeys & flags.moveRight)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 0;
  }
  // Handle events
  /* farter */
  // here problem causes it taking 2 frames to move 1 grid even ARR=1
  if (this.shiftDir) {
    // 1. When key pressed instantly move over once.
    if (this.shiftReleased) {
      this.shift(this.shiftDir);
      this.shiftDelay++;
      this.shiftReleased = false;
    // 2. Apply DAS delay
    } else if (this.shiftDelay < settings.DAS) {
      this.shiftDelay++;
    // 3. Once the delay is complete, move over once.
    //     Increment delay so this doesn't run again.
    } else if (this.shiftDelay === settings.DAS && settings.DAS !== 0) {
      this.shift(this.shiftDir);
      if (settings.ARR !== 0) this.shiftDelay++;
    // 4. Apply ARR delay
    } else if (this.arrDelay < settings.ARR) {
      this.arrDelay++;
    // 5. If ARR Delay is full, move piece, and reset delay and repeat.
    /*
    } else if (this.arrDelay === settings.ARR && settings.ARR !== 0) {
    */
      if (this.arrDelay === settings.ARR && settings.ARR !== 0) {
        this.shift(this.shiftDir);
      }
    }
  }
}
Piece.prototype.shift = function(direction) {
  this.arrDelay = 0;
  if (settings.ARR === 0 && this.shiftDelay === settings.DAS) {
    while (true) {
      if (this.moveValid(direction, 0, this.tetro)) {
        this.x += direction;
        /* farter */ //instant das under 20G
        if(this.gravity >= 20) {
          this.checkFall();
        }
        if (flags.moveDown & keysDown) {
          var grav = gravityArr[settings['Soft Drop'] + 1];
          if (grav >= 20) // 20G softdrop vs. 20G das
            this.y += this.getDrop(grav);
          piece.shiftDown();
          //piece.finesse++;
        }
      } else {
        break;
      }
    }
  } else if (this.moveValid(direction, 0, this.tetro)) {
    this.x += direction;
  }
}
Piece.prototype.shiftDown = function() {
  if (this.moveValid(0, 1, this.tetro)) {
    var grav = gravityArr[settings['Soft Drop'] + 1];
    if (grav > 1)
      this.y += this.getDrop(grav);
    else
      this.y += grav;
  }
}
Piece.prototype.hardDrop = function() {
  this.y += this.getDrop(2147483647); /* farter */
  this.lockDelay = this.lockDelayLimit;
}
Piece.prototype.getDrop = function(distance) {
  for (var i = 1; i <= distance; i++) {
    if (!this.moveValid(0, i, this.tetro))
      return i - 1;
  }
  return i - 1;
}
Piece.prototype.hold = function() {
  var temp = hold.piece;
  if (!this.held) {
    if (hold.piece !== void 0) {
      hold.piece = this.index;
      this.new(temp);
    } else {
      hold.piece = this.index;
      this.new(preview.next());
    }
    this.held = true;
    hold.draw();
  }
}
/**
 * Checks if position and orientation passed is valid.
 *  We call it for every action instead of only once a frame in case one
 *  of the actions is still valid, we don't want to block it.
 */
Piece.prototype.moveValid = function(cx, cy, tetro) {
  cx = cx + this.x;
  cy = Math.floor(cy + this.y);

  for (var x = 0; x < tetro.length; x++) {
    for (var y = 0; y < tetro[x].length; y++) {
      if (tetro[x][y] &&
      ((cx + x < 0 || cx + x >= 10 || cy + y >= 22) ||
      stack.grid[cx + x][cy + y])) {
        return false;
      }
    }
  }
  this.lockDelay = 0;
  return true;
}

Piece.prototype.checkFall = function() {
  var grav = this.gravity;
  if (grav > 1)
    this.y += this.getDrop(grav);
  else {
    this.y += grav;
  }
  /* farter */ // rounding problem
  if (Math.abs(this.y - Math.round(this.y))<0.000001)
    this.y = Math.round(this.y);
}
Piece.prototype.update = function() {
  if (this.moveValid(0, 1, this.tetro)) {
    landed = false;
    this.checkFall();
  } else {
    landed = true;
    this.y = Math.floor(this.y);
    if (this.lockDelay >= this.lockDelayLimit) {
      stack.addPiece(this.tetro);
      this.dead = true;
      this.new(preview.next()); // consider move to main update
      /* farter */
      
    } else {
      this.lockDelay++;
    }
  }
}
Piece.prototype.draw = function() {
  if (!this.dead) {
    var a = void 0;
    if (landed) {
      a = this.lockDelay / this.lockDelayLimit;
      a = Math.pow(a,2)*0.5;
    }
    draw(this.tetro, this.x, this.y, activeCtx, void 0, a);
  }
}
Piece.prototype.drawGhost = function() {
  if (!this.dead) {
    activeCtx.globalAlpha = 0.4;
    if (settings.Ghost === 0 && !landed) {
      draw(this.tetro, this.x,
           this.y + this.getDrop(22), activeCtx, 0);
    } else if (settings.Ghost === 1 && !landed) {
      draw(this.tetro, this.x,
           this.y + this.getDrop(22), activeCtx);
    }
    activeCtx.globalAlpha = 1;
  }
}

var piece = new Piece();
