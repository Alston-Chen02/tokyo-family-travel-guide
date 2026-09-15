import { useEffect, useMemo, useState } from "react";

const TARGET_URL = "https://www.jma.go.jp/bosai/typhoon/data/targetTc.json";
const SPECIFICATIONS_URL = (id: string) => `https://www.jma.go.jp/bosai/typhoon/data/${id}/specifications.json`;
const CACHE_KEY = "tokyo-family-guide-typhoon-v2";
const AUTO_REFRESH_MS = 10 * 60 * 1000;
const TOKYO = { latitude: 35.6762, longitude: 139.6503 };
const TRIP_START = "2026-09-19";
const TRIP_END = "2026-09-24";

type TargetCyclone = {
  tropicalCyclone: string;
  typhoonNumber: string;
  category: string;
  issue: string;
};

type ForecastPoint = {
  part: string | { jp: string; en: string };
  advancedHours: number;
  validtime: { JST: string; UTC: string };
  category?: { jp: string; en: string };
  intensity?: string;
  location?: string;
  pressure?: string;
  maximumWind?: { sustained: { "m/s": string }; gust: { "m/s": string } };
  position: { deg: [number, number] };
  probabilityCircleRadius?: { km: number };
};

type CycloneSystem = { target: TargetCyclone; forecast: ForecastPoint[] };
type TyphoonSnapshot = { fetchedAt: number; systems: CycloneSystem[] };

const categoryLabel = (category: string) => ({
  TD: "熱帶性低氣壓",
  TS: "颱風",
  STS: "颱風",
  TY: "颱風",
}[category] || category);

const formatJst = (value: string) => new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
}).format(new Date(value));

const distanceKm = ([latitude, longitude]: [number, number]) => {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadius = 6371;
  const deltaLatitude = radians(TOKYO.latitude - latitude);
  const deltaLongitude = radians(TOKYO.longitude - longitude);
  const a = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(radians(latitude)) * Math.cos(radians(TOKYO.latitude)) * Math.sin(deltaLongitude / 2) ** 2;
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const dateOnly = (value: string) => value.slice(0, 10);
const locationLabel = (location = "") => ({
  "マリアナ諸島": "馬里亞納群島",
  "南鳥島近海": "南鳥島近海",
  "小笠原近海": "小笠原近海",
  "日本の南": "日本南方",
}[location] || location);

export default function TyphoonTracker() {
  const [snapshot, setSnapshot] = useState<TyphoonSnapshot | null>(() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError(false);
    try {
      const targetResponse = await fetch(TARGET_URL, { cache: "no-store" });
      if (!targetResponse.ok) throw new Error("target");
      const targets = await targetResponse.json() as TargetCyclone[];
      const systems = await Promise.all(targets.map(async target => {
        const forecastResponse = await fetch(SPECIFICATIONS_URL(target.tropicalCyclone), { cache: "no-store" });
        if (!forecastResponse.ok) throw new Error("forecast");
        return { target, forecast: await forecastResponse.json() as ForecastPoint[] };
      }));
      const fresh = { fetchedAt: Date.now(), systems };
      setSnapshot(fresh);
      localStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), AUTO_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, []);

  const updated = snapshot ? new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(snapshot.fetchedAt)) : "—";

  return <section className="content-section typhoon-section">
    <div className="section-heading typhoon-heading"><span>LIVE WEATHER WATCH</span><h2>颱風動態</h2><p>日本氣象廳即時資料 · 自動每 10 分鐘更新</p></div>
    <div className="typhoon-toolbar" aria-live="polite"><div><i className={!error ? "online" : ""}/><b>{error ? (snapshot ? "連線失敗，顯示最近快取" : "暫時無法連線") : loading ? "正在更新" : "已連線"}</b><span>最後取得：日本時間 {updated}</span></div><button type="button" onClick={() => void refresh()} disabled={loading}>{loading ? "更新中…" : "立即更新"}</button></div>
    {!snapshot && <article className="typhoon-empty"><strong>{loading ? "正在讀取日本氣象廳資料…" : "目前無法取得颱風資料"}</strong><p>請確認網路後按「立即更新」，或直接開啟官方颱風圖。</p></article>}
    {snapshot?.systems.length === 0 && <article className="typhoon-empty"><strong>目前沒有日本氣象廳追蹤中的熱帶氣旋</strong><p>仍請留意東京當地的大雨、強風與交通警報。</p></article>}
    {snapshot?.systems.map(system => <CycloneCard key={system.target.tropicalCyclone} system={system} />)}
    <div className="typhoon-actions"><a href="https://www.jma.go.jp/bosai/map.html#5/34.5/137/&elem=root&typhoon=all&contents=typhoon" target="_blank" rel="noreferrer">日本氣象廳颱風路徑 ↗</a><a href="https://www.jma.go.jp/bosai/warning/#area_type=offices&area_code=130000" target="_blank" rel="noreferrer">東京都警報・注意報 ↗</a></div>
    <div className="typhoon-decisions"><article><span>出發前 48 小時</span><h3>先確認 BR184 航班</h3><p>查看航空公司通知、成田機場運作與台北出發天氣；不要只依路徑中心決定取消行程。</p></article><article><span>東京行程中</span><h3>依當地警報縮短移動</h3><p>強風或大雨時優先留在飯店、車站或室內場館，避免河川、海邊及高架戶外設施。</p></article><article><span>回程受阻</span><h3>先留證明，再改交通住宿</h3><p>保存原定與實際起飛時間、航空公司證明、登機證及新增收據；若超過保期，立即聯絡保險公司延長。</p></article></div>
    <p className="typhoon-disclaimer">路徑預報會改變；預報圓表示颱風中心可能出現的範圍，不等同暴風圈或東京確定受影響。實際行動請以日本氣象廳、航空公司、機場及地方政府最新公告為準。</p>
  </section>;
}

function CycloneCard({ system }: { system: CycloneSystem }) {
  const analysis = system.forecast.find(point => point.advancedHours === 0);
  const future = system.forecast.filter(point => point.advancedHours > 0);
  const tripPoints = future.filter(point => {
    const date = dateOnly(point.validtime.JST);
    return date >= TRIP_START && date <= TRIP_END;
  });
  const closest = useMemo(() => future.reduce<ForecastPoint | null>((best, point) =>
    !best || distanceKm(point.position.deg) < distanceKm(best.position.deg) ? point : best, null), [future]);
  const closestDistance = closest ? distanceKm(closest.position.deg) : null;
  const uncertaintyKm = closest?.probabilityCircleRadius?.km ?? null;
  const nearEnvelope = closestDistance !== null && uncertaintyKm !== null && closestDistance <= uncertaintyKm + 250;

  return <article className="cyclone-card">
    <header><div><span className="cyclone-status">{categoryLabel(system.target.category)}</span><small>{system.target.tropicalCyclone}</small><h3>{system.target.category === "TD" ? "尚未編號的熱帶系統" : `第 ${system.target.typhoonNumber} 號颱風`}</h3></div><p>氣象廳發布<br/><b>{formatJst(system.target.issue)} JST</b></p></header>
    <div className="cyclone-summary"><div><small>目前中心</small><strong>{analysis ? `${analysis.position.deg[0].toFixed(1)}°N · ${analysis.position.deg[1].toFixed(1)}°E` : "資料整理中"}</strong><span>{analysis ? `${locationLabel(analysis.location)} · ${analysis.pressure || "—"} hPa · 最大風速 ${analysis.maximumWind?.sustained["m/s"] || "—"} m/s` : "—"}</span></div><div><small>五日內最接近東京的中心預報</small><strong>{closestDistance === null ? "尚無預報" : `約 ${closestDistance.toLocaleString("zh-TW")} km`}</strong><span>{closest ? `${formatJst(closest.validtime.JST)} JST${uncertaintyKm ? ` · 預報圓約 ${uncertaintyKm} km` : ""}` : "—"}</span></div><div className={nearEnvelope ? "watch" : ""}><small>行程判讀</small><strong>{tripPoints.length ? nearEnvelope ? "預報範圍接近東京，持續追蹤" : "行程日期已有預報，持續觀察" : "五日預報尚未涵蓋行程"}</strong><span>這是路徑距離判讀，不是警報。</span></div></div>
    {tripPoints.length > 0 && <div className="cyclone-timeline"><h4>與旅程日期重疊的預報</h4><div>{tripPoints.map(point => <article key={point.validtime.JST}><time>{formatJst(point.validtime.JST)}</time><b>{categoryLabel(point.category?.en || "")} {point.intensity === "強い" ? "· 強" : ""}</b><span>{locationLabel(point.location)} · {point.pressure || "—"} hPa<br/>最大風速 {point.maximumWind?.sustained["m/s"] || "—"} m/s · 陣風 {point.maximumWind?.gust["m/s"] || "—"} m/s<br/>中心距東京約 {distanceKm(point.position.deg).toLocaleString("zh-TW")} km{point.probabilityCircleRadius ? ` · 預報圓約 ${point.probabilityCircleRadius.km} km` : ""}</span></article>)}</div></div>}
  </article>;
}
