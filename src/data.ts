export type TransportType = 'walk' | 'train' | 'shinkansen' | 'taxi' | 'flight' | 'bus' | 'boat';

export interface TransportInfo {
  type: TransportType;
  label: string;
  route: string;
  duration: string;
}

export interface ParentingTip {
  icon: string;
  text: string;
}

export interface ItineraryStop {
  id: string;
  time: string;
  title: string;
  subtitle?: string;
  description: string;
  highlights: string[];
  transport: TransportInfo;
  mapQuery: string;
  cityKey: CityKey;
  meal?: string;
  cost?: string;
  websiteUrl?: string;
  parentingTips?: ParentingTip[];
}

export type CityKey = 'tokyo' | 'urayasu' | 'omiya' | 'kinshicho';

export interface CityInfo {
  key: CityKey;
  name: string;
  nameJp: string;
  latitude: number;
  longitude: number;
}

export interface DayPlan {
  id: string;
  title: string;
  day: number;
  date: string;
  dateLabel: string;
  weekday: string;
  theme: string;
  cityLabel: string;
  cityKey: CityKey;
  stops: ItineraryStop[];
}

export const CITIES: Record<CityKey, CityInfo> = {
  tokyo: { key: 'tokyo', name: '東京', nameJp: '東京', latitude: 35.6762, longitude: 139.6503 },
  urayasu: { key: 'urayasu', name: '浦安', nameJp: '浦安', latitude: 35.6646, longitude: 139.9014 },
  omiya: { key: 'omiya', name: '大宮', nameJp: '大宮', latitude: 35.9079, longitude: 139.6263 },
  kinshicho: { key: 'kinshicho', name: '錦糸町', nameJp: '錦糸町', latitude: 35.6967, longitude: 139.8144 },
};

export const FLIGHTS = {
  outbound: {
    date: '2026/09/19',
    weekday: '六',
    airline: '長榮航空 EVA Air',
    flightNo: 'BR184',
    from: '台北 TPE',
    to: '東京成田 NRT',
    depart: '07:55',
    arrive: '12:25',
    aircraft: '波音 787-10',
    cabin: '皇璽桂冠艙',
    cabinCode: 'D 艙',
    duration: '約 3小時 30分',
    pnr: '6X5RQH',
    counter: '長榮專屬櫃檯 T1',
    passengers: [
      { type: 'adult', label: '大人 1', seat: '05D', meal: '🥩 皇璽桂冠艙獨享餐 (炙烤肋眼牛排 / 日式和食)', preOrder: '已網路預選' },
      { type: 'adult', label: '大人 2', seat: '05K', meal: '🦞 皇璽桂冠艙獨享餐 (龍蝦海鮮 / 網路預訂主廚餐)', preOrder: '已網路預選' },
      { type: 'child', label: '兒童', seat: '05G', meal: '🧸 兒童專屬餐 CHML (長榮 Hello Kitty/三麗鷗童趣餐)', preOrder: '已網路預選' },
    ],
    baggage: '2PC / 皇璽桂冠艙',
  },
  return: {
    date: '2026/09/24',
    weekday: '四',
    airline: '長榮航空 EVA Air',
    flightNo: 'BR197',
    from: '東京成田 NRT',
    to: '台北 TPE',
    depart: '14:25',
    arrive: '17:05',
    aircraft: '波音 787-10',
    cabin: '皇璽桂冠艙',
    cabinCode: 'D 艙',
    duration: '約 3小時 40分',
    pnr: '6X5RQH',
    counter: '長榮專屬櫃檯 T1',
    passengers: [
      { type: 'adult', label: '大人 1', seat: '05D', meal: '🥩 皇璽桂冠艙獨享餐 (炙烤肋眼牛排 / 日式和食)', preOrder: '已網路預選' },
      { type: 'adult', label: '大人 2', seat: '05K', meal: '🦞 皇璽桂冠艙獨享餐 (龍蝦海鮮 / 網路預訂主廚餐)', preOrder: '已網路預選' },
      { type: 'child', label: '兒童', seat: '05G', meal: '🧸 兒童專屬餐 CHML (長榮 Hello Kitty/三麗鷗童趣餐)', preOrder: '已網路預選' },
    ],
    baggage: '2PC / 皇璽桂冠艙',
  },
};

export const AIRFARE = {
  currency: 'TWD',
  total: 101025,
  breakdown: [
    { label: '大人', unitPrice: 35520, count: 2 },
    { label: '兒童', unitPrice: 29985, count: 1 },
  ],
};

export interface HotelInfo {
  id: string;
  name: string;
  nameJp: string;
  area: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  pricePerNight: number;
  currency: string;
  mapQuery: string;
  note: string;
  stars: number;
  website: string;
  facilities: string[];
  coverQuery: string;
  confirmationNo?: string;
  guestName?: string;
  checkInTime?: string;
  checkOutTime?: string;
  addressJp?: string;
  phone?: string;
}

export const HOTELS: HotelInfo[] = [
  {
    id: 'h1',
    name: '東京灣希爾頓酒店',
    nameJp: 'ヒルトン東京ベイ',
    area: '千葉・浦安',
    checkIn: '09/19',
    checkOut: '09/21',
    nights: 2,
    roomType: '豪華海景客房（雙床)',
    pricePerNight: 74114,
    currency: 'JPY',
    mapQuery: 'Tokyo Bay Maihama Hotel',
    note: '位於迪士尼度假區單軌海濱站對面!第二天玩迪士尼中場可搭單軌 5 分鐘回房睡午覺,寶寶體力不崩潰。',
    stars: 5,
    website: 'https://tokyobay.hiltonhotel.jp/',
    facilities: ['迪士尼度假區單軌海濱站對面', '豪華海景客房', '室內泳池與休憩設施', '24H FamilyMart 便利商店', '免費接駁巴士 Resort Cruiser', '迪士尼園區中途返房午休'],
    coverQuery: 'Hilton Tokyo Bay hotel exterior waterfront',
    confirmationNo: '3516233668',
    guestName: 'CHEN/HSU',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    addressJp: '千葉県浦安市舞浜1-8',
    phone: '047-355-5000',
  },
  {
    id: 'h2',
    name: '東京巨蛋飯店',
    nameJp: 'ホテル・TOKYO DOME HOTEL',
    area: '東京・文京區 (水道橋 / 後樂園)',
    checkIn: '09/21',
    checkOut: '09/23',
    nights: 2,
    roomType: '高樓層頂級房(35th-38th Floor Premium Room Twin)',
    pricePerNight: 41757,
    currency: 'JPY',
    mapQuery: 'Tokyo Dome Hotel',
    note: '位處市中心樞紐,35-38 樓高樓層視野,下樓直接連通 ASOBono! 全東京最大室內球池樂園。',
    stars: 5,
    website: 'https://www.tokyodome-hotels.co.jp/',
    facilities: ['35-38 樓高樓層夜景視野', '直通 ASOBono! 室內球池樂園', '東京巨蛋城 LaQua 商城步行 3 分', 'JR 水道橋站步行 2 分', '成城石井超市採買', '巨蛋城亮燈夜景'],
    coverQuery: 'Tokyo Dome Hotel building night city view',
    confirmationNo: '1759358828',
    guestName: 'CHEN/HSU',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    addressJp: '東京都文京区後楽1-3-61',
    phone: '03-5805-2222',
  },
  {
    id: 'h3',
    name: '東京錦糸町樂天城市飯店',
    nameJp: 'ロッテシティホテル錦糸町',
    area: '東京・墨田區 (錦糸町)',
    checkIn: '09/23',
    checkOut: '09/24',
    nights: 1,
    roomType: '塔樓小型套房(Towers Junior Suite)',
    pricePerNight: 57750,
    currency: 'JPY',
    mapQuery: 'Lotte City Hotel Kinshicho',
    note: '48-60㎡ 超大套房方便打包!地鐵站直通,對面即是阿卡將婦幼旗艦店,最後一天 JR 總武線快速免轉車直達成田機場。',
    stars: 4,
    website: 'https://lottecityhotel.jp/',
    facilities: ['48-60㎡ 超大套房', '對面即阿卡將婦幼旗艦店', '地鐵站直通零距離', 'JR 總武線快速免轉車直達成田', '塔樓小型套房寬敞打包', '錦糸町商圈生活機能便利'],
    coverQuery: 'Lotte City Hotel Kinshicho Tokyo building',
    confirmationNo: '3808-4905-6666',
    guestName: 'CHEN/HSU',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    addressJp: '東京都墨田区錦糸4-6-1',
    phone: '03-5619-1066',
  },
];

export const EMERGENCY_INFO = {
  hotlines: [
    { label: '警察 Police', number: '110', icon: 'shield' },
    { label: '救護車 Ambulance', number: '119', icon: 'heart' },
    { label: 'JNTO 中文旅客熱線', number: '050-3816-2787', icon: 'phone' },
    { label: '駐日代表處 TECRO', number: '+81-3-3280-7811', icon: 'globe' },
  ],
  insurance: {
    title: '海外旅平險 / 不便險',
    hotline: '0800-024-365 (24H)',
    policyNo: 'TRV-2026-0919-887',
    note: '航班延誤每 4 小時上限 NT$5,000 · 行李遺失上限 NT$20,000 · 海外突發醫療上限 NT$100 萬',
  },
};

export const RESERVATION_HUB = [
  {
    id: 'flight',
    title: '長榮航空 BR184／BR197',
    meta: '09/19 去程 · 09/24 回程',
    status: '已確認',
    note: 'PNR 與座位已收在機票卡；出發前再次確認航班與預選餐點。',
    url: 'https://www.evaair.com/zh-tw/manage-your-trip/',
    action: '管理行程',
  },
  {
    id: 'skyliner',
    title: '京成 Skyliner 電子憑證',
    meta: '09/19 成田機場 → 日暮里',
    status: '已預訂',
    note: '機場 B1 依憑證兌換劃位票；錯過 13:39 時改搭下一班，不硬追車。',
    url: 'https://www.keisei.co.jp/keisei/tetudou/skyliner/us/traffic/index.php',
    action: '班次與路線',
  },
  {
    id: 'disney',
    title: '東京迪士尼樂園',
    meta: '09/20 · 09:00–21:00（仍以當日公告為準）',
    status: '已購票',
    note: '入園後依序處理 DPA、Entry Request、Standby Pass 與行動點餐。',
    url: 'https://www.tokyodisneyresort.jp/en/tdr/guide/app_service.html',
    action: '官方 App 服務',
  },
  {
    id: 'railway',
    title: '大宮鐵道博物館',
    meta: '09/21 · 日本連假高人流',
    status: '待購票',
    note: '建議前一天前線上購票；指定模擬器／迷你駕駛另看體驗預約票。',
    url: 'https://www.railway-museum.jp/information/',
    action: '購票資訊',
  },
  {
    id: 'aquarium',
    title: '品川水族館（しながわ水族館）',
    meta: '09/23 · 10:00–17:00（16:30 最後入館）',
    status: '待購票',
    note: '9/23 為國定假日，海豚秀現行假日時刻為 10:45／12:30／14:00／15:30；主行程鎖定 10:45，10:30 前入座，出發前再查官方公告。',
    url: 'https://www.aquarium.gr.jp/calendar-holiday',
    action: '官方場次',
  },
];

export const EMERGENCY_PHRASES = [
  { zh: '孩子發燒了。', jp: '子どもが熱を出しています。' },
  { zh: '孩子一直嘔吐。', jp: '子どもが何度も吐いています。' },
  { zh: '可能是過敏反應。', jp: 'アレルギー反応かもしれません。' },
  { zh: '請幫我叫救護車。', jp: '救急車を呼んでください。' },
];

export const MEDICAL_SEARCHES = [
  { label: '舞濱飯店附近兒科', query: 'Hilton Tokyo Bay pediatric clinic' },
  { label: '水道橋飯店附近兒科', query: 'Tokyo Dome Hotel pediatric clinic' },
  { label: '錦糸町飯店附近兒科', query: 'Lotte City Hotel Kinshicho pediatric clinic' },
  { label: '附近急診／醫院', query: 'emergency hospital near me' },
];

export const LUGGAGE_AGENT = {
  name: 'LuggAgent 行李特工',
  currency: 'TWD',
  totalTwd: 2875,
  totalUsd: 88.80,
  status: 'paid',
};

export const AIRPORTER = {
  name: 'Airporter',
  orderId: '0809-4831',
  totalJpy: 6710,
  totalTwd: 1361,
  status: 'paid',
};

export const AIRPORT_TRANSFER = {
  name: 'Klook 機場專車',
  totalTwd: 3605,
  status: 'pending' as const,
};

export type LuggageStatus = 'paid' | 'pending' | 'included';

export interface LuggageRouteItem {
  from: string;
  to: string;
  method: string;
  date: string;
  note: string;
  cost?: string;
  status: LuggageStatus;
}

export const LUGGAGE_ROUTE: LuggageRouteItem[] = [
  {
    from: 'NRT 成田機場',
    to: '東京灣希爾頓飯店',
    method: 'LuggAgent 行李特工',
    date: '09/19',
    note: '機場交付 13:00 - 13:30 · 3 件大型行李',
    cost: '已付 US$88.80 / 折合 NT$2,875',
    status: 'paid',
  },
  {
    from: '東京灣希爾頓飯店',
    to: '東京巨蛋飯店',
    method: 'Airporter',
    date: '09/21',
    note: '09:00 前希爾頓寄放 ➔ 20:00 後巨蛋領取 · 掛牌填訂單號 0809-4831 · 上傳行李照片',
    cost: '已付 ¥6,710 / 折合 NT$1,361',
    status: 'paid',
  },
  {
    from: '東京巨蛋飯店',
    to: '東京樂天城市酒店',
    method: 'Airporter',
    date: '09/23',
    note: '09:00 退房時交寄 ➔ 同日 19:00 前送達錦糸町',
    cost: '預估每件 ¥2,200 / 折合約 NT$445',
    status: 'pending',
  },
  {
    from: '錦糸町酒店',
    to: '東京成田 NRT',
    method: 'Klook 機場專車接送',
    date: '09/24',
    note: '09/24 11:00 錦糸町上車 · 含 1 張嬰兒座椅',
    cost: '預估 NT$3,605',
    status: 'pending',
  },
];

const mkStop = (
  id: string,
  time: string,
  title: string,
  subtitle: string,
  description: string,
  highlights: string[],
  transport: TransportInfo,
  mapQuery: string,
  cityKey: CityKey,
  meal: string,
  cost?: string,
  websiteUrl?: string,
  parentingTips?: ParentingTip[],
): ItineraryStop => ({ id, time, title, subtitle, description, highlights, transport, mapQuery, cityKey, meal, cost, websiteUrl, parentingTips });

export const DAYS: DayPlan[] = [
  {
    id: 'd1',
    title: 'Day 1',
    day: 1,
    date: '2026-09-19',
    dateLabel: '09/19',
    weekday: '六',
    theme: '啟航東京 • 晴空塔水族館',
    cityLabel: '成田 ➔ 押上(晴空塔) ➔ 舞濱',
    cityKey: 'urayasu',
    stops: [
      mkStop('d1s1', '12:25', '成田機場抵達・入境手續', '皇璽桂冠艙優先出關',
        '抵達成田國際機場第一航廈，皇璽桂冠艙享優先入境審查與行李提領。完成入境後前往 B1 樓層購買 Skyliner 車票與行李托運飯店交付。',
        ['Skyliner 車票', 'Suica 西瓜卡', '日幣現金提領', '入境審查'],
        { type: 'flight', label: '長榮 BR184', route: 'TPE → NRT', duration: '3h 30m' },
        'Narita Airport Terminal 1', 'urayasu', '皇璽桂冠艙輕食', '預算依個人消費'),
      mkStop('d1s2', '13:39 - 14:18', '搭乘京成 Skyliner 32號前往日暮里', '成田機場 ➔ 日暮里 37 分鐘；再轉乘前往押上',
        'Skyliner 只直達日暮里／上野，不直達押上。預計搭 13:39 自成田機場第 1 航廈發車、14:18 抵達日暮里的班次，再轉乘前往押上／晴空塔。班機 12:25 抵達後仍須入境、領行李與交付托運；若來不及，直接改搭下一班，不讓全家在機場上演 F1。',
        ['Skyliner 劃位', '日暮里轉乘', '錯過即搭下一班', 'B1 憑證兌換'],
        { type: 'train', label: '京成 Skyliner 32號', route: '成田機場 → 日暮里；再轉乘押上', duration: 'Skyliner 37 分＋轉乘約 20 分' },
        'Keisei Skyliner Narita Airport', 'tokyo', 'KKday 電子憑證 (已預訂)', 'NT$472 / 人 (約 ¥2,520)',
        'https://www.keisei.co.jp/keisei/tetudou/skyliner/'),
      mkStop('d1s3', '15:00 - 17:00', '東京晴空塔展望台 & 墨田水族館', '晴空塔天望甲板+迴廊・水族館親子半日遊',
        '登上天望迴廊俯瞰東京全景，隨後前往 5F 墨田水族館欣賞企鵝與水母大水槽，親子互動性極高。',
        ['天望甲板+迴廊', '墨田水族館', '企鵝生態區'],
        { type: 'train', label: '京成/都營地鐵', route: '日暮里站 ➔ 押上站', duration: '約 15~20 分' },
        'Tokyo Skytree Tembo Galleria', 'tokyo', '下午茶:晴空塔咖啡廳', '晴空塔套票 ¥3,500/人 · 水族館 ¥2,700/人',
        'https://www.tokyo-skytree.jp/'),
      mkStop('d1s3b', '17:00 - 18:00', '晴空塔 Solamachi 必逛主題商店街', '東京晴空街道 Tokyo Solamachi (1F~5F)',
        '晚餐前於 3F/4F 逛街採買，集結寶可夢限定品、迪士尼與吉卜力精品，均可辦理退稅。',
        ['迪士尼專賣店 Disney Store (能退稅)', '寶可夢中心 晴空塔店 Pokémon Center (烈空坐展示)', '橡子共和國 Ghibli Store (吉卜力/龍貓專賣)'],
        { type: 'walk', label: '步行', route: '晴空塔 → Solamachi', duration: '—' },
        'Tokyo Solamachi', 'tokyo', '—', '預算依個人消費',
        'https://www.tokyo-solamachi.jp/'),
      mkStop('d1s4', '18:00 - 19:15', '晚餐：六厘舍 沾麵/拉麵（東京晴空塔店）', '東京晴空街道 Tokyo Solamachi 6F',
        '考量首日舟車勞頓，選在晴空塔 6F 享用東京極致濃郁沾麵名店。點餐機支援中文介面，用餐迅速方便，餐後可提早出發前往舞濱飯店辦理入住、養精蓄銳。',
        ['招牌濃郁沾麵', '中文點餐機', '親子快速用餐'],
        { type: 'walk', label: '步行', route: 'Solamachi 6F', duration: '—' },
        'Rokurinsha Tokyo Skytree Solamachi', 'tokyo', '晚餐:六厘舍沾麵', '餐費約 ¥1,000~¥1,500/人',
        'https://www.rokurinsha.com/'),
      mkStop('d1s5', '19:30', '前往舞濱・辦理希爾頓入住', '東京灣希爾頓飯店',
        '從晴空塔/押上站出發前往舞濱飯店，建議路線：1.【地鐵半藏門線】押上站 ➔ 大手町/東京站，轉乘【JR 京葉線】至舞濱站。2. 或搭乘【地鐵半藏門線】至錦糸町站，轉乘【JR 總武線】至西船橋站，再轉乘【JR 京葉線】直達舞濱站。抵達舞濱站南口後，可搭乘迪士尼度假區線單軌電車（或希爾頓免費接駁巴士）抵達東京灣希爾頓飯店辦理入住。',
        ['半藏門線', 'JR京葉線轉乘', '舞濱站接駁車', '希爾頓入住'],
        { type: 'train', label: '東京地鐵/JR', route: '押上站 ➔ 東京站 / 錦糸町站 ➔ 舞濱站', duration: '約 40~45 分' },
        'Hilton Tokyo Bay Maihama', 'urayasu', '—', 'IC 卡車資約 ¥500~¥760/人'),
    ],
  },
  {
    id: 'd2',
    title: 'Day 2',
    day: 2,
    date: '2026-09-20',
    dateLabel: '09/20',
    weekday: '日',
    theme: '夢幻童話 • 東京迪士尼樂園',
    cityLabel: '千葉・舞濱 (迪士尼樂園)',
    cityKey: 'urayasu',
    stops: [
      mkStop('d2s1', '06:30 - 07:00', '簡單早餐與 App 準備', '提早出發，避免週日入園人潮',
        '前一晚先把 3 人門票加入同一群組並登入 MyDisney。早上以快速吃完為原則，帶行動電源、薄外套或雨衣、飲水與孩子熟悉的點心。目標在公告開園前約 90 分鐘抵達入口。',
        ['3 人門票同一群組', 'MyDisney 已登入', '行動電源', '推車雨罩與孩子點心'],
        { type: 'walk', label: '步行', route: '酒店餐廳', duration: '—' },
        'Hilton Tokyo Bay', 'urayasu', '早餐:酒店簡單用餐', '已含於住宿費'),
      mkStop('d2s2', '約 07:15', '抵達樂園入口排隊', '東京灣希爾頓住客依一般入園隊伍排隊',
        '東京灣希爾頓不屬於 Happy Entry 適用的迪士尼飯店。兩位大人先分工：一人入園後操作 App，一人帶孩子與推車往探險樂園方向前進，避免在世界市集中央停下來找資料。實際開園時間於出發前一週再查官方 App。',
        ['一般入園隊伍', '大人先分工', '推車掛辨識物', '出發前再查開園時間'],
        { type: 'walk', label: '步行 / 接駁', route: '酒店 → 迪士尼', duration: '15 分' },
        'Tokyo Disneyland', 'urayasu', '—', '門票已購買',
        'https://www.tokyodisneyresort.jp/tdl/',
        [
          { icon: 'heart', text: '推車請加上醒目辨識物；設施入口須依演藝人員指示停放。' },
          { icon: 'phone', text: '排隊期間先確認 App 已登入，但 DPA 等園內服務須完成入園後才能操作。' },
        ]),
      mkStop('d2s3', '入園後 0 - 10 分', '先完成三項 App 任務', '一人操作手機，一人帶孩子往第一站',
        '優先購買「美女與野獸『城堡奇緣』」DPA，盡量選 11:30–13:30 或午後時段；視需求購買夜間電子大遊行 DPA；接著完成約 10:45–11:15 的行動點餐。40 週年優先入場卡已於 2026/08/31 結束，不列入當日規劃。',
        ['美女與野獸 DPA', '夜間遊行 DPA 視需要', '10:45 左右行動點餐', '不規劃 40 週年優先入場卡'],
        { type: 'walk', label: '園內步行', route: '園區內移動', duration: '—' },
        'Tokyo Disneyland World Bazaar', 'urayasu', '—', 'DPA 依當日價格與需求'),
      mkStop('d2s4', '開園 - 10:30', '探險樂園 → 西部樂園', '先玩可抱著孩子搭乘的低門檻設施',
        '依序體驗「叢林巡航」與「西部沿河鐵路」，兩者皆可讓孩子坐在大人腿上。若任一設施等待已超過約 25 分鐘，直接跳過並繼續往夢幻樂園，不為熱門成人設施跨區折返。',
        ['叢林巡航', '西部沿河鐵路', '可抱著孩子搭乘', '超過 25 分鐘就跳站'],
        { type: 'walk', label: '園內步行', route: '園區內移動', duration: '—' },
        'Tokyo Disneyland Adventureland', 'urayasu', '—', '—'),
      mkStop('d2s5', '10:30 - 13:00', '夢幻樂園：提早午餐與主目標', '午餐 → 親子設施 → 美女與野獸',
        '10:45 左右於紅心女王宴會大廳或已完成行動點餐的餐廳用餐，避開 12:00–13:30 尖峰。餐後依 DPA 時段體驗「美女與野獸『城堡奇緣』」；孩子須能在座位上維持穩定坐姿。鄰近備選只挑 1–2 項：小小世界、城堡旋轉木馬或小飛俠天空之旅。',
        ['10:45 提早午餐', '美女與野獸 DPA', '小小世界可抱乘', '旋轉木馬與小飛俠須自行坐穩'],
        { type: 'walk', label: '園內步行', route: '西部樂園 → 夢幻樂園', duration: '—' },
        'Tokyo Disneyland Fantasyland', 'urayasu', '午餐:園內主題餐', '預算依個人消費'),
      mkStop('d2s6', '13:00 - 15:30', '遊行與卡通城休息', '固定換尿布、補水與推車午睡',
        '依當日官方時刻，提前 30–45 分鐘在夢幻樂園或卡通城一側找遊行位置。遊行後走卡通城的唐老鴨汽船、遊戲區與卡通城嬰兒中心；若孩子已疲倦，直接省略排隊設施。',
        ['遊行提前找位置', '唐老鴨汽船', '卡通城嬰兒中心', '推車午睡'],
        { type: 'walk', label: '園內步行', route: '夢幻樂園 → 卡通城', duration: '—' },
        'Tokyo Disneyland Toontown', 'urayasu', '點心:孩子熟悉的點心', '預算依個人消費', undefined,
        [{ icon: 'heart', text: '這段以休息為主，不追設施數量；嬰兒中心可處理換尿布與孩子用餐。' }]),
      mkStop('d2s7', '15:30 - 18:30', '明日樂園 → 世界市集', '看體力選玩，17:00 前完成晚餐',
        '先看怪獸電力公司即時等待；孩子必須能自行坐穩。若身高已達 81 cm 且願意快速旋轉，再考慮杯麵歡樂之旅，否則跳過。17:00 前完成晚餐，之後回世界市集先買紀念品，避開閉園前商店尖峰。',
        ['怪獸電力公司須坐穩', '杯麵至少 81 cm', '17:00 前晚餐', '提早購物'],
        { type: 'walk', label: '園內步行', route: '卡通城 → 明日樂園 → 世界市集', duration: '—' },
        'Tokyo Disneyland Tomorrowland', 'urayasu', '晚餐:園內提前用餐', '預算依個人消費'),
      mkStop('d2s8', '夜間', '電子大遊行、城堡夜景與退園', '孩子狀態良好才加排低等待設施',
        '依當日官方時刻觀賞電子大遊行。散場後不逆向穿園，沿世界市集直接退園；搭迪士尼度假區線或 Resort Cruiser 返回東京灣希爾頓，約 5–10 分鐘。',
        ['電子大遊行', '散場後不逆走', '度假區線 / 接駁巴士', '飯店 24H FamilyMart'],
        { type: 'bus', label: '度假區線 / 接駁巴士', route: '迪士尼樂園 → 東京灣希爾頓', duration: '5-10 分' },
        'Hilton Tokyo Bay Maihama', 'urayasu', '宵夜:FamilyMart 甜點', '預算依個人消費'),
    ],
  },
  {
    id: 'd3',
    title: 'Day 3',
    day: 3,
    date: '2026-09-21',
    dateLabel: '09/21',
    weekday: '一',
    theme: '鐵道冒險 • 大宮鐵道博物館',
    cityLabel: '埼玉・大宮 ➔ 東京・水道橋',
    cityKey: 'omiya',
    stops: [
      mkStop('d3s1', '08:00 - 09:30', '飯店早餐 & Airporter 行李托運退房', '東京灣希爾頓飯店 (Hilton Tokyo Bay)',
        '上午於希爾頓飯店享用豐盛自助早餐。09:00 前將大件行李放置於飯店大廳，由 Airporter 當天行李特快專送服務收取並直接運送至【東京巨蛋飯店】。完成辦理退房，兩手空空輕鬆準備出發！',
        ['希爾頓自助早餐', '09:00 Airporter托運', '直達東京巨蛋飯店', '兩手空空輕鬆遊'],
        { type: 'walk', label: '飯店內', route: '房間 → 大廳', duration: '—' },
        'Hilton Tokyo Bay', 'urayasu', '早餐:希爾頓自助早餐', '已含於住宿費'),
      mkStop('d3s2', '09:30 - 10:50', '移動交通：舞濱 ➔ 大宮鐵道博物館', 'JR京葉線 + 上野東京線/新幹線',
        '從舞濱站搭乘【JR 京葉線】至東京站（約 15 分鐘），轉乘【JR 上野東京線 / 新幹線】至大宮站（約 30 分鐘），再轉乘【埼玉新都市交通 New Shuttle】至『鐵道博物館站』（約 3 分鐘），全程輕鬆無負擔。',
        ['JR京葉線', '上野東京線/新幹線', 'New Shuttle', '兩手空空'],
        { type: 'train', label: 'JR京葉線 + 上野東京線/新幹線', route: '舞濱 ➔ 東京 ➔ 大宮 ➔ 鐵道博物館', duration: '約 70 分' },
        'Railway Museum Saitama', 'omiya', '—', '車資約 ¥1,000~¥1,600 / 人'),
      mkStop('d3s3', '11:00 - 12:30', '大宮鐵道博物館', '日本最大鐵道主題館',
        '大宮鐵道博物館是日本鐵道迷朝聖地。館藏包含新幹線 0 系、蒸汽機關車 D51,兒童可體驗迷你駕駛與 JR 路線模擬器。',
        ['館內展區體驗', '新幹線 0 系實車', '蒸汽機關車 D51', '迷你駕駛體驗'],
        { type: 'walk', label: '步行', route: '鐵道博物館站 → 博物館', duration: '2 分' },
        'Railway Museum Saitama', 'omiya', '—', '前售：成人 ¥1,500／3歲幼兒 ¥200；當日：成人 ¥1,600／3歲幼兒 ¥300',
        'https://www.railway-museum.jp/'),
      mkStop('d3s3a', '12:30 - 13:30', '午餐：日本食堂 (Nippon Shokudo)', '鐵道博物館本館 2F',
        '於館內『日本食堂』享用午餐。餐廳重現昔日日本鐵道『食堂車』的尊榮氛圍與經典菜單，推薦必點傳統餐車咖哩飯、紅酒燉牛肉、兒童餐車套餐，以及主題限量鐵道便當，親子用餐環境舒適方便！',
        ['經典餐車咖哩', '食堂車紅酒燉牛肉', '兒童車廂套餐', '新幹線鐵道便當'],
        { type: 'walk', label: '館內', route: '展區 → 2F 日本食堂', duration: '—' },
        'Railway Museum Saitama', 'omiya', '午餐:餐車特色料理', '餐飲預算約 ¥1,200~¥2,000 / 人'),
      mkStop('d3s3b', '13:30 - 14:30', '館內午後體驗 & 戶外電車區', '迷你駕駛與戶外展區',
        '午餐後續探索館內互動展區與戶外電車區。兒童可體驗 JR 路線模擬器與迷你電車駕駛,並於戶外實車區親近退役電車車廂,感受鐵道魅力。',
        ['JR 路線模擬器', '迷你電車駕駛', '戶外實車區', '親子互動體驗'],
        { type: 'walk', label: '館內', route: '日本食堂 → 戶外電車區', duration: '—' },
        'Railway Museum Saitama', 'omiya', '下午茶:主題甜點', '預算依個人消費'),
      mkStop('d3s4', '15:00', '大宮站周邊探索', 'Lumine 購物與點心',
        '返回大宮站,於 Lumine 1・2 購物中心逛街採購。推薦兒童服飾店 Nishimatsuya、無印良品,並於站內品嚐大宮名物炸豬排便當。',
        ['Lumine 購物中心', 'Nishimatsuya 兒童服', '無印良品', '大宮炸豬排'],
        { type: 'walk', label: '步行', route: '鐵道博物館 → 大宮站', duration: '5 分' },
        'Lumine Omiya', 'omiya', '下午茶:抹茶刨冰', '購物預算 ¥4,000',
        'https://www.lumine.ne.jp/omiya/'),
      mkStop('d3s5', '17:00 - 18:00', '入住東京巨蛋飯店 (Tokyo Dome Hotel)', '文京區 (JR 水道橋站東口 步行 2 分鐘 / 後樂園站 步行 5 分鐘)',
        '結束大宮逛街行程後，搭乘 JR 埼京線/京濱東北線轉乘中央總武線，返回東京巨蛋城。辦理高樓層尊榮雙床房（35-38F Premium Room Twin）入住，放置行李後稍作休息，準備晚間 LaQua 商城逛街與晚餐採買行程。',
        ['35-38F高樓層景觀房', 'JR水道橋站2分', '東京巨蛋城夜景', '明日ASOBono'],
        { type: 'train', label: 'JR 電車', route: '大宮站 ➔ 水道橋站', duration: '35-40 分' },
        'Tokyo Dome Hotel', 'tokyo', '—', 'IC 卡車資 ¥480 / 人'),
      mkStop('d3s6', '18:00 - 19:30', 'Tokyo Dome City LaQua 商城逛街', 'LaQua 購物中心 (飯店步行 3 分鐘)',
        '從飯店步行即可直達 LaQua 商城。館內集結 Uniqlo、3COINS、無印良品、ABC-MART 等人氣品牌，動線寬敞平緩，非常適合推推車帶孩子輕鬆逛街採買服飾與生活雜貨。',
        ['Uniqlo 旗艦服飾', '3COINS 日系雜貨', '平緩推車動線', '親子採買'],
        { type: 'walk', label: '步行', route: '飯店 → LaQua', duration: '3 分' },
        'LaQua Tokyo Dome City', 'tokyo', '—', '購物預算 ¥3,000~¥8,000 / 人',
        'https://www.laqua.jp/'),
      mkStop('d3s7', '19:30', '晚餐：LaQua 超市與美食街採買 • 飯店夜景晚餐', '成城石井超市 / LaQua 美食街 ➔ 飯店房間',
        '前往 LaQua 內的『成城石井超市』與 1F/B1 美食街採買現做熟食、和牛便當、日式串燒、新鮮壽司與水果甜點。帶回東京巨蛋飯店高樓層房間，邊欣賞巨蛋城亮燈夜景、邊舒適享用豐富晚宴，享受悠閒的親子夜晚。',
        ['成城石井熟食', '日式串燒&壽司', '日本當季水果', '房間俯瞰巨蛋夜景'],
        { type: 'walk', label: '步行', route: 'LaQua → 飯店房間', duration: '3 分' },
        'Tokyo Dome Hotel', 'tokyo', '晚餐:超市與熟食外帶', '餐飲預算約 ¥1,500~¥2,500 / 人'),
    ],
  },
  {
    id: 'd4',
    title: 'Day 4',
    day: 4,
    date: '2026-09-22',
    dateLabel: '09/22',
    weekday: '二',
    theme: '巨蛋球池樂園 • 東京車站一番街',
    cityLabel: '東京・後樂園 ➔ 東京車站 ➔ 水道橋',
    cityKey: 'tokyo',
    stops: [
      mkStop('d4s1', '09:00 - 10:00', '享用東京巨蛋飯店高樓層早餐', '東京巨蛋飯店 (Tokyo Dome Hotel)',
        '於 35-38 樓頂級房型專屬區或高樓層景觀餐廳享用豐盛自助早餐，俯瞰東京巨蛋城全景，展開元氣充沛的一天。',
        ['早餐：飯店高樓層景觀早餐', '自助早餐', '巨蛋城全景'],
        { type: 'walk', label: '館內', route: '客房 → 餐廳', duration: '—' },
        'Tokyo Dome Hotel', 'tokyo', '早餐：飯店高樓層景觀早餐', '已含於住宿費'),
      mkStop('d4s2', '10:00 - 13:00', 'ASOBono! (アソボ～ノ!) 巨型室內兒童樂園', '東京巨蛋城 (Tokyo Dome City)',
        '飯店下樓直接連通商場零距離！進入全東京最大型的室內兒童樂園 ASOBono!，暢玩巨型海洋球池、氣墊跳床、木製廚房扮家家酒區與 Tomica 火車軌道區。午餐直接於巨蛋城商場內親子友善餐廳或美食街享用。',
        ['零距離飯店連通', '全東京最大球池', 'Tomica 火車軌道區', '氣墊跳床', '木製廚房扮家家酒'],
        { type: 'walk', label: '步行', route: '飯店 → ASOBono!', duration: '3 分' },
        'ASOBono Tokyo Dome City', 'tokyo', '午餐:巨蛋城商場美食街', '門票 ¥1,800~¥2,500 / 人',
        'https://www.tokyo-dome.co.jp/asobono/',
        [
          { icon: 'socks', text: '溫馨提醒：大人與幼兒入場均需穿著襪子，建議自備以免現場排隊購買。' },
        ]),
      mkStop('d4s3', '13:30 - 14:30', '神級優勢：回飯店客房午睡歇腳', '東京巨蛋飯店客房',
        '玩完球池樂園後，搭電梯即可返回巨蛋飯店客房，讓寶寶舒適午睡 1～1.5 小時，大人也能輕鬆歇腳充電，為下午行程補滿體力。',
        ['搭電梯直達', '寶寶舒適午睡', '大人歇腳充電'],
        { type: 'walk', label: '步行', route: 'ASOBono! → 飯店客房', duration: '3 分' },
        'Tokyo Dome Hotel', 'tokyo', '—', '免費參觀'),
      mkStop('d4s4', '14:30 - 17:30', '東京車站一番街 (Character Street)', 'JR 東京車站 B1 一番街',
        '從後樂園站搭乘【地鐵丸之內線】直達東京站（僅 9 分鐘免轉車），出站直通一番街，集中採買吉卜力、樂高、寶可夢商店與限定動漫玩具。',
        ['吉卜力橡子共和國', '樂高 LEGO', '寶可夢中心', 'Tomica Shop', '地鐵丸之內線  後樂園站 ➔ 東京站 • 直達僅 9 分鐘'],
        { type: 'train', label: '地鐵丸之內線', route: '後樂園站 → 東京站', duration: '9 分' },
        'Tokyo Character Street', 'tokyo', '下午茶:一番街輕食', '採買預算 ¥5,000~¥15,000 / 人',
        'https://www.tokyostationcity.com/characterstreet/'),
      mkStop('d4s5', '17:30 - 18:00', '移動交通：東京站 ➔ 巨蛋飯店', '地鐵丸之內線  東京站 ➔ 後樂園站 • 車程 9 分',
        '搭乘【地鐵丸之內線】返回後樂園站，出站步行 3 分鐘回到飯店放置下午採買的戰利品。',
        ['地鐵丸之內線  東京站 ➔ 後樂園站 • 車程 9 分', '回飯店放戰利品'],
        { type: 'train', label: '地鐵丸之內線', route: '東京站 → 後樂園站', duration: '9 分' },
        'Korakuen Station', 'tokyo', '—', 'IC 卡車資 ¥210 / 人'),
      mkStop('d4s6', '18:00 - 20:00', '晚餐：巨蛋商圈溫和系美饌', '東京巨蛋城 / 水道橋周邊',
        '於巨蛋商圈內享用溫和的清燉系拉麵、手打烏龍麵或日式定食，結束豐富充實又放鬆的一天。',
        ['晚餐：清燉拉麵/手打烏龍麵/定食', '親子友善餐廳', '巨蛋商圈'],
        { type: 'walk', label: '步行', route: '飯店 → 巨蛋商圈', duration: '3 分' },
        'Tokyo Dome City LaQua', 'tokyo', '晚餐：清燉拉麵/手打烏龍麵/定食', '餐飲預算約 ¥1,500~¥2,500 / 人'),
    ],
  },
  {
    id: 'd5',
    title: 'Day 5',
    day: 5,
    date: '2026-09-23',
    dateLabel: '09/23',
    weekday: '三',
    theme: '海洋探索 • 品川水族館海豚秀',
    cityLabel: '東京・水道橋 ➔ 品川／大森 ➔ 錦糸町',
    cityKey: 'kinshicho',
    stops: [
      mkStop('d5s1', '08:30 - 09:00', '退房 & 行李託運 (巨蛋 ➔ 錦糸町)', '東京巨蛋飯店 ➔ 錦糸町樂天城市酒店',
        '於東京巨蛋飯店辦理退房，將大行李交付櫃檯，安排當日送至錦糸町樂天城市酒店；隨身只帶親子用品與水族館所需物品。',
        ['退房 & 行李託運', '輕裝出發', '確認行李配送單'],
        { type: 'walk', label: '館內', route: '飯店櫃檯', duration: '—' },
        'Tokyo Dome Hotel', 'tokyo', '—', '行李託運服務'),
      mkStop('d5s2', '09:00 - 09:50', '水道橋前往品川水族館', 'JR 水道橋 ➔ 大森；步行前往しながわ区民公園',
        '由水道橋搭 JR 中央・總武線至秋葉原，轉京濱東北線至大森站，再由北口步行約 15 分鐘前往品川水族館。9/23 為國定假日，預留月台與步行緩衝。',
        ['秋葉原轉乘', '大森站北口', '步行約 15 分', '10:00 開館'],
        { type: 'train', label: 'JR + 步行', route: '水道橋 → 秋葉原 → 大森 → 品川水族館', duration: '約 45-50 分' },
        'Shinagawa Aquarium', 'tokyo', '—', 'IC 卡車資約 ¥230 / 人'),
      mkStop('d5s3', '10:00 - 10:30', '開館入場・海豚秀提前就座', 'しながわ水族館（品川區勝島）',
        '10:00 開館後先完成入場，快速經過東京灣生態與隧道水槽，10:30 前前往海豚・海獅表演場就座。假日人潮較多，海豚秀前 15 分鐘不再安排其他展區。',
        ['10:00 開館入場', '隧道水槽', '10:30 前入座', '假日預留排隊'],
        { type: 'walk', label: '館內步行', route: '入口 → 隧道水槽 → 表演場', duration: '30 分' },
        'Shinagawa Aquarium Dolphin Stadium', 'tokyo', '—', '成人 ¥1,350 / 人；3 歲幼兒免費',
        'https://www.aquarium.gr.jp/price'),
      mkStop('d5s4', '10:45', '海豚表演秀（主場次）', '假日場次：10:45／12:30／14:00／15:30',
        '主行程鎖定 10:45 海豚秀。若交通或入場延誤，直接改看 12:30 場；場次可能因動物狀況或館方安排調整，出發前與入館當日都要再看官方公告。',
        ['主場次 10:45', '備援場次 12:30', '10:30 前入座', '出發前再確認'],
        { type: 'walk', label: '館內', route: '海豚・海獅表演場', duration: '約 15 分' },
        'Shinagawa Aquarium Dolphin Stadium', 'tokyo', '—', '已含入館費',
        'https://www.aquarium.gr.jp/calendar-holiday',
        [
          { icon: 'clock', text: '9/23 為國定假日；官方現行假日海豚秀為 10:45、12:30、14:00、15:30，主行程採 10:45。' },
          { icon: 'shirt', text: '前排可能濺水，帶孩子建議準備薄外套或替換上衣。' },
        ]),
      mkStop('d5s5', '11:05 - 12:30', '海獸表演與館內親子探索', '海豹秀・海獅秀・海豹館・鯊魚廳',
        '海豚秀後依孩子狀態觀賞 11:15 海豹秀、11:45 海獅秀，再走訪海豹館、鯊魚廳、企鵝與水母等展區。若錯過 10:45 海豚秀，這段改為自由參觀並於 12:15 前返回表演場等候 12:30 備援場。',
        ['11:15 海豹秀', '11:45 海獅秀', '鯊魚廳', '企鵝與水母'],
        { type: 'walk', label: '館內步行', route: '表演場 → 海豹館 → 鯊魚廳', duration: '約 85 分' },
        'Shinagawa Aquarium', 'tokyo', '—', '已含入館費',
        'https://www.aquarium.gr.jp/floor_map'),
      mkStop('d5s6', '12:30 - 13:30', '水上餐廳／Dolphin Cafe 午餐', 'しながわ区民公園內',
        '主場次順利時，在水上餐廳「Dolphin」或 Dolphin Cafe 用午餐；若改看 12:30 海豚秀，先以簡單點心墊胃，表演後再快速用餐並視情況順延離館。',
        ['親子午餐', '兒童餐選擇', '備援場次彈性', '13:30 前後離館'],
        { type: 'walk', label: '步行', route: '水族館 → 園區餐廳', duration: '3-5 分' },
        'Shinagawa Aquarium Restaurant Dolphin', 'tokyo', '午餐：水上餐廳或 Dolphin Cafe', '餐費約 ¥1,000~¥2,000 / 人',
        'https://www.aquarium.gr.jp/restaurant'),
      mkStop('d5s7', '13:30 - 14:40', '品川水族館前往錦糸町', '大森海岸／大森 ➔ 錦糸町',
        '由大森海岸站搭京急線至品川，再轉 JR 至錦糸町；亦可步行回大森站搭 JR，依當日人潮選擇。連假與轉乘預留緩衝，目標 15:00 後辦理入住。',
        ['大森海岸站', '品川轉乘', '連假預留緩衝', '15:00 後入住'],
        { type: 'train', label: '京急 + JR', route: '大森海岸 → 品川 → 錦糸町', duration: '約 55-70 分' },
        'Lotte City Hotel Kinshicho', 'kinshicho', '—', 'IC 卡車資依當日路線'),
      mkStop('d5s8', '15:00 - 16:30', '入住錦糸町樂天城市酒店 • 小孩午睡充電', '錦糸町樂天城市酒店 (Lotte City Hotel Kinshicho)',
        '15:00 後辦理 Check-in，確認 Airporter 行李送達狀態，讓孩子在套房內午睡休息，大人同步整理水族館用品與晚間採買清單。',
        ['15:00 後 Check-in', '確認行李送達', '親子午休', '整理採買清單'],
        { type: 'walk', label: '步行', route: '錦糸町站 → 樂天城市酒店', duration: '3 分' },
        'Lotte City Hotel Kinshicho', 'kinshicho', '—', '免費'),
      mkStop('d5s9', '16:30 - 18:30', '錦糸町阿卡將 & 藥妝集中採買', 'Arcakit 錦糸町 5F 與車站北口',
        '主線留在飯店正對面的 Arcakit，先到阿卡將採買嬰幼兒用品，再依體力補齊附近藥妝。取消銀座繞行，避免國定假日跨區折返。',
        ['阿卡將婦幼用品', '藥妝一次補齊', '免稅購物', '取消銀座繞行'],
        { type: 'walk', label: '步行', route: '飯店 → Arcakit → 錦糸町北口', duration: '3-8 分' },
        'Akachan Hompo Kinshicho', 'kinshicho', '下午茶：商場輕食', '採買預算 ¥15,000~¥45,000 / 人',
        'https://www.akachan.jp/'),
      mkStop('d5s10', '18:30 - 20:30', '錦糸町晚餐 & 整理戰利品', 'OIOI／Arcakit 美食街 ➔ 飯店',
        '在錦糸町 OIOI 或 Arcakit 美食街享用親子友善晚餐，提早返回套房整理戰利品與打包，為隔日 11:00 專車接送保留睡眠。',
        ['親子友善晚餐', '回房整理戰利品', '隔日專車確認', '提早休息'],
        { type: 'walk', label: '步行', route: '錦糸町商圈 → 飯店', duration: '3-8 分' },
        'OIOI Kinshicho', 'kinshicho', '晚餐：日式定食／美食街', '餐飲預算約 ¥2,000~¥4,000 / 人',
        'https://www.morijp.com/oioi/'),
    ],
  },
  {
    id: 'd6',
    title: 'Day 6',
    day: 6,
    date: '2026-09-24',
    dateLabel: '09/24',
    weekday: '四',
    theme: '悠閒晨光 • 專車舒適返航',
    cityLabel: '東京・錦糸町 ➔ 成田機場 T1 ➔ 台北 TPE',
    cityKey: 'tokyo',
    stops: [
      mkStop('d6s1', '08:30 - 10:30', '享用樂天城市酒店主題早餐', '錦糸町樂天城市酒店 (Lotte City Hotel Kinshicho)',
        '於飯店內享用人氣樂天小熊鬆餅主題自助早餐，讓孩子在寬敞的套房空間內遊玩，大人優雅完成最後行李整理與打包。',
        ['早餐：可愛樂天小熊鬆餅', '套房大空間優雅打包', '親子悠閒晨光'],
        { type: 'walk', label: '館內', route: '套房 → 餐廳', duration: '—' },
        'Lotte City Hotel Kinshicho', 'kinshicho', '早餐：可愛樂天小熊鬆餅', '已含於住宿費'),
      mkStop('d6s2', '11:00 - 11:10', '飯店退房 & KLOOK 專車司機迎賓', '樂天城市酒店 1F 正門大廳',
        '辦理 Check-out 退房，帶隨身行李至 1 樓大廳。KLOOK 預約專車司機將在現場持牌迎賓，並協助搬運所有大行李箱與伴手禮。',
        ['飯店退房', '司機持牌迎賓', '專人搬運行李'],
        { type: 'walk', label: '館內', route: '客房 → 1F 大廳', duration: '—' },
        'Lotte City Hotel Kinshicho', 'kinshicho', '—', '免費參觀'),
      mkStop('d6s3', '11:10 - 12:20', '移動交通：錦糸町 ➔ 成田機場 T1', '錦糸町 ➔ 成田國際機場 第一航廈',
        '搭乘預約專車（11:10 出發）直達第一航廈出境大廳門口。司機協助下行李，車程約 60 分鐘，全程冷氣房舒適休息，完全免去拉行李推推車的辛苦。',
        ['KLOOK 預約專車 • 約 60 分鐘直達', '專車費用約 NT$3,600', '直達航廈門口', '免去搬運行李'],
        { type: 'taxi', label: 'KLOOK 專車', route: '錦糸町 → 成田機場 T1', duration: '約 60 分' },
        'Narita Airport Terminal 1', 'tokyo', '—', '專車費用約 NT$3,600'),
      mkStop('d6s4', '12:30 - 14:25', '皇璽桂冠艙櫃檯與貴賓室禮遇', '成田機場 T1 長榮航空商務艙櫃檯 / 星空聯盟貴賓室',
        '至長榮航空商務艙專屬櫃檯優先辦理登機與行李託運，隨後進入成田機場星空聯盟貴賓室休息，享用精緻美饌與飲料，進行最後免稅補貨。',
        ['商務艙優先報到', '行李優先託運', '星空聯盟貴賓室休息', '精緻美饌與免稅補貨'],
        { type: 'walk', label: '步行', route: '櫃檯 → 貴賓室', duration: '—' },
        'EVA Air Lounge Narita', 'tokyo', '午餐：貴賓室精緻美饌', '已含於機票費',
        'https://www.evaair.com/zh-tw/fly-prepare/facilities/lounges/'),
      mkStop('d6s5', '14:25', 'BR197 皇璽桂冠艙起飛返抵台北', '長榮航空 BR197 (波音 787-10)',
        '搭乘長榮航空 BR197 皇璽桂冠艙（波音 787-10，180 度全平躺座椅），享受連線機上 Wi-Fi 與頂級商務艙餐點，舒適平穩地返抵台北桃園機場，為 6 天 5 夜尊享親子之旅畫下完美句點。',
        ['180度全平躺座椅', '機上 Wi-Fi 連線', '頂級機上餐點', '預計 17:05 抵達 TPE'],
        { type: 'flight', label: '長榮 BR197', route: 'NRT → TPE', duration: '3h 40m' },
        'Narita Airport Terminal 1', 'tokyo', '頂級機上餐點', '已含於機票費'),
    ],
  },
];
