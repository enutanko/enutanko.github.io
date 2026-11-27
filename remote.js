/* 管理画面で更新した内容(Supabase)を読み込んでから、app.js を起動します。
   つながらないときは、前回の内容 → data.js のサンプル、の順で表示します。 */
(function(){
  var SB=CONFIG.sb||{}, KEY='enu_remote_v1', KEYS=['news','schedule','archive','songs','works','videos'];
  function rpc(fn,body,ms){
    var ctl=window.AbortController?new AbortController():null, t=ctl&&ms?setTimeout(function(){ctl.abort()},ms):0;
    return fetch(SB.url+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'apikey':SB.key,'Content-Type':'application/json'},body:JSON.stringify(body||{}),signal:ctl?ctl.signal:undefined})
      .then(function(r){clearTimeout(t);return r.json().catch(function(){return null}).then(function(d){if(!r.ok){var e=new Error('http');e.status=r.status;e.msg=d&&d.message;throw e}return d})},function(e){clearTimeout(t);throw e});
  }
  /* 送信(匿名メッセージ・お問い合わせ・曲リクエスト)。Promise: 'ok' | 'demo' | reject */
  window.enuSend=function(kind,p){
    if(!SB.url)return Promise.resolve('demo');
    return rpc('enu_send',{p_kind:kind,p_name:p.name||null,p_contact:p.contact||null,p_body:p.body},8000)
      .then(function(){return 'ok'},function(e){if(e&&(e.status===404||e.status===400&&/function|schema/i.test(e.msg||'')))return 'demo';throw e});
  };
  function apply(o){
    window.ENU_LIVE={};
    if(!o||typeof o!=='object')return;
    KEYS.forEach(function(k){if(Array.isArray(o[k])){DATA[k]=o[k];ENU_LIVE[k]=1}});
    if(o.profile&&typeof o.profile==='object'){DATA.profile=o.profile}
  }
  function start(){
    var s=document.createElement('script');s.src='app.js';document.body.appendChild(s);
  }
  var cached=null;try{cached=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  var fired=false;
  function go(o){if(fired)return;fired=true;apply(o);start()}
  if(!SB.url){go(null);return}
  var timer=setTimeout(function(){go(cached)},1500);   // 遅いときは前回の内容で先に表示
  rpc('enu_get',{},4000).then(function(o){
    try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}
    clearTimeout(timer);
    if(!fired)go(o);
  },function(){clearTimeout(timer);go(cached)});
})();
