import { motion, AnimatePresence } from "motion/react";
import { Share2, CheckCircle, Download } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import matreshkaLogo from "../../imports/1775050275_(1)_3_(1)-1.png";
import { useAuth } from "../contexts/AuthContext";
import { ModalShell } from "./ui/modal-shell";

interface QRShareModalProps {
  onClose: () => void;
}

export function QRShareModal({ onClose }: QRShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { user } = useAuth();
  
  // Generate unique QR URL with user ID
  const qrUrl = user?.id
    ? `${window.location.origin}/scan/${user.id}`
    : `${window.location.origin}/`;

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    img.onload = () => {
      if (!ctx) return;
      // Draw white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR code
      ctx.drawImage(img, 100, 100, 800, 800);

      // Draw matreshka logo in center
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoSize = 120;
        const logoX = (canvas.width - logoSize) / 2;
        const logoY = (canvas.height - logoSize) / 2;
        
        // Draw white background for logo
        ctx.fillStyle = "white";
        ctx.fillRect(logoX - 10, logoY - 10, logoSize + 20, logoSize + 20);
        
        // Draw logo
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "qr-code-любить-по-русски.png";
          a.click();
          URL.revokeObjectURL(url);
        });
      };
      logoImg.src = matreshkaLogo;
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Любить по-russки",
          text: "Отсканируй мой QR-код и узнай нашу совместимость!",
          url: qrUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          // If sharing fails, fall back to copying
          await copyToClipboard();
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback: copy to clipboard
      await copyToClipboard();
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    // Use fallback method directly in restricted environments
    fallbackCopyTextToClipboard(qrUrl);
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Make it invisible
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
    
    document.body.removeChild(textArea);
  };

  return (
    <ModalShell onClose={onClose} ariaLabel="Поделиться QR-кодом">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-red-500 to-amber-500 px-5 sm:px-6 py-4 sm:py-5 text-white">
          <div className="flex items-center gap-3 pr-12">
            <div className="bg-white/20 p-2.5 rounded-full">
              <Share2 className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold leading-tight">Поделиться</h2>
              <p className="text-white/80 text-xs">Пригласи друзей</p>
            </div>
          </div>
        </div>

        {/* QR Code body */}
        <div className="flex-1 min-h-0 overflow-y-auto modal-scroll p-5 sm:p-6 flex flex-col">
          <div className="mx-auto w-full max-w-[260px] bg-white p-3 rounded-2xl shadow-lg">
            <div className="bg-white p-2 rounded-xl relative">
              <QRCode
                id="qr-code-svg"
                value={qrUrl}
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
                fgColor="#991B1B"
                bgColor="#ffffff"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-lg shadow-md">
                <img
                  src={matreshkaLogo}
                  alt="Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Отсканируйте QR-код, чтобы узнать совместимость
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                <Download className="size-5" />
                Скачать
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-amber-500 hover:shadow-lg text-white rounded-xl font-medium transition-shadow disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="copied"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="size-5" />
                      Скопировано
                    </motion.div>
                  ) : (
                    <motion.div
                      key="share"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="size-5" />
                      Поделиться
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}