'use client';
import {useEffect,useRef,useState} from 'react';
import {ScanLine,Search,Settings,ShieldCheck,Scissors,Tag,Camera,User,Save,X,Gift} from 'lucide-react';

const eligible=['Color','Highlights','Botox','Keratina'];
const post=(url,body)=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});

export default function Equipo(){
  const [pin,setPin]=useState(''),[ok,setOk]=useState(false),[tab,setTab]=useState('counter');
  const [q,setQ]=useState(''),[results,setResults]=useState([]),[summary,setSummary]=useState(null),[client,setClient]=useState(null),[data,setData]=useState(null);
  const [service,setService]=useState('Color'),[msg,setMsg]=useState(''),[scan,setScan]=useState(false);
  const [configPin,setConfigPin]=useState(''),[configOk,setConfigOk]=useState(false),[cfg,setCfg]=useState(null);
  useEffect(()=>{let id=new URLSearchParams(location.search).get('client');if(id)setClient({id})},[]);
  useEffect(()=>{if(ok&&client?.id)load(client.id)},[ok,client?.id]);
  useEffect(()=>{if(ok&&!client)search('')},[ok]);
  async function enter(){let r=await post('/api/auth',{pin,type:'staff'}),d=await r.json();if(!r.ok)return setMsg(d.error);setMsg('');setOk(true)}
  async function load(id){let r=await fetch(`/api/client/${id}`),d=await r.json();setData(d);if(d.client)setClient(d.client);else setMsg(d.error)}
  async function search(value=q){let r=await post('/api/staff',{pin,query:value}),d=await r.json();if(!r.ok)return setMsg(d.error);setMsg('');setResults(d.clients||[]);setSummary(d.summary||null)}
  async function action(type,rewardType){setMsg('');let r=await post(`/api/staff/client/${client.id}/${type}`,{pin,service,rewardType}),d=await r.json();setMsg(r.ok?(type==='visit'?'Visita registrada correctamente ✨':type==='reward'?'Recompensa entregada correctamente ✨':'Beneficio canjeado correctamente ✨'):d.error);if(r.ok)load(client.id)}
  if(!ok)return <main className="staffHome"><header><img src="/libia-logo.jpg"/><span>USO INTERNO</span></header><section className="staffGate"><ShieldCheck/><h1>Equipo Libia</h1><p>Acceso exclusivo para el counter.</p><label>PIN de operación<input type="password" inputMode="numeric" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&enter()}/></label><button onClick={enter}>Entrar</button>{msg&&<p className="error">{msg}</p>}</section></main>;
  if(tab==='settings')return <SettingsPanel pin={configPin} setPin={setConfigPin} access={configOk} setAccess={setConfigOk} cfg={cfg} setCfg={setCfg} back={()=>setTab('counter')}/>;
  return <main className="teamApp">
    <header className="teamHead"><img src="/libia-logo.jpg"/><div><small>LIBIA BEAUTY SALON</small><b>Counter</b></div></header>
    <nav className="teamTabs"><button className="active" onClick={()=>{setClient(null);setData(null);setMsg('');search('')}}><Search/>Clientes</button><button onClick={()=>setScan(true)}><ScanLine/>Escanear QR</button><button onClick={()=>setTab('settings')}><Settings/>Configuración</button></nav>
    {!client?<Dashboard summary={summary} q={q} setQ={setQ} search={search} results={results} open={setClient} scan={()=>setScan(true)} msg={msg}/>:<ClientPanel data={data} service={service} setService={setService} action={action} msg={msg} close={()=>{setClient(null);setData(null);setMsg('');search('')}}/>}
    {scan&&<Scanner close={()=>setScan(false)} found={id=>{setScan(false);setClient({id})}}/>}
  </main>
}

function Dashboard({summary,q,setQ,search,results,open,scan,msg}){return <section className="counterStart dashboard"><div className="dashboardIntro"><div><small>DASHBOARD</small><h1>Clientes de Libia</h1><p>Todos los clientes y su progreso en un solo lugar.</p></div><button className="scanCompact" onClick={scan}><Camera/>Escanear QR</button></div>{summary&&<div className="summaryGrid"><div><small>CLIENTES</small><b>{summary.clients}</b></div><div><small>VISITAS</small><b>{summary.visits}</b></div><div><small>PUNTOS REFERIDOS</small><b>{Number(summary.referralPoints).toFixed(1)}</b></div><div><small>REGALOS LISTOS</small><b>{summary.rewards}</b></div></div>}<div className="searchBox"><Search/><input placeholder="Buscar nombre o teléfono" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()}/><button onClick={()=>search()}>Buscar</button></div>{msg&&<p className="error">{msg}</p>}<div className="clientList"><div className="listTitle"><b>{q?'Resultados':'Todos los clientes'}</b><span>{results.length}</span></div>{results.map(c=><button className="clientRow" key={c.id} onClick={()=>open(c)}><span className="avatar">{c.name?.[0]}</span><span className="clientMain"><b>{c.name}</b><small>{c.phone}</small></span><span className="clientMetrics"><em>{c.visitCount} visitas</em><em>{Number(c.refPoints).toFixed(1)} pts.</em>{c.referralStatus&&<em className={c.referralStatus.discount_redeemed?'done':c.referralStatus.first_visit_completed?'half':'pending'}>{c.referralStatus.discount_redeemed?'+1 referido':c.referralStatus.first_visit_completed?'+0.5 referido':'Referido pendiente'}</em>}</span><span className="chevron">›</span></button>)}</div></section>}

function ClientPanel({data,service,setService,action,msg,close}){
  if(!data?.client)return <section className="counterStart">Cargando cliente…</section>;
  let c=data.client,b=data.referralBenefit;
  return <section className="clientRecord"><button className="back" onClick={close}>← Buscar otro cliente</button><span className="badge">{c.source==='referral'?'CLIENTE REFERIDA':'CLIENTE'}</span><h1>{c.name}</h1><p>{c.phone}</p><div className="stats"><div><small>VISITAS</small><b>{data.visitCount}</b></div><div><small>REFERIDOS</small><b>{Number(data.refPoints).toFixed(1)}</b></div></div>
    <section className="counterCard"><h2>Registrar visita</h2><p>Cada visita suma a su tarjeta personal.</p><button className="darkAction" onClick={()=>action('visit')}><Scissors/>Registrar visita</button>
    {data.visitAvailable>0&&<><hr/><h2>Tratamiento de color disponible</h2><p>Recompensa obtenida por completar cinco visitas.</p><button className="goldAction" onClick={()=>action('reward','visit_color')}><Gift/>Marcar recompensa como entregada</button></>}
    {data.referralAvailable>0&&<><hr/><h2>Regalo especial disponible</h2><p>Recompensa obtenida por completar cinco puntos de referidos.</p><button className="goldAction" onClick={()=>action('reward','referral_color')}><Gift/>Marcar regalo como entregado</button></>}
    {b&&!b.discount_redeemed&&<><hr/><h2>Beneficio de referido · 5%</h2><p>Permanece pendiente hasta usarlo en Color, Highlights, Botox o Keratina.</p><div className="serviceButtons">{eligible.map(x=><button className={service===x?'selected':''} onClick={()=>setService(x)} key={x}>{x}</button>)}</div><button className="goldAction" onClick={()=>action('redeem')}><Tag/>Canjear 5% · {service}</button></>}
    {b&&<div className={`refProgress ${b.discount_redeemed?'complete':b.first_visit_completed?'half':'pending'}`}><span>PROGRESO DEL REFERIDO</span><b>{b.discount_redeemed?'+1.0 punto':b.first_visit_completed?'+0.5 punto':'Pendiente'}</b><small>{b.discount_redeemed?`Primera visita + canje en ${b.qualifying_service}`:b.first_visit_completed?'Primera visita completada · falta usar el 5%':'Aún no registra su primera visita'}</small></div>}{msg&&<div className="notice">{msg}</div>}</section>
  </section>
}

function Scanner({close,found}){
  const video=useRef(null),controls=useRef(null),[err,setErr]=useState('');
  useEffect(()=>{let live=true;(async()=>{try{let {BrowserQRCodeReader}=await import('@zxing/browser'),reader=new BrowserQRCodeReader();controls.current=await reader.decodeFromConstraints({video:{facingMode:{ideal:'environment'}}},video.current,(result)=>{if(!live||!result)return;try{let u=new URL(result.getText()),id=u.searchParams.get('client');if(id){live=false;controls.current?.stop();found(id)}}catch{setErr('Este QR no pertenece a Libia Beauty.') }})}catch{setErr('No pudimos abrir la cámara. Revisa el permiso o busca por teléfono.')}})();return()=>{live=false;controls.current?.stop()}},[]);
  return <div className="scanner"><div><button className="x" onClick={close}><X/></button><small>ESCÁNER LIBIA</small><h2>Escanea la tarjeta</h2><p>Usaremos la cámara trasera cuando esté disponible.</p><div className="camera"><video ref={video} playsInline muted/><span/></div>{err&&<p className="error">{err}</p>}</div></div>
}

function SettingsPanel({pin,setPin,access,setAccess,cfg,setCfg,back}){
  const [msg,setMsg]=useState('');
  useEffect(()=>{if(access&&!cfg)fetch('/api/config').then(r=>r.json()).then(d=>setCfg(d.config))},[access,cfg]);
  async function enter(){let r=await post('/api/auth',{pin,type:'config'}),d=await r.json();if(!r.ok)return setMsg(d.error);setMsg('');setAccess(true)}
  if(!access)return <main className="staffHome"><section className="staffGate"><Settings/><h1>Configuración</h1><p>Esta área modifica el contenido global de Libia Beauty.</p><label>Código de configuración<input type="password" inputMode="numeric" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&enter()}/></label><button onClick={enter}>Abrir configuración</button>{msg&&<p className="error">{msg}</p>}<button className="back" onClick={back}>← Volver</button></section></main>;
  if(!cfg)return <main className="loading">Cargando configuración…</main>;
  async function save(){let r=await post('/api/config',{pin,...cfg}),d=await r.json();setMsg(r.ok?'Cambios guardados para todos los dispositivos ✨':d.error)}
  return <main className="teamApp"><header className="teamHead"><img src="/libia-logo.jpg"/><div><small>CONFIGURACIÓN</small><b>Libia Beauty</b></div></header><section className="settingsPanel"><button className="back" onClick={back}>← Operación</button><h1>Contenido del salón</h1><p>Los cambios se aplican globalmente.</p>{[['visit_text','Texto · Mis visitas'],['ref_text','Texto · Mis referidos'],['ref_reward','Recompensa · Referidos'],['booking_label','Texto botón · Agendar'],['booking_url','URL destino · Agendar'],['contact_label','Texto botón · Contacto'],['contact_url','URL destino · Contacto']].map(([k,l])=><label key={k}>{l}<input value={cfg[k]||''} onChange={e=>setCfg({...cfg,[k]:e.target.value})}/></label>)}<button className="goldAction" onClick={save}><Save/>Guardar cambios</button>{msg&&<div className="notice">{msg}</div>}</section></main>
}
