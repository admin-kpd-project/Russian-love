/** Те же шаблоны, что в web/app/components/EventsModal.tsx — без Math.random для стабильного RN. */

export type EventCategoryRu = "романтика" | "культура" | "активность" | "еда" | "развлечения";

export type EventTemplate = {
  id: string;
  title: string;
  category: EventCategoryRu;
  description: string;
  location: string;
  organizer: string;
  isFree: boolean;
  price?: string;
  workingHours?: string;
  tags: string[];
};

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: "chess",
    title: "Шахматный турнир в парке",
    category: "активность",
    description: "Бесплатный шахматный турнир для всех желающих",
    location: "Центральный парк",
    organizer: "НКО «Шахматы для всех»",
    isFree: true,
    workingHours: "10:00 – 18:00",
    tags: ["шахматы", "турнир", "парк"],
  },
  {
    id: "curling",
    title: "Керлинг для начинающих",
    category: "активность",
    description: "Попробуйте керлинг под руководством профессионалов",
    location: "Ледовая арена «Метеор»",
    organizer: "ООО «Спортивные развлечения»",
    isFree: false,
    price: "800 руб/час",
    workingHours: "09:00 – 22:00",
    tags: ["керлинг", "спорт", "лед"],
  },
  {
    id: "walk",
    title: "Прогулка в парке",
    category: "романтика",
    description: "Романтическая прогулка на закате",
    location: "Центральный парк",
    organizer: "Департамент культуры",
    isFree: true,
    workingHours: "06:00 – 23:00",
    tags: ["прогулка", "парк", "закат"],
  },
  {
    id: "cinema",
    title: "Кинопоказ под открытым небом",
    category: "развлечения",
    description: "Бесплатный показ классических фильмов",
    location: "Парк Горького",
    organizer: "Мосгорпарк",
    isFree: true,
    tags: ["кино", "фильмы", "парк"],
  },
  {
    id: "dinner",
    title: "Ужин в ресторане",
    category: "еда",
    description: "Романтический ужин с живой музыкой",
    location: "Ресторан «Усадьба»",
    organizer: "Ресторан «Усадьба»",
    isFree: false,
    price: "от 2000 руб",
    workingHours: "12:00 – 00:00",
    tags: ["ужин", "ресторан", "музыка"],
  },
  {
    id: "art",
    title: "Выставка современного искусства",
    category: "культура",
    description: "Бесплатная выставка молодых художников",
    location: "Третьяковская галерея",
    organizer: "Третьяковская галерея",
    isFree: true,
    workingHours: "10:00 – 18:00 (Пн — выходной)",
    tags: ["выставка", "искусство", "галерея"],
  },
  {
    id: "bowling",
    title: "Боулинг вечер",
    category: "активность",
    description: "Аренда дорожки для двоих с коктейлями",
    location: "Bowling Club Premium",
    organizer: "ИП Смирнов В.А.",
    isFree: false,
    price: "600 руб/час",
    workingHours: "12:00 – 02:00",
    tags: ["боулинг", "дворец", "коктейли"],
  },
  {
    id: "jazz",
    title: "Джаз в парке",
    category: "развлечения",
    description: "Бесплатный концерт джазовой музыки",
    location: "Парк «Сокольники»",
    organizer: "Комитет по культуре",
    isFree: true,
    tags: ["джаз", "концерт", "парк"],
  },
  {
    id: "picnic",
    title: "Пикник у реки",
    category: "романтика",
    description: "Романтический пикник с видом на воду",
    location: "Набережная",
    organizer: "Департамент природопользования",
    isFree: true,
    workingHours: "Круглосуточно",
    tags: ["пикник", "река", "вид"],
  },
  {
    id: "pasta",
    title: "Мастер-класс по приготовлению пасты",
    category: "еда",
    description: "Научитесь готовить настоящую итальянскую пасту",
    location: "Кулинарная студия «Вкусно»",
    organizer: "Кулинарная студия «Вкусно»",
    isFree: false,
    price: "1200 руб/чел",
    workingHours: "10:00 – 20:00",
    tags: ["мастер-класс", "кулинария", "паста"],
  },
  {
    id: "quest",
    title: "Квест-приключение",
    category: "развлечения",
    description: "Захватывающий квест на двоих",
    location: "Quest Zone Center",
    organizer: "ООО «Квест Мастер»",
    isFree: false,
    price: "2500 руб/команда",
    workingHours: "10:00 – 23:00",
    tags: ["квест", "приключение", "центер"],
  },
  {
    id: "yoga",
    title: "Йога в парке",
    category: "активность",
    description: "Бесплатная утренняя йога на свежем воздухе",
    location: "Парк Горького",
    organizer: "НКО «Здоровый город»",
    isFree: true,
    workingHours: "07:00 – 09:00",
    tags: ["йога", "парк", "утро"],
  },
  {
    id: "theatre",
    title: "Спектакль в театре",
    category: "культура",
    description: "Премьера новой постановки",
    location: "Театр им. Маяковского",
    organizer: "Театр им. Маяковского",
    isFree: false,
    price: "от 500 руб",
    workingHours: "Начало в 19:00",
    tags: ["спектакль", "театр", "премьера"],
  },
  {
    id: "skate",
    title: "Каток на ВДНХ",
    category: "активность",
    description: "Самый большой каток под открытым небом",
    location: "ВДНХ",
    organizer: "ВДНХ",
    isFree: false,
    price: "350 руб (прокат коньков + вход)",
    workingHours: "10:00 – 23:00",
    tags: ["каток", "ВДНХ", "коньки"],
  },
  {
    id: "literary",
    title: "Литературный вечер",
    category: "культура",
    description: "Встреча с современными авторами",
    location: "Библиотека им. Ленина",
    organizer: "Библиотека им. Ленина",
    isFree: true,
    workingHours: "18:00 – 20:00",
    tags: ["литература", "вечер", "библиотека"],
  },
];

export type GeneratedEventPick = {
  id: string;
  title: string;
  description: string;
  location: string;
  hours?: string;
  dateLine: string;
  category: EventCategoryRu;
  priceLine?: string;
  organizer: string;
};

/** Распределение по месяцу как на вебе, но детерминировано по индексу шаблона. */
export function generateEventPicksForProfile(_profileName: string): GeneratedEventPick[] {
  const today = new Date();
  const n = EVENT_TEMPLATES.length;
  return EVENT_TEMPLATES.map((t, index) => {
    const daysOffset = Math.floor((index * 30) / n);
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + daysOffset);
    const dateLine = eventDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" });
    const priceLine = t.isFree ? "Бесплатно" : t.price;
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      location: t.location,
      hours: t.workingHours,
      dateLine,
      category: t.category,
      priceLine,
      organizer: t.organizer,
    };
  });
}
