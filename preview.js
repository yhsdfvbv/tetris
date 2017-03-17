function Preview() {
  grabBag = this.gen();
}
Preview.prototype.init = function() {
  //XXX fix ugly code lolwut /* farter */
  while (1) {
    this.grabBag = this.gen();
    break;
    //if ([3,4,6].indexOf(this.grabBag[0]) === -1) break;
  }
  this.grabBag.push.apply(this.grabBag, this.gen());
  this.draw();
}
Preview.prototype.next = function() {
  var next;
  next = this.grabBag.shift();
  if (this.grabBag.length === 7) {
    this.grabBag.push.apply(this.grabBag, this.gen());
  }
  this.draw();
  return next;
  //TODO Maybe return the next piece?
}
/**
 * Creates a "grab bag" of the 7 tetrominos.
 */
Preview.prototype.gen = function() {
  var pieceList = [0, 1, 2, 3, 4, 5, 6];
  //return pieceList.sort(function() {return 0.5 - rng.next()});
  /* farter */ // proven random shuffle algorithm
  for (var i=0;i<7-1;i++)
  {
    var temp=pieceList[i];
    var rand=~~((7-i)*rng.next())+i;
    pieceList[i]=pieceList[rand];
    pieceList[rand]=temp;
  }
  return pieceList;
}
/**
 * Draws the piece preview.
 */
Preview.prototype.draw = function() {
  clear(previewCtx);
  var drawCount = (settings["Next"]===void 0) ? 6 : settings["Next"];
  for (var i = 0; i < drawCount; i++) {
    var p = this.grabBag[i];
    var initInfo = RotSys[settings.RotSys].initinfo[p];
    var rect = pieces[p].rect;
    draw(
      pieces[p].tetro[initInfo[2]],
      -rect[initInfo[2]][0] + (4 - rect[initInfo[2]][2] + rect[initInfo[2]][0]) / 2,
      -rect[initInfo[2]][1] +
        (3 - rect[initInfo[2]][3] + rect[initInfo[2]][1]) / 2 +
        i*3,
      previewCtx
    );
  }
}
var preview = new Preview();
