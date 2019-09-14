const doc = document,
    omnibox = doc.getElementById("omnibox"),
    search = doc.getElementById("omnibox-wrapper"),
    navBack = doc.getElementById("nav-back"),
    navForward = doc.getElementById("nav-forward"),
    webviewContainer = doc.getElementById('webview-container'),
    draggable = doc.getElementById('draggable'),
    tabContainer = doc.getElementById('tab-container'),
    tabNew = doc.getElementById('tab-new'),
    topchrome = doc.getElementById("topchrome"),
    closeWindow = doc.getElementById('close'),
    miniWindow = doc.getElementById('mini'),
    maxWindow = doc.getElementById('max'),
    snackbar = doc.getElementById('snackbar'),
    rem = parseFloat(getComputedStyle(doc.documentElement).fontSize),
    discordwrapper = doc.getElementById('discord-wrapper'),
    discord = doc.getElementById('discord'),
    root = doc.documentElement,
    lightbar = doc.getElementById('lightbar'),
    discordShadow = doc.getElementById('discord-shadow');

let webview = [],
    webviewhold = [],
    tab = [],
    tabhold = [], //temp storage for rearranging tabs
    tick = {invert:0,fog:0,discord:0,chat:0},
    app = chrome.app.window.current(),
    current = 0;

function setCurrent(k){
  console.log('function setCurrent('+k+')');
  console.log('Set #webview'+k+' as current tab');
  current=k;
  webview[current].classList='current-webview';
  tab[current].classList.add('current');
  omnibox.value=webview[current].src;
  checkHome();
  if(tab.length>1){
    for(let i=0;i<tab.length;i++){
      if(i!==current){
        webview[i].classList.remove('current-webview');
        tab[i].classList.remove('current');
      }
    }
  }
}

function isMaximized(){
  return window.screen.width<=(window.innerWidth+100)||window.screen.height<=(window.innerHeight+100);
}
function isFullscreen(){
  return window.screen.width===window.innerWidth&&window.screen.height===window.innerHeight;
}

function omniUrl(inputSrc){
  omnibox.value=inputSrc;
  checkHome();
}

function closeTab(input){
  console.log('function CloseTab('+input+')');
  if(webviewContainer.childElementCount>1){
    tab[input].classList.add('close');
    setTimeout(function(){
      webview[input].remove();
      webview.splice(input,1);
      tab[input].remove();
      tab.splice(input,1);
      if(!(webview[current])){
        current--;
      }
      setCurrent(current);
    },100);
  }else{
    window.close();
  }
}

function matchUrl(url){
  return url.match(/(?<=:\/\/)(.*)(?=\.)/g)[0].replace(/(www\.)/,'');
}

function newTab(url){
  
  console.log('function newTab('+url+')');
  
  var j = tab.length;
  
  webview[j] = doc.createElement('webview');
  // webview[j].setAttribute('partition',('trusted-'+(Math.random()*10)));
  webview[j].setAttribute('partition','trusted');
  webview[j].currentUrl='';
  webview[j].setAttribute('allowtransparency','on');
  webviewContainer.appendChild(webview[j]);

  tab[j] = doc.createElement('div');
  tab[j].classList.add('tab');
  tab[j].tabindex = 10+j;
  tabContainer.insertAdjacentElement('afterbegin',tab[j]);
  setCurrent(j);
  tab[j].addEventListener('click',function(e){
    j=tab.indexOf(this);
    if(e.offsetX+(1.25*rem)>tab[j].scrollWidth&&e.offsetX<tab[j].scrollWidth){
      closeTab(j);
    }else{
      setCurrent(j);
    }
  });
  
  webview[j].onmousemove = function(e){
    omnibox.blur();
    if(snackbar!==document.activeElement){
      this.focus();
    }
  };
  webview[j].addEventListener('loadstart',function(e){
    j=webview.indexOf(this);
    lightbar.classList='load';
    if(e.isTopLevel){
      tab[j].setAttribute('data-domain',matchUrl(e.url));
      omnibox.focus();
      if(j===current){
        omniUrl(e.url);
        webviewContainer.style.backgroundColor='#fff0';
        webviewContainer.style.backgroundImage='url(offline/loading.svg)';
      }
    }
  });
  webview[j].addEventListener('loadcommit',function(e){
    j=webview.indexOf(this);
    if(e.isTopLevel){
      tab[j].setAttribute('data-domain',matchUrl(e.url));
      omnibox.focus();
      if(j===current){
        omniUrl(e.url);
        webviewContainer.style.backgroundColor='#fff';
        webviewContainer.style.backgroundImage='none';
      }
    }
  });
  webview[j].addEventListener('loadstop',function(){
    j=webview.indexOf(this);
    lightbar.classList='loaded';
    webviewContainer.style.backgroundColor='#fff';
    webviewContainer.style.backgroundImage='none';
    this.executeScript({file:'blur.js'});
    omniUrl(webview[current].src);
    this.currentUrl=this.src;
    tab[j].setAttribute('data-domain',matchUrl(this.src));
  });
  webview[j].addEventListener("permissionrequest", function(e) {
    e.request.allow();
  });
  webview[j].addEventListener("newwindow", function(e) {
    e.window.discard();
    snackbar.innerHTML='Open '+String(e.targetUrl).substr(0,50)+' in new tab? Click to confirm.';
    snackbar.focus({preventScroll:true});
    setTimeout(function(){
      snackbar.blur();
    },4000);
    snackbar.onclick=function(){
      newTab();
      webview[current].src=e.targetUrl;
      snackbar.blur();
    };
  });
  
  setTimeout(function(){webview[0].src=url;},1);
  
  omnibox.focus();
}

function checkHome(){
  if(omnibox.value.startsWith('chrome-extension')||omnibox.value=='offline/home.html'||omnibox.value=='undefined'){
    omnibox.value='';
  }
}

function clearAllHistory(){
  for(let i=0;i<tab.length;i++){
    webview[i].clearData(
      {since:0},
      {appcache:true,cache:true,cookies:true,sessionCookies:true,persistentCookies:true,fileSystems:true,indexedDB:true,localStorage:true,webSQL:true},
      window.close()
    );
  }
}

newTab('offline/home.html');
checkHome();

navBack.onclick = function(){
  webview[current].back();
};
navForward.onclick = function(){
  webview[current].forward();
};

tabNew.onclick = function(){newTab();webview[current].src='offline/home.html';};
search.onsubmit = function() {
  var e = omnibox.value;
  if(e){
    if(!(e.includes("."))||e.includes(" ")){
      e = "duckduckgo.com/?q=" + e + "&kp=-2";
    }
    if(!(e.includes("http"))){
      e = "https://" + e;
    }
    webview[current].src=e;
  }else{
    webview[current].src='offline/home.html';
    e='';
  }
  omnibox.value=e;
};
topchrome.onmousemove = function (e){
  topchrome.style.backgroundPosition = (100*(window.innerWidth-e.pageX)/window.innerWidth)+'%';
  if(snackbar!==document.activeElement){
    omnibox.focus();
  }
};
miniWindow.onclick = function(){
  app = chrome.app.window.current();
  app.minimize();
};
maxWindow.onclick = function(){
  app = chrome.app.window.current();
  if(isMaximized()){
    app.restore();
  }else{
    app.maximize();
  }
};
closeWindow.onclick = function(){
  app = chrome.app.window.current();
  app.close();
};

//keyboard shortcuts
window.addEventListener('keydown',
function(e){
  if(e.altKey){
    if(e.key==='w'){
      if(e.ctrlKey){
        clearAllHistory();
      }else{
       closeTab(current);
      }
    }else if(e.key==='n'){
      chrome.app.window.create('browser.html', {
        id:String(Math.random()),
        state:'fullscreen',
        frame:'none',
        innerBounds: {
            minWidth: 400,
            minHeight: 300
        }
      });
    }else if(e.key==='t'){
      newTab();
      webview[current].src='offline/home.html';
    }else if(e.key==='/'){
      if(tick.fog){
        topchrome.classList.remove('blur');
        for(let i = 0;i<webview.length;i++){
          webview[i].executeScript({file:'blurfalse.js'});
        }
        tick.fog--;
      }else{
        topchrome.classList.add('blur');
        for(let i = 0;i<webview.length;i++){
          webview[i].executeScript({file:'blurtrue.js'});
        }
        tick.fog++;
      }
    }else if(e.key==='d'){
      if(tick.chat){
        discordwrapper.style.display='none';
        tick.chat--;
      }else{
        discordwrapper.style.display='block';
        tick.chat++;
      }
    }
  }
},false);

setInterval(function(){
  if(topchrome.classList){
    if(isFullscreen()){
      topchrome.classList.add('fullscreen');
      draggable.classList.add('fullscreen');
      webviewContainer.classList.add('fullscreen');
    }else{
      topchrome.classList.remove('fullscreen');
      draggable.classList.remove('fullscreen');
      webviewContainer.classList.remove('fullscreen');
    }
  }
  webview[current].style.WebkitBoxReflect='above';
},100);

discord.addEventListener('loadstop',function(){
  if(this.src==='https://discordapp.com/login'){
    this.classList.add('login');
    discordShadow.classList.add('login');
  }else{
    this.classList.remove('login');
    discordShadow.classList.remove('login');
    tick.discord=0;
  }
});
discordShadow.onclick=function(){
  console.log('click');
  if(tick.discord){
    this.classList.remove('menu');
    discord.classList.remove('menu');
    tick.discord=0;
  }else{
    this.classList.add('menu');
    discord.classList.add('menu');
    tick.discord=1;
  }
}
omnibox.onfocus=function(){
  if(omnibox.value){
    omnibox.select();
  }
}