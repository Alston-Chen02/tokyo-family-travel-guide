import { TRAVEL_INSURANCE } from './data';

const coverage = [
  ['身故／喪葬費用及失能', '1,000 萬', '未列此項保障'],
  ['傷害醫療', '100 萬', '10 萬（童遊傷害醫療）'],
  ['海外突發疾病・住院', '100 萬', '10 萬'],
  ['海外突發疾病・返國住院', '10 萬', '1 萬'],
  ['海外突發疾病・門診', '3 萬', '3,000'],
  ['海外突發疾病・急診', '10 萬', '1 萬'],
  ['食物中毒', '2,000', '2,000'],
  ['信用卡盜刷／現金竊盜', '2 萬／5,000', '未列此項保障'],
];
const shared = [
  ['班機延誤', '每滿 4 小時 6,000 元；單次事故最高 12,000 元，保險期間最多 2 次。'],
  ['旅程取消／更改', '各最高 12 萬元，限額內實支實付；含傳染病及檢疫附加條款，須符合承保事由。'],
  ['行李延誤／損失', '各定額 5,000 元；行李延誤須達 6 小時以上，返抵台灣境內機場不在行李延誤保障內。'],
  ['旅行文件損失／班機改降', '旅行文件損失定額 3,000 元；班機改降保額 5,000 元，符合條件時按 50% 給付，即 2,500 元。'],
  ['緊急救援與第三人責任', '緊急醫療運送 300 萬、遺體運返 300 萬、子女看護 12 萬、探病 20 萬；第三人責任 500 萬元。'],
];
const claims = [
  ['班機延誤／取消', ['航空公司延誤或取消證明', '電子機票、實際搭乘航班登機證', '另買替代機票時，保留購票時間及票據']],
  ['旅程更改', ['延誤或取消證明、實際搭乘登機證', '額外交通與住宿收據正本', '原訂交通、住宿費用及退費／無法退費證明']],
  ['行李延誤／損失', ['向航空公司取得行李異常報告（PIR）及延誤／損失證明', '保留行李條、託運證明及領回時間', '遭竊、強盜或搶奪時，保留警方報案證明正本']],
  ['傷害醫療／海外突發疾病', ['診斷證明書正本', '收據正本與醫療費用明細', '傷害事故另留登機證、事故證明；突發疾病另備病歷']],
];
const typhoonRules = [
  ['先看投保時間', '投保時若中央氣象署已發布海上颱風警報，該颱風造成的班機延誤、旅程取消或更改屬特別不保。'],
  ['延誤看實際起飛', '預定班機取消或延誤後，航空公司提供的第一班替代航班，或自行安排的同目的地定期航班，實際起飛比原定時間晚滿 4 小時才啟動定額給付；提早起飛不賠。'],
  ['轉機失接合併計算', '前段班機延誤或取消造成轉接航班失接，自原定轉接出發至替代班機實際出發合併為同一事故，只給付一次。航空公司改排航程所增加的轉機等待時間不另計。'],
  ['海外滯留先延長保期', '因颱風滯留海外、無法如期返台，請主動聯絡南山產物客服延長保期，避免海外醫療及旅行不便保障中斷。'],
  ['旅程更改只看新增支出', '出境後因旅程更改而額外增加的交通或住宿費才在保障範圍；未使用的原住宿、餐飲、代步及換洗衣物等日常花費不賠。'],
  ['改降與非航空限制', '定期航班因天候改降至中華民國境內其他機場，可依班機改降保額的 50% 給付。渡輪等非空中交通工具延誤不屬班機延誤。'],
];
export default function InsuranceGuide() {
  return <section className="insurance-guide" aria-labelledby="insurance-title">
    <header className="insurance-overview"><span className="eyebrow">FAMILY TRAVEL PROTECTION</span><h2 id="insurance-title">一家人的旅途保障</h2><p>南山產物 · 金平安 PRO 6</p><span className="insurance-badge">9/15 已購買 · 2 大 1 小</span><div className="insurance-facts"><div><small>成人計畫二 × 2</small><strong>NT$2,034／人</strong></div><div><small>幼兒計畫六（童遊）× 1</small><strong>NT$869／人</strong></div><div><small>六日保費合計</small><strong>NT${TRAVEL_INSURANCE.totalTwd.toLocaleString('zh-TW')}</strong></div></div><p className="insurance-caption">要保書：2026/09/19 00:00 起，共 6 日，旅行地點日本。終止時間、時區及承保狀態請核對正式保單。</p></header>
    <div className="insurance-contact"><div><small>海外緊急救援／諮詢</small><a href="tel:+886277268280">+886-2-7726-8280</a><p>在日本需救援時，先聯絡專線確認安排與適用服務。</p></div><div><small>台灣理賠服務</small><a href="tel:0800005678">0800-005-678</a><p>國內免付費專線；海外請使用國際救援電話。</p></div></div>
    <p className="insurance-caption">保單號碼請存於「住宿」頁的本機私密保管箱；出發前另下載正式保單至手機。</p>
    <h3>成人與幼兒，保障分開看</h3><p className="insurance-caption">以下為每人保額，單位新台幣；並非每次事故均可全額領取。</p>
    <table className="insurance-table"><caption>計畫二與計畫六保障比較</caption><thead><tr><th scope="col">保障項目</th><th scope="col">成人・計畫二</th><th scope="col">幼兒・計畫六</th></tr></thead><tbody>{coverage.map(([label, adult, child]) => <tr key={label}><th scope="row">{label}</th><td>{adult}</td><td>{child}</td></tr>)}</tbody></table>
    <p className="insurance-note">日本適用海外突發疾病特定地區調整係數 200%；上表列基本保額。返國住院及各項給付的適用範圍，依正式保單與條款核定。</p>
    <h3>全家共同的旅行不便保障</h3><div className="insurance-benefits">{shared.map(([label, value]) => <article key={label}><h4>{label}</h4><p>{value}</p></article>)}</div>
    <section className="typhoon-guide" aria-labelledby="typhoon-guide-title"><span className="eyebrow">TYPHOON QUICK CHECK</span><h3 id="typhoon-guide-title">遇到颱風，先判斷這六件事</h3><div>{typhoonRules.map(([title, rule], index) => <article key={title}><b>{index + 1}</b><p><strong>{title}</strong><span>{rule}</span></p></article>)}</div><p className="insurance-note">若自行購買替代機票，出發時間必須仍在原保險期間內；若排到保期外，請先向保險公司申請延長。若尚未搭乘、原班機已取消後才改了目的地，不符合班機改降保障。</p></section>
    <h3>遇到狀況，先把文件留好</h3><p>共同文件：理賠申請書正本、電子機票或行程表、被保險人存摺影本。</p><div className="insurance-claims">{claims.map(([title, documents]) => <details key={title as string}><summary>{title}</summary><ul>{(documents as string[]).map(document => <li key={document}>{document}</li>)}</ul></details>)}</div>
    <p className="insurance-note">旅程更改：有原訂費用與退款證明時，交通或每日住宿各以原預定費用的 120% 為限；缺少相關證明時，每日交通及住宿合計以 NT$2,000 為限，仍受保額與條款限制。實支實付項目請留正式收據並先拍照備份。</p>
    <footer className="insurance-caption">整理依據：本次要保書、金平安 PRO 6 方案表（2026/5）、理賠文件表（2026/7）、颱風（天災）FAQ（2026/7）及理賠提醒。此處為出遊速查摘要，承保範圍、除外責任與理賠仍依正式保單及條款。海外救援電話已於 2026/09/15 核對南山產物官方服務資訊。</footer>
  </section>;
}
