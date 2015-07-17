function Compress(strNormalString)
{
  var strCompressedString = "";
  var strBase52 = "";

  var ht = new HashTable;
  for(i = 0; i < 128; i++) {
    var e = new HashTableElement;
    e.key = i;
    e.code = i;
    ht.Insert(e);
  }

  var used = 128;
  var intLeftOver = 0;
  var intOutputCode = 0;
  var pcode = 0;
  var ccode = 0;
  var k = 0;

  for(var i=0; i<strNormalString.length; i++) {
    ccode = strNormalString.charCodeAt(i);
    k = (pcode << 8) | ccode;
    if((intSearch = ht.Search(k)) != null) {
      pcode = intSearch;
    } else {
      intLeftOver += 12;
      intOutputCode <<= 12;
      intOutputCode |= pcode;
      pcode = ccode;
      if(intLeftOver >= 16) {
        strCompressedString += String.fromCharCode( intOutputCode >> ( intLeftOver - 16 ) );
        intOutputCode &= (Math.pow(2,(intLeftOver - 16)) - 1);
        intLeftOver -= 16;
      }
      if(used < 4096) {
        used ++;
        var e = new HashTableElement;
        e.key = k;
        e.code = used - 1;
        ht.Insert(e);
      }
    }
  }

  if(pcode != 0) {
    intLeftOver += 12;
    intOutputCode <<= 12;
    intOutputCode |= pcode;
  }

  if(intLeftOver >= 16) {
    strCompressedString += String.fromCharCode( intOutputCode >> ( intLeftOver - 16 ) );
    intOutputCode &= (Math.pow(2,(intLeftOver - 16)) - 1);
    intLeftOver -= 16;
  }

  if( intLeftOver > 0) {
    intOutputCode <<= (16 - intLeftOver);
    strCompressedString += String.fromCharCode( intOutputCode );
  }

  //return strCompressedString;
  
  for(var i=0;i<strCompressedString.length;i++) {
    var ch=0,ch0=0,ch1=0,ch2=0;
    ch = strCompressedString.charCodeAt(i);
    ch0 = ch%52;
    ch /= 52;
    ch1 = ch%52;
    ch /= 52;
    ch2 = ch%52;
    ch0 += (ch0<26?65:(97-26));
    ch1 += (ch1<26?65:(97-26));
    ch2 += (ch2<26?65:(97-26));
    strBase52 += String.fromCharCode(ch0,ch1,ch2); 
  }
  
  return strBase52;
}

function Decompress(/*strCompressedString*/ strBase52)
{
  var strCompressedString = "";
  
  var Base52Unit = function(num) {
    if(num>=65&&num<65+26) num-=65;
    else if(num>=97&&ch0<97+26) num-=(97-26);
    else return null;
    return num;
  }
  
  if(strBase52.length % 3 != 0)
    return null;
  
  for(var i=0;i<strBase52.length;i+=3) {
    var ch=0,ch0=0,ch1=0,ch2=0;
    ch0 = strBase52.charCodeAt(i);
    ch1 = strBase52.charCodeAt(i+1);
    ch2 = strBase52.charCodeAt(i+2);
    ch0 = Base52Unit(ch0);
    ch1 = Base52Unit(ch1);
    ch2 = Base52Unit(ch2);
    if(ch0==null||ch1==null||ch2==null)
      return null;
    ch = ch0 + 52 * (ch1 + 52 * ch2);
    strCompressedString += String.fromCharCode(ch); 
  }
  
  var strNormalString = "";
  var ht = new Array;

  for(i = 0; i < 128; i++)
  {
    ht[i] = String.fromCharCode(i);
  }

  var used = 128;
  var intLeftOver = 0;
  var intOutputCode = 0;
  var ccode = 0;
  var pcode = 0;
  var key = 0;

  for(var i=0; i<strCompressedString.length; i++) {
    intLeftOver += 16;
    intOutputCode <<= 16;
    intOutputCode |= strCompressedString.charCodeAt(i);
    while(1) {
      if(intLeftOver >= 12) {
          ccode = intOutputCode >> (intLeftOver - 12);
        if( typeof( key = ht[ccode] ) != "undefined" ) {
          strNormalString += key;
          if(used > 128) {
            ht[ht.length] = ht[pcode] + key.substr(0, 1);
          }
          pcode = ccode;
        } else {
          key = ht[pcode] + ht[pcode].substr(0, 1);
          strNormalString += key;
          ht[ht.length] = ht[pcode] + key.substr(0, 1);
          pcode = ht.length - 1;
        }used ++;
        intLeftOver -= 12;
        intOutputCode &= (Math.pow(2,intLeftOver) - 1);
      } else {
        break;
      }
    }
  }
  return strNormalString;
}

function HashTableElement()
{
  this.key = null;
  this.code = null;
}

function HashTable()
{
  this.ht = new Array(4099);

  this.Search = function(keyword) {
    var arr = this.ht[keyword];
    if(typeof(arr) != "undefined") {
      for(i = 0; i < arr.length; i ++) {
        if(arr[i].key == keyword) return arr[i].code;
      }
    }
    return null;
  }
  this.Insert = function(e) {
    var arr = this.ht[e.key];
    if(typeof(arr) == "undefined") {
    arr = new Array();
    arr[0] = e;
    this.ht[e.key] = arr;
    } else {
      arr[arr.length] = e;
    }
  }
}
