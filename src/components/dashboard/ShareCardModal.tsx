import React, { useRef, useState } from "react";
import { useToast } from "../../context/ToastContext";
import type { Project, TagMatrixItem } from "../../types/analytics.types";

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  tags: TagMatrixItem[];
  views?: number;
  appreciations?: number;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  project,
  tags,
  views = 0,
  appreciations = 0,
}) => {
  const { showToast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !project) return null;

  // Best ranked tags
  const validRankedTags = tags
    .filter((t) => typeof t.currentRank === "number" && t.currentRank > 0)
    .sort((a, b) => (a.currentRank || 999) - (b.currentRank || 999));

  const bestTag = validRankedTags[0];
  const top10Tags = validRankedTags.filter((t) => (t.currentRank || 999) <= 10);

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      // Use Canvas API to draw a high-res social card
      const canvas = document.createElement("canvas");
      const width = 1200;
      const height = 630;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas context not available");

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#09090d");
      bgGrad.addColorStop(0.5, "#0f111a");
      bgGrad.addColorStop(1, "#07080b");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Decorative glow circle
      const glowGrad = ctx.createRadialGradient(width - 200, 150, 10, width - 200, 150, 450);
      glowGrad.addColorStop(0, "rgba(0, 87, 255, 0.25)");
      glowGrad.addColorStop(1, "rgba(0, 87, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // 3. Logo / Brand Header
      ctx.fillStyle = "#0057ff";
      ctx.font = "900 32px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("BERANKED", 60, 90);

      ctx.fillStyle = "#71717a";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("BEHANCE SEO & TAG ANALYTICS", 260, 85);

      // Date badge
      const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(today, width - 60, 85);
      ctx.textAlign = "left";

      // 4. Project Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 48px -apple-system, BlinkMacSystemFont, sans-serif";
      const displayTitle = project.title.length > 35 ? project.title.substring(0, 35) + "..." : project.title;
      ctx.fillText(displayTitle, 60, 175);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 20px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`Отчет о позициях в глобальном поиске Behance`, 60, 215);

      // 5. Highlight Badges Box
      if (bestTag && bestTag.currentRank) {
        // Gold / Green Hero Badge
        ctx.fillStyle = "rgba(34, 197, 94, 0.15)";
        ctx.strokeStyle = "rgba(34, 197, 94, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(60, 260, 500, 120, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#22c55e";
        ctx.font = "900 20px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText("ЛУЧШАЯ ПОЗИЦИЯ В ПОИСКЕ", 90, 300);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 42px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(`МЕСТО #${bestTag.currentRank}`, 90, 355);

        ctx.fillStyle = "#86efac";
        ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(`по тегу #${bestTag.tag}`, 340, 353);
      }

      // Stats Right Box
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.roundRect(600, 260, 540, 120, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("В ТОП-10 ВЫДАЧИ", 630, 305);
      ctx.fillText("ПРОСМОТРОВ", 820, 305);
      ctx.fillText("ОЦЕНОК", 1000, 305);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`${top10Tags.length} тегов`, 630, 355);
      ctx.fillText(`${views.toLocaleString()}`, 820, 355);
      ctx.fillText(`${appreciations.toLocaleString()}`, 1000, 355);

      // 6. Top Tags Pill List
      ctx.fillStyle = "#71717a";
      ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("АКТИВНЫЕ ТЕГИ КЕЙСА В ТОПЕ:", 60, 430);

      let xPos = 60;
      const yPos = 460;
      validRankedTags.slice(0, 5).forEach((t) => {
        const tagText = `#${t.tag} (${t.currentRank})`;
        ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
        const tagWidth = ctx.measureText(tagText).width + 36;

        ctx.fillStyle = (t.currentRank || 999) <= 10 ? "rgba(0, 87, 255, 0.2)" : "rgba(255, 255, 255, 0.08)";
        ctx.strokeStyle = (t.currentRank || 999) <= 10 ? "#0057ff" : "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.roundRect(xPos, yPos, tagWidth, 48, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = (t.currentRank || 999) <= 10 ? "#60a5fa" : "#e4e4e7";
        ctx.fillText(tagText, xPos + 18, yPos + 31);

        xPos += tagWidth + 16;
      });

      // 7. Footer
      ctx.fillStyle = "#52525b";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("⚡ Аналитика и мониторинг позиций на beranked.domcraft.digital", 60, 580);

      // Download
      const link = document.createElement("a");
      link.download = `beranked-${project.title.replace(/[^a-zA-Z0-9а-яА-Я]/g, "-").toLowerCase()}-report.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      showToast("Карточка отчета успешно скачана! 📸", "success");
    } catch {
      showToast("Не удалось сохранить изображение", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#141419] border border-white/10 rounded-3xl p-6 md:p-8 text-white shadow-2xl space-y-6">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* HEADER */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-behance-blue block">
            Экспорт для заказчиков и сторис
          </span>
          <h2 className="text-xl md:text-2xl font-black mt-1">Карточка успеха кейса</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Поделитесь высокими позициями вашего проекта в соцсетях или отправьте заказчику.
          </p>
        </div>

        {/* PREVIEW CARD */}
        <div
          ref={cardRef}
          className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-white/10 space-y-4 shadow-inner"
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-behance-blue uppercase">BeRanked</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Behance Analytics</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black text-white line-clamp-1">{project.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Позиции кейса в выдаче Behance</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {bestTag && bestTag.currentRank ? (
              <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30">
                <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider block">
                  Лучшая позиция
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white">#{bestTag.currentRank}</span>
                  <span className="text-xs font-bold text-green-300">по #{bestTag.tag}</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Теги</span>
                <span className="text-base font-bold text-white mt-1 block">{tags.length} тегов на мониторинге</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex justify-around items-center text-center">
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase block">В ТОП-10</span>
                <span className="text-lg font-black text-blue-400">{top10Tags.length}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase block">Просмотры</span>
                <span className="text-lg font-black text-white">{views.toLocaleString()}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase block">Лайки</span>
                <span className="text-lg font-black text-white">{appreciations.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {validRankedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {validRankedTags.slice(0, 4).map((t) => (
                <span
                  key={t.tag}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                    (t.currentRank || 999) <= 10
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                      : "bg-white/5 border-white/10 text-zinc-300"
                  }`}
                >
                  #{t.tag} <span className="opacity-60">#{t.currentRank}</span>
                </span>
              ))}
            </div>
          )}

          <div className="pt-2 text-[10px] text-zinc-500 text-center font-medium">
            ⚡ beranked.domcraft.digital
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            type="button"
            className="flex-1 py-3.5 px-6 rounded-2xl bg-behance-blue hover:bg-behance-darkBlue text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>📸</span>
            <span>{isExporting ? "Генерация PNG..." : "Скачать изображение (PNG)"}</span>
          </button>

          <button
            onClick={onClose}
            type="button"
            className="py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
