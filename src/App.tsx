import { useEffect, useMemo, useState } from "react";
import {
  AIRFARE,
  AIRPORTER,
  AIRPORT_TRANSFER,
  DAYS,
  EMERGENCY_PHRASES,
  EMERGENCY_INFO,
  FLIGHTS,
  HOTELS,
  LUGGAGE_AGENT,
  LUGGAGE_ROUTE,
  MEDICAL_SEARCHES,
  RESERVATION_HUB,
  type ItineraryStop,
} from "./data";

type View = "schedule" | "bookings" | "budget" | "help";

const STORAGE_KEY = "tokyo-family-guide-progress-v2";
const EXCHANGE_RATE_STORAGE_KEY = "tokyo-family-guide-jpy-rate-v1";
const DEFAULT_EXCHANGE_RATE = 0.2045;
const JPY_RATE = 0.215;
const budgetJpy = 289492 + 21800 + 12000 + 150000 + AIRPORTER.totalJpy;
const budgetTwd = Math.round(budgetJpy * JPY_RATE) + AIRFARE.total + LUGGAGE_AGENT.totalTwd + AIRPORTER.totalTwd + AIRPORT_TRANSFER.totalTwd;

const WEATHER_CACHE_KEY = "tokyo-family-guide-weather-v1";
const WEATHER_CACHE_MAX_AGE = 30 * 60 * 1000;
const WEATHER_FORECAST_DAYS = 16;

const WEATHER_LOCATIONS: Record<string, { name: string; latitude: number; longitude: number }> = {
  d1: { name: "押上・東京", latitude: 35.7101, longitude: 139.8107 },
  d2: { name: "舞濱・浦安", latitude: 35.6329, longitude: 139.8804 },
  d3: { name: "大宮", latitude: 35.9063, longitude: 139.6238 },
  d4: { name: "水道橋・東京", latitude: 35.7020, longitude: 139.7537 },
  d5: { name: "大森・品川", latitude: 35.5885, longitude: 139.7354 },
  d6: { name: "成田機場", latitude: 35.7720, longitude: 140.3929 },
};

type WeatherApiResponse = {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };
};

type WeatherDay = {
  date: string;
  location: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  rainChance: number;
};

type WeatherHour = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  rainChance: number;
  weatherCode: number;
  windSpeed: number;
};

type WeatherSnapshot = {
  fetchedAt: number;
  primary: WeatherDay;
  next?: WeatherDay;
  hours: WeatherHour[];
};

const weatherLabel = (code: number) => {
  if (code === 0) return "晴朗";
  if (code <= 3) return "多雲";
  if ([45, 48].includes(code)) return "有霧";
  if (code <= 57) return "毛毛雨";
  if (code <= 67) return "下雨";
  if (code <= 77) return "降雪";
  if (code <= 82) return "陣雨";
  if (code <= 86) return "陣雪";
  return "雷雨";
};

const weatherIcon = (code: number) => {
  if (code === 0) return "☀";
  if (code <= 3) return "☁";
  if ([45, 48].includes(code)) return "≋";
  if (code <= 67 || (code >= 80 && code <= 82)) return "☂";
  if (code <= 86) return "❄";
  return "⚡";
};

const dayDistance = (from: string, to: string) =>
  Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / 86_400_000);

const minusDays = (date: string, days: number) => {
  const value = new Date(date + "T00:00:00Z");
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
};

const weatherUrl = (day: typeof DAYS[number]) => {
  const location = WEATHER_LOCATIONS[day.id];
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: "Asia/Tokyo",
    start_date: day.date,
    end_date: day.date,
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    hourly: "temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m",
  });
  return `https://api.open-meteo.com/v1/forecast?${params}`;
};

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

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function SensitiveValue({ value, label = "敏感資料" }: { value?: string; label?: string }) {
  const [visible, setVisible] = useState(false);
  if (!value) return <span>—</span>;
  return <span className="sensitive-value">
    <span className={visible ? "" : "masked"}>{visible ? value : "••••••••"}</span>
    <button type="button" onClick={() => setVisible(v => !v)} aria-label={`${visible ? "隱藏" : "顯示"}${label}`}>{visible ? "隱藏" : "顯示"}</button>
  </span>;
}

const datePartsInTokyo = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value || "0";
  return { date: `${pick("year")}-${pick("month")}-${pick("day")}`, minutes: Number(pick("hour")) * 60 + Number(pick("minute")) };
};

const startMinutes = (time: string) => {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
};

const stopTitleParts = (title: string) => {
  const [primary, ...rest] = title.split(/[・·]/).map(part => part.trim()).filter(Boolean);
  return { primary: primary || title, detail: rest.join("・") };
};

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
        <div className="detail-box"><small>訂位代碼 PNR</small><strong><SensitiveValue value={flight.pnr} label="機票訂位代碼" /></strong><p>{flight.counter}</p></div>
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

function WeatherCard({ day, mode }: { day: typeof DAYS[number]; mode: "before" | "during" | "after" }) {
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState(false);
  const today = datePartsInTokyo().date;
  const daysUntil = dayDistance(today, day.date);
  const available = mode !== "after" && daysUntil >= 0 && daysUntil < WEATHER_FORECAST_DAYS;
  const availableFrom = minusDays(day.date, WEATHER_FORECAST_DAYS - 1);
  const nextDay = DAYS.find(candidate => candidate.day === day.day + 1);

  useEffect(() => {
    if (!available) return;
    const cacheId = `${day.id}:${day.date}`;
    let cached: WeatherSnapshot | null = null;
    try {
      const cache = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || "{}") as Record<string, WeatherSnapshot>;
      cached = cache[cacheId] || null;
      if (cached) {
        setSnapshot(cached);
        setStale(Date.now() - cached.fetchedAt > WEATHER_CACHE_MAX_AGE);
      }
    } catch { /* empty */ }
    if (cached && Date.now() - cached.fetchedAt <= WEATHER_CACHE_MAX_AGE) return;

    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const requestedDays = nextDay ? [day, nextDay] : [day];
    Promise.all(requestedDays.map(item =>
      fetch(weatherUrl(item), { signal: controller.signal }).then(response => {
        if (!response.ok) throw new Error("weather");
        return response.json() as Promise<WeatherApiResponse>;
      })
    )).then(responses => {
      const makeDay = (item: typeof DAYS[number], response: WeatherApiResponse): WeatherDay => ({
        date: item.date,
        location: WEATHER_LOCATIONS[item.id].name,
        weatherCode: response.daily.weather_code[0],
        maxTemp: Math.round(response.daily.temperature_2m_max[0]),
        minTemp: Math.round(response.daily.temperature_2m_min[0]),
        rainChance: response.daily.precipitation_probability_max[0] ?? 0,
      });
      const primary = makeDay(day, responses[0]);
      const hours = responses[0].hourly.time.map((time, index) => ({
        time,
        temperature: Math.round(responses[0].hourly.temperature_2m[index]),
        apparentTemperature: Math.round(responses[0].hourly.apparent_temperature[index]),
        rainChance: responses[0].hourly.precipitation_probability[index] ?? 0,
        weatherCode: responses[0].hourly.weather_code[index],
        windSpeed: Math.round(responses[0].hourly.wind_speed_10m[index]),
      })).filter(hour => {
        const value = Number(hour.time.slice(11, 13));
        return value >= 7 && value <= 21;
      });
      const fresh: WeatherSnapshot = {
        fetchedAt: Date.now(),
        primary,
        next: nextDay && responses[1] ? makeDay(nextDay, responses[1]) : undefined,
        hours,
      };
      setSnapshot(fresh);
      setStale(false);
      try {
        const cache = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || "{}") as Record<string, WeatherSnapshot>;
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ ...cache, [cacheId]: fresh }));
      } catch { /* empty */ }
    }).catch(err => {
      if (err?.name !== "AbortError") {
        setError(true);
        setStale(Boolean(cached));
      }
    }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [available, day.id, day.date, nextDay?.id]);

  if (mode === "after") return null;

  if (!available) return <article className="weather-card weather-upcoming">
    <div className="weather-heading"><span>WEATHER READY</span><b>旅程天氣</b></div>
    <div className="weather-upcoming-copy"><i>☁</i><div><strong>{day.dateLabel} · {WEATHER_LOCATIONS[day.id].name}</strong><p>逐時預報預計於 {availableFrom.split("-").join("/")} 開放，進入預報範圍後會自動顯示。</p></div></div>
    <a href="https://www.jma.go.jp/bosai/forecast/" target="_blank" rel="noreferrer">日本氣象廳官方預報 ↗</a>
  </article>;

  if (!snapshot && loading) return <article className="weather-card weather-loading">正在取得旅程天氣…</article>;
  if (!snapshot) return <article className="weather-card weather-loading">暫時無法取得天氣。<button type="button" onClick={() => window.location.reload()}>重新整理</button></article>;

  const riskyHours = snapshot.hours.filter(hour => hour.rainChance >= 50);
  const rainWindow = riskyHours.length
    ? `${riskyHours[0].time.slice(11, 16)}–${riskyHours[riskyHours.length - 1].time.slice(11, 16)}`
    : "";
  const maxFeelsLike = Math.max(...snapshot.hours.map(hour => hour.apparentTemperature));
  const maxWind = Math.max(...snapshot.hours.map(hour => hour.windSpeed));
  const advice = rainWindow
    ? `${rainWindow} 降雨機率較高，攜帶折傘與推車雨罩。`
    : maxFeelsLike >= 30
      ? "體感偏熱，增加補水與室內休息。"
      : maxWind >= 30
        ? "風勢偏強，戶外表演與交通請再確認。"
        : "目前未見明顯天氣風險，仍請留意臨時變化。";
  const updated = new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(snapshot.fetchedAt));

  return <article className="weather-card">
    <div className="weather-heading">
      <div><span>TRIP WEATHER</span><b>{snapshot.primary.location}</b></div>
      <small>{stale ? "離線快取" : `${updated} 更新`}</small>
    </div>
    <div className="weather-summary">
      <div className="weather-main"><i>{weatherIcon(snapshot.primary.weatherCode)}</i><div><strong>{weatherLabel(snapshot.primary.weatherCode)}</strong><span>{snapshot.primary.minTemp}–{snapshot.primary.maxTemp}°C</span></div></div>
      <div className="weather-rain"><small>最高降雨</small><b>{snapshot.primary.rainChance}%</b></div>
      {snapshot.next && <div className="weather-next"><small>明天 · {snapshot.next.location}</small><b>{weatherIcon(snapshot.next.weatherCode)} {snapshot.next.minTemp}–{snapshot.next.maxTemp}°</b><span>降雨 {snapshot.next.rainChance}%</span></div>}
    </div>
    <p className="weather-advice">{advice}</p>
    <div className="weather-actions">
      <button type="button" onClick={() => setExpanded(value => !value)}>{expanded ? "收合逐時天氣" : "查看 07:00–21:00"}</button>
      <a href="https://www.jma.go.jp/bosai/forecast/" target="_blank" rel="noreferrer">氣象廳 ↗</a>
    </div>
    {expanded && <div className="weather-hourly">
      {snapshot.hours.filter((_, index) => index % 2 === 0).map(hour => <div key={hour.time}>
        <b>{hour.time.slice(11, 16)}</b><i>{weatherIcon(hour.weatherCode)}</i><span>{hour.temperature}°</span><small>{hour.rainChance}%</small>
      </div>)}
    </div>}
    {(error || stale) && <small className="weather-stale">目前顯示上次成功更新的資料，連線恢復後會自動更新。</small>}
    <small className="weather-source">Weather data by Open-Meteo · 僅供行程調整參考</small>
  </article>;
}

function TodayPanel({
  day,
  nextStop,
  mode,
  onOpenDay,
  installPrompt,
  onInstall,
  offlineReady,
}: {
  day: typeof DAYS[number];
  nextStop: ItineraryStop;
  mode: "before" | "during" | "after";
  onOpenDay: () => void;
  installPrompt: InstallPromptEvent | null;
  onInstall: () => void;
  offlineReady: boolean;
}) {
  const hotel = mode === "during"
    ? HOTELS.find(h => day.dateLabel >= h.checkIn && day.dateLabel < h.checkOut) || HOTELS[HOTELS.length - 1]
    : HOTELS[0];
  const nav = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextStop.mapQuery)}`;
  const title = stopTitleParts(nextStop.title);
  return <section className="today-wrap">
    <article className="today-card">
      <div className="today-copy">
        <span className="eyebrow">{mode === "during" ? "TODAY IN TOKYO" : mode === "before" ? "NEXT TRAVEL DAY" : "TRIP ARCHIVE"}</span>
        {mode === "after"
          ? <h2 className="today-finished">六日行程已完成</h2>
          : <h2 className="today-destination">
              <span>{mode === "during" ? "現在前往" : "下一站"}</span>
              <strong>{title.primary}</strong>
              {title.detail && <em>{title.detail}</em>}
            </h2>}
        <p>{day.dateLabel} · Day {day.day} · {nextStop.time}<br/>{nextStop.subtitle}</p>
      </div>
      <div className="today-meta"><small>當日住宿</small><b>{hotel.name}</b><span>{hotel.area}</span></div>
      <div className="today-actions">
        <button type="button" onClick={onOpenDay}>打開當日行程</button>
        <a href={nav} target="_blank" rel="noreferrer">下一站導航 ↗</a>
        {installPrompt && <button type="button" className="secondary" onClick={onInstall}>安裝到手機</button>}
      </div>
      <div className="offline-state"><i className={offlineReady ? "ready" : ""}/><span>{offlineReady ? "離線備援已啟用" : "首次開啟後自動建立離線備援"}</span></div>
    </article>
    <aside className="holiday-alert"><b>9/19–9/23 日本連假提醒</b><span>9/21 敬老日、9/22 國定休日、9/23 秋分日。交通、園區與室內景點皆預留排隊時間，票券盡量事前完成。</span></aside>
    <WeatherCard day={day} mode={mode} />
  </section>;
}

function ReservationHub() {
  return <section className="reservation-section">
    <div className="section-heading compact"><span>TICKETS & BOOKINGS</span><h2>票券與預約，一次打開。</h2><p>把會在入口前臨時找不到的東西，先集中在這裡。</p></div>
    <div className="reservation-grid">{RESERVATION_HUB.map(item => <article key={item.id}>
      <div><span className={`status ${item.status.includes("待") || item.status === "確認票種" ? "pending" : "paid"}`}>{item.status}</span><small>{item.meta}</small></div>
      <h3>{item.title}</h3><p>{item.note}</p>
      <a href={item.url} target="_blank" rel="noreferrer">{item.action} ↗</a>
    </article>)}</div>
  </section>;
}

function Bookings() {
  return <section className="content-section">
    <div className="section-heading"><span>STAY & LUGGAGE</span><h2>旅宿與行李，都安排妥當。</h2><p>從入住到交接，一頁收好所有地址、電話與確認資訊；確認碼預設遮住，避免旁人一眼看光。</p></div>
    <div className="hotel-grid">
      {HOTELS.map((hotel, i) => <article className="hotel-card" key={hotel.id}>
        <div className="hotel-number">0{i + 1}</div>
        <div><span className="eyebrow">{hotel.checkIn} — {hotel.checkOut} · {hotel.nights} 晚</span><h3>{hotel.name}</h3><p className="jp">{hotel.nameJp}</p></div>
        <dl>
          <div><dt>房型</dt><dd>{hotel.roomType}</dd></div>
          <div><dt>入住 / 退房</dt><dd>{hotel.checkInTime} / {hotel.checkOutTime}</dd></div>
          <div><dt>訂房確認碼</dt><dd className="mono"><SensitiveValue value={hotel.confirmationNo} label={`${hotel.name}訂房確認碼`} /></dd></div>
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
    <ReservationHub />
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
  return <section className="content-section">
    <div className="section-heading"><span>PEACE OF MIND</span><h2>安心出發，也安心回家。</h2><p>重要聯絡、親子醫療、求助日文與旅平險，真正需要時一秒找到。</p></div>
    <div className="hotline-grid">{EMERGENCY_INFO.hotlines.map(h => <a key={h.label} href={`tel:${h.number}`}><small>{h.label}</small><strong>{h.number}</strong><span>{h.label.includes("JNTO") ? "24H · 中文／英文／韓文" : "點一下，立即撥號"}</span></a>)}</div>
    <div className="medical-grid">
      <article><span className="eyebrow">NEARBY CARE</span><h3>附近兒科與急診</h3><p>依當下住宿地點開啟地圖搜尋；危急狀況直接撥 119。</p><div className="medical-links">{MEDICAL_SEARCHES.map(item => <a key={item.label} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.query)}`} target="_blank" rel="noreferrer">{item.label} ↗</a>)}</div></article>
      <article><span className="eyebrow">SHOW THIS SCREEN</span><h3>親子求助日文</h3><dl className="phrase-list">{EMERGENCY_PHRASES.map(item => <div key={item.zh}><dt>{item.zh}</dt><dd lang="ja">{item.jp}</dd></div>)}</dl></article>
    </div>
    <article className="insurance-card"><div><span className="eyebrow">24H ASSISTANCE</span><h3>{EMERGENCY_INFO.insurance.title}</h3></div><a className="insurance-phone" href={`tel:${EMERGENCY_INFO.insurance.hotline.split(" ")[0]}`}>{EMERGENCY_INFO.insurance.hotline}</a><dl><div><dt>保單號碼</dt><dd className="mono"><SensitiveValue value={EMERGENCY_INFO.insurance.policyNo} label="保單號碼" /></dd></div><div><dt>保障摘要</dt><dd>{EMERGENCY_INFO.insurance.note}</dd></div></dl></article>
    <div className="backup-plans"><h3>行程卡住時，照這個順序。</h3><div><b>交通延誤</b><p>先保留住宿與已預約票券；購物、銀座與非指定時間景點優先刪除。用官方 App／站務員確認替代線，必要時直接叫車。</p></div><div><b>孩子不舒服</b><p>回最近飯店休息 → JNTO 中文熱線協助找醫療 → 有呼吸困難、意識不清或嚴重過敏直接 119。</p></div><div><b>班機／回程異動</b><p>先聯絡長榮與接送司機，再通知保險公司；保留延誤證明、收據與 App 截圖。</p></div></div>
    <div className="travel-notes"><h3>出發前，從容確認。</h3><label><input type="checkbox" /> 護照、機票、住宿憑證</label><label><input type="checkbox" /> Disney App 與門票完成登入</label><label><input type="checkbox" /> PokéPark App、票種與同團票券</label><label><input type="checkbox" /> Suica / PASMO、日幣與行動電源</label><label><input type="checkbox" /> 兒童襪子、推車雨罩、常備藥</label><label><input type="checkbox" /> 行李配送掛牌與照片</label></div>
  </section>;
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
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [now, setNow] = useState(datePartsInTokyo);

  useEffect(() => {
    try { setCompleted(new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"))); } catch { /* empty */ }
    const tokyo = datePartsInTokyo();
    const matchingDay = DAYS.find(d => d.date === tokyo.date);
    if (matchingDay) setDayId(matchingDay.id);
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed])); }, [completed, hydrated]);
  useEffect(() => {
    const refreshClock = () => setNow(datePartsInTokyo());
    const timer = window.setInterval(refreshClock, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const matchingDay = DAYS.find(d => d.date === now.date);
    if (matchingDay) setDayId(matchingDay.id);
  }, [now.date]);
  useEffect(() => {
    const capturePrompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", capturePrompt);
    if ("serviceWorker" in navigator) navigator.serviceWorker.ready.then(() => setOfflineReady(true)).catch(() => undefined);
    return () => window.removeEventListener("beforeinstallprompt", capturePrompt);
  }, []);
  const day = DAYS.find(d => d.id === dayId) || DAYS[0];
  const tripTotal = useMemo(() => DAYS.reduce((n, d) => n + d.stops.length, 0), []);
  const tripMode: "before" | "during" | "after" = now.date < DAYS[0].date ? "before" : now.date > DAYS[DAYS.length - 1].date ? "after" : "during";
  const todayDay = DAYS.find(d => d.date === now.date) || (tripMode === "after" ? DAYS[DAYS.length - 1] : DAYS[0]);
  const incompleteStops = todayDay.stops.filter(stop => !completed.has(stop.id));
  const currentStopIndex = tripMode === "during"
    ? todayDay.stops.reduce((latest, stop, index) => startMinutes(stop.time) <= now.minutes ? index : latest, -1)
    : -1;
  const nextStop = tripMode === "during"
    ? todayDay.stops.slice(Math.max(0, currentStopIndex)).find(stop => !completed.has(stop.id))
      || todayDay.stops.slice(0, Math.max(0, currentStopIndex)).find(stop => !completed.has(stop.id))
      || todayDay.stops[todayDay.stops.length - 1]
    : incompleteStops[0] || todayDay.stops[todayDay.stops.length - 1];
  const toggle = (id: string) => setCompleted(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const switchView = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openToday = () => { setDayId(todayDay.id); setView("schedule"); window.setTimeout(() => document.querySelector(".day-shell")?.scrollIntoView({ behavior: "smooth" }), 40); };
  const install = async () => { if (!installPrompt) return; await installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null); };

  return <main>
    <header className="hero">
      <nav className="topbar"><div className="brand"><i>東京</i><span><b>東京親子行旅</b><small>FAMILY JOURNEY · 2026</small></span></div><div className="topbar-actions"><button className="calculator-action" type="button" onClick={() => setCalculatorOpen(true)}><b>¥</b><span>日圓換算</span></button><button className="print-action" type="button" onClick={() => window.print()}><span>旅程備份 / 列印</span></button></div></nav>
      <div className="hero-content"><div><p className="kicker">TOKYO · SIX DAYS TOGETHER</p><h1>東京，慢慢走。<br/><em>六日親子行旅</em></h1><p className="hero-copy">2026/09/19 — 09/24 · 兩大一小<br/>從第一班航班到最後一件行李，旅程需要的都在這裡。</p></div><div className="trip-stamp"><span>6</span><b>DAYS</b><i>5 NIGHTS</i><small>TPE ⇄ NRT</small></div></div>
      <div className="hero-stats"><div><small>啟程</small><b>BR184</b><span>09/19 · 07:55</span></div><div><small>歸程</small><b>BR197</b><span>09/24 · 14:25</span></div><div><small>旅程記錄</small><b>{completed.size}/{tripTotal}</b><span>已完成 {Math.round(completed.size / tripTotal * 100)}%</span></div></div>
    </header>

    <div className="desktop-nav"><button className={view === "schedule" ? "active" : ""} onClick={() => switchView("schedule")}>每日行程</button><button className={view === "bookings" ? "active" : ""} onClick={() => switchView("bookings")}>旅宿與行李</button><button className={view === "budget" ? "active" : ""} onClick={() => switchView("budget")}>旅費筆記</button><button className={view === "help" ? "active" : ""} onClick={() => switchView("help")}>安心資訊</button></div>

    {view === "schedule" && <>
      <TodayPanel day={todayDay} nextStop={nextStop} mode={tripMode} onOpenDay={openToday} installPrompt={installPrompt} onInstall={install} offlineReady={offlineReady} />
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
