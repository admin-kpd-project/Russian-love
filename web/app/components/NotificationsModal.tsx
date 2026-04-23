import { motion } from "motion/react";
import { X, Heart, Star, MessageCircle, UserPlus, Gift, Send } from "lucide-react";

import type { OpenChatParams } from "../types/chat";

interface NotificationsModalProps {
  onClose: () => void;
  onOpenChat: (params: OpenChatParams) => void;
}

interface Notification {
  id: number;
  type: "match" | "like" | "message" | "superlike" | "new";
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
  userName?: string;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "match",
    title: "Новый match!",
    message: "У вас взаимная симпатия с Анастасией",
    time: "2 минуты назад",
    read: false,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    userName: "Анастасия",
  },
  {
    id: 2,
    type: "superlike",
    title: "Супер-лайк!",
    message: "Мария отправила вам супер-лайк",
    time: "15 минут назад",
    read: false,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    userName: "Мария",
  },
  {
    id: 3,
    type: "like",
    title: "Новый лайк",
    message: "Кто-то поставил вам лайк",
    time: "1 час назад",
    read: true,
  },
  {
    id: 4,
    type: "message",
    title: "Новое сообщение",
    message: "Елена написала вам сообщение",
    time: "2 часа назад",
    read: true,
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop",
    userName: "Елена",
  },
  {
    id: 5,
    type: "new",
    title: "Обновление профилей",
    message: "5 новых пользователей в вашем районе",
    time: "3 часа назад",
    read: true,
  },
];

export function NotificationsModal({ onClose, onOpenChat }: NotificationsModalProps) {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "match":
        return <Heart className="size-5 text-red-500" />;
      case "superlike":
        return <Star className="size-5 text-amber-500" />;
      case "like":
        return <Heart className="size-5 text-pink-500" />;
      case "message":
        return <MessageCircle className="size-5 text-blue-500" />;
      case "new":
        return <UserPlus className="size-5 text-green-500" />;
      default:
        return <Gift className="size-5 text-purple-500" />;
    }
  };

  const getBackgroundColor = (type: Notification["type"]) => {
    switch (type) {
      case "match":
        return "bg-red-50";
      case "superlike":
        return "bg-amber-50";
      case "like":
        return "bg-pink-50";
      case "message":
        return "bg-blue-50";
      case "new":
        return "bg-green-50";
      default:
        return "bg-purple-50";
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-amber-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Уведомления</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-white/90">{unreadCount} непрочитанных</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="size-6 text-white" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-4">
          {mockNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-red-100 to-amber-100 rounded-full p-8 mx-auto w-fit mb-4">
                <MessageCircle className="size-12 text-red-500" />
              </div>
              <p className="text-gray-600">Нет новых уведомлений</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-3 p-4 rounded-2xl transition-colors ${
                    !notification.read ? "bg-gradient-to-r from-red-50 to-amber-50" : "bg-white border border-gray-100"
                  }`}
                >
                  {/* Avatar or Icon */}
                  <div className={`flex-shrink-0 size-12 rounded-full flex items-center justify-center ${getBackgroundColor(notification.type)}`}>
                    {notification.avatar ? (
                      <img
                        src={notification.avatar}
                        alt=""
                        className="size-12 rounded-full object-cover"
                      />
                    ) : (
                      getIcon(notification.type)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="size-2 bg-red-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mb-2">{notification.time}</p>
                    
                    {/* Write Button for notifications with avatar */}
                    {notification.avatar && notification.userName && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onOpenChat({
                            userName: notification.userName!,
                            userAvatar: notification.avatar!,
                          });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all hover:scale-105"
                      >
                        <Send className="size-4" />
                        Написать
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {mockNotifications.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <button className="w-full text-center text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
              Отметить все как прочитанные
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}