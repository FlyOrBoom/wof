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
    toolbar = document.getElementById('topchrome-tools'),
    iframe = document.getElementById('iframe'),
    closeWindow = document.getElementById('close');


function setCurrent(k){
  console.log('function setCurrent('+k+')');
  console.log('Set #webview'+k+' as current tab');
  webview[k].classList='current-webview';
  tab[k].classList='current-tab';
  current=k;
  omnibox.value='';
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
  webview[j].id = 'webview'+j;
  webview[j].src = url;
  webviewContainer.appendChild(webview[j]);
  
  tab[j] = document.createElement('div');
  tab[j].id = 'tab'+j;
  tabContainer.appendChild(tab[j]);
  
  setCurrent(j);
  tab[j].addEventListener('click',function(e){setCurrent(j)});
  
  webview[j].onmouseover = function(){
    if(webview[j].src){
      webview[j].focus();
    }
  };
  webview[j].addEventListener('loadstart',function(e){
    omnibox.value=e.url;
  });
  webview[j].addEventListener('loadstop',function(e){
    omnibox.value=webview[j].src;
  });
  webview[j].addEventListener("permissionrequest", function(e) {
    e.request.allow();
  });
  webview[j].addEventListener("newwindow", function(e) {
    newTab(e.targetUrl);
  });
  iframe.style.display='block';
}


newTab();
omnibox.focus();

tabNew.onclick = function(){newTab()};
omnibox.onclick = function(){
  omnibox.select();
};
search.onsubmit = function() {
  var e = omnibox.value;
  if(!(e.includes("."))){
    e = "duckduckgo.com/" + e + "&kp=-2";
  }
  if(!(e.includes("http"))){
    e = "https://" + e;
  }
  omnibox.value=e;
  webview[current].src=e;
  iframe.style.display='none';
};
document.onmousemove = function (e){
  highlight.style.transform = 'translate('+e.pageX+'px,0)';
  toolbar.style.webkitMaskPositionX = (e.pageX-window.innerWidth)+'px';
};
closeWindow.onclick = function(){
  window.close();
};