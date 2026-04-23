import { motion, AnimatePresence } from "motion/react";
import { X, Share2, Copy, CheckCircle, Download } from "lucide-react";
import { useState } from "react";
import QRCode from "react-qr-code";
import { currentUser } from "../utils/compatibilityAI";
import matreshkaLogo from "../../imports/1775050275_(1)_3_(1)-1.png";

interface QRShareModalProps {
  onClose: () => void;
}

export function QRShareModal({ onClose }: QRShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Generate unique QR URL with user ID
  const qrUrl = `${window.location.origin}/scan/${currentUser.id}`;

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-amber-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="size-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Share2 className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Поделиться</h2>
              <p className="text-white/80 text-sm">Пригласи друзей</p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="p-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-gradient-to-r from-red-500 to-amber-500">
            <div className="bg-white p-4 rounded-xl relative">
              <QRCode
                id="qr-code-svg"
                value={qrUrl}
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
                fgColor="#991B1B"
                bgColor="#ffffff"
              />
              {/* Overlay logo on QR code */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-lg shadow-md">
                <img 
                  src={matreshkaLogo} 
                  alt="Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-6">
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
      </motion.div>
    </motion.div>
  );
}