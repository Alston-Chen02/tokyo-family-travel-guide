import { useEffect, useRef, useState, type FormEvent } from "react";
import { createVault, deleteQrImage, getVaultMeta, loadQrImage, QR_SLOTS, resetVault, saveQrImage, SKYLINER_SLOT, unlockVault, type QrSlot } from "./privateQrStore";

type Entry = { name: string; image: Blob };

async function prepareQrImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width > 10_000 || bitmap.height > 10_000 || bitmap.width * bitmap.height > 40_000_000) {
      throw new Error("圖片尺寸過大，請先縮小截圖");
    }
    // The supplied Visit Japan Web desktop screenshots place the QR above the page center.
    if (bitmap.width / bitmap.height < 1.7 || bitmap.width < 1200) return file;
    const side = Math.min(bitmap.width * .26, bitmap.height * .72);
    const x = (bitmap.width - side) / 2;
    const y = Math.max(0, Math.min(bitmap.height - side, bitmap.height * .36 - side / 2));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(side);
    canvas.height = Math.round(side);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("此瀏覽器無法裁切圖片");
    context.drawImage(bitmap, x, y, side, side, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error("圖片裁切失敗")), "image/png"));
    return new File([blob], "visit-japan-qr.png", { type: "image/png" });
  } finally {
    bitmap.close();
  }
}

const ALL_SLOTS: readonly QrSlot[] = [...QR_SLOTS, SKYLINER_SLOT];

export default function QrVault({ onClose, initialSlot }: { onClose: () => void; initialSlot?: QrSlot }) {
  const [phase, setPhase] = useState<"loading" | "setup" | "locked" | "ready">("loading");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [entries, setEntries] = useState<Partial<Record<QrSlot, Entry>>>({});
  const [names, setNames] = useState<Partial<Record<QrSlot, string>>>({});
  const [viewer, setViewer] = useState<{ slot: QrSlot; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let mounted = true;
    getVaultMeta().then(meta => { if (mounted) setPhase(meta ? "locked" : "setup"); })
      .catch(error => { if (mounted) setMessage(error instanceof Error ? error.message : "無法開啟本機保管箱"); });
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      mounted = false;
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), a[href]") || [])]
          .filter(element => element.getClientRects().length > 0);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!dialogRef.current?.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if (event.key === "Escape") {
        if (viewer) setViewer(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, viewer]);

  useEffect(() => () => { if (viewer) URL.revokeObjectURL(viewer.url); }, [viewer]);

  const openEntry = (slot: QrSlot) => {
    const entry = entries[slot];
    if (entry) setViewer({ slot, url: URL.createObjectURL(entry.image) });
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (phase === "setup" && (password.length < 4 || password !== confirmation)) {
      setMessage(password.length < 4 ? "密碼至少需要 4 個字元" : "兩次輸入的密碼不一致");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const meta = await getVaultMeta();
      const unlocked = meta ? await unlockVault(password, meta) : await createVault(password);
      const loaded = await Promise.all(ALL_SLOTS.map(slot => loadQrImage(slot, unlocked)));
      const next: Partial<Record<QrSlot, Entry>> = {};
      loaded.forEach((entry, index) => { if (entry) next[ALL_SLOTS[index]] = entry; });
      setEntries(next);
      setNames(Object.fromEntries(QR_SLOTS.map(slot => [slot, next[slot]?.name || ""])));
      setKey(unlocked);
      setPassword("");
      setConfirmation("");
      setPhase("ready");
      if (initialSlot === SKYLINER_SLOT && next[SKYLINER_SLOT]) {
        setViewer({ slot: SKYLINER_SLOT, url: URL.createObjectURL(next[SKYLINER_SLOT].image) });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "無法解鎖 QR 保管箱");
    } finally {
      setBusy(false);
    }
  };

  const importImage = async (slot: QrSlot, file: File | undefined) => {
    if (!key || !file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setMessage("請選擇小於 10 MB 的 PNG、JPG 或 WebP 圖片");
      return;
    }
    const isTicket = slot === SKYLINER_SLOT;
    const name = isTicket ? "京成 Skyliner · 兌換 QR" : (names[slot] || "").trim().slice(0, 60);
    if (!name) { setMessage(`請先輸入旅客 ${slot} 的姓名`); return; }
    if (entries[slot] && !window.confirm(`要覆蓋已儲存的${isTicket ? "京成 Skyliner 兌換 QR" : `旅客 ${slot} QR`}嗎？`)) return;
    setBusy(true);
    setMessage("");
    try {
      if (isTicket) {
        const bitmap = await createImageBitmap(file);
        const tooWide = bitmap.width > bitmap.height * 1.5;
        bitmap.close();
        if (tooWide) throw new Error("請匯入京成購買完成信的 QR Code 圖片附件，不要匯入整頁截圖，避免縮小後無法掃描");
      }
      const prepared = isTicket ? file : await prepareQrImage(file);
      await saveQrImage(slot, key, prepared, name);
      setEntries(previous => ({ ...previous, [slot]: { image: prepared, name } }));
      setMessage(isTicket ? "京成 Skyliner 兌換 QR 已加密儲存在這台裝置；請放大確認可掃描" : `旅客 ${slot} 已加密儲存在這台裝置；請放大確認 QR 完整可掃描`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "儲存失敗，請確認瀏覽器仍有可用空間");
    } finally {
      setBusy(false);
    }
  };

  const saveName = async (slot: QrSlot) => {
    if (slot === SKYLINER_SLOT) return;
    const entry = entries[slot];
    const name = (names[slot] || "").trim().slice(0, 60);
    if (!key || !entry || !name) return;
    setBusy(true);
    try {
      await saveQrImage(slot, key, new File([entry.image], "visit-japan-qr.png", { type: entry.image.type }), name);
      setEntries(previous => ({ ...previous, [slot]: { ...entry, name } }));
      setMessage(`旅客 ${slot} 的姓名已加密更新`);
    } catch { setMessage("姓名儲存失敗，請重試"); }
    finally { setBusy(false); }
  };

  const removeImage = async (slot: QrSlot) => {
    const label = slot === SKYLINER_SLOT ? "京成 Skyliner 兌換 QR" : `旅客 ${slot} 的入境 QR`;
    if (!window.confirm(`確定移除${label}？請先確認你仍有原始圖片。`)) return;
    setBusy(true);
    try {
      await deleteQrImage(slot);
      if (viewer?.slot === slot) setViewer(null);
      setEntries(previous => { const next = { ...previous }; delete next[slot]; return next; });
      setNames(previous => ({ ...previous, [slot]: "" }));
      setMessage(`${label}已從此瀏覽器移除`);
    } catch { setMessage("無法移除，請重試"); }
    finally { setBusy(false); }
  };

  const clearAll = async () => {
    if (!window.confirm("這會刪除此瀏覽器的入境 QR、京成車票兌換 QR 與密碼設定，且無法還原。確定重設嗎？")) return;
    setBusy(true);
    try {
      await resetVault();
      setViewer(null);
      setKey(null);
      setEntries({});
      setNames({});
      setPassword("");
      setPhase("setup");
      setMessage("已清除本機 QR，請重新設定密碼及匯入圖片");
    } catch { setMessage("無法清除，請重試"); }
    finally { setBusy(false); }
  };

  const ticketCard = <article className="qr-ticket-card">
    <div><b>京成 Skyliner · 兌換 QR</b><span>{entries[SKYLINER_SLOT] ? "已儲存 · 可離線顯示" : "尚未匯入"}</span></div>
    <p>請從京成購買完成信下載「QR Code (e-ticket exchange number).png」附件，直接匯入這台手機。這是櫃檯換票憑證，不是直接進閘車票；保留原信件作備份。</p>
    <div className="qr-slot-actions">{entries[SKYLINER_SLOT] && <button type="button" onClick={() => openEntry(SKYLINER_SLOT)}>放大顯示兌換 QR</button>}
      <label className="qr-file-button">{entries[SKYLINER_SLOT] ? "更換 QR 圖片" : "匯入 QR 圖片"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => { void importImage(SKYLINER_SLOT, event.target.files?.[0]); event.target.value = ""; }} /></label>
      {entries[SKYLINER_SLOT] && <button type="button" className="qr-danger" disabled={busy} onClick={() => void removeImage(SKYLINER_SLOT)}>移除</button>}
    </div>
  </article>;

  return <div className="qr-backdrop">
    <section ref={dialogRef} className={`qr-dialog ${viewer ? "showing" : ""}`} role="dialog" aria-modal="true" aria-labelledby="qr-title">
      <header className="qr-dialog-header"><div><small>PRIVATE · ON THIS DEVICE</small><h2 id="qr-title">{initialSlot === SKYLINER_SLOT ? "京成 Skyliner · 兌換 QR" : "離線 QR 保管箱"}</h2></div><button ref={closeRef} type="button" onClick={onClose} aria-label="關閉並鎖定 QR 保管箱">關閉並鎖定 ×</button></header>
      {viewer ? <div className="qr-fullscreen">
        <h3>{entries[viewer.slot]?.name || `旅客 ${viewer.slot}`}</h3>
        <img className={viewer.slot === SKYLINER_SLOT ? "ticket-qr-image" : undefined} src={viewer.url} alt={viewer.slot === SKYLINER_SLOT ? "京成 Skyliner 車票兌換 QR 圖片" : `${entries[viewer.slot]?.name || `旅客 ${viewer.slot}`} 的入境審查及海關申報 QR 圖片`} />
        {viewer.slot === SKYLINER_SLOT && <p className="qr-ticket-note">在指定換票地點出示；此 QR 並非直接進閘車票。請保留京成原始郵件備用。</p>}
        <div className="qr-viewer-actions"><button type="button" onClick={() => setViewer(null)}>返回 QR 清單</button><button type="button" onClick={onClose}>出示完成 · 鎖定</button></div>
      </div> : <>
        <p className="qr-privacy">QR 圖片與姓名以密碼加密後只存在此裝置的瀏覽器，不會寫入公開網站或同步至其他裝置。密碼至少 4 個字元；建議使用更長的密碼並啟用手機螢幕鎖。關閉後需重新輸入密碼；若清除瀏覽器資料或忘記密碼，需重新匯入。京成車票請匯入郵件中的 QR 專用附件；Visit Japan Web 橫式截圖會自動裁切，匯入後請逐張放大確認並保留原始檔案備份。</p>
        {phase === "loading" ? <p>正在檢查本機保管箱…</p> : phase === "ready" ? <>
          {initialSlot === SKYLINER_SLOT && <div className="qr-slots">{ticketCard}</div>}
          <div className="qr-slots">{QR_SLOTS.map(slot => <article key={slot}>
            <div><b>旅客 {slot}</b><span>{entries[slot] ? "已儲存 · 可離線顯示" : "尚未匯入"}</span></div>
            <label>旅客姓名（匯入／儲存後僅本機加密保存）<input value={names[slot] || ""} maxLength={60} onChange={event => setNames(previous => ({ ...previous, [slot]: event.target.value }))} placeholder="請輸入護照上的姓名" /></label>
            <div className="qr-slot-actions">{entries[slot] && <button type="button" onClick={() => openEntry(slot)}>放大顯示 QR</button>}
              {entries[slot] && entries[slot]?.name !== (names[slot] || "").trim() && <button type="button" disabled={busy || !(names[slot] || "").trim()} onClick={() => void saveName(slot)}>儲存姓名</button>}
              <label className="qr-file-button">{entries[slot] ? "更換截圖" : "匯入截圖"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => { void importImage(slot, event.target.files?.[0]); event.target.value = ""; }} /></label>
              {entries[slot] && <button type="button" className="qr-danger" disabled={busy} onClick={() => void removeImage(slot)}>移除</button>}
            </div>
          </article>)}</div>
          {initialSlot !== SKYLINER_SLOT && <div className="qr-slots qr-ticket-after-travelers">{ticketCard}</div>}
          <button type="button" className="qr-reset" disabled={busy} onClick={() => void clearAll()}>忘記密碼／清除此裝置的 QR</button>
        </> : <form className="qr-password-form" onSubmit={event => void submitPassword(event)}>
          <h3>{phase === "setup" ? "設定這台裝置的 QR 密碼" : "輸入密碼以開啟 QR"}</h3>
          <label>密碼<input type="password" autoComplete={phase === "setup" ? "new-password" : "current-password"} required minLength={phase === "setup" ? 4 : undefined} value={password} onChange={event => setPassword(event.target.value)} /></label>
          {phase === "setup" && <label>再次輸入密碼<input type="password" autoComplete="new-password" required value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label>}
          <button type="submit" disabled={busy}>{busy ? "處理中…" : phase === "setup" ? "設定密碼並開始匯入" : "解鎖 QR"}</button>
          {phase === "locked" && <button type="button" className="qr-reset" disabled={busy} onClick={() => void clearAll()}>忘記密碼？清除此裝置的 QR 並重設</button>}
        </form>}
        <p className="qr-message" role="status">{message}</p>
      </>}
    </section>
  </div>;
}
