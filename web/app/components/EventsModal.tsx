import { Calendar, List, MapPin, Clock, Heart, ExternalLink, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo, useEffect } from "react";
import { ModalShell } from "./ui/modal-shell";

interface EventsModalProps {
  onClose: () => void;
  profileName: string;
  profilePhoto?: string;
  onSendEventInvite?: (eventTitle: string, eventDescription: string) => void;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  category: "романтика" | "культура" | "активность" | "еда" | "развлечения";
  organizer: string;
  organizerType: "government" | "ngo" | "private" | "venue";
  isFree: boolean;
  price?: string;
  workingHours?: string;
  registrationUrl?: string;
  requiresRegistration: boolean;
  tags: string[];
}

const categoryColors = {
  романтика: "from-pink-500 to-rose-500",
  культура: "from-purple-500 to-indigo-500",
  активность: "from-green-500 to-emerald-500",
  еда: "from-amber-500 to-orange-500",
  развлечения: "from-blue-500 to-cyan-500",
};

const categoryIcons = {
  романтика: "💕",
  культура: "🎭",
  активность: "⚡",
  еда: "🍽️",
  развлечения: "🎉",
};

const CATS: ("все" | Event["category"])[] = [
  "все",
  "романтика",
  "культура",
  "активность",
  "еда",
  "развлечения",
];

// Generate events for the next 30 days
function generateEvents(profileName: string): Event[] {
  const events: Event[] = [];
  const today = new Date();
  
  const eventTemplates = [
    { 
      title: "Шахматный турнир в парке", 
      category: "активность" as const, 
      description: "Бесплатный шахматный турнир для всех желающих", 
      location: "Центральный парк", 
      organizer: "НКО 'Шахматы для всех'", 
      organizerType: "ngo" as const, 
      isFree: true,
      workingHours: "10:00 - 18:00",
      requiresRegistration: false,
      tags: ["шахматы", "турнир", "парк"]
    },
    { 
      title: "Керлинг для начинающих", 
      category: "активность" as const, 
      description: "Попробуйте керлинг под руководством профессионалов", 
      location: "Ледовая арена 'Метеор'", 
      organizer: "ООО 'Спортивные развлечения'", 
      organizerType: "private" as const, 
      isFree: false, 
      price: "800 руб/час", 
      workingHours: "09:00 - 22:00",
      registrationUrl: "https://example.com/curling-register", 
      requiresRegistration: true,
      tags: ["керлинг", "спорт", "лед"]
    },
    { 
      title: "Прогулка в парке", 
      category: "романтика" as const, 
      description: "Романтическая прогулка на закате", 
      location: "Центральный парк", 
      organizer: "Департамент культуры", 
      organizerType: "government" as const, 
      isFree: true,
      workingHours: "06:00 - 23:00",
      requiresRegistration: false,
      tags: ["прогулка", "парк", "закат"]
    },
    { 
      title: "Кинопоказ под открытым небом", 
      category: "развлечения" as const, 
      description: "Бесплатный показ классических фильмов", 
      location: "Парк Горького", 
      organizer: "Мосгорпарк", 
      organizerType: "government" as const, 
      isFree: true,
      requiresRegistration: false,
      tags: ["кино", "фильмы", "парк"]
    },
    { 
      title: "Ужин в ресторане", 
      category: "еда" as const, 
      description: "Романтический ужин с живой музыкой", 
      location: "Ресторан 'Усадьба'", 
      organizer: "Ресторан 'Усадьба'", 
      organizerType: "private" as const, 
      isFree: false, 
      price: "от 2000 руб", 
      workingHours: "12:00 - 00:00",
      registrationUrl: "https://example.com/restaurant-booking", 
      requiresRegistration: true,
      tags: ["ужин", "ресторан", "музыка"]
    },
    { 
      title: "Выставка современного искусства", 
      category: "культура" as const, 
      description: "Бесплатная выставка молодых художников", 
      location: "Третьяковская галерея", 
      organizer: "Третьяковская галерея", 
      organizerType: "government" as const, 
      isFree: true,
      workingHours: "10:00 - 18:00 (Пн - выходной)",
      requiresRegistration: false,
      tags: ["выставка", "искусство", "галерея"]
    },
    { 
      title: "Боулинг вечер", 
      category: "активность" as const, 
      description: "Аренда дорожки для двоих с коктейлями", 
      location: "Bowling Club Premium", 
      organizer: "ИП Смирнов В.А.", 
      organizerType: "private" as const, 
      isFree: false, 
      price: "600 руб/час", 
      workingHours: "12:00 - 02:00",
      registrationUrl: "https://example.com/bowling-book", 
      requiresRegistration: true,
      tags: ["боулинг", "дворец", "коктейли"]
    },
    { 
      title: "Джаз в парке", 
      category: "развлечения" as const, 
      description: "Бесплатный концерт джазовой музыки", 
      location: "Парк 'Сокольники'", 
      organizer: "Комитет по культуре", 
      organizerType: "government" as const, 
      isFree: true,
      requiresRegistration: false,
      tags: ["джаз", "концерт", "парк"]
    },
    { 
      title: "Пикник у реки", 
      category: "романтика" as const, 
      description: "Романтический пикник с видом на воду", 
      location: "Набережная", 
      organizer: "Департамент природопользования", 
      organizerType: "government" as const, 
      isFree: true,
      workingHours: "Круглосуточно",
      requiresRegistration: false,
      tags: ["пикник", "река", "вид"]
    },
    { 
      title: "Мастер-класс по приготовлению пасты", 
      category: "еда" as const, 
      description: "Научитесь готовить настоящую итальянскую пасту", 
      location: "Кулинарная студия 'Вкусно'", 
      organizer: "Кулинарная студия 'Вкусно'", 
      organizerType: "private" as const, 
      isFree: false, 
      price: "1200 руб/чел", 
      workingHours: "10:00 - 20:00",
      registrationUrl: "https://example.com/cooking-class", 
      requiresRegistration: true,
      tags: ["мастер-класс", "кулинария", "паста"]
    },
    { 
      title: "Квест-приключение", 
      category: "развлечения" as const, 
      description: "Захватывающий квест на двоих", 
      location: "Quest Zone Center", 
      organizer: "ООО 'Квест Мастер'", 
      organizerType: "private" as const, 
      isFree: false, 
      price: "2500 руб/команда", 
      workingHours: "10:00 - 23:00",
      registrationUrl: "https://example.com/quest-booking", 
      requiresRegistration: true,
      tags: ["квест", "приключение", "центер"]
    },
    { 
      title: "Йога в парке", 
      category: "активность" as const, 
      description: "Бесплатная утренняя йога на свежем воздухе", 
      location: "Парк Горького", 
      organizer: "НКО 'Здоровый город'", 
      organizerType: "ngo" as const, 
      isFree: true,
      workingHours: "07:00 - 09:00",
      requiresRegistration: false,
      tags: ["йога", "парк", "утро"]
    },
    { 
      title: "Спектакль в театре", 
      category: "культура" as const, 
      description: "Премьера новой постановки", 
      location: "Театр им. Маяковского", 
      organizer: "Театр им. Маяковского", 
      organizerType: "government" as const, 
      isFree: false,
      price: "от 500 руб",
      workingHours: "Начало в 19:00",
      registrationUrl: "https://example.com/theatre-tickets", 
      requiresRegistration: true,
      tags: ["спектакль", "театр", "премьера"]
    },
    { 
      title: "Каток на ВДНХ", 
      category: "активность" as const, 
      description: "Самый большой каток под открытым небом", 
      location: "ВДНХ", 
      organizer: "ВДНХ", 
      organizerType: "government" as const, 
      isFree: false,
      price: "350 руб (прокат коньков + вход)",
      workingHours: "10:00 - 23:00",
      requiresRegistration: false,
      tags: ["каток", "ВДНХ", "коньки"]
    },
    { 
      title: "Литературный вечер", 
      category: "культура" as const, 
      description: "Встреча с современными авторами", 
      location: "Библиотека им. Ленина", 
      organizer: "Библиотека им. Ленина", 
      organizerType: "government" as const, 
      isFree: true,
      workingHours: "18:00 - 20:00",
      registrationUrl: "https://example.com/literary-evening", 
      requiresRegistration: true,
      tags: ["литература", "вечер", "библиотека"]
    },
  ];

  // Distribute events across the month
  eventTemplates.forEach((template, index) => {
    const daysOffset = Math.floor((index * 30) / eventTemplates.length) + Math.floor(Math.random() * 3);
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + daysOffset);
    eventDate.setHours(18 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);

    events.push({
      id: `event-${index}`,
      ...template,
      date: eventDate,
    });
  });

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function EventsModal({ onClose, profileName, profilePhoto, onSendEventInvite }: EventsModalProps) {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [cat, setCat] = useState<(typeof CATS)[number]>("все");
  const events = useMemo(() => generateEvents(profileName), [profileName]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sentEventId, setSentEventId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setViewMode("list");
    setCat("все");
    setPriceFilter("all");
    setTagFilter(null);
    setSelectedDate(null);
    setCurrentMonth(new Date());
  }, [profileName]);

  // Handle event card click - send invitation to chat
  const handleEventClick = (event: Event) => {
    if (onSendEventInvite) {
      const dateStr = event.date.toLocaleDateString("ru-RU", { 
        day: "numeric", 
        month: "long",
        weekday: "short"
      });
      const inviteMessage = `${event.title}\n📍 ${event.location}\n📅 ${dateStr}${event.workingHours ? `\n🕐 ${event.workingHours}` : ''}\n\n${event.description}\n\n${event.isFree ? '💚 Бесплатно' : `💰 ${event.price}`}`;
      
      onSendEventInvite(event.title, inviteMessage);
      
      // Show toast notification
      setSentEventId(event.id);
      setShowToast(true);
      
      // Auto hide toast after 2 seconds
      setTimeout(() => {
        setShowToast(false);
        setTimeout(() => {
          onClose();
        }, 300);
      }, 2000);
    }
  };

  const allTags = useMemo(
    () => Array.from(new Set(events.flatMap((e) => e.tags))).sort(),
    [events]
  );

  const filteredEvents = useMemo(() => {
    let list = events;
    if (cat !== "все") list = list.filter((e) => e.category === cat);
    if (priceFilter === "free") list = list.filter((e) => e.isFree);
    if (priceFilter === "paid") list = list.filter((e) => !e.isFree);
    if (tagFilter) list = list.filter((e) => e.tags.includes(tagFilter));
    return list;
  }, [events, cat, priceFilter, tagFilter]);

  const M = events.length;
  const k = filteredEvents.length;

  const resetFilters = () => {
    setCat("все");
    setPriceFilter("all");
    setTagFilter(null);
    setSelectedDate(null);
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert to Monday = 0
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((event) => isSameDay(event.date, date));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const hasEvents = dayEvents.length > 0;
      const isToday = isSameDay(date, new Date());
      const isSelected = selectedDate && isSameDay(date, selectedDate);

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`aspect-square rounded-lg p-2 text-sm transition-all relative ${
            isSelected
              ? "bg-gradient-to-br from-red-600 to-amber-500 text-white font-bold shadow-lg"
              : isToday
              ? "bg-red-100 text-red-600 font-semibold"
              : hasEvents
              ? "bg-amber-50 hover:bg-amber-100 text-gray-800"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <div>{day}</div>
          {hasEvents && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
              {dayEvents.slice(0, 3).map((event, idx) => (
                <div
                  key={idx}
                  className={`size-1.5 rounded-full ${
                    isSelected ? "bg-white" : "bg-gradient-to-r " + categoryColors[event.category]
                  }`}
                />
              ))}
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <ModalShell onClose={onClose} ariaLabel="Куда сходить вместе" size="wide" variant="sheet">
      <div className="flex flex-col h-full">
        <div
          className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-[11px] sm:text-xs text-center flex-shrink-0"
          role="status"
        >
          Демо-данные. Подборка событий и ссылки — для демонстрации.
        </div>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-500 px-5 sm:px-6 py-4 flex-shrink-0 pr-14">
          <h2 className="text-lg sm:text-xl font-bold text-white">Куда сходить вместе</h2>
          <p className="text-xs text-white/90 truncate">Идеи для встреч с {profileName}</p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 py-3 text-center font-medium transition-colors relative flex items-center justify-center gap-2 ${
              viewMode === "list"
                ? "text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List className="size-4" />
            Список
            {viewMode === "list" && (
              <motion.div
                layoutId="viewMode"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
              />
            )}
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex-1 py-3 text-center font-medium transition-colors relative flex items-center justify-center gap-2 ${
              viewMode === "calendar"
                ? "text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Calendar className="size-4" />
            Календарь
            {viewMode === "calendar" && (
              <motion.div
                layoutId="viewMode"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
              />
            )}
          </button>
        </div>

        {/* Filters: как на моб. EventsPicker — счётчик, цена, категория, тег (один) */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-gray-700">
              Найдено: {k} из {M}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-red-600 font-medium hover:underline"
            >
              Сбросить
            </button>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Цена</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { key: "all" as const, label: "Все" },
                  { key: "free" as const, label: "Бесплатные" },
                  { key: "paid" as const, label: "Платные" },
                ] as const
              ).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriceFilter(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    priceFilter === key
                      ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Категория</p>
            <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
              {CATS.map((c) => {
                const on = cat === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      on
                        ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {c === "все" ? "Все" : c}
                  </button>
                );
              })}
            </div>
          </div>

          {allTags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">Теги</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
                {allTags.map((tag) => {
                  const on = tagFilter === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTagFilter((prev) => (prev === tag ? null : tag))}
                      className={`whitespace-nowrap flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        on
                          ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-md"
                          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {viewMode === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3"
              >
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className={`bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border transition-all cursor-pointer ${
                      sentEventId === event.id
                        ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:shadow-lg hover:border-red-300 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-3xl bg-gradient-to-br ${categoryColors[event.category]} p-3 rounded-xl transition-transform ${
                        sentEventId === event.id ? 'scale-110' : 'group-hover:scale-105'
                      }`}>
                        <span className="block">{categoryIcons[event.category]}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold mb-1 transition-colors ${
                          sentEventId === event.id ? 'text-green-600' : 'text-gray-800 group-hover:text-red-600'
                        }`}>{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="flex gap-3 text-xs text-gray-500">
                          {event.workingHours && (
                            <div className="flex items-center gap-1">
                              <Clock className="size-3" />
                              {event.workingHours}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {event.location}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Users className="size-3" />
                            {event.organizer}
                          </div>
                          <div className="flex items-center gap-1">
                            {event.isFree ? (
                              <span className="text-green-500">Бесплатно</span>
                            ) : (
                              <span className="text-red-500">Цена: {event.price}</span>
                            )}
                          </div>
                          {event.registrationUrl && (
                            <a 
                              href={event.registrationUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-1 text-blue-500 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="size-3" />
                              Регистрация
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(currentMonth.getMonth() - 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <h3 className="font-bold text-gray-800">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button
                    onClick={() => {
                      const newMonth = new Date(currentMonth);
                      newMonth.setMonth(currentMonth.getMonth() + 1);
                      setCurrentMonth(newMonth);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>

                {/* Weekday names */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">{renderCalendar()}</div>

                {/* Selected Date Events */}
                {selectedDate && selectedDateEvents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Heart className="size-5 text-red-500" />
                      События {selectedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
                    </h4>
                    <div className="space-y-2">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-gradient-to-r from-amber-50 to-red-50 rounded-xl p-3 border border-amber-200"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{categoryIcons[event.category]}</span>
                            <h5 className="font-bold text-gray-800">{event.title}</h5>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          <div className="flex gap-3 text-xs text-gray-500">
                            {event.workingHours && (
                              <div className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {event.workingHours}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <MapPin className="size-3" />
                              {event.location}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                              <Users className="size-3" />
                              {event.organizer}
                            </div>
                            <div className="flex items-center gap-1">
                              {event.isFree ? (
                                <span className="text-green-500">Бесплатно</span>
                              ) : (
                                <span className="text-red-500">Цена: {event.price}</span>
                              )}
                            </div>
                            {event.registrationUrl && (
                              <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                                <ExternalLink className="size-3" />
                                Регистрация
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {selectedDate && selectedDateEvents.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Calendar className="size-12 mx-auto mb-2 opacity-30" />
                    <p>Нет событий на эту дату</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toast Notification */}
        {showToast && sentEventId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between"
          >
            <p>Приглашение отправлено!</p>
            <button
              onClick={() => setShowToast(false)}
              className="p-1 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              aria-label="Закрыть уведомление"
            >
              <span className="text-white">×</span>
            </button>
          </motion.div>
        )}
      </div>
    </ModalShell>
  );
}