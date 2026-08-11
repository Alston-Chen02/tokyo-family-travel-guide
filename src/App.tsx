import { useEffect, useMemo, useState } from "react";
import {
  AIRFARE,
  AIRPORTER,
  AIRPORT_TRANSFER,
  DAYS,
  EMERGENCY_INFO,
  FLIGHTS,
  HOTELS,
  LUGGAGE_AGENT,
  LUGGAGE_ROUTE,
  type ItineraryStop,
} from "./data";

type View = "schedule" | "bookings" | "budget" | "help";

const STORAGE_KEY = "tokyo-family-guide-progress-v2";
const EXCHANGE_RATE_STORAGE_KEY = "tokyo-family-guide-jpy-rate-v1";
const DEFAULT_EXCHANGE_RATE = 0.2045;
const JPY_RATE = 0.215;
const budgetJpy = 289492 + 21800 + 12000 + 150000 + AIRPORTER.totalJpy;
const budgetTwd = Math.round(budgetJpy * JPY_RATE) + AIRFARE.total + LUGGAGE_AGENT.totalTwd + AIRPORTER.totalTwd + AIRPORT_TRANSFER.totalTwd;

const transportIcon: Record<string, string> = {
  walk: "步",
  train: "電",
  shinkansen: "新",
  taxi: "車",
  flight: "飛",
  bus: "巴",
  boat: "船",
};

const money = (n: number) => n.toLocaleString("zh-TW");

function FlightCard({ flight, label }: { flight: typeof FLIGHTS.outbound; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="flight-card">
      <div className="flight-topline">
        <span className="eyebrow">{label}</span>
        <span className="cabin">♛ {flight.cabin}</span>
      </div>
      <div className="flight-route">
        <div><b>{flight.depart}</b><span>{flight.from}</span></div>
        <div className="flight-line"><small>{flight.flightNo} · {flight.duration}</small><i>✈</i></div>
        <div className="align-right"><b>{flight.arrive}</b><span>{flight.to}</span></div>
      </div>
      <div className="seat-row">
        <span>{flight.date}（{flight.weekday}）</span>
        <span>{flight.aircraft}</span>
        <span>座位 {flight.passengers.map(p => p.seat).join(" · ")}</span>
      </div>
      <button className="text-button" onClick={() => setOpen(!open)}>{open ? "收合機票細節" : "查看機票、餐點與行李"}</button>
      {open && <div className="details-grid">
        <div className="detail-box"><small>訂位代碼 PNR</small><strong>{flight.pnr}</strong><p>{flight.counter}</p></div>
        <div className="detail-box"><small>託運行李</small><strong>{flight.baggage}</strong><p>每位旅客 2 件免費託運</p></div>
        {flight.passengers.map((p, i) => <div className="passenger" key={i}><b>{p.label} · {p.seat}</b><p>{p.meal}</p><small>✓ {p.preOrder}</small></div>)}
      </div>}
    </article>
  );
}

function StopCard({ stop, index, done, onToggle }: { stop: ItineraryStop; index: number; done: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(index === 0);
  const nav = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.mapQuery)}`;
  return (
    <article className={`stop-card ${done ? "is-done" : ""}`}>
      <div className="timeline-dot">{index + 1}</div>
      <button className="stop-summary" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="stop-time">{stop.time}</span>
        <span className="stop-title"><b>{stop.title}</b><small>{stop.subtitle}</small></span>
        <span className="chevron">{open ? "−" : "+"}</span>
      </button>
      {(stop.meal !== "—" || stop.cost !== "—") && <div className="quick-tags">
        {stop.meal !== "—" && <span>🍽 {stop.meal}</span>}
        {stop.cost !== "—" && <span>💴 {stop.cost}</span>}
      </div>}
      {open && <div className="stop-detail">
        <div className="transit"><i>{transportIcon[stop.transport.type]}</i><b>{stop.transport.label}</b><span>{stop.transport.route}</span><em>{stop.transport.duration}</em></div>
        <p>{stop.description}</p>
        {stop.parentingTips?.map((tip, i) => <div className="parent-tip" key={i}>👶 {tip.text}</div>)}
        <div className="highlights">{stop.highlights.map(h => <span key={h}>{h}</span>)}</div>
        <div className="action-row">
          <a href={nav} target="_blank" rel="noreferrer">路線導航 ↗</a>
          {stop.websiteUrl && <a href={stop.websiteUrl} target="_blank" rel="noreferrer">官方網站 ↗</a>}
          <button onClick={onToggle}>{done ? "↶ 取消完成" : "✓ 標記完成"}</button>
        </div>
      </div>}
    </article>
  );
}

function Bookings() {
  return <section className="content-section">
    <div className="section-heading"><span>STAY & LUGGAGE</span><h2>旅宿與行李，都安排妥當。</h2><p>從入住到交接，一頁收好所有地址、電話與確認資訊。</p></div>
    <div className="hotel-grid">
      {HOTELS.map((hotel, i) => <article className="hotel-card" key={hotel.id}>
        <div className="hotel-number">0{i + 1}</div>
        <div><span className="eyebrow">{hotel.checkIn} — {hotel.checkOut} · {hotel.nights} 晚</span><h3>{hotel.name}</h3><p className="jp">{hotel.nameJp}</p></div>
        <dl>
          <div><dt>房型</dt><dd>{hotel.roomType}</dd></div>
          <div><dt>入住 / 退房</dt><dd>{hotel.checkInTime} / {hotel.checkOutTime}</dd></div>
          <div><dt>訂房確認碼</dt><dd className="mono">{hotel.confirmationNo}</dd></div>
          <div><dt>入住人</dt><dd>{hotel.guestName}</dd></div>
          <div><dt>日文地址</dt><dd className="jp">{hotel.addressJp}</dd></div>
          <div><dt>電話</dt><dd><a href={`tel:${hotel.phone}`}>{hotel.phone}</a></dd></div>
        </dl>
        <p className="hotel-note">{hotel.note}</p>
        <div className="action-row"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.mapQuery)}`} target="_blank" rel="noreferrer">飯店導航 ↗</a><a href={hotel.website} target="_blank" rel="noreferrer">官方網站 ↗</a></div>
      </article>)}
    </div>
    <div className="section-heading compact"><span>LUGGAGE RELAY</span><h2>行李先走，我們輕裝旅行。</h2></div>
    <div className="luggage-list">{LUGGAGE_ROUTE.map((item, i) => <article key={i}><div className="route-index">{i + 1}</div><div><b>{item.date} · {item.method}</b><h3>{item.from} <span>→</span> {item.to}</h3><p>{item.note}</p><small>{item.cost}</small></div><span className={`status ${item.status}`}>{item.status === "paid" ? "已付款" : "待確認"}</span></article>)}</div>
  </section>;
}

function Budget() {
  const items = [
    ["機票費用", `NT$${money(AIRFARE.total)}`, "已付款 · 皇璽桂冠艙 2 大 1 小"],
    ["住宿總計", "¥289,492", "已付款 · 希爾頓 2 晚、巨蛋 2 晚、樂天城市 1 晚"],
    ["樂園門票", "¥21,800", "已付款 · 迪士尼成人 2 位、3 歲免費"],
    ["當地交通", "¥12,000", "預估 · Skyliner、Suica / PASMO"],
    ["餐飲與購物", "¥150,000", "預估"],
    ["LuggAgent", `NT$${money(LUGGAGE_AGENT.totalTwd)}`, `已付款 · US$${LUGGAGE_AGENT.totalUsd}`],
    ["Airporter", `¥${money(AIRPORTER.totalJpy)}`, `已付款 · 訂單 ${AIRPORTER.orderId}`],
    ["回程機場專車", `NT$${money(AIRPORT_TRANSFER.totalTwd)}`, "預估 · 含嬰兒座椅"],
  ];
  return <section className="content-section"><div className="section-heading"><span>TRIP BUDGET</span><h2>把預算，留給值得的風景。</h2><p>費用依原規劃完整保留 · 換算匯率 1 JPY ≈ NT$0.215</p></div><div className="budget-total"><small>六天五夜 · 旅程預算</small><strong>NT${money(budgetTwd)}</strong><span>日本當地 ¥{money(budgetJpy)} + 台幣固定支出</span></div><div className="budget-grid">{items.map(([label, amount, note]) => <article key={label}><span>{label}</span><b>{amount}</b><small>{note}</small></article>)}</div></section>;
}

function Help() {
  return <section className="content-section"><div className="section-heading"><span>PEACE OF MIND</span><h2>安心出發，也安心回家。</h2><p>重要聯絡、旅平險與行前確認，真正需要時一秒找到。</p></div><div className="hotline-grid">{EMERGENCY_INFO.hotlines.map(h => <a key={h.label} href={`tel:${h.number}`}><small>{h.label}</small><strong>{h.number}</strong><span>點一下，立即撥號</span></a>)}</div><article className="insurance-card"><div><span className="eyebrow">24H ASSISTANCE</span><h3>{EMERGENCY_INFO.insurance.title}</h3></div><a className="insurance-phone" href={`tel:${EMERGENCY_INFO.insurance.hotline.split(" ")[0]}`}>{EMERGENCY_INFO.insurance.hotline}</a><dl><div><dt>保單號碼</dt><dd className="mono">{EMERGENCY_INFO.insurance.policyNo}</dd></div><div><dt>保障摘要</dt><dd>{EMERGENCY_INFO.insurance.note}</dd></div></dl></article><div className="travel-notes"><h3>出發前，從容確認。</h3><label><input type="checkbox" /> 護照、機票、住宿憑證</label><label><input type="checkbox" /> Disney App 與門票完成登入</label><label><input type="checkbox" /> Suica / PASMO 與日幣</label><label><input type="checkbox" /> 兒童襪子、推車雨罩、常備藥</label><label><input type="checkbox" /> 行李配送掛牌與照片</label></div></section>;
}


function CurrencyCalculator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [jpy, setJpy] = useState("");
  const [rate, setRate] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(EXCHANGE_RATE_STORAGE_KEY));
      return saved > 0 ? String(saved) : String(DEFAULT_EXCHANGE_RATE);
    } catch {
      return String(DEFAULT_EXCHANGE_RATE);
    }
  });
  const jpyAmount = Number(jpy);
  const rateAmount = Number(rate);
  const twdAmount = jpy !== "" && Number.isFinite(jpyAmount) && Number.isFinite(rateAmount)
    ? Math.round(jpyAmount * rateAmount)
    : 0;
  const cleanNumber = (value: string) => {
    const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
    const [whole, ...decimals] = cleaned.split(".");
    return decimals.length ? whole + "." + decimals.join("") : whole;
  };

  useEffect(() => {
    if (Number.isFinite(rateAmount) && rateAmount > 0) {
      localStorage.setItem(EXCHANGE_RATE_STORAGE_KEY, String(rateAmount));
    }
  }, [rateAmount]);

  if (!open) return null;

  return <div className="calculator-backdrop" role="presentation" onMouseDown={event => {
    if (event.target === event.currentTarget) onClose();
  }} onKeyDown={event => {
    if (event.key === "Escape") onClose();
  }}>
    <section className="calculator-card" role="dialog" aria-modal="true" aria-labelledby="calculator-title">
      <button className="calculator-close" type="button" onClick={onClose} aria-label="關閉日圓換算">×</button>
      <span className="eyebrow">QUICK CONVERTER</span>
      <h2 id="calculator-title">日圓快速換算</h2>
      <p>輸入商品價格，立即估算約合台幣。</p>
      <label className="calculator-field">
        <span>商品價格</span>
        <div><b>¥</b><input autoFocus inputMode="decimal" type="text" value={jpy} onChange={event => setJpy(cleanNumber(event.target.value))} placeholder="例如 12,800" aria-label="日圓金額" /></div>
      </label>
      <div className="calculator-result" aria-live="polite">
        <small>約合台幣</small>
        <strong>{"NT$" + money(twdAmount)}</strong>
      </div>
      <label className="calculator-rate">
        <span>參考匯率</span>
        <input inputMode="decimal" type="text" value={rate} onChange={event => setRate(cleanNumber(event.target.value))} aria-label="日圓兌台幣參考匯率" />
      </label>
      <small className="calculator-note">{"1 JPY ≈ NT$" + (rate || "—") + " · 僅供快速估算，實際金額以交易時匯率為準。"}</small>
    </section>
  </div>;
}

export default function Home() {
  const [view, setView] = useState<View>("schedule");
  const [dayId, setDayId] = useState(DAYS[0].id);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { setCompleted(new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"))); } catch { /* empty */ }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed])); }, [completed, hydrated]);
  const day = DAYS.find(d => d.id === dayId) || DAYS[0];
  const tripTotal = useMemo(() => DAYS.reduce((n, d) => n + d.stops.length, 0), []);
  const toggle = (id: string) => setCompleted(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const switchView = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <main>
    <header className="hero">
      <nav className="topbar"><div className="brand"><i>東京</i><span><b>東京親子行旅</b><small>FAMILY JOURNEY · 2026</small></span></div><div className="topbar-actions"><button className="calculator-action" type="button" onClick={() => setCalculatorOpen(true)}><b>¥</b><span>日圓換算</span></button><button className="print-action" type="button" onClick={() => window.print()}><span>旅程備份 / 列印</span></button></div></nav>
      <div className="hero-content"><div><p className="kicker">TOKYO · SIX DAYS TOGETHER</p><h1>東京，慢慢走。<br/><em>六日親子行旅</em></h1><p className="hero-copy">2026/09/19 — 09/24 · 兩大一小<br/>從第一班航班到最後一件行李，旅程需要的都在這裡。</p></div><div className="trip-stamp"><span>6</span><b>DAYS</b><i>5 NIGHTS</i><small>TPE ⇄ NRT</small></div></div>
      <div className="hero-stats"><div><small>啟程</small><b>BR184</b><span>09/19 · 07:55</span></div><div><small>歸程</small><b>BR197</b><span>09/24 · 14:25</span></div><div><small>旅程記錄</small><b>{completed.size}/{tripTotal}</b><span>已完成 {Math.round(completed.size / tripTotal * 100)}%</span></div></div>
    </header>

    <div className="desktop-nav"><button className={view === "schedule" ? "active" : ""} onClick={() => switchView("schedule")}>每日行程</button><button className={view === "bookings" ? "active" : ""} onClick={() => switchView("bookings")}>旅宿與行李</button><button className={view === "budget" ? "active" : ""} onClick={() => switchView("budget")}>旅費筆記</button><button className={view === "help" ? "active" : ""} onClick={() => switchView("help")}>安心資訊</button></div>

    {view === "schedule" && <>
      <section className="flight-section"><FlightCard flight={FLIGHTS.outbound} label="啟程 · OUTBOUND"/><FlightCard flight={FLIGHTS.return} label="歸程 · RETURN"/></section>
      <section className="day-shell">
        <div className="day-tabs" aria-label="選擇行程日期">{DAYS.map(d => <button key={d.id} className={d.id === day.id ? "active" : ""} onClick={() => setDayId(d.id)}><small>{d.dateLabel}</small><b>D{d.day}</b><span>週{d.weekday}</span></button>)}</div>
        <div className="day-header"><div><span className="eyebrow">DAY {day.day} · {day.dateLabel}（週{day.weekday}）</span><h2>{day.theme}</h2><p>{day.cityLabel}</p></div><div className="day-progress"><b>{day.stops.filter(s => completed.has(s.id)).length}/{day.stops.length}</b><span>今日完成</span></div></div>
        <div className="itinerary">{day.stops.map((stop, i) => <StopCard key={stop.id} stop={stop} index={i} done={completed.has(stop.id)} onToggle={() => toggle(stop.id)}/>)}</div>
      </section>
    </>}
    {view === "bookings" && <Bookings/>}
    {view === "budget" && <Budget/>}
    {view === "help" && <Help/>}

    <footer><b>東京，慢慢走。· 2026 秋</b><span>所有原定行程與時間完整保留 · 旅途中依現場公告從容調整</span></footer>
    <CurrencyCalculator open={calculatorOpen} onClose={() => setCalculatorOpen(false)} />
    <nav className="mobile-nav"><button className={view === "schedule" ? "active" : ""} onClick={() => switchView("schedule")}><i>日</i><span>行程</span></button><button className={view === "bookings" ? "active" : ""} onClick={() => switchView("bookings")}><i>宿</i><span>住宿</span></button><button className={view === "budget" ? "active" : ""} onClick={() => switchView("budget")}><i>費</i><span>旅費</span></button><button className={view === "help" ? "active" : ""} onClick={() => switchView("help")}><i>助</i><span>應急</span></button><button type="button" onClick={() => setCalculatorOpen(true)}><i>¥</i><span>換算</span></button></nav>
  </main>;
}
