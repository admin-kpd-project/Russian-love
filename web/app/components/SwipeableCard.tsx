import { useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  index: number;
  /** Например, во время анимации суперлайка */
  dragEnabled?: boolean;
}

export function SwipeableCard({ children, onSwipeLeft, onSwipeRight, index, dragEnabled = true }: SwipeableCardProps) {
  const [exitX, setExitX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (isAnimating) return;
    
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      setIsAnimating(true);
      setExitX(info.offset.x > 0 ? 300 : -300);
      
      setTimeout(() => {
        if (info.offset.x > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      }, 200);
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        position: "absolute",
        width: "100%",
        height: "100%",
        cursor: "grab",
        zIndex: 10 - index, // Передняя карточка (index 0) имеет самый высокий z-index
      }}
      drag={index === 0 && dragEnabled ? "x" : false} // Только передняя карточка может свайпаться
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{
        scale: index === 0 ? 0.98 : 0.92 - (index * 0.02),
        opacity: index === 0 ? 1 : 0.6,
        y: index * 20,
        x: exitX,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      whileTap={{ cursor: "grabbing" }}
    >
      {children}
    </motion.div>
  );
}