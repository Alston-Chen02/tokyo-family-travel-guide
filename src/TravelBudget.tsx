import { useState } from "react";
import ExpenseTracker from "./ExpenseTracker";
import { AIRFARE, AIRPORTER, AIRPORT_TRANSFER, LUGGAGE_AGENT, TRAVEL_INSURANCE } from "./data";

type Currency = "JPY" | "TWD";
type Cost = { name: string; amount: number; currency: Currency; status: string; tone: "paid" | "estimate" | "review"; note: string };
const RATE = 0.215;
const costs: Cost[] = [
  { name: "住宿 · 5 晚", amount: 289492, currency: "JPY", status: "付款待逐筆核對", tone: "review", note: "希爾頓 2 晚、東京巨蛋 2 晚、樂天城市 1 晚。沿用原訂房總額；樂天城市飯店確認於現場結算，尚未拆分各飯店已付金額。" },
  { name: "迪士尼樂園", amount: 21800, currency: "JPY", status: "已付款", tone: "paid", note: "成人門票 2 張；3 歲孩童免費。" },
  { name: "京成 Skyliner", amount: 5770, currency: "JPY", status: "已付款", tone: "paid", note: "09/19 成田機場 → 日暮里，2 大 1 小；已包含在原交通預算 ¥12,000 中。" },
  { name: "其他當地交通", amount: 12000 - 5770, currency: "JPY", status: "預估", tone: "estimate", note: "原交通預算扣除已付 Skyliner 的餘額，供 Suica／PASMO 等市區交通使用。" },
  { name: "Airporter · 兩段", amount: AIRPORTER.totalJpy, currency: "JPY", status: "已付款", tone: "paid", note: "09/21 希爾頓 → 巨蛋、09/23 巨蛋 → 樂天城市；每段 ¥6,710。" },
  { name: "餐飲與購物", amount: 150000, currency: "JPY", status: "預估", tone: "estimate", note: "六天旅程的餐飲、購物預留額度，依實際消費記帳。" },
  { name: "長榮機票", amount: AIRFARE.total, currency: "TWD", status: "已付款", tone: "paid", note: "皇璽桂冠艙，2 大 1 小。" },
  { name: "Aqua Park 門票", amount: 1168, currency: "TWD", status: "已付款", tone: "paid", note: "成人票 2 張 NT$1,112，加 No-show Refund NT$56；3 歲孩童免費。" },
  { name: "南山旅平險", amount: TRAVEL_INSURANCE.totalTwd, currency: "TWD", status: "已購買", tone: "paid", note: "成人計畫二 × 2、幼兒計畫六 × 1，共 6 日。" },
  { name: "LuggAgent 行李特工", amount: LUGGAGE_AGENT.totalTwd, currency: "TWD", status: "已付款", tone: "paid", note: `09/19 成田機場 → 希爾頓，3 件行李；原價 US$${LUGGAGE_AGENT.totalUsd.toFixed(2)}，沿用台幣紀錄。` },
  { name: "回程機場專車", amount: AIRPORT_TRANSFER.totalTwd, currency: "TWD", status: "預估 · 待確認", tone: "estimate", note: "09/24 錦糸町 → 成田機場，含嬰兒座椅；以最終訂單為準。" },
];
const sum = (currency: Currency) => costs.filter(item => item.currency === currency).reduce((total, item) => total + item.amount, 0);
const totals = { JPY: sum("JPY"), TWD: sum("TWD") };
const format = (amount: number, currency: Currency) => `${currency === "JPY" ? "¥" : "NT$"}${new Intl.NumberFormat("zh-TW").format(amount)}`;

export default function TravelBudget() {
  const [panel, setPanel] = useState<"plan" | "actual">("plan");
  return <section className="content-section travel-budget">
    <div className="section-heading"><span>TRAVEL MONEY</span><h2>旅費筆記</h2><p>先掌握整趟規劃，再記下旅途中的每筆花費。</p></div>
    <div className="budget-switch" role="group" aria-label="選擇旅費內容">
      <button type="button" aria-pressed={panel === "plan"} onClick={() => setPanel("plan")}>旅程預算</button>
      <button type="button" aria-pressed={panel === "actual"} onClick={() => setPanel("actual")}>實際記帳與分帳</button>
    </div>
    <div hidden={panel !== "plan"}>
      <div className="budget-overview">
        <div className="budget-grand"><span>六天五夜 · 規劃總額</span><strong><small>約</small> {format(Math.round(totals.JPY * RATE) + totals.TWD, "TWD")}</strong><p>包含已購項目、住宿及預估花費</p></div>
        <dl className="budget-currency-totals"><div><dt>日圓項目合計</dt><dd>{format(totals.JPY, "JPY")}</dd></div><div><dt>台幣項目合計</dt><dd>{format(totals.TWD, "TWD")}</dd></div></dl>
      </div>
      <p className="budget-rate">試算匯率 1 JPY = NT${RATE} · 沿用原規劃，實際扣款以帳單為準。此總額不是尚待付款金額。</p>
      <div className="budget-detail-groups">{(["JPY", "TWD"] as Currency[]).map(currency => <section className="budget-currency-group" key={currency} aria-labelledby={`budget-${currency}`}>
        <header><div><span>{currency === "JPY" ? "JAPANESE YEN" : "TAIWAN DOLLAR"}</span><h3 id={`budget-${currency}`}>{currency === "JPY" ? "日圓費用" : "台幣費用"}</h3></div><strong>{format(totals[currency], currency)}</strong></header>
        <ul className="budget-cost-list">{costs.filter(item => item.currency === currency).map(item => <li key={item.name}>
          <div className="budget-cost-top"><h4>{item.name}</h4><b>{format(item.amount, currency)}</b></div>
          <span className={`budget-payment-status ${item.tone}`}>{item.status}</span><p>{item.note}</p>
        </li>)}</ul>
      </section>)}</div>
      <aside className="budget-accounting-note"><b>預算與記帳各自計算</b><p>本表整理目前規劃；尚未列出的景點門票與額外消費，請另行預留。實際記帳不會自動加進上方總額，也不會自動扣除預算。</p><button type="button" onClick={() => setPanel("actual")}>開始記錄實際支出 →</button></aside>
    </div>
    <div hidden={panel !== "actual"}><ExpenseTracker /></div>
  </section>;
}
