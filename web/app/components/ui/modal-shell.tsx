import { motion } from "motion/react";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

/**
 * Унифицированная "оболочка" модального окна.
 *
 * Два варианта геометрии:
 *
 *  variant="card" (по умолчанию для коротких попапов):
 *      Жёстко зафиксированное соотношение сторон 9:16 (как карточка профиля).
 *      Размер всегда вписывается в видимую область:
 *      width = min(идеальная, ширина_окна, высота_окна·9/16);
 *      height высчитывается из aspect-ratio. Используется для модалок,
 *      которые показывают компактную информацию (мэтч, QR, рекомендация).
 *
 *  variant="sheet" (по умолчанию для контентных списков):
 *      «Высокий» лист — занимает до 90% высоты окна, ширина ограничена
 *      базовой (примерно как `max-w-md`). Контент скроллится внутри.
 *      Используется для длинных списков: чаты, лайки, избранное,
 *      уведомления, профиль, настройки и т. п.
 *
 * size — базовый размер ширины (одинаков для card/sheet):
 *  - "card"    — основной размер.
 *  - "compact" — уже (простые подтверждения / алерты).
 *  - "wide"    — шире (детальный анализ, события).
 *
 * Безопасные отступы (safe-area) учитываются на iOS/Android-веб в обоих режимах.
 */
export type ModalShellSize = "card" | "compact" | "wide";
export type ModalShellVariant = "card" | "sheet";

const ASPECT_W = 9;
const ASPECT_H = 16;

interface ModalShellProps {
  onClose?: () => void;
  /** Не закрывать модалку по клику вне рамки (например, формы регистрации). */
  disableBackdropClose?: boolean;
  size?: ModalShellSize;
  /** "card" — пропорция 9:16; "sheet" — высокий лист (контентные списки). */
  variant?: ModalShellVariant;
  /** Скрыть встроенную кнопку закрытия (если у модалки уже есть своя в header). */
  hideCloseButton?: boolean;
  /** Дополнительные классы для внутреннего "тела" модалки. */
  className?: string;
  /** Содержимое — обычно flex-колонка (header + scroll-area + footer). */
  children: ReactNode;
  /** Ярлык для accessibility — отдаётся как aria-label. */
  ariaLabel?: string;
}

/**
 * Шаблон сетки внутри модалки:
 * <ModalShell ...>
 *   <ModalHeader>...</ModalHeader>
 *   <ModalBody>...</ModalBody>
 *   <ModalFooter>...</ModalFooter>
 * </ModalShell>
 *
 * Body имеет min-h-0 + overflow-y-auto, что гарантирует, что модалка
 * не "разъезжается" даже на маленьких экранах.
 */
export function ModalShell({
  onClose,
  disableBackdropClose = false,
  size = "card",
  variant = "card",
  hideCloseButton = false,
  className = "",
  children,
  ariaLabel,
}: ModalShellProps) {
  // Esc для закрытия
  useEffect(() => {
    if (!onClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Базовая «идеальная» ширина для каждого размера.
  const idealWidthRem = size === "compact" ? 21 : size === "wide" ? 30 : 26;

  // Геометрия отличается для card / sheet.
  const frameStyle: React.CSSProperties =
    variant === "sheet"
      ? {
          // «Высокий лист»: ширина ограничена базовой, высота — до 90% видимой
          // области. Контент скроллится внутри. Пропорции не «жёсткие» —
          // важно, чтобы поместился список (чаты/лайки/уведомления).
          width: `min(${idealWidthRem}rem, calc(100vw - 1.5rem))`,
          maxHeight: "min(90dvh, calc(100dvh - 1.5rem))",
          height: "auto",
        }
      : {
          // Жёсткое 9:16: вписываем рамку и в ширину, и в высоту окна.
          width: `min(${idealWidthRem}rem, calc(100vw - 1.5rem), calc((100dvh - 1.5rem) * ${ASPECT_W} / ${ASPECT_H}))`,
          aspectRatio: `${ASPECT_W} / ${ASPECT_H}`,
          maxHeight: "calc(100dvh - 1.5rem)",
        };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden"
      onClick={() => {
        if (!disableBackdropClose && onClose) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-label={ariaLabel}
      style={{
        paddingTop: "max(env(safe-area-inset-top), 0.75rem)",
        paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)",
        paddingLeft: "max(env(safe-area-inset-left), 0.75rem)",
        paddingRight: "max(env(safe-area-inset-right), 0.75rem)",
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{ type: "spring", duration: 0.45 }}
        className={[
          "relative bg-white rounded-3xl shadow-2xl",
          "flex flex-col overflow-hidden",
          className,
        ].join(" ")}
        style={frameStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideCloseButton && onClose && (
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="absolute top-3 right-3 z-20 size-9 inline-flex items-center justify-center rounded-full bg-white/85 backdrop-blur-sm text-gray-700 shadow hover:bg-white transition-colors"
          >
            <X className="size-5" />
          </button>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Шапка модалки. По умолчанию — градиент "russian-love". */
export function ModalHeader({
  children,
  className = "",
  variant = "gradient",
}: {
  children: ReactNode;
  className?: string;
  variant?: "gradient" | "plain";
}) {
  const base =
    variant === "gradient"
      ? "bg-gradient-to-br from-red-500 to-amber-500 text-white"
      : "bg-white text-gray-900 border-b border-gray-100";
  return (
    <div className={`flex-shrink-0 px-5 sm:px-6 py-4 sm:py-5 ${base} ${className}`}>
      {children}
    </div>
  );
}

/** Основное прокручиваемое тело модалки. */
export function ModalBody({
  children,
  className = "",
  noPadding = false,
}: {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={[
        "flex-1 min-h-0 overflow-y-auto modal-scroll",
        noPadding ? "" : "px-5 sm:px-6 py-4 sm:py-5",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/** Закреплённый снизу футер с действиями. */
export function ModalFooter({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex-shrink-0 px-5 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-white",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
