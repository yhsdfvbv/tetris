function Stack() {
  //this.grid;
}
/**
 * Creates a matrix for the playfield.
 */
Stack.prototype.new = function(x, y, hy) {
  var cells = new Array(x);
  for (var i = 0; i < x; i++) {
    cells[i] = new Array(hy + y);
  }
  this.width = x;
  this.height = hy + y;
  this.hiddenHeight = hy;
  this.grid = cells;
}
/**
 * Adds tetro to the stack, and clears lines if they fill up.
 */
Stack.prototype.addPiece = function(tetro) {
  var lineClear = 0;
  var isSpin = false;
  var once = false;

  // spin check
  if (
    !piece.moveValid(-1, 0, piece.tetro) &&
    !piece.moveValid( 1, 0, piece.tetro) &&
    !piece.moveValid( 0,-1, piece.tetro)
  ) {
    isSpin = true;
  }
  
  // Add the piece to the stack.
  var range = [];
  var valid = false;
  for (var x = 0; x < tetro.length; x++) {
    for (var y = 0; y < tetro[x].length; y++) {
      if (tetro[x][y] && y + piece.y >= 0) {
        this.grid[x + piece.x][y + piece.y] = tetro[x][y];
        // Get column for finesse
        if (!once || x + piece.x < column) {
          column = x + piece.x;
          once = true;
        }
        // Check which lines get modified
        if (range.indexOf(y + piece.y) === -1) {
          range.push(y + piece.y);
          // This checks if any cell is in the play field. If there
          //  isn't any this is called a lock out and the game ends.
          if (y + piece.y >= this.hiddenHeight) valid = true;
        }
      }
    }
  }

  // Lock out
  if (!valid) {
    gameState = 9;
    msg.innerHTML = 'LOCK OUT!';
    menu(3);
    return;
  }

  // Check modified lines for full lines.
  range = range.sort(function(a,b){return a-b});
  for (var row = range[0], len = row + range.length; row < len; row++) {
    var count = 0;
    for (var x = 0; x < this.width; x++) {
      if (this.grid[x][row]) count++;
    }
    // Clear the line. This basically just moves down the stack.
    // TODO Ponder during the day and see if there is a more elegant solution.
    if (count === this.width) {
      lineClear++; // NOTE stats
      var rowInDig = digLines.indexOf(row);
      if (rowInDig !== -1) {
        for (var y = 0; y < rowInDig; y++) {
          digLines[y]++;
        }
        digLines.splice(rowInDig, 1);
      }
      for (var y = row; y >= 1; y--) {
        for (var x = 0; x < this.width; x++) {
          this.grid[x][y] = this.grid[x][y - 1];
        }
      }
      for (var x = 0; x < this.width; x++) {
        this.grid[x][0] = void 0;
      }
    }
  }

  var scoreAdd = bigInt(level + 1);
  if (lineClear !== 0) {
    //console.log("C"+combo+" B"+b2b)
    if (isSpin) {
      scoreAdd = scoreAdd.mul(
        bigInt([800,1200,1600,2000][lineClear - 1])
          .mul(bigInt(2).pow(b2b + combo))
      );
      b2b += 1;
    } else if(lineClear === 4) {
      scoreAdd = scoreAdd.mul(
        bigInt(800)
          .mul(bigInt(2).pow(b2b + combo))
      );
      b2b += 1;
    } else {
      scoreAdd = scoreAdd.mul(
        bigInt([100,300,500,800][lineClear - 1])
          .mul(bigInt(2).pow(combo))
      );
      b2b = 0;
    }
    combo += 1;
  } else {
    if (isSpin) {
      scoreAdd = scoreAdd.mul(
        bigInt(2).pow(bigInt(b2b))
          .mul(bigInt(400))
      );
    } else {
      scoreAdd = bigInt(0);
    }
    combo = 0;
  }
  lines += lineClear;
  if (gametype === 1)
    level = ~~(lines / 10);
  score = score.add(scoreAdd.mul(bigInt(16).pow(allclear)));
  
  var pc = true;
  for (var x = 0; x < this.width; x++)
    for (var y = 0; y < this.height; y++)
      if (this.grid[x][y])
        pc = false;
  if (pc) {
    score = score.add(bigInt(1000000).mul(bigInt(16).pow(allclear)));
    allclear ++;
  }
  
  //if (scoreAdd.cmp(0) > 0)
    //console.log(scoreAdd.toString());

  statsFinesse += piece.finesse - finesse[piece.index][piece.pos][column];
  piecesSet++; // NOTE Stats
  // TODO Might not need this (same for in init)
  column = 0;

  statisticsStack();

  this.draw();
}
/**
 * Raise a garbage line. farter
 */
Stack.prototype.rowRise = function(arrRow, objPiece) {
  var isEmpty = true;
  for(var x = 0; x < this.width; x++) {
    for(var y = 0; y < this.height - 1; y++) {
      this.grid[x][y] = this.grid[x][y+1];
    }
    if(arrRow[x])
      isEmpty = false;
    this.grid[x][this.height-1]=arrRow[x];
  }
  var topout = false;
  for(var y = 0; y < digLines.length; y++) {
    digLines[y]--;
    if(digLines[y] < 0) { // top out, but only detecting added lines
      topout = true;
    }
  }
  if(topout) {
    gameState = 9;
    msg.innerHTML = 'TOP OUT!';
    menu(3);
  }
  if(!isEmpty) {
    digLines.push(this.height - 1);
  }
  if (!piece.moveValid(0, 0, piece.tetro)) {
    piece.y-=1;
    if (piece.y + pieces[piece.index].rect[3] <= this.hiddenHeight - 2) { // the bottom is >=2 cell away from visible part
      gameState = 9;
      msg.innerHTML = 'OOPS!';
      menu(3);
    }
  }
  piece.dirty = true;
  this.draw();
}
/**
 * Draws the stack.
 */
Stack.prototype.draw = function() {
  
  clear(stackCtx);
  draw(this.grid, 0, -this.hiddenHeight, stackCtx, void 0, 0.3);

  // Darken Stack
  // TODO wrap this with an option.
  // no fullscreen flush, see above
  //stackCtx.globalCompositeOperation = 'source-atop';
  //stackCtx.fillStyle = 'rgba(0,0,0,0.3)';
  //stackCtx.fillRect(0, 0, stackCanvas.width, stackCanvas.height);
  //stackCtx.globalCompositeOperation = 'source-over';

  if (settings.Outline) {
    var b = ~~(cellSize / 8);
    var c = cellSize;
    var hhc = stack.hiddenHeight * c;
    var pi = Math.PI;
    var lineCanvas = document.createElement('canvas');
    lineCanvas.width = stackCanvas.width;
    lineCanvas.height = stackCanvas.height;
    
    var lineCtx = lineCanvas.getContext('2d');
    lineCtx.fillStyle = 'rgba(255,255,255,0.5)';
    lineCtx.beginPath();
    for (var x = 0, len = this.grid.length; x < len; x++) {
      for (var y = 0, wid = this.grid[x].length; y < wid; y++) {
        if (this.grid[x][y]) {
          if (x < this.width - 1 && !this.grid[x + 1][y]) {
            lineCtx.fillRect(x * c + c - b, y * c - hhc, b, c);
          }
          if (x > 0 && !this.grid[x - 1][y]) {
            lineCtx.fillRect(x * c, y * c - hhc, b, c);
          }
          if (y < this.height - 1 && !this.grid[x][y + 1]) {
            lineCtx.fillRect(x * c, y * c - hhc + c - b, c, b);
          }
          if (!this.grid[x][y - 1]) {
            lineCtx.fillRect(x * c, y * c - hhc, c, b);
          }
          // Diags
          if (x < this.width - 1 && y < this.height - 1) {
            if (!this.grid[x + 1][y] && !this.grid[x][y + 1]) {
              lineCtx.clearRect(x * c + c - b, y * c - hhc + c - b, b, b);
              lineCtx.fillRect(x * c + c - b, y * c - hhc + c - b, b, b);
            } else if (!this.grid[x + 1][y + 1] && this.grid[x + 1][y] && this.grid[x][y + 1]) {
              lineCtx.moveTo(x * c + c, y * c - hhc + c - b);
              lineCtx.lineTo(x * c + c, y * c - hhc + c);
              lineCtx.lineTo(x * c + c - b, y * c - hhc + c);
              lineCtx.arc(x * c + c, y * c - hhc + c, b, 3 * pi / 2, pi, true);
            }
          }
          if (x < this.width - 1) {
            if (!this.grid[x + 1][y] && !this.grid[x][y - 1]) {
              lineCtx.clearRect(x * c + c - b, y * c - hhc, b, b);
              lineCtx.fillRect(x * c + c - b, y * c - hhc, b, b);
            } else if (!this.grid[x + 1][y - 1] && this.grid[x + 1][y] && this.grid[x][y - 1]) {
              lineCtx.moveTo(x * c + c - b, y * c - hhc);
              lineCtx.lineTo(x * c + c, y * c - hhc);
              lineCtx.lineTo(x * c + c, y * c - hhc + b);
              lineCtx.arc(x * c + c, y * c - hhc, b, pi / 2, pi, false);
            }
          }
          if (x > 0 && y < this.height - 1) {
            if (!this.grid[x - 1][y] && !this.grid[x][y + 1]) {
              lineCtx.clearRect(x * c, y * c - hhc + c - b, b, b);
              lineCtx.fillRect(x * c, y * c - hhc + c - b, b, b);
            } else if (!this.grid[x - 1][y + 1] && this.grid[x - 1][y] && this.grid[x][y + 1]) {
              lineCtx.moveTo(x * c, y * c - hhc + c - b);
              lineCtx.lineTo(x * c, y * c - hhc + c);
              lineCtx.lineTo(x * c + b, y * c - hhc + c);
              lineCtx.arc(x * c, y * c - hhc + c, b, pi * 2, 3 * pi / 2, true);
            }
          }
          if (x > 0) {
            if (!this.grid[x - 1][y] && !this.grid[x][y - 1]) {
              lineCtx.clearRect(x * c, y * c - hhc, b, b);
              lineCtx.fillRect(x * c, y * c - hhc, b, b);
            } else if (!this.grid[x - 1][y - 1] && this.grid[x - 1][y] && this.grid[x][y - 1]) {
              lineCtx.moveTo(x * c + b, y * c - hhc);
              lineCtx.lineTo(x * c, y * c - hhc);
              lineCtx.lineTo(x * c, y * c - hhc + b);
              lineCtx.arc(x * c, y * c - hhc, b, pi / 2, pi * 2, true);
            }
          }
        }
      }
    }
    lineCtx.fill();
    stackCtx.globalCompositeOperation = 'source-over';
    stackCtx.drawImage(lineCanvas, 0, 0);
  }
}
var stack = new Stack();
