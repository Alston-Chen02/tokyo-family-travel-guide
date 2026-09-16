import { DAYS, type DayPlan, type ItineraryStop } from './data';

const originalMonday = DAYS[2];
const originalTuesday = DAYS[3];

const stop = (day: DayPlan, id: string): ItineraryStop => {
  const found = day.stops.find(item => item.id === id);
  if (!found) throw new Error(`Missing itinerary stop: ${id}`);
  return found;
};

const monday: DayPlan = {
  ...originalMonday,
  theme: '風雨備案・巨蛋室內樂園與東京車站',
  cityLabel: '舞濱 ➔ 東京・水道橋（入住東京巨蛋飯店）',
  cityKey: 'tokyo',
  stops: [
    stop(originalMonday, 'd3s1'),
    {
      id: 'swap-d3-transfer', time: '09:30 - 10:45', title: '舞濱前往東京巨蛋城',
      subtitle: '先完成希爾頓退房與 Airporter 行李交付',
      description: '從舞濱搭 JR 京葉線到東京站，轉乘東京 Metro 丸之內線至後樂園；抵達東京巨蛋城後先確認 ASOBono! 入場狀況。若強風或列車停駛，留在安全場所，勿為趕行程移動。',
      highlights: ['舞濱 → 東京站', '丸之內線 → 後樂園', '先確認交通運行', '大行李照原訂配送'],
      transport: { type: 'train', label: 'JR + 東京 Metro', route: '舞濱 → 東京 → 後樂園 → ASOBono!', duration: '約 60–75 分，依運行狀況' },
      mapQuery: 'ASOBono Tokyo Dome City', cityKey: 'tokyo', meal: '—', cost: '交通費依當日票價',
    },
    {
      ...stop(originalTuesday, 'd4s2'),
      time: '10:45 - 12:45',
      description: '抵達東京巨蛋城後進入 ASOBono! 室內遊樂區。9/21 為日本假日，入場與使用時間依當日票種及現場人流調整；如果交通或場館受風雨影響，改為飯店附近室內休息，不勉強移動。',
      transport: { type: 'walk', label: '步行', route: '後樂園站／水道橋站 → ASOBono!', duration: '依抵達出口' },
      meal: '—',
      cost: '依 9/21 官方票價與票種',
    },
    {
      id: 'swap-d3-rest', time: '12:45 - 15:00', title: '巨蛋城午餐與室內休息',
      subtitle: '尚未入住客房，不把飯店午睡當成已確認安排',
      description: '在東京巨蛋城找親子友善餐點及座位，讓孩子休息與補水；先向飯店確認能否提早入住，未獲確認前以 15:00 後進房為準。若雨勢增強，取消跨區購物。',
      highlights: ['親子午餐', '補水與休息', '可詢問提早入住', '不預設已有客房'],
      transport: { type: 'walk', label: '館區步行', route: 'ASOBono! → 東京巨蛋城／東京巨蛋飯店', duration: '約 5–10 分' },
      mapQuery: 'Tokyo Dome Hotel', cityKey: 'tokyo', meal: '午餐：巨蛋城室內餐飲', cost: '依實際消費',
    },
    {
      ...stop(originalMonday, 'd3s5'),
      time: '15:00 - 16:00',
      description: '15:00 後於東京巨蛋飯店辦理入住，確認 Airporter 行李送達安排。先讓孩子在客房休息；若飯店延後交房或行李配送受天候影響，以飯店及配送業者通知為準。',
      highlights: ['15:00 後入住', '確認行李配送', '孩子客房休息'],
      transport: { type: 'walk', label: '步行', route: '東京巨蛋城 → 東京巨蛋飯店', duration: '約 3–5 分' },
      cost: '已含於住宿費',
    },
    {
      ...stop(originalTuesday, 'd4s4'),
      time: '16:00 - 18:00',
      title: '可選：東京車站一番街',
      description: '只有在風雨趨緩、交通正常且孩子休息足夠時，才由後樂園搭丸之內線往返東京站購物。若仍有強風、警報或列車異動，直接留在巨蛋飯店周邊，這站可以整段略過。',
      highlights: ['天候安全才出發', '丸之內線往返', '可整段略過', '不影響飯店入住'],
      transport: { type: 'train', label: '東京 Metro 丸之內線', route: '後樂園站 ↔ 東京站', duration: '單程約 9 分＋步行' },
    },
    {
      ...stop(originalMonday, 'd3s7'),
      time: '18:00 - 19:30',
      description: '在東京巨蛋飯店周邊的室內餐飲區或超市採買晚餐，帶回客房用餐。若天氣惡劣，避免為了購物而跨區移動。',
    },
  ],
};

const tuesday: DayPlan = {
  ...originalTuesday,
  theme: '風雨備案・大宮鐵道博物館',
  cityLabel: '東京・水道橋 ➔ 埼玉・大宮 ➔ 水道橋',
  cityKey: 'omiya',
  stops: [
    { ...stop(originalTuesday, 'd4s1'), time: '08:00 - 09:00' },
    {
      id: 'swap-d4-transfer', time: '09:15 - 10:30', title: '東京巨蛋飯店前往大宮鐵道博物館',
      subtitle: '由水道橋出發，不再使用原行程的舞濱路線',
      description: '從水道橋搭 JR 中央・總武線至秋葉原，轉 JR 京濱東北線前往大宮；也可依當日 JR 公告選擇更快的轉乘。於大宮站轉 New Shuttle 至「鐵道博物館站」，出站步行約 1 分鐘。若鐵路受颱風影響，取消大宮行程。',
      highlights: ['水道橋 → 秋葉原 → 大宮', '大宮轉 New Shuttle', '博物館站步行約 1 分', '出發前確認運行'],
      transport: { type: 'train', label: 'JR + New Shuttle', route: '水道橋 → 秋葉原 → 大宮 → 鐵道博物館站', duration: '約 65–80 分，依運行狀況' },
      mapQuery: 'Railway Museum Saitama', cityKey: 'omiya', meal: '—', cost: '交通費依當日票價',
    },
    { ...stop(originalMonday, 'd3s3'), time: '10:30 - 12:30' },
    stop(originalMonday, 'd3s3a'),
    {
      ...stop(originalMonday, 'd3s3b'), time: '13:30 - 15:00',
      title: '館內午後體驗；戶外區視天候略過',
      description: '午餐後優先探索館內展示與 JR 路線模擬器。迷你駕駛等指定體驗以當日預約結果為準；若仍有強風或大雨，直接略過戶外電車區。',
      highlights: ['館內展示', '模擬器依預約', '戶外區視天候略過', '不為體驗冒險'],
    },
    {
      ...stop(originalMonday, 'd3s4'),
      time: '15:00 - 15:45', title: '可選：大宮站周邊短暫採買',
      description: '回到大宮站後，如天候及孩子體力允許，短暫逛站內商店；若列車班次受影響，直接搭車返回水道橋，不為購物延後返程。',
      highlights: ['大宮站內', '可直接略過', '優先確認返程列車'],
      transport: { type: 'train', label: 'New Shuttle', route: '鐵道博物館站 → 大宮站', duration: '約 3 分＋步行' },
      meal: '點心視當日需要', cost: '依實際消費',
    },
    {
      id: 'swap-d4-return', time: '15:45 - 17:15', title: '大宮返回東京巨蛋飯店',
      subtitle: '原住宿不變，當晚仍住東京巨蛋飯店',
      description: '從大宮搭 JR 返回秋葉原，轉中央・總武線至水道橋，再步行回東京巨蛋飯店。實際車次以 JR 即時運行資訊為準；若風雨轉強，提早離開博物館。',
      highlights: ['大宮 → 秋葉原 → 水道橋', '回原飯店休息', '留轉乘緩衝'],
      transport: { type: 'train', label: 'JR + 步行', route: '大宮 → 秋葉原 → 水道橋 → 東京巨蛋飯店', duration: '約 60–75 分，依運行狀況' },
      mapQuery: 'Tokyo Dome Hotel', cityKey: 'tokyo', meal: '—', cost: '交通費依當日票價',
    },
    { ...stop(originalTuesday, 'd4s6'), time: '18:00 - 19:30' },
  ],
};

export const WEATHER_SWAP_DAYS: DayPlan[] = DAYS.map(day =>
  day.id === 'd3' ? monday : day.id === 'd4' ? tuesday : day
);
