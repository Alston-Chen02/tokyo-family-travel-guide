import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { createClient, type Session } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || "https://vpjfubcgdnoetawguogf.supabase.co",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_69_rjdfJs_Lt13c4UqU64Q_yvd6Hp2Q",
);

type Currency = "JPY" | "TWD";
type Sharing = "shared" | "private";
type Category = "food" | "transport" | "shopping" | "tickets" | "lodging" | "other";
type Member = { user_id: string; display_name: string };
type Expense = {
  id: string;
  created_by: string;
  occurred_on: string;
  merchant: string;
  amount: number;
  currency: Currency;
  category: Category;
  sharing: Sharing;
  payer_share_percent: number;
  note: string;
};

const categoryLabels: Record<Category, string> = {
  food: "餐飲", transport: "交通", shopping: "購物", tickets: "門票", lodging: "住宿", other: "其他",
};
const categories = Object.keys(categoryLabels) as Category[];
const tripToday = () => new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());
const formatAmount = (value: number, currency: Currency) =>
  `${currency === "JPY" ? "¥" : "NT$"}${new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 2 }).format(value)}`;

export default function ExpenseTracker() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState(tripToday);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("JPY");
  const [category, setCategory] = useState<Category>("food");
  const [sharing, setSharing] = useState<Sharing>("shared");
  const [payerShare, setPayerShare] = useState(50);
  const [note, setNote] = useState("");

  const refresh = useCallback(async () => {
    const [memberResult, expenseResult] = await Promise.all([
      supabase.from("trip_members").select("user_id,display_name"),
      supabase.from("expenses").select("id,created_by,occurred_on,merchant,amount,currency,category,sharing,payer_share_percent,note")
        .order("occurred_on", { ascending: false }).order("id", { ascending: false }),
    ]);
    if (memberResult.error || expenseResult.error) {
      setMessage(`讀取記帳資料失敗：${memberResult.error?.message || expenseResult.error?.message}`);
    } else {
      setMembers((memberResult.data || []) as Member[]);
      setExpenses((expenseResult.data || []).map(row => ({ ...row, amount: Number(row.amount) })) as Expense[]);
      setMessage("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setMembers([]); setExpenses([]); setLoading(false); return; }
    setLoading(true);
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 15_000);
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, [session, refresh]);

  const me = members.find(member => member.user_id === session?.user.id);
  const other = members.find(member => member.user_id !== session?.user.id);
  const totals = useMemo(() => {
    const result: Record<Currency, { shared: number; private: number; net: number; byCategory: Record<Category, number> }> = {
      JPY: { shared: 0, private: 0, net: 0, byCategory: Object.fromEntries(categories.map(key => [key, 0])) as Record<Category, number> },
      TWD: { shared: 0, private: 0, net: 0, byCategory: Object.fromEntries(categories.map(key => [key, 0])) as Record<Category, number> },
    };
    for (const expense of expenses) {
      const row = result[expense.currency];
      row.byCategory[expense.category] += expense.amount;
      if (expense.sharing === "private") row.private += expense.amount;
      else {
        row.shared += expense.amount;
        const otherShare = expense.amount * (100 - expense.payer_share_percent) / 100;
        row.net += expense.created_by === session?.user.id ? otherShare : -otherShare;
      }
    }
    return result;
  }, [expenses, session?.user.id]);

  const sendLink = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: {
      emailRedirectTo: window.location.origin + window.location.pathname,
      shouldCreateUser: false,
    } });
    setBusy(false);
    if (error) setMessage(`登入信寄送失敗：${error.message}`);
    else setSent(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!me || !merchant.trim() || !Number.isFinite(value) || value <= 0 || !date) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.from("expenses").insert({
      created_by: me.user_id, occurred_on: date, merchant: merchant.trim(), amount: value,
      currency, category, sharing, payer_share_percent: sharing === "shared" ? payerShare : 100, note: note.trim(),
    });
    setBusy(false);
    if (error) setMessage(`儲存失敗：${error.message}`);
    else { setMerchant(""); setAmount(""); setNote(""); await refresh(); }
  };

  const remove = async (expense: Expense) => {
    if (!window.confirm(`刪除「${expense.merchant}」這筆支出？`)) return;
    setBusy(true);
    const { error } = await supabase.from("expenses").delete().eq("id", expense.id);
    setBusy(false);
    if (error) setMessage(`刪除失敗：${error.message}`);
    else await refresh();
  };

  return <section className="expense-ledger" aria-label="即時旅費記帳">
    <div className="section-heading compact"><span>LIVE EXPENSES</span><h2>旅途中，隨手記下每一筆。</h2><p>實際支出與上方旅程預算分開計算。資料同步至 Supabase。</p></div>
    {!session ? <div className="expense-panel"><h3>登入後開始記帳</h3><p>請使用旅程成員的電子郵件收取登入連結。</p><form className="expense-login" onSubmit={sendLink}><label>電子郵件<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label><button disabled={busy} type="submit">{busy ? "寄送中…" : "寄送登入連結"}</button></form>{sent && <p role="status">登入連結已寄出，請在同一台裝置開啟郵件。</p>}</div> : <>
      <div className="expense-session"><span>已登入：{me?.display_name || session.user.email || "旅程成員"}</span><button type="button" onClick={() => { void supabase.auth.signOut(); }}>登出</button></div>
      {loading ? <p>讀取記帳資料中…</p> : !me ? <div className="expense-panel"><p>此帳號尚未列入旅程成員，無法查看或新增支出。請先由管理者在 Supabase 指定兩位成員。</p></div> : <>
        <div className="expense-summary">{(["JPY", "TWD"] as Currency[]).map(unit => <article key={unit}><small>{unit} · 本次記錄</small><b>{formatAmount(totals[unit].shared, unit)}</b><span>共用支出</span><p>我的私人支出 {formatAmount(totals[unit].private, unit)}</p>{other && <p>{Math.abs(totals[unit].net) < 0.005 ? "目前無須分帳" : totals[unit].net > 0 ? `${other.display_name} 應付我 ${formatAmount(totals[unit].net, unit)}` : `我應付 ${other.display_name} ${formatAmount(-totals[unit].net, unit)}`}</p>}</article>)}</div>
        <div className="expense-layout"><form className="expense-panel expense-form" onSubmit={save}><h3>新增支出</h3><div className="expense-fields"><label>日期<input type="date" required value={date} onChange={event => setDate(event.target.value)} /></label><label>店家／用途<input required maxLength={120} value={merchant} onChange={event => setMerchant(event.target.value)} placeholder="例如：午餐" /></label><label>金額<input type="number" inputMode="decimal" min="0.01" step="0.01" required value={amount} onChange={event => setAmount(event.target.value)} /></label><label>幣別<select value={currency} onChange={event => setCurrency(event.target.value as Currency)}><option value="JPY">日圓 JPY</option><option value="TWD">台幣 TWD</option></select></label><label>分類<select value={category} onChange={event => setCategory(event.target.value as Category)}>{categories.map(key => <option key={key} value={key}>{categoryLabels[key]}</option>)}</select></label><label>用途<select value={sharing} onChange={event => setSharing(event.target.value as Sharing)}><option value="shared">共用 · 後續分帳</option><option value="private">私人 · 僅自己可見</option></select></label>{sharing === "shared" && <label>我負擔比例：{payerShare}%<input type="range" min="0" max="100" step="5" value={payerShare} onChange={event => setPayerShare(Number(event.target.value))} /><small>另一位負擔 {100 - payerShare}%</small></label>}<label className="expense-wide">備註<input maxLength={500} value={note} onChange={event => setNote(event.target.value)} /></label></div><p className="expense-ocr-note">收據拍照辨識將於 Google Cloud 完成設定後啟用；目前可直接手動輸入。</p><button disabled={busy} type="submit">{busy ? "儲存中…" : "儲存這筆支出"}</button></form>
          <div className="expense-panel"><h3>支出明細</h3>{expenses.length === 0 ? <p>目前沒有支出記錄。</p> : <ul className="expense-list">{expenses.map(expense => <li key={expense.id}><div><small>{expense.occurred_on} · {categoryLabels[expense.category]} · {expense.sharing === "shared" ? "共用" : "私人"}</small><b>{expense.merchant}</b><span>{members.find(member => member.user_id === expense.created_by)?.display_name || "我"}{expense.note ? ` · ${expense.note}` : ""}</span></div><strong>{formatAmount(expense.amount, expense.currency)}</strong>{expense.created_by === me.user_id && <button type="button" disabled={busy} onClick={() => { void remove(expense); }} aria-label={`刪除 ${expense.merchant} 支出`}>刪除</button>}</li>)}</ul>}</div></div>
        <div className="expense-categories"><h3>我可見的支出分類</h3><p>包含共用支出與自己的私人支出。</p>{(["JPY", "TWD"] as Currency[]).map(unit => <div key={unit}><small>{unit}</small>{categories.filter(key => totals[unit].byCategory[key] > 0).map(key => <span key={key}>{categoryLabels[key]} {formatAmount(totals[unit].byCategory[key], unit)}</span>)}</div>)}</div>
      </>}
    </>}
    {message && <p className="expense-message" role="alert">{message}</p>}
  </section>;
}
