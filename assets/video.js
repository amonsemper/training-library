/* Click-to-play YouTube player. Links (.vlink) and grid cards (.vcard) open one centered player; nothing loads from YouTube until a video is played.
   Offline copy: opens videos on YouTube in a new tab, or explains they need internet when there is no connection. */
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
  var offline=function(){return navigator.onLine===false};
  function open(card){
    if(!card)return;
    var id=card.dataset.yt,t=card.dataset.start||"0",url="https://www.youtube.com/watch?v="+id+"&t="+t+"s";
    // from the offline copy (file://) YouTube won't embed, so open the video on YouTube in a new tab instead
    if(location.protocol==="file:"&&!offline()){window.open(url,"_blank","noopener");return}
    if(!dlg)build();
    if(offline()){
      frame.innerHTML='<div class="voff"><p><b>This video plays from YouTube and needs an internet connection.</b></p><p>Connect, then press the link below, or come back to this page later.</p></div>';
      title.textContent=card.dataset.ch+": "+card.dataset.title;ext.href=url;
      if(dlg.showModal)dlg.showModal();else dlg.setAttribute("open","");return;
    }
    frame.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1&start='+t+'" title="'+card.dataset.title.replace(/"/g,"&quot;")+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    title.textContent=card.dataset.ch+": "+card.dataset.title;
    ext.href=url;
    if(dlg.showModal)dlg.showModal();else dlg.setAttribute("open","");
  }
  // thumbnails come from YouTube too: with no connection, swap each broken one for a plain "needs internet" panel
  function noThumb(img){if(!img||img.dataset.off)return;img.dataset.off="1";var d=document.createElement("span");d.className="voffthumb";d.textContent="Video \u00b7 needs internet";img.replaceWith(d)}
  document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG"&&t.closest&&t.closest(".vcard"))noThumb(t)},true);
  document.querySelectorAll(".vcard img").forEach(function(i){if(i.complete&&!i.naturalWidth)noThumb(i)});
  document.addEventListener("click",function(e){
    var a=e.target.closest(".vlink");
    if(a){var c=document.getElementById(a.getAttribute("href").slice(1));if(c&&c.dataset.yt){e.preventDefault();open(c)}return}
    var b=e.target.closest(".vthumb");if(b){e.preventDefault();open(b.closest(".vcard"))}
  });
})();
