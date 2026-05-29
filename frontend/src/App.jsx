import { useState, useEffect, useRef } from "react"

const SVCS = [
  {name:'Transaction Ingestion',lat:42,up:'99.98%',st:'UP',port:8081,desc:'Recibe transacciones del sistema de pagos'},
  {name:'Fraud Analysis',lat:138,up:'99.95%',st:'UP',port:8082,desc:'Analiza y clasifica transacciones'},
  {name:'Rule Engine',lat:28,up:'100%',st:'UP',port:8083,desc:'Evalúa reglas con patrón Strategy'},
  {name:'Notification Service',lat:61,up:'99.90%',st:'UP',port:8084,desc:'Notifica Admin/Analista por RabbitMQ'},
  {name:'Alert Query Service',lat:null,up:'98.10%',st:'DOWN',port:8085,desc:'API REST + JWT para el dashboard'},
]

const INIT_AL = [
  {id:'ALT-001',tipo:'Monto anómalo',svc:'Matrícula',usr:'u.garcia@uan.edu.co',monto:4850000,est:'PENDIENTE',rsk:'ALTO',org:'Fraud Analysis → Rule MONTO',hora:'08:14'},
  {id:'ALT-002',tipo:'Acceso no autorizado',svc:'Nómina',usr:'admin.ext@unknown.com',monto:null,est:'REVISADO',rsk:'ALTO',org:'Fraud Analysis → Rule ACCESO',hora:'07:52'},
  {id:'ALT-003',tipo:'Frecuencia anormal',svc:'Pagos',usr:'j.martinez@uan.edu.co',monto:120000,est:'PENDIENTE',rsk:'MEDIO',org:'Fraud Analysis → Rule FRECUENCIA',hora:'07:30'},
  {id:'ALT-004',tipo:'Patrón inusual',svc:'Inscripción',usr:'r.lopez@uan.edu.co',monto:890000,est:'CERRADO',rsk:'BAJO',org:'Fraud Analysis → Rule PATRON',hora:'06:45'},
  {id:'ALT-005',tipo:'Monto anómalo',svc:'Nómina',usr:'sys.batch@uan.edu.co',monto:12500000,est:'PENDIENTE',rsk:'ALTO',org:'Fraud Analysis → Rule MONTO',hora:'23:11'},
]

const INIT_TX = [
  {id:'TXN-9807',svc:'NOMINA',monto:12500000,usr:'sys.batch@uan.edu.co',est:'ANOMALA',lat:188,hora:'23:11',ip:'10.0.0.5'},
  {id:'TXN-9808',svc:'MATRICULA',monto:4850000,usr:'l.moreno@uan.edu.co',est:'NORMAL',lat:95,hora:'22:41',ip:'10.0.1.42'},
  {id:'TXN-9809',svc:'NOMINA',monto:3200000,usr:'sys.payroll@uan.edu.co',est:'NORMAL',lat:110,hora:'06:00',ip:'10.0.0.5'},
  {id:'TXN-9810',svc:'INSCRIPCION',monto:890000,usr:'r.lopez@uan.edu.co',est:'NORMAL',lat:87,hora:'06:45',ip:'10.0.1.88'},
  {id:'TXN-9811',svc:'PAGOS',monto:120000,usr:'j.martinez@uan.edu.co',est:'ANOMALA',lat:98,hora:'07:30',ip:'10.0.1.91'},
  {id:'TXN-9812',svc:'MATRICULA',monto:4850000,usr:'u.garcia@uan.edu.co',est:'ANOMALA',lat:142,hora:'08:14',ip:'10.0.1.77'},
]

const RULES = [
  {n:1,name:'Monto excesivo en matrícula',desc:'Matrícula > $6.000.000 → riesgo ALTO'},
  {n:2,name:'Monto excesivo en nómina',desc:'Nómina > $10.000.000 → riesgo ALTO'},
  {n:3,name:'Frecuencia anormal',desc:'>5 transacciones del mismo usuario en 10 min → MEDIO'},
  {n:4,name:'Fuera de horario',desc:'Transacción entre 11pm y 5am → riesgo MEDIO'},
  {n:5,name:'Acceso no autorizado',desc:'IP externa o usuario fuera de @uan.edu.co → ALTO'},
]

const PRESETS = {
  n: {ss:'PAGOS',sm:'500000',su:'j.perez@uan.edu.co',si:'10.0.1.55',sh:'10:00'},
  m: {ss:'MATRICULA',sm:'9500000',su:'est@uan.edu.co',si:'10.0.1.22',sh:'09:30'},
  o: {ss:'NOMINA',sm:'15000000',su:'sys.batch@uan.edu.co',si:'10.0.0.5',sh:'14:00'},
  h: {ss:'PAGOS',sm:'2000000',su:'c.torres@uan.edu.co',si:'10.0.1.77',sh:'02:30'},
  e: {ss:'NOMINA',sm:'3000000',su:'hacker@external.com',si:'192.168.1.105',sh:'11:00'},
  p: {ss:'MATRICULA',sm:'8000000',su:'unknown@ext.net',si:'172.16.0.1',sh:'23:45'},
}

const fmt = n => n != null ? '$' + n.toLocaleString('es-CO') : '—'
const lc = l => !l ? '#A32D2D' : l > 150 ? '#854F0B' : '#27500A'
const rb = r => r === 'ALTO' ? 'br' : r === 'MEDIO' ? 'bw' : 'bg'
const eb = e => e === 'PENDIENTE' ? 'bw' : e === 'REVISADO' ? 'bb' : 'bg'
const ts = () => new Date().toLocaleTimeString('es-CO', {hour:'2-digit',minute:'2-digit',second:'2-digit'})

function evalRules(svc, monto, usr, ip, hora) {
  const h = parseInt(hora.split(':')[0]), v = []
  if (svc === 'MATRICULA' && monto > 6000000) v.push({r:'Monto excesivo matrícula',n:'ALTO',t:'MONTO'})
  if (svc === 'NOMINA' && monto > 10000000) v.push({r:'Monto excesivo nómina',n:'ALTO',t:'MONTO'})
  if (usr.startsWith('sys.')) v.push({r:'Frecuencia anormal',n:'MEDIO',t:'FRECUENCIA'})
  if (h >= 23 || h < 5) v.push({r:'Transacción fuera de horario',n:'MEDIO',t:'HORARIO'})
  if (!usr.endsWith('@uan.edu.co') && !ip.startsWith('10.0.')) v.push({r:'Acceso no autorizado',n:'ALTO',t:'ACCESO'})
  if (monto > 3000000 && (h >= 22 || h < 6)) v.push({r:'Patrón combinado monto+noche',n:'ALTO',t:'PATRON'})
  return v
}

const styles = `
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --navy:#0F2044;--navy2:#162B58;--navy3:#1E3A6E;
    --gold:#C8972A;--gold-lt:#F0C040;
    --bg:#F5F4EF;--surface:#FFFFFF;--surface2:#F8F7F3;
    --border:#E2DDD0;--border2:#D0C9B8;
    --text:#1A1A1A;--muted:#6B6860;--hint:#9E9B94;
    --danger:#A32D2D;--danger-bg:#FCEBEB;--danger-bd:#F7C1C1;
    --warn:#854F0B;--warn-bg:#FAEEDA;--warn-bd:#FAC775;
    --ok:#27500A;--ok-bg:#EAF3DE;--ok-bd:#C0DD97;
    --info:#0C447C;--info-bg:#E6F1FB;--info-bd:#B5D4F4;
    --r-md:8px;--r-lg:12px;
  }
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;color:var(--text);background:var(--bg);min-height:100vh}
  .wrap{max-width:1200px;margin:0 auto;background:var(--bg)}
  .topbar{background:var(--navy);border-bottom:3px solid var(--gold);padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;position:sticky;top:0;z-index:100}
  .tl{display:flex;align-items:center;gap:10px}
  .crest{width:32px;height:32px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:var(--navy);flex-shrink:0}
  .ttitle{font-size:14px;font-weight:600;color:#fff}.ttitle span{color:var(--gold-lt)}
  .tsub{font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1.5px}
  .tpills{display:flex;gap:6px;flex-wrap:wrap}
  .tpill{font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.75);display:flex;align-items:center;gap:5px}
  .tpill.danger{background:rgba(163,45,45,0.25);border-color:rgba(163,45,45,0.5);color:#FCA5A5}
  .navtabs{background:var(--navy2);border-bottom:1px solid rgba(200,151,42,0.25);padding:0 20px;display:flex;gap:0;overflow-x:auto}
  .nt{padding:10px 16px;font-size:12px;font-weight:500;color:rgba(255,255,255,0.45);cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;white-space:nowrap;display:flex;align-items:center;gap:6px;transition:all .15s;font-family:inherit}
  .nt:hover{color:rgba(255,255,255,0.85)}
  .nt.on{color:var(--gold-lt);border-bottom-color:var(--gold)}
  .main{padding:24px 20px}
  .ptitle{font-size:20px;font-weight:600;color:var(--text);margin-bottom:3px}
  .psub{font-size:11px;color:var(--muted);margin-bottom:20px;font-family:monospace}
  .kgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
  .kcard{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px 16px}
  .klbl{font-size:10px;color:var(--muted);margin-bottom:7px;text-transform:uppercase;letter-spacing:.7px;font-weight:500}
  .kval{font-size:24px;font-weight:700;line-height:1;margin-bottom:3px}
  .ksub{font-size:10px;color:var(--muted)}
  .kbar{height:3px;border-radius:2px;background:var(--border);margin-top:10px;overflow:hidden}
  .kbarfill{height:100%;border-radius:2px}
  .stitle{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--navy3);margin-bottom:10px;display:flex;align-items:center;gap:8px}
  .stitle::before{content:'';width:3px;height:12px;background:var(--gold);border-radius:2px;display:inline-block}
  .sgrid{display:grid;gap:10px;margin-bottom:20px}
  .sc{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:12px 8px;text-align:center}
  .sc.down{border-color:var(--danger-bd);background:var(--danger-bg)}
  .scname{font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;line-height:1.3;font-weight:500}
  .sclat{font-size:16px;font-weight:700}
  .scup{font-size:9px;color:var(--muted);font-family:monospace;margin-top:2px}
  .twocol{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:20px}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden}
  .ch{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--border);background:var(--surface2)}
  .chtitle{font-size:12px;font-weight:600;display:flex;align-items:center;gap:7px;color:var(--text)}
  .chtitle::before{content:'';width:3px;height:12px;background:var(--gold);border-radius:2px}
  .chsub{font-size:10px;color:var(--muted)}
  .tscroll{overflow-x:auto}
  table{width:100%;border-collapse:collapse}
  th{font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);padding:8px 12px;text-align:left;background:var(--surface2);border-bottom:1px solid var(--border);white-space:nowrap;font-weight:600}
  td{font-size:11px;padding:8px 12px;border-bottom:1px solid var(--border);color:var(--text);white-space:nowrap}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:var(--surface2)}
  .idcol{color:var(--info);font-family:monospace;font-size:11px;font-weight:600}
  .mono{font-family:monospace;font-size:11px}
  .badge{display:inline-flex;align-items:center;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;text-transform:uppercase;letter-spacing:.3px;white-space:nowrap;border:1px solid}
  .br{background:var(--danger-bg);color:var(--danger);border-color:var(--danger-bd)}
  .bg{background:var(--ok-bg);color:var(--ok);border-color:var(--ok-bd)}
  .bw{background:var(--warn-bg);color:var(--warn);border-color:var(--warn-bd)}
  .bb{background:var(--info-bg);color:var(--info);border-color:var(--info-bd)}
  .frow{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
  .fb{font-size:11px;padding:5px 12px;border-radius:var(--r-md);border:1px solid var(--border);background:var(--surface);color:var(--muted);cursor:pointer;font-weight:500;font-family:inherit}
  .fb:hover{border-color:var(--gold);color:var(--warn)}
  .fb.on{background:var(--navy);color:var(--gold-lt);border-color:var(--navy)}
  .simpad{padding:16px}
  .fgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
  .fg{display:flex;flex-direction:column;gap:4px}
  .fg label{font-size:10px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.6px}
  .fg input,.fg select{font-family:inherit;font-size:13px;padding:8px 10px;border:1px solid var(--border);border-radius:var(--r-md);background:var(--surface2);color:var(--text);outline:none}
  .fg input:focus,.fg select:focus{border-color:var(--navy3)}
  .sbtn{background:var(--navy);color:var(--gold-lt);border:none;padding:10px 18px;border-radius:var(--r-md);font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:inherit}
  .sbtn:hover{background:var(--navy2)}
  .rbox{border-radius:var(--r-md);padding:12px 14px;margin-top:14px}
  .rbox.fraud{background:var(--danger-bg);border:1px solid var(--danger-bd)}
  .rbox.ok{background:var(--ok-bg);border:1px solid var(--ok-bd)}
  .rtitle{font-size:13px;font-weight:700;margin-bottom:5px;display:flex;align-items:center;gap:7px}
  .rdetail{font-size:11px;color:var(--muted);line-height:1.7}
  .logbox{background:var(--surface2);border-radius:var(--r-md);border:1px solid var(--border);padding:10px 12px;font-family:monospace;font-size:10px;line-height:1.9;max-height:180px;overflow-y:auto}
  .ll{display:flex;gap:8px;margin-bottom:1px}
  .lt{color:var(--hint)}
  .ls{font-weight:700}
  .ls-i{color:#185FA5}.ls-a{color:#534AB7}.ls-r{color:#0F6E56}.ls-n{color:#854F0B}
  .flowrow{display:grid;grid-template-columns:repeat(5,1fr);gap:0;align-items:center;margin:12px 0}
  .fn{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:10px 8px;text-align:center}
  .fn.ext{background:#FAEEDA;border-color:#EF9F27}
  .fni{font-size:16px;margin-bottom:4px}
  .fnn{font-size:10px;font-weight:600;color:var(--text);line-height:1.3}
  .fnp{font-size:9px;color:var(--muted);font-family:monospace;margin-top:2px}
  .farrow{display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 3px}
  .fline{width:100%;height:1px;background:var(--border2)}
  .flbl{font-size:8px;color:var(--muted);white-space:nowrap;text-align:center}
  .igrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .ic{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:14px}
  .ic h3{font-size:12px;font-weight:700;margin-bottom:8px;display:flex;align-items:center;gap:6px;color:var(--text)}
  .ic p{font-size:11px;color:var(--muted);line-height:1.6}
  .ri{display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)}
  .ri:last-child{border-bottom:none}
  .rnum{width:20px;height:20px;border-radius:50%;background:var(--navy);color:var(--gold-lt);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0}
  .rtext{font-size:11px;color:var(--muted);line-height:1.5}
  .rtext b{color:var(--text);font-weight:600}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .pulse{animation:pulse 2s infinite}
`

// ─── COMPONENTES ──────────────────────────────────────────────────────────────

function SvcCard({ s }) {
  const latColor = lc(s.lat)
  return (
    <div className={`sc ${s.st === 'DOWN' ? 'down' : ''}`}>
      <div style={{fontSize:18,marginBottom:5}}>{s.st==='UP'?'✅':'❌'}</div>
      <div className="scname">{s.name}</div>
      <div className="sclat" style={{color:latColor}}>
        {s.lat ? `${s.lat}ms` : <span className="pulse">CAÍDO</span>}
      </div>
      <div className="scup">{s.up}</div>
    </div>
  )
}

function Badge({ cls, text }) {
  return <span className={`badge ${cls}`}>{text}</span>
}

// ─── VISTAS ───────────────────────────────────────────────────────────────────

function Overview({ alertas, transacciones }) {
  const pendientes = alertas.filter(a => a.est === 'PENDIENTE').length
  const altos = alertas.filter(a => a.rsk === 'ALTO').length
  const anomalas = transacciones.filter(t => t.est === 'ANOMALA').length
  const avgLat = Math.round(transacciones.reduce((s,t) => s+t.lat, 0) / transacciones.length)

  return (
    <div>
      <div className="kgrid">
        <div className="kcard"><div className="klbl">Alertas pendientes</div><div className="kval" style={{color:'var(--danger)'}}>{pendientes}</div><div className="ksub">últimas 24h</div><div className="kbar"><div className="kbarfill" style={{width:`${Math.round(pendientes/alertas.length*100)}%`,background:'var(--danger)'}}></div></div></div>
        <div className="kcard"><div className="klbl">Riesgo alto</div><div className="kval" style={{color:'var(--warn)'}}>{altos}</div><div className="ksub">requieren atención</div><div className="kbar"><div className="kbarfill" style={{width:`${Math.round(altos/alertas.length*100)}%`,background:'var(--warn)'}}></div></div></div>
        <div className="kcard"><div className="klbl">Tx anómalas</div><div className="kval" style={{color:'var(--info)'}}>{anomalas}</div><div className="ksub">de {transacciones.length} procesadas</div><div className="kbar"><div className="kbarfill" style={{width:`${Math.round(anomalas/transacciones.length*100)}%`,background:'var(--info)'}}></div></div></div>
        <div className="kcard"><div className="klbl">Latencia prom.</div><div className="kval" style={{color:'var(--ok)'}}>{avgLat}ms</div><div className="ksub">objetivo &lt; 200ms ✓</div><div className="kbar"><div className="kbarfill" style={{width:`${Math.round(avgLat/200*100)}%`,background:'var(--ok)'}}></div></div></div>
      </div>
      <div className="stitle">Estado de microservicios</div>
      <div className="sgrid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        {SVCS.map(s => <SvcCard key={s.name} s={s} />)}
      </div>
      <div className="twocol">
        <div className="card">
          <div className="ch"><span className="chtitle">Alertas recientes</span><span className="chsub">{alertas.length} registros</span></div>
          <div className="tscroll">
            <table><thead><tr><th>ID</th><th>Tipo</th><th>Riesgo</th><th>Estado</th><th>Hora</th></tr></thead>
            <tbody>{alertas.slice(0,5).map(a => (
              <tr key={a.id}><td className="idcol">{a.id}</td><td>{a.tipo}</td><td><Badge cls={rb(a.rsk)} text={a.rsk}/></td><td><Badge cls={eb(a.est)} text={a.est}/></td><td className="mono" style={{color:'var(--muted)'}}>{a.hora}</td></tr>
            ))}</tbody></table>
          </div>
        </div>
        <div className="card">
          <div className="ch"><span className="chtitle">Transacciones recientes</span><span className="chsub">{transacciones.length} registros</span></div>
          <div className="tscroll">
            <table><thead><tr><th>ID</th><th>Servicio</th><th>Monto</th><th>Estado</th><th>Lat.</th></tr></thead>
            <tbody>{transacciones.slice(0,6).map(t => (
              <tr key={t.id}><td className="idcol">{t.id}</td><td>{t.svc}</td><td className="mono">{fmt(t.monto)}</td><td><Badge cls={t.est==='ANOMALA'?'br':'bg'} text={t.est}/></td><td className="mono" style={{color:lc(t.lat)}}>{t.lat}ms</td></tr>
            ))}</tbody></table>
          </div>
        </div>
      </div>
    </div>
  )
}

function Simular({ onNuevaTx, onNuevaAlerta }) {
  const [form, setForm] = useState({ss:'MATRICULA',sm:'2000000',su:'j.perez@uan.edu.co',si:'10.0.1.55',sh:'14:30'})
  const [logs, setLogs] = useState([{t:'--:--:--',cls:'',svc:'SYSTEM',msg:'Esperando transacciones...'}])
  const [result, setResult] = useState(null)
  const [preset, setPreset] = useState('')
  const logRef = useRef(null)
  const txRef = useRef(9813)

  const addLog = (svc, cls, msg) => setLogs(l => [...l, {t:ts(), cls, svc, msg}])

  useEffect(() => { if(logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight }, [logs])

  const applyPreset = (p) => {
    setPreset(p)
    if(PRESETS[p]) setForm({...PRESETS[p]})
  }

  const sim = () => {
    const svc=form.ss, monto=parseFloat(form.sm)||0, usr=form.su||'anon@uan.edu.co'
    const ip=form.si||'10.0.1.1', hora=form.sh||'12:00'
    const txid='TXN-'+txRef.current++
    const lat=Math.round(80+Math.random()*120)
    setResult(null)
    setPreset('')
    addLog('INGESTION','ls-i',`${txid} recibida — ${svc} ${fmt(monto)}`)
    setTimeout(()=>{
      addLog('INGESTION','ls-i',`${txid} guardada en MySQL → transactions.queue`)
      setTimeout(()=>{
        addLog('FRAUD-ANALYSIS','ls-a',`Consumiendo ${txid} de la cola`)
        setTimeout(()=>{
          addLog('RULE-ENGINE','ls-r',`Evaluando ${txid} contra ${RULES.length} reglas activas...`)
          const vs = evalRules(svc,monto,usr,ip,hora)
          setTimeout(()=>{
            if(!vs.length){
              addLog('RULE-ENGINE','ls-r',`${txid} — 0 violaciones → NORMAL`)
              setResult({type:'ok',txid,lat,vs:[]})
              onNuevaTx({id:txid,svc,monto,usr,est:'NORMAL',lat,hora,ip})
            } else {
              const nm = vs.some(v=>v.n==='ALTO')?'ALTO':'MEDIO'
              vs.forEach(v=>addLog('RULE-ENGINE','ls-r',`⚠ "${v.r}" ACTIVADA (${v.n})`))
              addLog('FRAUD-ANALYSIS','ls-a',`${txid} → ANOMALA · ${vs.length} alerta(s)`)
              setTimeout(()=>{
                vs.forEach((v,i)=>{
                  const aid='ALT-'+(100+i).toString().padStart(3,'0')
                  addLog('FRAUD-ANALYSIS','ls-a',`${aid} guardada → alerts.queue`)
                  onNuevaAlerta({id:aid,tipo:v.r,svc,usr,monto,est:'PENDIENTE',rsk:v.n,org:`Fraud Analysis → Rule ${v.t}`,hora})
                })
                addLog('NOTIFICATION','ls-n',`Notificando ${nm==='ALTO'?'Admin + Analista':'Analista'} — riesgo ${nm}`)
                onNuevaTx({id:txid,svc,monto,usr,est:'ANOMALA',lat,hora,ip})
                setResult({type:'fraud',txid,lat,nm,vs})
              },600)
            }
          },700)
        },500)
      },400)
    },300)
  }

  return (
    <div>
      <div className="ptitle">Simular transacción</div>
      <div className="psub">Ingresa datos y observa cómo el sistema los analiza en tiempo real</div>
      <div className="card" style={{marginBottom:14}}>
        <div className="ch"><span className="chtitle">Nueva transacción</span><span className="chsub">Ingestion → Fraud Analysis → Rule Engine</span></div>
        <div className="simpad">
          <div className="fgrid">
            <div className="fg"><label>Servicio</label><select value={form.ss} onChange={e=>setForm({...form,ss:e.target.value})}><option value="MATRICULA">Matrícula</option><option value="NOMINA">Nómina</option><option value="INSCRIPCION">Inscripción</option><option value="PAGOS">Pagos</option></select></div>
            <div className="fg"><label>Monto (COP)</label><input type="number" value={form.sm} onChange={e=>setForm({...form,sm:e.target.value})}/></div>
          </div>
          <div className="fgrid">
            <div className="fg"><label>Usuario origen</label><input type="text" value={form.su} onChange={e=>setForm({...form,su:e.target.value})}/></div>
            <div className="fg"><label>IP origen</label><input type="text" value={form.si} onChange={e=>setForm({...form,si:e.target.value})}/></div>
          </div>
          <div className="fgrid">
            <div className="fg"><label>Hora</label><input type="time" value={form.sh} onChange={e=>setForm({...form,sh:e.target.value})}/></div>
            <div className="fg"><label>Escenario rápido</label>
              <select value={preset} onChange={e=>applyPreset(e.target.value)}>
                <option value="">— elegir escenario —</option>
                <option value="n">✅ Transacción normal</option>
                <option value="m">🚨 Monto excesivo en matrícula</option>
                <option value="o">🚨 Nómina sospechosa ($15M)</option>
                <option value="h">⚠️ Transacción nocturna (2am)</option>
                <option value="e">⚠️ Acceso desde IP externa</option>
                <option value="p">🚨 Patrón combinado (monto + noche)</option>
              </select>
            </div>
          </div>
          <button className="sbtn" onClick={sim}>↗ Enviar transacción al sistema</button>
          {result && (
            <div className={`rbox ${result.type}`}>
              <div className="rtitle">{result.type==='ok'?'✅ Transacción NORMAL':'🚨 Transacción ANÓMALA detectada'}</div>
              <div className="rdetail">
                <strong>ID:</strong> {result.txid} · <strong>Latencia:</strong> {result.lat}ms
                {result.type==='fraud' && (<><br/><strong>Riesgo:</strong> {result.nm} · <strong>Reglas violadas:</strong> {result.vs.length}<br/>{result.vs.map((v,i)=><span key={i}>→ {v.r} ({v.n})<br/></span>)}</>)}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="card">
        <div className="ch"><span className="chtitle">Log del sistema</span><span className="chsub">flujo en tiempo real</span></div>
        <div style={{padding:'10px 14px'}}>
          <div className="logbox" ref={logRef}>
            {logs.map((l,i)=>(
              <div key={i} className="ll">
                <span className="lt">{l.t}</span>
                <span className={`ls ${l.cls}`}>&nbsp;[{l.svc}]&nbsp;</span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Alertas({ alertas }) {
  const [filtro, setFiltro] = useState('TODAS')
  const lista = filtro==='TODAS' ? alertas : alertas.filter(a=>a.est===filtro)
  return (
    <div>
      <div className="ptitle">Centro de alertas</div>
      <div className="psub">Generadas por Fraud Analysis Service · JWT requerido</div>
      <div className="frow">
        {['TODAS','PENDIENTE','REVISADO','CERRADO'].map(f=>(
          <button key={f} className={`fb ${filtro===f?'on':''}`} onClick={()=>setFiltro(f)}>{f}</button>
        ))}
      </div>
      <div className="card"><div className="tscroll">
        <table><thead><tr><th>ID</th><th>Tipo</th><th>Servicio</th><th>Usuario</th><th>Monto</th><th>Riesgo</th><th>Estado</th><th>Origen</th></tr></thead>
        <tbody>{lista.length===0
          ? <tr><td colSpan="8" style={{textAlign:'center',padding:20,color:'var(--muted)'}}>No hay alertas</td></tr>
          : lista.map(a=>(
            <tr key={a.id}>
              <td className="idcol">{a.id}</td><td>{a.tipo}</td>
              <td><Badge cls="bb" text={a.svc}/></td>
              <td style={{color:'var(--muted)',fontSize:11}}>{a.usr}</td>
              <td className="mono">{fmt(a.monto)}</td>
              <td><Badge cls={rb(a.rsk)} text={a.rsk}/></td>
              <td><Badge cls={eb(a.est)} text={a.est}/></td>
              <td style={{color:'var(--muted)',fontSize:10}}>{a.org}</td>
            </tr>
          ))}
        </tbody></table>
      </div></div>
    </div>
  )
}

function Transacciones({ transacciones }) {
  const [filtro, setFiltro] = useState('TODAS')
  const lista = filtro==='TODAS' ? transacciones : transacciones.filter(t=>t.est===filtro)
  return (
    <div>
      <div className="ptitle">Historial de transacciones</div>
      <div className="psub">Transaction Ingestion Service · puerto 8081</div>
      <div className="frow">
        {['TODAS','NORMAL','ANOMALA'].map(f=>(
          <button key={f} className={`fb ${filtro===f?'on':''}`} onClick={()=>setFiltro(f)}>{f}</button>
        ))}
      </div>
      <div className="card"><div className="tscroll">
        <table><thead><tr><th>ID</th><th>Servicio</th><th>Monto</th><th>Usuario</th><th>IP</th><th>Estado</th><th>Latencia</th><th>Hora</th></tr></thead>
        <tbody>{lista.map(t=>(
          <tr key={t.id}>
            <td className="idcol">{t.id}</td><td>{t.svc}</td>
            <td className="mono">{fmt(t.monto)}</td>
            <td style={{color:'var(--muted)',fontSize:11}}>{t.usr}</td>
            <td className="mono">{t.ip}</td>
            <td><Badge cls={t.est==='ANOMALA'?'br':'bg'} text={t.est}/></td>
            <td className="mono" style={{color:lc(t.lat)}}>{t.lat}ms</td>
            <td className="mono" style={{color:'var(--muted)'}}>{t.hora}</td>
          </tr>
        ))}</tbody></table>
      </div></div>
    </div>
  )
}

function Microservicios() {
  return (
    <div>
      <div className="ptitle">Estado de microservicios</div>
      <div className="psub">Spring Boot Actuator /health · heartbeat cada 10 segundos</div>
      <div className="sgrid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:16}}>
        {SVCS.map(s => <SvcCard key={s.name} s={s} />)}
      </div>
      <div className="card"><div className="tscroll">
        <table><thead><tr><th>Servicio</th><th>Puerto</th><th>Estado</th><th>Latencia</th><th>Uptime</th><th>Función</th></tr></thead>
        <tbody>{SVCS.map(s=>(
          <tr key={s.name}>
            <td style={{fontWeight:600}}>{s.name}</td>
            <td className="mono">:{s.port}</td>
            <td><Badge cls={s.st==='UP'?'bg':'br'} text={s.st}/></td>
            <td className="mono" style={{color:lc(s.lat)}}>{s.lat?`${s.lat}ms`:'—'}</td>
            <td className="mono">{s.up}</td>
            <td style={{color:'var(--muted)',fontSize:11}}>{s.desc}</td>
          </tr>
        ))}</tbody></table>
      </div></div>
    </div>
  )
}

function ComoFunciona() {
  return (
    <div>
      <div className="ptitle">Cómo funciona el sistema</div>
      <div className="psub">Flujo completo desde el sistema de pagos UAN hasta el dashboard</div>
      <div className="card" style={{marginBottom:16}}>
        <div className="ch"><span className="chtitle">Flujo de una transacción</span></div>
        <div style={{padding:16}}>
          <div className="flowrow">
            <div className="fn ext"><div className="fni">🏦</div><div className="fnn">Sistema Pagos UAN</div><div className="fnp">externo</div></div>
            <div className="farrow"><div className="fline"></div><div className="flbl">AMQP/JSON</div><div className="flbl" style={{color:'#0F6E56'}}>asíncrono</div></div>
            <div className="fn"><div className="fni">⇄</div><div className="fnn">Transaction Ingestion</div><div className="fnp">:8081</div></div>
            <div className="farrow"><div className="fline"></div><div className="flbl">RabbitMQ</div><div className="flbl" style={{color:'#0F6E56'}}>asíncrono</div></div>
            <div className="fn"><div className="fni">🧠</div><div className="fnn">Fraud Analysis</div><div className="fnp">:8082</div></div>
          </div>
          <div className="flowrow" style={{marginTop:8}}>
            <div className="fn"><div className="fni">📋</div><div className="fnn">Rule Engine</div><div className="fnp">:8083</div></div>
            <div className="farrow"><div className="fline" style={{background:'#7F77DD'}}></div><div className="flbl" style={{color:'#534AB7'}}>REST/JSON</div><div className="flbl" style={{color:'#534AB7'}}>síncrono</div></div>
            <div className="fn"><div className="fni">🔔</div><div className="fnn">Notification Service</div><div className="fnp">:8084</div></div>
            <div className="farrow"><div className="fline"></div><div className="flbl">RabbitMQ</div><div className="flbl" style={{color:'#0F6E56'}}>asíncrono</div></div>
            <div className="fn ext"><div className="fni">👁</div><div className="fnn">Alert Query + Dashboard</div><div className="fnp">:8085 / :3000</div></div>
          </div>
        </div>
      </div>
      <div className="igrid">
        <div className="ic">
          <h3>✅ Reglas de detección activas</h3>
          {RULES.map(r=>(
            <div key={r.n} className="ri">
              <div className="rnum">{r.n}</div>
              <div className="rtext"><b>{r.name}</b><br/>{r.desc}</div>
            </div>
          ))}
        </div>
        <div className="ic">
          <h3>❓ ¿Qué hace fraudulenta una transacción?</h3>
          <p>El sistema clasifica una transacción como anómala si viola al menos una regla activa del Rule Engine. Las reglas viven en MySQL y se pueden modificar sin reiniciar el sistema (patrón Strategy).</p>
          <p style={{marginTop:8}}>Ejemplos que el sistema detecta:</p>
          <ul style={{fontSize:11,color:'var(--muted)',marginTop:6,paddingLeft:16,lineHeight:1.9}}>
            <li>Matrícula de $9.000.000 → supera límite de $6M</li>
            <li>Pago de nómina procesado a las 2am</li>
            <li>Login desde IP 192.168.1.x (red externa UAN)</li>
            <li>Usuario sys.batch con comportamiento automatizado</li>
          </ul>
        </div>
        <div className="ic">
          <h3>🗄️ ¿De dónde vienen las transacciones?</h3>
          <p>En producción vendrían del <strong>Sistema de Pagos UAN</strong> (externo), del <strong>módulo de nómina</strong> y del <strong>módulo de matrícula</strong>. Publican eventos en RabbitMQ con AMQP y formato JSON.</p>
          <p style={{marginTop:8}}>En este simulador las genera tú desde la pestaña "Simular transacción".</p>
        </div>
        <div className="ic">
          <h3>🔗 ¿De dónde vienen las alertas?</h3>
          <p>El <strong>Fraud Analysis Service</strong> crea una alerta por cada regla violada. Se guarda en MySQL y se publica en la cola <code style={{fontSize:10,background:'var(--surface2)',padding:'1px 5px',borderRadius:3,border:'1px solid var(--border)'}}>alerts.queue</code>.</p>
          <p style={{marginTop:8}}>El <strong>Notification Service</strong> notifica al Admin (ALTO) o Analista (MEDIO). El <strong>Alert Query Service</strong> expone las alertas al dashboard vía REST+JWT.</p>
        </div>
      </div>
    </div>
  )
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────────

const TABS = [
  {id:'overview',label:'Dashboard'},
  {id:'simular',label:'Simular transacción'},
  {id:'alertas',label:'Alertas'},
  {id:'transacciones',label:'Transacciones'},
  {id:'microservicios',label:'Microservicios'},
  {id:'info',label:'Cómo funciona'},
]

export default function App() {
  const [view, setView] = useState('overview')
  const [alertas, setAlertas] = useState(INIT_AL)
  const [transacciones, setTransacciones] = useState(INIT_TX)

  const pendientes = alertas.filter(a => a.est === 'PENDIENTE').length

  const handleNuevaTx = (tx) => setTransacciones(prev => [tx, ...prev])
  const handleNuevaAlerta = (al) => setAlertas(prev => [al, ...prev])

  return (
    <>
      <style>{styles}</style>
      <div className="wrap">
        <div className="topbar">
          <div className="tl">
            <div className="crest">U</div>
            <div>
              <div className="ttitle">UAN <span>·</span> FraudGuard</div>
              <div className="tsub">sistema de detección de fraude</div>
            </div>
          </div>
          <div className="tpills">
            <div className="tpill danger">🔔 {pendientes} alertas pendientes</div>
            <div className="tpill">👤 analista@uan.edu.co</div>
          </div>
        </div>

        <div className="navtabs">
          {TABS.map(t => (
            <button key={t.id} className={`nt ${view===t.id?'on':''}`} onClick={()=>setView(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="main">
          {view==='overview'       && <Overview alertas={alertas} transacciones={transacciones}/>}
          {view==='simular'        && <Simular onNuevaTx={handleNuevaTx} onNuevaAlerta={handleNuevaAlerta}/>}
          {view==='alertas'        && <Alertas alertas={alertas}/>}
          {view==='transacciones'  && <Transacciones transacciones={transacciones}/>}
          {view==='microservicios' && <Microservicios/>}
          {view==='info'           && <ComoFunciona/>}
        </div>
      </div>
    </>
  )
}
