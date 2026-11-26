/* 試作用の簡易パスワード。本番公開時は ENABLED を false にする(または gate.js の読み込みを消す) */
(function(){
  var ENABLED=true;
  var HASH='4d364fbb3786fc31157cc1e2a2671aac0e36348ae9d6b4ba4459ee883c240fe8';
  var ok=!ENABLED;
  try{ if(sessionStorage.getItem('gate-ok')==='1') ok=true; }catch(e){}
  window.__unlocked=ok;
  if(ok) return;
  var st=document.createElement('style');
  st.textContent='html.locked body>*:not(#gate){display:none!important}'
   +'#gate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;'
   +'background:linear-gradient(#1d3a86,#070c2b);font-family:"Zen Maru Gothic",sans-serif;color:#fff;text-align:center}'
   +'#gate .box{width:100%;max-width:320px}'
   +'#gate h1{font-size:18px;margin:0 0 6px;letter-spacing:.08em}'
   +'#gate p{font-size:13px;margin:0 0 16px;opacity:.85;line-height:1.7}'
   +'#gate input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:999px;border:2px solid #bfe0ff;background:rgba(255,255,255,.12);color:#fff;font-size:16px;text-align:center;outline:none}'
   +'#gate button{margin-top:12px;width:100%;padding:12px;border:0;border-radius:999px;background:#fff;color:#1d3a86;font-weight:700;font-size:15px}'
   +'#gate .err{min-height:18px;margin-top:10px;font-size:12px;color:#ffd2e0}';
  document.head.appendChild(st);
  document.documentElement.classList.add('locked');
  function sha(s){
    return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){
      return Array.prototype.map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('');
    });
  }
  document.addEventListener('DOMContentLoaded',function(){
    var g=document.createElement('div');g.id='gate';
    g.innerHTML='<form class="box"><h1>PREVIEW</h1><p>制作中の確認用ページです。<br>4桁の数字を入力してください。</p>'
      +'<input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="4桁の数字" aria-label="パスワード"><button type="submit">ひらく</button><div class="err"></div></form>';
    document.body.appendChild(g);
    var f=g.querySelector('form'),i=g.querySelector('input'),e=g.querySelector('.err');
    f.addEventListener('submit',function(ev){
      ev.preventDefault();
      sha(i.value.trim()).then(function(h){
        if(h===HASH){try{sessionStorage.setItem('gate-ok','1')}catch(x){} location.reload();}
        else{e.textContent='パスワードがちがうみたい…';i.value='';}
      });
    });
  });
})();
