var omnibox = document.getElementById("omnibox"),
    tick = 0;
    search = document.getElementById("search"),
    webviewContainer = document.getElementById('webview-container'),
    webview = [],
    tabContainer = document.getElementById('tab-container'),
    tab = [],
    tabNew = document.getElementById('tab-new');
    current = 0,
    opened = [0],
    topchrome = document.getElementById("topchrome"),
    highlight = document.getElementById('topchrome-highlight'),
    textlight = document.getElementById('topchrome-textlight'),
    toolbar = document.getElementById('topchrome-tools'),
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


function newTab(url){
  
  console.log('function newTab('+url+')');
  
  var j = tab.length;
  
  webview[j] = document.createElement('webview');
  // webview[j].setAttribute('partition',('trusted-'+(Math.random()*10)));
  webview[j].setAttribute('partition','trusted');
  webview[j].id = 'webview'+j;
  webviewContainer.appendChild(webview[j]);

  tab[j] = document.createElement('div');
  tab[j].id = 'tab'+j;
  tabContainer.appendChild(tab[j]);
  setCurrent(j);
  tab[j].addEventListener('click',function(e){
    if(j===current){
      if(tab.length>1){
        webview[j].remove();
        tab[j].remove();
        webview.splice(j);
        tab.splice(j);
        setCurrent(j-1);
      }else{
        window.close();
      }
    }else{
      setCurrent(j);
    }
  });
  
  webview[j].onmousemove = function(){
    webview[j].focus();
  };
  webview[j].addEventListener('loadstart',function(e){
    if(e.isTopLevel){
      omnibox.value=e.url;
      checkHome();
    }
  });
  webview[j].addEventListener('loadstop',function(e){
    omnibox.value=webview[current].src;
    checkHome();
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
  if(omnibox.value.startsWith('chrome-extension')||omnibox.value=='offline/home.html'){
    omnibox.value='';
  }
}

newTab('offline/home.html');
checkHome();
omnibox.focus();

omnibox.onclick = function(){
  omnibox.select();
};
tabNew.onclick = function(){newTab();webview[current].src='offline/home.html'};
omnibox.onclick = function(){
  omnibox.select();
};
search.onsubmit = function() {
  var e = omnibox.value;
  if(e){
    if(!(e.includes("."))){
      e = "duckduckgo.com/" + e + "&kp=-2";
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