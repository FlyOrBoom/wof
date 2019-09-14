var goblurr=false,blurrtimer=150,bluralt=false; //seconds
window.onmousemove=function(){
  blurrtimer=150;
  bluralt=false;
};
window.onkeydown=function(e){
  blurrtimer=150;
  if(e.altKey&&goblurr){
    document.body.style.filter='blur(2rem)';
    bluralt=true;
    blurrtimer=150;
  }else{
    bluralt=false;
  }
};
setInterval(function(){
  if(blurrtimer>0&&!bluralt){
    blurrtimer--;
    document.body.style.filter='';
  }else if(goblurr){
    document.body.style.filter='blur(2rem)';
  }
},100);