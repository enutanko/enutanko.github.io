/* ---- tabs ---- */
(function(){
  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  var panels=[].slice.call(document.querySelectorAll('.panel'));
  function show(id,push){
    if(!document.getElementById(id))id='home';
    tabs.forEach(function(t){var on=t.dataset.tab===id;t.setAttribute('aria-selected',on);
      if(on){try{t.scrollIntoView({inline:'center',block:'nearest',behavior:'smooth'})}catch(e){}}});
    panels.forEach(function(p){p.classList.toggle('on',p.id===id)});
    if(push){try{history.replaceState(null,'','#'+(id==='home'?'':id))}catch(e){location.hash=id==='home'?'':id}}
  }
  tabs.forEach(function(t){t.addEventListener('click',function(){show(t.dataset.tab,true);window.scrollTo({top:0,behavior:'smooth'})})});
  window.addEventListener('hashchange',function(){show(location.hash.slice(1)||'home')});
  show(location.hash.slice(1)||'home');
})();

function esc(v){return String(v).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(m){var e=document.getElementById('toast');e.textContent=m;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove('on')},2200)}

/* 管理画面で更新済みの項目は SAMPLE の印を外す / プロフィール文 */
(function(){
  var live=window.ENU_LIVE||{};
  [].slice.call(document.querySelectorAll('.badge[data-k]')).forEach(function(b){if(live[b.dataset.k])b.style.display='none'});
  var pf=DATA.profile&&DATA.profile.text;
  if(pf){var el=document.getElementById('pfText');el.className='pftext';el.removeAttribute('style');el.innerHTML=esc(pf).replace(/\n/g,'<br>')}
})();

/* news */
(function(){
  function row(n){return '<div class="row"><div class="dt">'+esc(n.d)+'</div><div><div class="tt"><span class="tag">'+esc(n.tag)+'</span>'+esc(n.t)+'</div><div class="ds">'+esc(n.s)+'</div></div></div>'}
  document.getElementById('newsMini').innerHTML=DATA.news.slice(0,2).map(row).join('');
  document.getElementById('newsFull').innerHTML=DATA.news.map(row).join('');
})();

/* this week */
(function(){
  var names=['日','月','火','水','木','金','土'];
  var now=new Date(), mon=new Date(now); mon.setDate(now.getDate()-((now.getDay()+6)%7));
  var days=[];
  for(var i=0;i<7;i++){var d=new Date(mon);d.setDate(mon.getDate()+i);days.push(d)}
  var todayIdx=(now.getDay()+6)%7;
  function evOf(i){return DATA.schedule.filter(function(e){return e.dow===i+1}).sort(function(a,b){return a.time<b.time?-1:1})}
  function grid(sel){
    return days.map(function(d,i){
      var has=evOf(i).length>0;
      return '<button type="button" class="day'+(i===todayIdx?' today':'')+(i===sel?' sel':'')+'" data-i="'+i+'" aria-label="'+(d.getMonth()+1)+'月'+d.getDate()+'日 '+names[d.getDay()]+'曜日'+(has?' 配信あり':'')+'">'+names[d.getDay()]+'<b>'+d.getDate()+'</b><i class="'+(has?'dot':'')+'">'+(has?'':'–')+'</i></button>';
    }).join('');
  }
  function evt(e){return '<div class="evt"><div class="tm">'+esc(e.time)+'</div><div><span class="pf2">'+esc(e.pf)+'</span><div class="tt">'+esc(e.t)+'</div></div></div>'}
  function detail(i){
    var list=evOf(i), d=days[i];
    var head='<div class="ds" style="font-size:12px;color:#cfe6ff;margin-top:12px;font-weight:700">'+(d.getMonth()+1)+'月'+d.getDate()+'日（'+names[d.getDay()]+'）</div>';
    return head+(list.length?list.map(evt).join(''):'<div class="empty">この日の配信予定はありません</div>');
  }
  var sel=todayIdx;
  var mini=document.getElementById('weekMini'), full=document.getElementById('weekFull'), dEl=document.getElementById('dayEvt'), nx=document.getElementById('nextEvt');
  function nextEvent(){
    var nowMin=now.getHours()*60+now.getMinutes();
    for(var k=0;k<7;k++){
      var i=(todayIdx+k)%7, l=evOf(i);
      for(var j=0;j<l.length;j++){var p=l[j].time.split(':');if(k>0||(+p[0]*60+ +p[1])>=nowMin)return {e:l[j],i:i,k:k}}
    }return null;
  }
  function render(){
    mini.innerHTML=grid(-1); full.innerHTML=grid(sel); dEl.innerHTML=detail(sel);
    var n=nextEvent();
    nx.innerHTML=n?'<div class="ds" style="font-size:12px;color:#cfe6ff;margin-top:12px;font-weight:700">NEXT ／ '+(n.k===0?'今日':(days[n.i].getMonth()+1)+'/'+days[n.i].getDate()+'（'+names[days[n.i].getDay()]+'）')+'</div>'+evt(n.e):'';
  }
  full.addEventListener('click',function(ev){var b=ev.target.closest('.day');if(!b)return;sel=+b.dataset.i;render()});
  mini.addEventListener('click',function(ev){var b=ev.target.closest('.day');if(!b)return;sel=+b.dataset.i;render();document.getElementById('t-live').click()});
  render();
})();

/* archive / works / videos */
(function(){
  function th(x){
    var h='<div class="th"><div class="im '+esc(x.c||'')+'"></div><div class="cap">'+esc(x.t)+'<small>'+esc(x.s||'')+'</small></div></div>';
    return /^https:\/\//.test(x.u||'')?'<a class="thl" href="'+esc(x.u)+'" target="_blank" rel="noopener">'+h+'</a>':h;
  }
  document.getElementById('archive').innerHTML=DATA.archive.map(th).join('');
  document.getElementById('works').innerHTML=DATA.works.map(th).join('');
  document.getElementById('videos').innerHTML=DATA.videos.map(th).join('');
})();

/* song list */
(function(){
  var genres=['すべて'].concat(DATA.songs.map(function(s){return s.g}).filter(function(g,i,a){return a.indexOf(g)===i}));
  var cur='すべて', done={};
  var fe=document.getElementById('songFilter'), le=document.getElementById('songs');
  function render(){
    fe.innerHTML=genres.map(function(g){return '<button type="button" class="fbtn'+(g===cur?' on':'')+'" data-g="'+esc(g)+'">'+esc(g)+'</button>'}).join('');
    le.innerHTML=DATA.songs.map(function(s,i){return [s,i]}).filter(function(p){return cur==='すべて'||p[0].g===cur}).map(function(p){
      var s=p[0],i=p[1];
      return '<div class="row"><div><div class="tt">'+esc(s.t)+'</div><div class="ds">'+esc(s.a)+'<span class="tag t3" style="margin:0 0 0 8px">'+esc(s.g)+'</span></div></div>'+
        '<button type="button" class="btn'+(done[i]?' done':'')+'" data-i="'+i+'">'+(done[i]?'送信済み':'リクエスト')+'</button></div>';
    }).join('');
  }
  fe.addEventListener('click',function(e){var b=e.target.closest('.fbtn');if(!b)return;cur=b.dataset.g;render()});
  le.addEventListener('click',function(e){var b=e.target.closest('.btn');if(!b||done[b.dataset.i])return;
    var i=b.dataset.i,sg=DATA.songs[i];done[i]=1;render();
    enuSend('request',{body:'「'+sg.t+'」'+(sg.a?' / '+sg.a:'')}).then(function(r){toast(r==='demo'?'リクエストしました（サンプル表示です）':'リクエストしました！')},function(){done[i]=0;render();toast('送信できませんでした。もう一度ためしてね')});
  });
  render();
})();


/* ---- storage helpers ---- */
var mem={};
function sget(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}}
function sset(k,v){try{localStorage.setItem(k,v)}catch(e){mem[k]=v}}
function today(){var d=new Date();return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}

/* ---- opening ---- */
(function(){
  var o=document.getElementById('opening');
  var seen=false;try{seen=sessionStorage.getItem('opened')==='1'}catch(e){}
  if(seen){o.className+=' out';o.style.display='none';return}
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.style.overflow='hidden';

  /* ふわふわ上っていく王冠・ハート・星・雪 */
  var mo=document.getElementById('opMotifs'),G=['♡','♛','★','❄','✦','♡','♛','✧','❄','♡'];
  if(!reduce)for(var i=0;i<46;i++){
    var m=document.createElement('span');m.textContent=G[i%G.length];
    var big=Math.random()<.35;
    m.style.left=(Math.random()*96+2)+'%';
    m.style.fontSize=(big?26+Math.random()*24:12+Math.random()*12)+'px';
    m.style.setProperty('--du',(6+Math.random()*7)+'s');
    m.style.setProperty('--de',(-Math.random()*14+(i<4?0:0))+'s');
    m.style.setProperty('--op',(big?.7:.4+Math.random()*.3).toFixed(2));
    m.style.setProperty('--rt',((Math.random()-.5)*160)+'deg');
    mo.appendChild(m);
  }

  /* 夜空: またたく星・流れ星・雪 */
  var cv=document.getElementById('opSky'),cx=cv.getContext('2d'),W,H,dpr,st=[],sn=[],shoot=null,nextShoot=3500,alive=true,t0=0,lastT=0;
  function fit(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
    st=[];for(var i=0;i<110;i++)st.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.5+.3,p:Math.random()*6.28,s:Math.random()*2+.8});
    sn=[];for(var j=0;j<38;j++)sn.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2.2+.6,v:20+Math.random()*40,ph:Math.random()*6.28});
  }
  fit();addEventListener('resize',fit);
  function frame(t){
    if(!alive)return;
    if(!t0)t0=t;var dt=Math.min(.05,(t-(lastT||t))/1000);lastT=t;var el=t-t0;
    cx.clearRect(0,0,W,H);
    var fade=Math.min(1,el/900);
    st.forEach(function(s){
      var a=(.25+.75*Math.abs(Math.sin(s.p+el/1000*s.s)))*fade;
      cx.fillStyle='rgba(225,243,255,'+a+')';cx.beginPath();cx.arc(s.x,s.y,s.r,0,6.283);cx.fill();
      if(s.r>1.3){cx.strokeStyle='rgba(225,243,255,'+a*.5+')';cx.lineWidth=.6;cx.beginPath();cx.moveTo(s.x-s.r*3.2,s.y);cx.lineTo(s.x+s.r*3.2,s.y);cx.moveTo(s.x,s.y-s.r*3.2);cx.lineTo(s.x,s.y+s.r*3.2);cx.stroke()}
    });
    sn.forEach(function(f){
      f.y+=f.v*dt;f.x+=Math.sin(el/1000+f.ph)*8*dt;
      if(f.y>H+6){f.y=-6;f.x=Math.random()*W}
      cx.fillStyle='rgba(255,255,255,'+(.35+f.r/6)*fade+')';cx.beginPath();cx.arc(f.x,f.y,f.r,0,6.283);cx.fill();
    });
    if(!shoot&&el>nextShoot){shoot={x:Math.random()*W*.6+W*.35,y:Math.random()*H*.35,l:0};nextShoot=el+2600+Math.random()*2400}
    if(shoot){
      shoot.l+=dt*1.4;var k=shoot.l,hx=shoot.x-k*W*.45,hy=shoot.y+k*H*.22;
      var g=cx.createLinearGradient(hx,hy,hx+110,hy-55);g.addColorStop(0,'rgba(255,255,255,'+Math.max(0,1-k)+')');g.addColorStop(1,'rgba(255,255,255,0)');
      cx.strokeStyle=g;cx.lineWidth=2;cx.beginPath();cx.moveTo(hx,hy);cx.lineTo(hx+110,hy-55);cx.stroke();
      if(k>1)shoot=null;
    }
    requestAnimationFrame(frame);
  }
  if(!reduce)requestAnimationFrame(frame);

  /* はじまりの流れ星: 3本が右上からロゴへ直撃 → 点灯 */
  var mt=document.getElementById('opMeteor');
  function burstAt(x,y,n,rmin,rmax,life){
    var g=['★','✦','♡','❄','✧','♛'],cols=['#fff','#bfe6ff','#fff6b0','#ffd6ec'];
    for(var i=0;i<n;i++){var e=document.createElement('span');e.className='spark';e.textContent=g[i%g.length];
      var an=Math.random()*6.28,r=rmin+Math.random()*(rmax-rmin);e.style.left=x+'px';e.style.top=y+'px';e.style.color=cols[i%cols.length];
      e.style.fontSize=(12+Math.random()*20)+'px';
      e.style.setProperty('--dx',Math.cos(an)*r+'px');e.style.setProperty('--dy',Math.sin(an)*r+'px');
      document.body.appendChild(e);(function(n){setTimeout(function(){n.remove()},life||1000)})(e)}
  }
  if(!reduce&&mt&&mt.animate){
    var lgEl=document.getElementById('opLogo'),lr=lgEl?lgEl.getBoundingClientRect():null;
    var ex=lr&&lr.width?lr.left+lr.width*.5:innerWidth*.5,ey=lr&&lr.height?lr.top+lr.height*.5:innerHeight*.38;
    var M=[{dx:0,dy:0,d:0,w:280,h:4,o:1},{dx:90,dy:-40,d:130,w:190,h:3,o:.85},{dx:-110,dy:-70,d:260,w:150,h:2,o:.7}];
    M.forEach(function(p,k){
      var el=k?mt.cloneNode(false):mt;if(k){el.removeAttribute('id');mt.parentNode.appendChild(el)}
      el.style.width=p.w+'px';el.style.height=p.h+'px';
      var sx=innerWidth+60+p.dx*.6,sy=-40+p.dy*.4,tx=ex+p.dx*.25,ty=ey+p.dy*.25;
      var ang=Math.atan2(ty-sy,tx-sx)*180/Math.PI;
      el.animate([
        {opacity:0,transform:'translate('+(sx-p.w)+'px,'+sy+'px) rotate('+ang+'deg)'},
        {opacity:p.o,offset:.12},{opacity:p.o,offset:.85},
        {opacity:0,transform:'translate('+(tx-p.w)+'px,'+ty+'px) rotate('+ang+'deg)'}
      ],{duration:720,delay:40+p.d,easing:'cubic-bezier(.5,0,.9,.6)',fill:'both'});
      if(k===0){ /* 尾に星くずをこぼす */
        var N=16;for(var n=1;n<=N;n++)(function(n){var u=n/N;setTimeout(function(){
          var q=Math.pow(u,1.7),x=sx+(tx-sx)*q,y=sy+(ty-sy)*q;
          var s=document.createElement('span');s.className='op-trail';s.textContent=n%3?'✦':'★';
          s.style.left=x+'px';s.style.top=y+'px';s.style.fontSize=(9+Math.random()*10)+'px';
          s.style.setProperty('--dy',(10+Math.random()*26)+'px');
          o.appendChild(s);setTimeout(function(){s.remove()},800)},40+720*u)})(n);
      }
    });
    /* 衝突: 光がはじけてロゴが点灯 */
    setTimeout(function(){burstAt(ex,ey,22,90,260,1100);var f=document.createElement('div');f.className='op-flash';o.appendChild(f);setTimeout(function(){f.remove()},900)},780);
  }

  /* タップ: ロゴがヘッダーへ飛んでいく + 光の輪 + きらきら */
  var busy=false;
  function go(ev){
    if(busy)return;busy=true;
    var x=ev&&ev.clientX||innerWidth/2,y=ev&&ev.clientY||innerHeight/2;
    if(!reduce)burstAt(x,y,36,80,280,1000);
    var stage=document.getElementById('opStage'),lg=document.getElementById('opLogo'),hd=document.querySelector('.logo-wrap img');
    window.scrollTo(0,0);
    var fly=null;
    if(!reduce&&hd&&lg){
      var s=lg.getBoundingClientRect(),t=hd.getBoundingClientRect();
      if(s.width&&t.width){
        fly=lg.cloneNode(false);fly.removeAttribute('id');fly.className='opLogoFly';fly.style.animation='none';fly.style.opacity=1;
        fly.style.left=s.left+'px';fly.style.top=s.top+'px';fly.style.width=s.width+'px';fly.style.height=s.height+'px';
        document.body.appendChild(fly);hd.classList.add('hold');
        requestAnimationFrame(function(){requestAnimationFrame(function(){
          fly.style.transform='translate('+(t.left-s.left)+'px,'+(t.top-s.top)+'px) scale('+(t.width/s.width)+','+(t.height/s.height)+')';
        })});
      }
    }
    stage.classList.add('go');
    var delay=fly?950:0;
    setTimeout(function(){o.classList.add('out');document.documentElement.style.overflow='';alive=false},fly?500:0);
    setTimeout(function(){
      if(fly){hd.classList.remove('hold');hd.classList.add('land');fly.remove();setTimeout(function(){hd.classList.remove('land')},1000)}
      o.style.display='none';
    },delay+400);
    try{sessionStorage.setItem('opened','1')}catch(e){}
  }
  o.addEventListener('click',go);
  o.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}});
})();

/* ---- omikuji ---- */
(function(){
  var F=[
    {r:'大吉',st:'★★★★★',w:1,m:'今日はなんでもうまくいく日！ゆめかわパワー全開✨',li:'ラッキーモチーフ：白いハート'},
    {r:'中吉',st:'★★★★☆',w:2,m:'ちいさな楽しいことが見つかりそう。おでかけ日和。',li:'ラッキーモチーフ：王冠'},
    {r:'小吉',st:'★★★☆☆',w:3,m:'ゆっくり深呼吸。あたたかい飲み物でほっとしてね。',li:'ラッキーモチーフ：雪の結晶'},
    {r:'吉',st:'★★★☆☆',w:3,m:'いつも通りがいちばん。自分のペースで進もう。',li:'ラッキーモチーフ：星'},
    {r:'末吉',st:'★★☆☆☆',w:1,m:'あせらなくて大丈夫。夜にはいいことがあるかも。',li:'ラッキーモチーフ：ふわふわのくま'}
  ];
  var btn=document.getElementById('omiBtn'),res=document.getElementById('omiRes'),note=document.getElementById('omiNote');
  function show(f){document.getElementById('omiRk').textContent=f.r;document.getElementById('omiSt').textContent=f.st;
    document.getElementById('omiMs').textContent=f.m;document.getElementById('omiLi').textContent=f.li;res.classList.add('on')}
  function lock(){btn.disabled=true;btn.textContent='今日はひきました';note.textContent='また明日ひいてね。'}
  var saved=sget('enu_omi');
  if(saved){try{var o=JSON.parse(saved);if(o.d===today()){show(F[o.i]);lock()}}catch(e){}}
  btn.addEventListener('click',function(){
    if(btn.disabled)return;
    btn.classList.add('shake');
    setTimeout(function(){
      btn.classList.remove('shake');
      var tot=F.reduce(function(a,f){return a+f.w},0),r=Math.random()*tot,i=0;
      for(;i<F.length;i++){r-=F[i].w;if(r<0)break}
      i=Math.min(i,F.length-1);sset('enu_omi',JSON.stringify({d:today(),i:i}));show(F[i]);lock();
    },600);
  });
})();

/* ---- stamp card ---- */
(function(){
  var N=10,G=['★','♛','♡','❄','✦'];
  var box=document.getElementById('stamps'),btn=document.getElementById('stampBtn'),msg=document.getElementById('stampMsg'),rs=document.getElementById('stampReset');
  function load(){try{var o=JSON.parse(sget('enu_stamp')||'{}');return{n:o.n||0,d:o.d||''}}catch(e){return{n:0,d:''}}}
  var st=load();
  function save(){sset('enu_stamp',JSON.stringify(st))}
  function render(fresh){
    var h='';for(var i=0;i<N;i++){h+=i<st.n?'<div class="sl on" style="'+(fresh&&i===st.n-1?'':'animation:none')+'">'+G[i%G.length]+'</div>':'<div class="sl">'+(i+1)+'</div>'}
    box.innerHTML=h;
    var done=st.n>=N;rs.hidden=!done;
    if(done){btn.disabled=true;btn.textContent='コンプリート！';msg.textContent='全部たまったよ！ありがとう💙'}
    else if(st.d===today()){btn.disabled=true;btn.textContent='今日はおしました';msg.textContent='また明日きてね。あと'+(N-st.n)+'こ！'}
    else{btn.disabled=false;btn.textContent='今日のスタンプをおす';msg.textContent=st.n?'いま '+st.n+' こ。あと '+(N-st.n)+' こ！':''}
  }
  btn.addEventListener('click',function(){if(btn.disabled)return;st.n++;st.d=today();save();render(true)});
  rs.addEventListener('click',function(){st={n:0,d:''};save();render()});
  render();
})();

/* ---- forms ---- */
(function(){
  var last=0;
  function send(type,payload,form,done){
    if(form.querySelector('.hp').value){return} // bot
    if(Date.now()-last<20000){toast('少し待ってから送ってね');return}
    last=Date.now();
    enuSend(type,payload).then(function(r){
      toast(r==='demo'?'サンプル表示です（まだ届きません）':'送信しました。ありがとう！');done()
    },function(){last=0;toast('送信できませんでした。もう一度ためしてね')});
  }
  var mb=document.getElementById('msgBody'),mc=document.getElementById('msgCnt');
  mb.addEventListener('input',function(){mc.textContent=mb.value.length});
  document.getElementById('msgForm').addEventListener('submit',function(e){
    e.preventDefault();var v=mb.value.trim();if(!v){toast('メッセージを入力してね');mb.focus();return}
    send('message',{body:v},this,function(){mb.value='';mc.textContent=0});
  });
  var f2=document.getElementById('ctForm');
  f2.addEventListener('submit',function(e){
    e.preventDefault();
    var n=document.getElementById('ctName'),m=document.getElementById('ctMail'),b=document.getElementById('ctBody');
    if(!n.value.trim()||!m.value.trim()||!b.value.trim()){toast('すべて入力してください');return}
    send('contact',{name:n.value.trim(),contact:m.value.trim(),body:b.value.trim()},this,function(){n.value=m.value=b.value=''});
  });
})();

/* ---- X post box ---- */
(function(){
  var box=document.getElementById('xbox');if(!CONFIG.xHandle){box.style.display='none';return}
  var url='https://x.com/'+encodeURIComponent(CONFIG.xHandle);
  box.innerHTML='<a class="twitter-timeline" data-theme="dark" data-height="420" data-chrome="noheader nofooter transparent" data-dnt="true" href="'+url+'">'+
    '<span style="display:flex;justify-content:space-between;align-items:center;color:#fff;font-weight:700;font-size:14px">Xで最新のポストを見る<em style="font-style:normal;font-size:11px;color:#9ad4f2;font-weight:500">@'+CONFIG.xHandle+' →</em></span></a>';
  var sc=document.createElement('script');sc.async=true;sc.src='https://platform.twitter.com/widgets.js';sc.charset='utf-8';
  document.body.appendChild(sc); // 本番公開時にタイムラインへ置き換わる。読み込めない環境ではリンクのまま
})();


/* ---- app install (PWA) ---- */
(function(){
  var box=document.getElementById('install'),txt=document.getElementById('installTxt'),btn=document.getElementById('installBtn'),cl=document.getElementById('installClose');
  var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
  var dismissed=sget('enu_install_off')==='1';
  if(standalone||dismissed)return;
  var dp=null,ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  if(ios){txt.textContent='Safariの共有ボタン(□↑)から「ホーム画面に追加」を選んでね。';box.classList.add('on')}
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();dp=e;txt.textContent='ボタンを押すとホーム画面に追加できます。';btn.hidden=false;box.classList.add('on')});
  btn.addEventListener('click',function(){if(!dp)return;dp.prompt();dp.userChoice.then(function(){dp=null;box.classList.remove('on')})});
  cl.addEventListener('click',function(){box.classList.remove('on');sset('enu_install_off','1')});
  window.addEventListener('appinstalled',function(){box.classList.remove('on')});
})();
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){try{navigator.serviceWorker.register('sw.js').catch(function(){})}catch(e){}}

/* ---- stars & snow ---- */
(function(){
  var c=document.getElementById('sky'),x=c.getContext('2d');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W,H,dpr,stars=[],flakes=[],last=0,sprites={};
  // やわらかい雪の粒を先に描いておく(大きさごと・ぼかしごと)
  function sprite(r,blur){
    var k=r.toFixed(1)+'_'+blur,s=sprites[k];if(s)return s;
    var d=Math.ceil((r+blur)*2+4),cv=document.createElement('canvas');cv.width=cv.height=d*dpr;
    var g=cv.getContext('2d');g.scale(dpr,dpr);
    var gr=g.createRadialGradient(d/2,d/2,0,d/2,d/2,d/2);
    var core=Math.max(.05,Math.min(.85,r/(r+blur+.001)));
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(core*.7,'rgba(255,255,255,.95)');
    gr.addColorStop(core,'rgba(235,246,255,.55)');gr.addColorStop(1,'rgba(235,246,255,0)');
    g.fillStyle=gr;g.beginPath();g.arc(d/2,d/2,d/2,0,6.283);g.fill();
    return sprites[k]={cv:cv,d:d};
  }
  function size(){
    dpr=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;sprites={};
    c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
    stars=[];for(var i=0;i<70;i++)stars.push({x:Math.random()*W,y:Math.random()*H*.8,r:Math.random()*1.4+.3,p:Math.random()*6.28,s:Math.random()*.02+.006});
    flakes=[];var n=Math.round(Math.max(26,Math.min(70,W/7)));
    for(var j=0;j<n;j++)flakes.push(mk(true));
  }
  // z: 0=遠い(小さく・ゆっくり・薄い) 〜 1=近い(大きく・速く・ぼんやり)
  function mk(init){
    var z=Math.pow(Math.random(),1.6);
    return{
      x:Math.random()*W, y:init?Math.random()*H:-12-Math.random()*40, z:z,
      r:.7+z*3.2, vy:14+z*46+Math.random()*8,           // px/秒
      ph:Math.random()*6.28, fr:.35+Math.random()*.6,    // ゆれの位相・周期
      amp:6+z*14+Math.random()*6,                        // ゆれ幅
      ph2:Math.random()*6.28, fr2:.12+Math.random()*.2,
      o:.35+z*.5, blur:z>.7?2.2:(z>.4?1.1:.4)
    };
  }
  var wind=0,windT=0;
  function frame(t){
    var dt=last?Math.min(.05,(t-last)/1000):.016;last=t;
    x.clearRect(0,0,W,H);
    stars.forEach(function(s){
      var a=.35+.65*Math.abs(Math.sin(s.p+t*s.s*.06));
      x.fillStyle='rgba(215,240,255,'+a+')';x.beginPath();x.arc(s.x,s.y,s.r,0,6.283);x.fill();
    });
    // ゆっくり向きが変わる風(+ときどき弱いひと吹き)
    windT+=dt; wind=Math.sin(windT*.18)*9+Math.sin(windT*.51+1.3)*5;
    flakes.forEach(function(f){
      f.y+=f.vy*dt;
      // 横ゆれ: 2つのゆっくりした波を重ねて、風は近い雪ほど強く受ける
      var sway=Math.sin(t/1000*f.fr+f.ph)*f.amp*.55+Math.sin(t/1000*f.fr2+f.ph2)*f.amp*.45;
      f.x+=(wind*(.3+f.z)+Math.cos(t/1000*f.fr+f.ph)*f.amp*f.fr*.55)*dt;
      var px=f.x+sway*.15, py=f.y;
      if(f.y>H+14||f.x<-40||f.x>W+40){Object.assign(f,mk(false));if(f.x<-40||f.x>W+40)f.x=Math.random()*W;return}
      // 上下の端でふわっと出入り
      var edge=Math.min(1,Math.max(0,(f.y+10)/60),Math.max(0,(H+14-f.y)/80));
      var sp=sprite(f.r,f.blur),sz=sp.d;
      x.globalAlpha=f.o*edge;x.drawImage(sp.cv,px-sz/2,py-sz/2,sz,sz);
    });
    x.globalAlpha=1;
    if(!reduce)requestAnimationFrame(frame);
  }
  size();
  // スマホはスクロールでアドレスバーが出入りして resize が飛ぶ。そのたびに雪を作り直すと
  // 急に動いたように見えるので、横幅が変わらない小さな高さ変化は雪をそのままにして描画サイズだけ更新する
  var lastW=innerWidth;
  addEventListener('resize',function(){
    if(innerWidth===lastW&&Math.abs(innerHeight-H)<220){
      H=innerHeight;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
    }else{lastW=innerWidth;size();}
  });
  document.addEventListener('visibilitychange',function(){last=0});
  addEventListener('pageshow',function(){last=0});
  requestAnimationFrame(frame);
})();
