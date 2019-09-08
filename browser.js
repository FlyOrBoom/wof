var doc = document,
    omnibox = doc.getElementById("omnibox"),
    search = doc.getElementById("omnibox-wrapper"),
    navBack = doc.getElementById("nav-back"),
    navForward = doc.getElementById("nav-forward"),
    webviewContainer = doc.getElementById('webview-container'),
    webview = [],
    tabContainer = doc.getElementById('tab-container'),
    tab = [],
    tabNew = doc.getElementById('tab-new'),
    current = 0,
    topchrome = doc.getElementById("topchrome"),
    closeWindow = doc.getElementById('close'),
    snackbar = doc.getElementById('snackbar'),
    tick = {invert:0,fog:0},
    root = doc.documentElement;


function setCurrent(k){
  console.log('function setCurrent('+k+')');
  console.log('Set #webview'+k+' as current tab');
  webview[k].classList='current-webview';
  tab[k].classList.add('current');
  current=k;
  omnibox.value=webview[current].src;
  checkHome();
  if(tab.length>1){
    for(let i=0;i<tab.length;i++){
      if(i!==k){
        webview[i].classList = '';
        tab[i].classList.remove('current');
        console.log('Deactivated #webview'+i+' and #tab'+i);
      }
    }
  }
}

function omniUrl(){
  omnibox.value=webview[current].src;
  checkHome();
}

function closeTab(){
  console.log('function CloseTab('+current+')');
  if(webviewContainer.childElementCount>1){
    tab[current].classList.add('close');
    setTimeout(function(){
      webview[current].remove();
      tab[current].remove();
      tab[current]=false;
      webview[current]=false;
      while(!(webview[current])){
        console.log(current);
        if(current<1){
          current+=tab.length;
        }else{
          current--;
        }
      }
      setCurrent(current);
    },100);
  }else{
    window.close();
  }
}

function newTab(url){
  
  console.log('function newTab('+url+')');
  
  var j = tab.length;
  
  webview[j] = doc.createElement('webview');
  // webview[j].setAttribute('partition',('trusted-'+(Math.random()*10)));
  webview[j].setAttribute('partition','trusted');
  webview[j].id = 'webview'+j;
  webview[j].currentUrl='';
  webview[j].setAttribute('allowtransparency','on');
  webviewContainer.appendChild(webview[j]);

  tab[j] = doc.createElement('div');
  tab[j].id = 'tab'+j;
  tab[j].classList.add('tab','button');
  tab[j].tabindex = 10+j;
  tabContainer.insertAdjacentElement('afterbegin',tab[j]);
  setCurrent(j);
  tab[j].addEventListener('click',function(){
    if(j===current){
      closeTab();
    }else{
      setCurrent(j);
    }
  });
  
  webview[j].onmousemove = function(e){
    webview[j].focus();
  };
  webview[j].addEventListener('loadstart',function(e){
    // if(j===current&&e.isTopLevel&&(webview[j].currentUrl.match(/(?<=:\/\/)(.*)(?=\.)/g)[0]!==webview[j].src.match(/(?<=:\/\/)(.*)(?=\.)/g)[0])){
    //   loadwrapper.classList.add('loading');
    //   console.log(true);
    // }
    omniUrl();
  });
  webview[j].addEventListener('loadstop',function(){
    this.insertCSS({code:'body::before{background-color:#fff}'});
    omniUrl();
    this.currentUrl=this.src;
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
  omnibox.focus();
};
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
       closeTab();
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
  if(window.screen.width===window.innerWidth&&window.screen.height===window.innerHeight){
    topchrome.classList.add('fullscreen');
    webviewContainer.classList.add('fullscreen');
  }else{
    topchrome.classList.remove('fullscreen');
    webviewContainer.classList.remove('fullscreen');
  }
},10);