/* Click-to-play YouTube player. Links (.vlink) and grid cards (.vcard) open one centered player; nothing loads from YouTube until a video is played. */
(function(){
  var dlg,frame,title,ext;
  function build(){
    dlg=document.createElement("dialog");dlg.className="vmodal";dlg.setAttribute("aria-label","Video player");
    dlg.innerHTML='<div class="vframe"></div><div class="vbar"><b></b><a target="_blank" rel="noopener">YouTube ↗</a><button class="vclose" type="button">Close</button></div>';
    document.body.appendChild(dlg);frame=dlg.querySelector(".vframe");title=dlg.querySelector("b");ext=dlg.querySelector("a");
    dlg.querySelector(".vclose").addEventListener("click",function(){dlg.close()});
    dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close()});
    dlg.addEventListener("close",function(){frame.innerHTML=""});
  }
  function open(card){
    if(!card)return;if(!dlg)build();
    var id=card.dataset.yt,t=card.dataset.start||"0";
    frame.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1&start='+t+'" title="'+card.dataset.title.replace(/"/g,"&quot;")+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    title.textContent=card.dataset.ch+": "+card.dataset.title;
    ext.href="https://www.youtube.com/watch?v="+id+"&t="+t+"s";
    if(dlg.showModal)dlg.showModal();else dlg.setAttribute("open","");
  }
  document.addEventListener("click",function(e){
    var a=e.target.closest(".vlink");
    if(a){var c=document.getElementById(a.getAttribute("href").slice(1));if(c&&c.dataset.yt){e.preventDefault();open(c)}return}
    var b=e.target.closest(".vthumb");if(b){e.preventDefault();open(b.closest(".vcard"))}
  });
})();
