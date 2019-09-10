var doc = document,
    omnibox = doc.getElementById("omnibox"),
    search = doc.getElementById("omnibox-wrapper"),
    navBack = doc.getElementById("nav-back"),
    navForward = doc.getElementById("nav-forward"),
    webviewContainer = doc.getElementById('webview-container'),
    webview = [],
    webviewhold = [],
    tabContainer = doc.getElementById('tab-container'),
    tab = [],
    tabhold = [], //temp storage for rearranging tabs
    tabNew = doc.getElementById('tab-new'),
    current = 0,
    topchrome = doc.getElementById("topchrome"),
    closeWindow = doc.getElementById('close'),
    miniWindow = doc.getElementById('mini'),
    snackbar = doc.getElementById('snackbar'),
    tick = {invert:0,fog:0},
    rem = parseFloat(getComputedStyle(doc.documentElement).fontSize),
    root = doc.documentElement;


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
    if(!(snackbar.hasFocus())){
      this.focus();
    }
  };
  webview[j].addEventListener('loadstart',function(e){
    j=webview.indexOf(this);
    if(e.isTopLevel){
      // loadwrapper.classList.add('loading');
      tab[j].setAttribute('data-domain',matchUrl(e.url));
      omnibox.focus();
      if(j===current){
        omniUrl(e.url);
      }
    }
  });
  webview[j].addEventListener('loadstop',function(){
    j=webview.indexOf(this);
    this.insertCSS({code:'body::before{background-color:#fff}'});
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
window.onmousemove = function (e){
  topchrome.style.backgroundPosition = (100*(window.innerWidth-e.pageX)/window.innerWidth)+'%';
  if(!(snackbar.hasFocus())){
    omnibox.focus();
  }
};
miniWindow.onclick = function(){
  chrome.app.window.current().minimize();
}
closeWindow.onclick = function(){
  window.close();
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
        doc.body.classList.remove('blur');
        tick.fog--;
      }else{
        doc.body.classList.add('blur');
        tick.fog++;
      }
    }else if(e.key==='i'){
      if(tick.invert){
        root.style.setProperty('--main','#fff');
        root.style.setProperty('--highlight','#80f');
        root.style.setProperty('--halflight','#408');
        root.style.setProperty('--background','#204');
        tick.invert--;
      }else{
        root.style.setProperty('--main','#204');
        root.style.setProperty('--highlight','#648');
        root.style.setProperty('--halflight','#fff');
        root.style.setProperty('--background','#fff');
        tick.invert++;
      }
    }
  }
},false);

setInterval(function checkFullscreen(){
  if(topchrome.classList){
    if(window.screen.width===window.innerWidth&&window.screen.height===window.innerHeight){
      topchrome.classList.add('fullscreen');
      webviewContainer.classList.add('fullscreen');
    }else{
      topchrome.classList.remove('fullscreen');
      webviewContainer.classList.remove('fullscreen');
    }
  }
},10);