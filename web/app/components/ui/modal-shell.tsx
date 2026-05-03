import { motion } from "motion/react";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

/**
 * Унифицированная "оболочка" модального окна.
 *
 * Геометрия:
 *  - Соотношение сторон — как у карточки знакомств (≈9:16 «портретный» формат).
 *  - Размер всегда подбирается так, чтобы рамка УМЕСТИЛАСЬ в видимой области
 *    и сохранила одно и то же соотношение сторон на ЛЮБОМ разрешении.
 *  - Безопасные отступы (safe-area) учитываются на iOS/Android-веб.
 *
 * size — масштаб «обычного размера карточки»:
 *  - "card"    — основной (базовый) размер, аналогичный карточке профиля.
 *  - "compact" — слегка уже (для простых подтверждений / алертов).
 *  - "wide"    — слегка шире (для расширенных модалок: детальный анализ, события).
 *
 * Соотношение сторон 9:16 одинаково для всех вариантов — меняется только базовая ширина.
 */
export type ModalShellSize = "card" | "compact" | "wide";

const ASPECT_W = 9;
const ASPECT_H = 16;

interface ModalShellProps {
  onClose?: () => void;
  /** Не закрывать модалку по клику вне рамки (например, формы регистрации). */
  disableBackdropClose?: boolean;
  size?: ModalShellSize;
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
  // Реальная ширина = min(идеальная, ширина окна с safe-area, высота_окна * 9/16),
  // высота высчитывается через aspect-ratio — пропорция всегда сохраняется.
  const idealWidthRem = size === "compact" ? 21 : size === "wide" ? 30 : 26;

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
        style={{
          // Ширина: меньшее из «идеальной», доступной ширины и высоты * (W/H).
          // Это гарантирует, что соотношение сторон 9:16 не сломается ни при
          // широком экране, ни при низкой высоте.
          width: `min(${idealWidthRem}rem, calc(100vw - 1.5rem), calc((100dvh - 1.5rem) * ${ASPECT_W} / ${ASPECT_H}))`,
          aspectRatio: `${ASPECT_W} / ${ASPECT_H}`,
          // Дополнительная страховка — никогда не выше доступной высоты.
          maxHeight: "calc(100dvh - 1.5rem)",
        }}
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
