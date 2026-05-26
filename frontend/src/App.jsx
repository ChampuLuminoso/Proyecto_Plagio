import { useState } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_ALERTS = [
  { id: "ALT-001", tipo: "Monto anómalo", servicio: "Matrícula", monto: 4850000, usuario: "u.garcia@uan.edu.co", timestamp: "2026-05-26T08:14:22", estado: "PENDIENTE", riesgo: "ALTO" },
  { id: "ALT-002", tipo: "Acceso no autorizado", servicio: "Nómina", monto: null, usuario: "admin.ext@unknown.com", timestamp: "2026-05-26T07:52:10", estado: "REVISADO", riesgo: "ALTO" },
  { id: "ALT-003", tipo: "Frecuencia anormal", servicio: "Pagos", monto: 120000, usuario: "j.martinez@uan.edu.co", timestamp: "2026-05-26T07:30:05", estado: "PENDIENTE", riesgo: "MEDIO" },
  { id: "ALT-004", tipo: "Patrón inusual", servicio: "Inscripción", monto: 890000, usuario: "r.lopez@uan.edu.co", timestamp: "2026-05-26T06:45:33", estado: "CERRADO", riesgo: "BAJO" },
  { id: "ALT-005", tipo: "Modificación no autorizada", servicio: "Nómina", monto: 12500000, usuario: "sys.batch@uan.edu.co", timestamp: "2026-05-25T23:11:47", estado: "PENDIENTE", riesgo: "ALTO" },
  { id: "ALT-006", tipo: "Monto anómalo", servicio: "Matrícula", monto: 9200000, usuario: "c.torres@uan.edu.co", timestamp: "2026-05-25T21:08:19", estado: "REVISADO", riesgo: "ALTO" },
  { id: "ALT-007", tipo: "Acceso no autorizado", servicio: "Pagos", monto: null, usuario: "bot.scan@external.net", timestamp: "2026-05-25T18:30:00", estado: "CERRADO", riesgo: "MEDIO" },
  { id: "ALT-008", tipo: "Frecuencia anormal", servicio: "Inscripción", monto: 45000, usuario: "p.silva@uan.edu.co", timestamp: "2026-05-25T15:22:41", estado: "PENDIENTE", riesgo: "BAJO" },
];

const MOCK_TRANSACTIONS = [
  { id: "TXN-9812", servicio: "Matrícula", monto: 4850000, usuario: "u.garcia@uan.edu.co", timestamp: "2026-05-26T08:14:20", estado: "ANOMALA", latencia: 142 },
  { id: "TXN-9811", servicio: "Pagos", monto: 120000, usuario: "j.martinez@uan.edu.co", timestamp: "2026-05-26T07:30:03", estado: "ANOMALA", latencia: 98 },
  { id: "TXN-9810", servicio: "Inscripción", monto: 890000, usuario: "r.lopez@uan.edu.co", timestamp: "2026-05-26T06:45:30", estado: "NORMAL", latencia: 87 },
  { id: "TXN-9809", servicio: "Nómina", monto: 3200000, usuario: "sys.payroll@uan.edu.co", timestamp: "2026-05-26T06:00:00", estado: "NORMAL", latencia: 110 },
  { id: "TXN-9808", servicio: "Matrícula", monto: 4850000, usuario: "l.moreno@uan.edu.co", timestamp: "2026-05-25T22:41:15", estado: "NORMAL", latencia: 95 },
  { id: "TXN-9807", servicio: "Nómina", monto: 12500000, usuario: "sys.batch@uan.edu.co", timestamp: "2026-05-25T23:11:44", estado: "ANOMALA", latencia: 188 },
];

const MOCK_SERVICES = [
  { name: "Transaction Ingestion", status: "UP", latencia: 42, uptime: "99.98%" },
  { name: "Fraud Analysis", status: "UP", latencia: 138, uptime: "99.95%" },
  { name: "Rule Engine", status: "UP", latencia: 28, uptime: "100%" },
  { name: "Notification Service", status: "UP", latencia: 61, uptime: "99.90%" },
  { name: "Alert Query Service", status: "DOWN", latencia: null, uptime: "98.10%" },
];

const fmt = (n) => n != null ? `$${n.toLocaleString("es-CO")}` : "—";
const fmtTime = (ts) => new Date(ts).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const RIESGO_COLOR = { ALTO: "#DC2626", MEDIO: "#D97706", BAJO: "#16A34A" };
const RIESGO_BG    = { ALTO: "#FEE2E2", MEDIO: "#FEF3C7", BAJO: "#DCFCE7" };
const ESTADO_BG    = { PENDIENTE: "#FEF3C7", REVISADO: "#DBEAFE", CERRADO: "#D1FAE5" };
const ESTADO_TEXT  = { PENDIENTE: "#92400E", REVISADO: "#1E40AF", CERRADO: "#065F46" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --navy:#0F2044;--navy2:#162B58;--navy3:#1E3A6E;
    --gold:#C8972A;--gold-lt:#F0C040;--gold-pale:#FDF6E3;
    --white:#FFFFFF;--off-white:#F8F7F2;
    --border:#D4C9A8;--border-lt:#EDE8D8;
    --text:#0F2044;--muted:#6B7280;
    --danger:#DC2626;--success:#16A34A;--warn:#D97706;--blue:#1D4ED8;
    --font-head:'Playfair Display',serif;--font-body:'DM Sans',sans-serif;--font-mono:'DM Mono',monospace;
    --shadow-sm:0 1px 3px rgba(15,32,68,.08);--shadow:0 4px 16px rgba(15,32,68,.10);
  }
  body{background:var(--off-white);color:var(--text);font-family:var(--font-body);font-size:14px}
  .nav{background:var(--navy);border-bottom:3px solid var(--gold);display:flex;align-items:center;justify-content:space-between;padding:0 28px;height:60px;position:sticky;top:0;z-index:100;box-shadow:var(--shadow)}
  .nav-left{display:flex;align-items:center;gap:14px}
  .nav-crest{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--gold) 0%,var(--gold-lt) 100%);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:var(--navy);font-family:var(--font-head);box-shadow:0 2px 8px rgba(200,151,42,.4)}
  .nav-title{font-family:var(--font-head);font-size:18px;color:var(--white)}
  .nav-title span{color:var(--gold-lt)}
  .nav-sub{font-size:10px;color:rgba(255,255,255,.45);letter-spacing:2px;text-transform:uppercase}
  .nav-right{display:flex;align-items:center;gap:12px}
  .nav-pill{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:4px 12px;font-size:12px;color:rgba(255,255,255,.8)}
  .nav-pill.danger{background:rgba(220,38,38,.15);border-color:rgba(220,38,38,.3);color:#FCA5A5}
  .nav-pill.warn{background:rgba(217,119,6,.15);border-color:rgba(217,119,6,.3);color:#FCD34D}
  .nav-dot{width:7px;height:7px;border-radius:50%}
  .dash{display:grid;grid-template-rows:60px 1fr;min-height:100vh}
  .main{display:grid;grid-template-columns:220px 1fr}
  .sidebar{background:var(--navy2);border-right:1px solid rgba(200,151,42,.2);padding:28px 0;position:sticky;top:60px;height:calc(100vh - 60px);display:flex;flex-direction:column}
  .sidebar-section-label{font-size:9px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:rgba(200,151,42,.5);padding:0 20px;margin-bottom:6px}
  .sidebar-item{display:flex;align-items:center;gap:10px;padding:11px 20px;font-size:13px;font-weight:500;color:rgba(255,255,255,.55);cursor:pointer;transition:all .15s;border:none;background:none;width:100%;text-align:left;font-family:var(--font-body);border-left:3px solid transparent}
  .sidebar-item:hover{color:rgba(255,255,255,.9);background:rgba(255,255,255,.05)}
  .sidebar-item.active{color:var(--gold-lt);background:rgba(200,151,42,.12);border-left-color:var(--gold)}
  .sidebar-icon{font-size:15px;width:20px;text-align:center}
  .sidebar-bottom{margin-top:auto;padding:16px 20px;border-top:1px solid rgba(255,255,255,.08)}
  .sidebar-user{display:flex;align-items:center;gap:10px}
  .sidebar-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gold) 0%,var(--gold-lt) 100%);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--navy)}
  .sidebar-uname{font-size:11px;color:rgba(255,255,255,.6);font-family:var(--font-mono)}
  .sidebar-urole{font-size:10px;color:var(--gold);font-weight:600;text-transform:uppercase;letter-spacing:.5px}
  .content{padding:32px;overflow-y:auto;background:var(--off-white)}
  .page-header{margin-bottom:28px;display:flex;align-items:flex-end;justify-content:space-between}
  .page-title{font-family:var(--font-head);font-size:26px;color:var(--navy);margin-bottom:2px}
  .page-sub{font-size:12px;color:var(--muted);font-family:var(--font-mono)}
  .page-date{font-size:11px;color:var(--muted);font-family:var(--font-mono);text-align:right}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-bottom:28px}
  .kpi-card{background:var(--white);border-radius:12px;padding:22px 20px;border:1px solid var(--border-lt);box-shadow:var(--shadow-sm);transition:box-shadow .2s,transform .2s}
  .kpi-card:hover{box-shadow:var(--shadow);transform:translateY(-1px)}
  .kpi-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px}
  .kpi-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}
  .kpi-trend{font-size:11px;font-weight:600;padding:2px 7px;border-radius:999px}
  .kpi-value{font-size:30px;font-weight:700;color:var(--navy);line-height:1;margin-bottom:4px;font-family:var(--font-head)}
  .kpi-label{font-size:12px;color:var(--muted);font-weight:500}
  .kpi-bar{height:3px;background:var(--border-lt);border-radius:999px;margin-top:14px}
  .kpi-bar-fill{height:100%;border-radius:999px}
  .section-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:var(--navy3);margin-bottom:14px;display:flex;align-items:center;gap:10px}
  .section-title::before{content:'';width:4px;height:14px;background:var(--gold);border-radius:2px;display:inline-block}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px}
  .card{background:var(--white);border-radius:12px;border:1px solid var(--border-lt);box-shadow:var(--shadow-sm);overflow:hidden}
  .card-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border-lt);background:linear-gradient(to right,#FFFDF5,var(--white))}
  .card-title{font-size:13px;font-weight:700;color:var(--navy);display:flex;align-items:center;gap:8px}
  .card-title::before{content:'';width:3px;height:14px;background:var(--gold);border-radius:2px}
  .card-count{font-size:11px;color:var(--muted);font-family:var(--font-mono)}
  table{width:100%;border-collapse:collapse}
  th{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);padding:10px 20px;text-align:left;background:#FAFAF8;border-bottom:1px solid var(--border-lt)}
  td{font-size:12px;padding:11px 20px;border-bottom:1px solid var(--border-lt);color:var(--text)}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#FDFCF5}
  .td-mono{font-family:var(--font-mono)}
  .td-id{color:var(--navy3);font-weight:600;font-family:var(--font-mono)}
  .badge{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;text-transform:uppercase;letter-spacing:.5px}
  .riesgo-badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600}
  .riesgo-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
  .filter-row{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
  .filter-btn{font-size:12px;font-weight:600;padding:6px 14px;border-radius:8px;border:1.5px solid var(--border);background:var(--white);color:var(--muted);cursor:pointer;transition:all .15s;font-family:var(--font-body)}
  .filter-btn:hover{border-color:var(--gold);color:var(--gold)}
  .filter-btn.active{background:var(--navy);border-color:var(--navy);color:var(--gold-lt)}
  .services-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:28px}
  .service-card{background:var(--white);border-radius:12px;padding:18px 14px;border:1px solid var(--border-lt);box-shadow:var(--shadow-sm);text-align:center;transition:box-shadow .2s}
  .service-card:hover{box-shadow:var(--shadow)}
  .service-card.down{border-color:#FECACA;background:#FFF5F5}
  .service-icon{font-size:22px;margin-bottom:8px}
  .service-name{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;line-height:1.3}
  .service-lat{font-size:20px;font-weight:700;font-family:var(--font-head);margin-bottom:2px}
  .service-uptime{font-size:10px;color:var(--muted);font-family:var(--font-mono)}
  .gold-divider{height:1px;background:linear-gradient(to right,var(--gold),transparent);margin:24px 0}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .pulse{animation:pulse 2s infinite}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .fade-in{animation:fadeIn .3s ease forwards}
  .empty{text-align:center;padding:40px;color:var(--muted);font-size:13px}
  ::-webkit-scrollbar{width:6px}
  ::-webkit-scrollbar-track{background:var(--off-white)}
  ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
`;

function KpiCard({ label, value, sub, color, bg, icon, pct }) {
  return (
    <div className="kpi-card fade-in">
      <div className="kpi-card-top">
        <div className="kpi-icon" style={{ background: bg }}>{icon}</div>
        <span className="kpi-trend" style={{ background: bg, color }}>{sub}</span>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {pct != null && (
        <div className="kpi-bar">
          <div className="kpi-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

function ServiceCard({ name, status, latencia, uptime }) {
  const up = status === "UP";
  const latColor = !up ? "#DC2626" : latencia > 150 ? "#D97706" : "#16A34A";
  return (
    <div className={`service-card ${!up ? "down" : ""}`}>
      <div className="service-icon">{up ? "✅" : "❌"}</div>
      <div className="service-name">{name}</div>
      <div className="service-lat" style={{ color: latColor }}>
        {up ? `${latencia}ms` : <span className="pulse">CAÍDO</span>}
      </div>
      <div className="service-uptime">{uptime}</div>
    </div>
  );
}

function Overview() {
  const pendientes = MOCK_ALERTS.filter(a => a.estado === "PENDIENTE").length;
  const altos      = MOCK_ALERTS.filter(a => a.riesgo  === "ALTO").length;
  const anomalas   = MOCK_TRANSACTIONS.filter(t => t.estado === "ANOMALA").length;
  const avgLat     = Math.round(MOCK_TRANSACTIONS.reduce((s,t) => s + t.latencia, 0) / MOCK_TRANSACTIONS.length);
  return (
    <div className="fade-in">
      <div className="kpi-grid">
        <KpiCard label="Alertas Pendientes"     value={pendientes}    sub="últimas 24h"      color="#DC2626" bg="#FEE2E2" icon="🚨" pct={pendientes/MOCK_ALERTS.length*100} />
        <KpiCard label="Riesgo Alto"            value={altos}         sub="atención req."    color="#D97706" bg="#FEF3C7" icon="⚠️" pct={altos/MOCK_ALERTS.length*100} />
        <KpiCard label="Tx Anómalas"            value={anomalas}      sub="de 6 procesadas"  color="#1D4ED8" bg="#DBEAFE" icon="💳" pct={anomalas/MOCK_TRANSACTIONS.length*100} />
        <KpiCard label="Latencia Promedio"      value={`${avgLat}ms`} sub="objetivo <200ms ✓" color="#16A34A" bg="#DCFCE7" icon="⚡" pct={avgLat/200*100} />
      </div>
      <div className="section-title">Estado de Microservicios</div>
      <div className="services-grid">
        {MOCK_SERVICES.map(s => <ServiceCard key={s.name} {...s} />)}
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Alertas Recientes</span>
            <span className="card-count">{MOCK_ALERTS.length} registros</span>
          </div>
          <table>
            <thead><tr><th>ID</th><th>Tipo</th><th>Riesgo</th><th>Estado</th><th>Hora</th></tr></thead>
            <tbody>
              {MOCK_ALERTS.slice(0,5).map(a => (
                <tr key={a.id}>
                  <td className="td-id">{a.id}</td>
                  <td>{a.tipo}</td>
                  <td><span className="riesgo-badge"><span className="riesgo-dot" style={{ background: RIESGO_COLOR[a.riesgo] }} /><span style={{ color: RIESGO_COLOR[a.riesgo] }}>{a.riesgo}</span></span></td>
                  <td><span className="badge" style={{ background: ESTADO_BG[a.estado], color: ESTADO_TEXT[a.estado] }}>{a.estado}</span></td>
                  <td className="td-mono" style={{ color: "#9CA3AF" }}>{fmtTime(a.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Transacciones Recientes</span>
            <span className="card-count">{MOCK_TRANSACTIONS.length} registros</span>
          </div>
          <table>
            <thead><tr><th>ID</th><th>Servicio</th><th>Monto</th><th>Estado</th><th>Lat.</th></tr></thead>
            <tbody>
              {MOCK_TRANSACTIONS.map(t => (
                <tr key={t.id}>
                  <td className="td-id">{t.id}</td>
                  <td>{t.servicio}</td>
                  <td className="td-mono">{fmt(t.monto)}</td>
                  <td><span className="badge" style={{ background: t.estado==="ANOMALA"?"#FEE2E2":"#DCFCE7", color: t.estado==="ANOMALA"?"#DC2626":"#16A34A" }}>{t.estado}</span></td>
                  <td className="td-mono" style={{ color: t.latencia>150?"#D97706":"#16A34A", fontWeight:600 }}>{t.latencia}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Alertas() {
  const [filtro, setFiltro] = useState("TODAS");
  const lista = filtro === "TODAS" ? MOCK_ALERTS : MOCK_ALERTS.filter(a => a.estado === filtro);
  return (
    <div className="fade-in">
      <div className="filter-row">
        {["TODAS","PENDIENTE","REVISADO","CERRADO"].map(f => (
          <button key={f} className={`filter-btn ${filtro===f?"active":""}`} onClick={() => setFiltro(f)}>{f}</button>
        ))}
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Alertas Generadas</span>
          <span className="card-count">{lista.length} registros</span>
        </div>
        <table>
          <thead><tr><th>ID</th><th>Tipo</th><th>Servicio</th><th>Usuario</th><th>Monto</th><th>Riesgo</th><th>Estado</th><th>Fecha</th></tr></thead>
          <tbody>
            {lista.length === 0
              ? <tr><td colSpan={8}><div className="empty">No hay alertas con este filtro</div></td></tr>
              : lista.map(a => (
                <tr key={a.id}>
                  <td className="td-id">{a.id}</td>
                  <td>{a.tipo}</td>
                  <td><span className="badge" style={{ background:"#EFF6FF", color:"#1D4ED8" }}>{a.servicio}</span></td>
                  <td className="td-mono" style={{ color:"#9CA3AF", fontSize:11 }}>{a.usuario}</td>
                  <td className="td-mono">{fmt(a.monto)}</td>
                  <td><span className="badge" style={{ background: RIESGO_BG[a.riesgo], color: RIESGO_COLOR[a.riesgo] }}>{a.riesgo}</span></td>
                  <td><span className="badge" style={{ background: ESTADO_BG[a.estado], color: ESTADO_TEXT[a.estado] }}>{a.estado}</span></td>
                  <td className="td-mono" style={{ color:"#9CA3AF" }}>{fmtTime(a.timestamp)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Transacciones() {
  const [filtro, setFiltro] = useState("TODAS");
  const lista = filtro === "TODAS" ? MOCK_TRANSACTIONS : MOCK_TRANSACTIONS.filter(t => t.estado === filtro);
  return (
    <div className="fade-in">
      <div className="filter-row">
        {["TODAS","NORMAL","ANOMALA"].map(f => (
          <button key={f} className={`filter-btn ${filtro===f?"active":""}`} onClick={() => setFiltro(f)}>{f}</button>
        ))}
      </div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Historial de Transacciones</span>
          <span className="card-count">{lista.length} registros</span>
        </div>
        <table>
          <thead><tr><th>ID</th><th>Servicio</th><th>Monto</th><th>Usuario</th><th>Estado</th><th>Latencia</th><th>Fecha</th></tr></thead>
          <tbody>
            {lista.map(t => (
              <tr key={t.id}>
                <td className="td-id">{t.id}</td>
                <td>{t.servicio}</td>
                <td className="td-mono">{fmt(t.monto)}</td>
                <td className="td-mono" style={{ color:"#9CA3AF", fontSize:11 }}>{t.usuario}</td>
                <td><span className="badge" style={{ background: t.estado==="ANOMALA"?"#FEE2E2":"#DCFCE7", color: t.estado==="ANOMALA"?"#DC2626":"#16A34A" }}>{t.estado}</span></td>
                <td className="td-mono" style={{ color: t.latencia>150?"#D97706":"#16A34A", fontWeight:700 }}>{t.latencia}ms</td>
                <td className="td-mono" style={{ color:"#9CA3AF" }}>{fmtTime(t.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Servicios() {
  return (
    <div className="fade-in">
      <div className="section-title">Estado en tiempo real</div>
      <div className="services-grid" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
        {MOCK_SERVICES.map(s => <ServiceCard key={s.name} {...s} />)}
      </div>
      <div className="gold-divider" />
      <div className="card">
        <div className="card-header">
          <span className="card-title">Detalle de Microservicios</span>
          <span className="card-count">{MOCK_SERVICES.length} servicios</span>
        </div>
        <table>
          <thead><tr><th>Servicio</th><th>Estado</th><th>Latencia</th><th>Uptime</th><th>Health Endpoint</th></tr></thead>
          <tbody>
            {MOCK_SERVICES.map(s => (
              <tr key={s.name}>
                <td style={{ fontWeight:700 }}>{s.name}</td>
                <td><span className="badge" style={{ background: s.status==="UP"?"#DCFCE7":"#FEE2E2", color: s.status==="UP"?"#16A34A":"#DC2626" }}>{s.status}</span></td>
                <td className="td-mono" style={{ color: !s.latencia?"#DC2626":s.latencia>150?"#D97706":"#16A34A", fontWeight:600 }}>{s.latencia ? `${s.latencia}ms` : "—"}</td>
                <td className="td-mono" style={{ color: parseFloat(s.uptime)<99.5?"#D97706":"#16A34A" }}>{s.uptime}</td>
                <td className="td-mono" style={{ color:"#9CA3AF" }}>/actuator/health</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const VIEWS = [
  { id:"overview",      label:"Dashboard",      icon:"📊" },
  { id:"alertas",       label:"Alertas",         icon:"🚨" },
  { id:"transacciones", label:"Transacciones",   icon:"💳" },
  { id:"servicios",     label:"Microservicios",  icon:"⚙️" },
];
const TITLES = { overview:"Panel Principal", alertas:"Centro de Alertas", transacciones:"Historial de Transacciones", servicios:"Estado de Microservicios" };

export default function App() {
  const [view, setView] = useState("overview");
  const pendientes   = MOCK_ALERTS.filter(a => a.estado === "PENDIENTE").length;
  const downServices = MOCK_SERVICES.filter(s => s.status === "DOWN").length;
  const now = new Date().toLocaleString("es-CO", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  return (
    <>
      <style>{styles}</style>
      <div className="dash">
        <nav className="nav">
          <div className="nav-left">
            <div className="nav-crest">U</div>
            <div>
              <div className="nav-title">UAN <span>·</span> FraudGuard</div>
              <div className="nav-sub">Sistema de Detección de Fraude</div>
            </div>
          </div>
          <div className="nav-right">
            {downServices > 0 && <div className="nav-pill danger"><span className="nav-dot pulse" style={{ background:"#EF4444" }} />{downServices} servicio(s) caído(s)</div>}
            <div className="nav-pill warn"><span className="nav-dot" style={{ background:"#F59E0B" }} />{pendientes} alertas pendientes</div>
            <div className="nav-pill">👤 analista@uan.edu.co</div>
          </div>
        </nav>
        <div className="main">
          <aside className="sidebar">
            <div className="sidebar-section-label">Navegación</div>
            {VIEWS.map(v => (
              <button key={v.id} className={`sidebar-item ${view===v.id?"active":""}`} onClick={() => setView(v.id)}>
                <span className="sidebar-icon">{v.icon}</span>{v.label}
              </button>
            ))}
            <div className="sidebar-bottom">
              <div className="sidebar-user">
                <div className="sidebar-avatar">A</div>
                <div>
                  <div className="sidebar-urole">Analista</div>
                  <div className="sidebar-uname">analista@uan</div>
                </div>
              </div>
            </div>
          </aside>
          <main className="content">
            <div className="page-header">
              <div>
                <div className="page-title">{TITLES[view]}</div>
                <div className="page-sub">Sistema de Pagos UAN · Datos simulados (mock)</div>
              </div>
              <div className="page-date">{now}</div>
            </div>
            {view==="overview"      && <Overview />}
            {view==="alertas"       && <Alertas />}
            {view==="transacciones" && <Transacciones />}
            {view==="servicios"     && <Servicios />}
          </main>
        </div>
      </div>
    </>
  );
}
