function XMLHTTP(url,obj)
{
  var xmlhttp=null;
  var state_Change = function()
  {
    if (xmlhttp.readyState==4)
    {// 4 = "loaded"
      if (xmlhttp.status==200)
      {
        var res=JSON.parse(xmlhttp.responseText);
        if(res.msg==="fail")
        {
          leaderboard.innerHTML = "←_←"
        }
        else if(res.msg=="ok")
        {
          leaderboard.innerHTML = ""
          var ranks = res.ranks;
          var now = (new Date()).getTime();
          var gettimedifftext = function(t)
          {
            t=Math.round(t/(60*1000));
            if(t<100)
              return t==0?"!":(t+"m");
            else if(t<99*60)
              return Math.round(t/60)+"h";
            else
              return Math.round(t/(60*24))+"d";
          }
          var gettimetext = function(t)
          {
            var hs=Math.round(t/10);
            var s=~~(hs/100);
            var m=~~(s/60);
            hs-=s*100;
            s-=m*60;
            if(m==0)
              return s+"."+((hs>9?"":"0")+hs);
            else if(m<10)
              return m+":"+((s>9?"":"0")+s)+"."+((hs>9?"":"0")+hs);
            else
              return m+":"+((s>9?"":"0")+s)+"."+(~~(hs/10)); //
          }
          var getlinetxt = function(l)
          {
            if(l<1000)
              return l+"L";
            else
              return l+"";
          }
          for (var i in ranks) {
            var div = document.createElement('div');
            var spanname = document.createElement('span');
            var spanlines = document.createElement('span');
            var spantime = document.createElement('span');
            var spandate = document.createElement('span');
            
            spanname.innerText = ranks[i].name;
            spanname.style.width = "6em";
            spanname.style["text-align"] = "left";
            spanlines.innerText = ranks[i].score + "L";
            spanlines.style.width = "2.5em";
            spantime.innerText = gettimetext(ranks[i].time);
            spantime.style.width = "4em";
            spandate.innerText = gettimedifftext(now-ranks[i].date);
            spandate.style.width = "2.5em";
            spandate.style["font-weight"] = "normal";
            
            leaderboard.appendChild(div);
            div.appendChild(spanname);
            div.appendChild(spanlines);
            div.appendChild(spantime);
            div.appendChild(spandate);
          }
        }
      }
      else
      {
        leaderboard.innerText = "Problem retrieving leaderboard data\n" + 
          xmlhttp.status + "\n" + xmlhttp.readyState + "\n" + xmlhttp.statusText + "\n" +
          xmlhttp.responseText;
      }
    }
  }
  if (window.XMLHttpRequest)
  {// code for all new browsers
    xmlhttp=new XMLHttpRequest();
  }
  else if (window.ActiveXObject)
  {// code for IE5 and IE6
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  if (xmlhttp!=null)
  {
    xmlhttp.onreadystatechange=state_Change;
    xmlhttp.open("POST",url,true);
    xmlhttp.send(JSON.stringify(obj));
  }
  else
  {
    alert("Your browser does not support XMLHTTP.");
  }
}

var playername=void 0;

function submitscore(obj)
{
  if(playername===void 0)
    playername=prompt("Enter your nick: 请输入大名：");
  if(playername===null)
    return;
  if(playername==="")
    playername="unnamed";
  obj.name=playername;
  console.log(obj);
  XMLHTTP("http://farter.tk:8888", obj);
}