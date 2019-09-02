var omnibox = document.getElementById("omnibox"),
    search = document.getElementById("search"),
    tick = 0,
    navBack = document.getElementById("nav-back"),
    navForward = document.getElementById("nav-forward"),
    webviewContainer = document.getElementById('webview-container'),
    webview = [],
    tabContainer = document.getElementById('tab-container'),
    tab = [],
    tabNew = document.getElementById('tab-new'),
    current = 0,
    opened = [0],
    topchrome = document.getElementById("topchrome"),
    highlight = document.getElementById('topchrome-highlight'),
    textlight = document.getElementById('topchrome-textlight'),
    toolbar = document.getElementById('topchrome-tools'),
    loadwrapper = document.getElementById('loadwrapper'),
    tip = ['Made with <3 from Arcadia High','Alt+W to close current tab','Ctrl+alt+W to erase this window\'s history','Alt+N to open new tab','Ctrl+alt+N to open new window'],
    tiptick=0,
    closeWindow = document.getElementById('close');

function setCurrent(k){
  console.log('function setCurrent('+k+')');
  console.log('Set #webview'+k+' as current tab');
  webview[k].classList='current-webview';
  tab[k].classList='current-tab';
  current=k;
  omnibox.value=webview[current].src;
  checkHome();
  if(tab.length>1){
    for(var i = 0;i<tab.length;i++){
      if(i!==k){
        webview[i].classList = '';
        tab[i].classList = '';
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
    webview[current].remove();
    tab[current].remove();
    webview[current]=false;
    tab[current]=false;
    if(current){
      while(!(webview[current])){
        current--;
      }
      setCurrent(current);
    }
  }else{
    window.close();
  }
}

function newTab(url){
  
  console.log('function newTab('+url+')');
  
  var j = tab.length;
  
  webview[j] = document.createElement('webview');
  // webview[j].setAttribute('partition',('trusted-'+(Math.random()*10)));
  webview[j].setAttribute('partition','trusted');
  webview[j].id = 'webview'+j;
  webview[j].currentUrl='';
  webviewContainer.appendChild(webview[j]);

  tab[j] = document.createElement('div');
  tab[j].id = 'tab'+j;
  tabContainer.appendChild(tab[j]);
  setCurrent(j);
  tab[j].addEventListener('click',function(){
    if(j===current){
      closeTab();
    }else{
      setCurrent(j);
    }
  });
  
  webview[j].onmousemove = function(){
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
    loadwrapper.classList.remove('loading');
    omniUrl();
    webview[j].currentUrl=webview[j].src;
  });
  webview[j].addEventListener("permissionrequest", function(e) {
    e.request.allow();
  });
  webview[j].addEventListener("newwindow", function(e) {
    newTab();
    webview[current].src=e.targetUrl;
  });
  
  setTimeout(function(){webview[0].src=url;},1);
}

function checkHome(){
  if(omnibox.value.startsWith('chrome-extension')||omnibox.value=='offline/home.html'||omnibox.value=='undefined'){
    omnibox.value='';
  }
}

function clearAllHistory(){
  for(i=0;i<tab.length;i++){
    webview[i].clearData(
      {since:0},
      {appcache:true,cache:true,cookies:true,sessionCookies:true,persistentCookies:true,fileSystems:true,indexedDB:true,localStorage:true,webSQL:true},
      window.close()
    );
  }
}

newTab('offline/home.html');
checkHome();
omnibox.focus();

omnibox.placeholder='Search DuckDuckGo or type in a URL\u2003\u2003\u2003'+tip[0];
setInterval(function(){
  tiptick++;
  omnibox.placeholder='Search DuckDuckGo or type in a URL\u2003\u2003\u2003'+tip[tiptick%5];
},3000);


navBack.onclick = function(){
  webview[current].back();
};
navForward.onclick = function(){
  webview[current].back();
};

omnibox.onclick = function(){
  omnibox.select();
};
tabNew.onclick = function(){newTab();webview[current].src='offline/home.html';};
omnibox.onclick = function(){
  omnibox.select();
};
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
document.onmousemove = function (e){
  highlight.style.transform = 'translate('+e.pageX+'px,0)';
  textlight.style.transform = 'translate('+e.pageX+'px,0)';
  omnibox.focus();
};
closeWindow.onclick = function(){
  window.close();
};

//keyboard shortcuts
document.addEventListener('keyup',
function(e){
  if(e.altKey){
    if(e.key=='w'){
      if(e.ctrlKey){
        clearAllHistory();
      }else{
       closeTab();
      }
    }
    if(e.key=='n'){
      if(e.ctrlKey){
        chrome.app.window.create('browser.html', {
          id:String(Math.random()),
          state:'maximized',
          frame:'none',
          innerBounds: {
              minWidth: 400,
              minHeight: 300
          }
        });
      }else{
        newTab();
        webview[current].src='offline/home.html';
      }
    }
  }
},false);