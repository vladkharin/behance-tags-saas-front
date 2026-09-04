import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import type { BehanceProject, TagMatrixItem } from "../../types/analytics.types";

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BehanceProject | null;
  tags: TagMatrixItem[];
  views?: number;
  appreciations?: number;
}

type CardFormat = "stories" | "post" | "banner";

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  project,
  tags,
  views = 0,
  appreciations = 0,
}) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const isEn = i18n.language.startsWith("en");

  const [format, setFormat] = useState<CardFormat>("stories");
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !project) return null;

  const validRankedTags = tags
    .filter((t) => typeof t.currentRank === "number" && t.currentRank > 0)
    .sort((a, b) => (a.currentRank || 999) - (b.currentRank || 999));

  const bestTag = validRankedTags[0];
  const top10Tags = validRankedTags.filter((t) => (t.currentRank || 999) <= 10);

  const drawCard = (formatType: CardFormat): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    let width = 1080;
    let height = 1920;

    if (formatType === "post") {
      width = 1200;
      height = 1200;
    } else if (formatType === "banner") {
      width = 1200;
      height = 630;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not available");

    // 1. Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#08090d");
    bgGrad.addColorStop(0.5, "#0e111a");
    bgGrad.addColorStop(1, "#050608");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Glow Circles
    const glow1 = ctx.createRadialGradient(width / 2, height * 0.35, 20, width / 2, height * 0.35, width * 0.6);
    glow1.addColorStop(0, "rgba(0, 87, 255, 0.28)");
    glow1.addColorStop(1, "rgba(0, 87, 255, 0)");
    ctx.fillStyle = glow1;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.35, width * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 2. Stories Layout
    if (formatType === "stories") {
      // Header brand
      ctx.fillStyle = "#0057ff";
      ctx.font = "900 36px Inter, system-ui, sans-serif";
      ctx.fillText("BERANKED", 80, 140);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "700 20px Inter, system-ui, sans-serif";
      ctx.fillText("BEHANCE SEO ANALYTICS", 320, 140);

      // Main Badge
      ctx.fillStyle = "rgba(0, 87, 255, 0.2)";
      ctx.strokeStyle = "rgba(0, 87, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(80, 220, width - 160, 100, 30);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#60a5fa";
      ctx.font = "900 26px Inter, system-ui, sans-serif";
      ctx.fillText("🚀 BEHANCE SEARCH RANKINGS", 120, 282);

      // Project Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 54px Inter, system-ui, sans-serif";
      const displayTitle = project.title.length > 32 ? project.title.substring(0, 29) + "..." : project.title;
      ctx.fillText(displayTitle, 80, 420);

      // Best rank hero card
      if (bestTag && bestTag.currentRank) {
        ctx.fillStyle = "rgba(34, 197, 94, 0.12)";
        ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(80, 480, width - 160, 260, 36);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#4ade80";
        ctx.font = "900 24px Inter, system-ui, sans-serif";
        ctx.fillText("🔥 TOP RANK BREAKTHROUGH", 130, 550);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 110px Inter, system-ui, sans-serif";
        ctx.fillText(`#${bestTag.currentRank}`, 130, 670);

        ctx.fillStyle = "#86efac";
        ctx.font = "800 36px Inter, system-ui, sans-serif";
        ctx.fillText(`by #${bestTag.tag}`, 400, 650);
      }

      // Top-10 tags list
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 32px Inter, system-ui, sans-serif";
      ctx.fillText("🎯 ACTIVE KEYWORDS RANK", 80, 820);

      let curY = 880;
      const renderList = validRankedTags.slice(0, 6);
      renderList.forEach((item) => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(80, curY, width - 160, 85, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "800 28px Inter, system-ui, sans-serif";
        ctx.fillText(`#${item.tag}`, 120, curY + 54);

        const rankVal = item.currentRank || 999;
        const isTop = rankVal <= 10;
        ctx.fillStyle = isTop ? "rgba(34, 197, 94, 0.2)" : "rgba(0, 87, 255, 0.2)";
        ctx.beginPath();
        ctx.roundRect(width - 240, curY + 15, 120, 55, 16);
        ctx.fill();

        ctx.fillStyle = isTop ? "#4ade80" : "#60a5fa";
        ctx.font = "900 26px Inter, system-ui, sans-serif";
        ctx.fillText(`#${rankVal}`, width - 200, curY + 52);

        curY += 105;
      });

      // Bottom Footer CTA
      ctx.fillStyle = "rgba(0, 87, 255, 0.15)";
      ctx.beginPath();
      ctx.roundRect(80, height - 260, width - 160, 140, 30);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 30px Inter, system-ui, sans-serif";
      ctx.fillText("AUDIT YOUR BEHANCE CASE", 130, height - 190);

      ctx.fillStyle = "#60a5fa";
      ctx.font = "700 22px Inter, system-ui, sans-serif";
      ctx.fillText("beranked.domcraft.digital", 130, height - 150);
    } else {
      // Post / Banner Layout
      const isSquare = formatType === "post";
      ctx.fillStyle = "#0057ff";
      ctx.font = "900 28px Inter, system-ui, sans-serif";
      ctx.fillText("BERANKED", 60, 70);

      ctx.fillStyle = "#71717a";
      ctx.font = "700 16px Inter, system-ui, sans-serif";
      ctx.fillText("BEHANCE SEO ANALYTICS", 230, 70);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 42px Inter, system-ui, sans-serif";
      const displayTitle = project.title.length > 40 ? project.title.substring(0, 37) + "..." : project.title;
      ctx.fillText(displayTitle, 60, isSquare ? 160 : 150);

      if (bestTag && bestTag.currentRank) {
        ctx.fillStyle = "rgba(0, 87, 255, 0.12)";
        ctx.strokeStyle = "rgba(0, 87, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(60, isSquare ? 220 : 210, width - 120, isSquare ? 200 : 160, 24);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#60a5fa";
        ctx.font = "800 16px Inter, system-ui, sans-serif";
        ctx.fillText("🔥 TOP SEARCH RANK BREAKTHROUGH", 90, isSquare ? 270 : 260);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 64px Inter, system-ui, sans-serif";
        ctx.fillText(`#${bestTag.currentRank}`, 90, isSquare ? 360 : 335);

        ctx.fillStyle = "#93c5fd";
        ctx.font = "800 24px Inter, system-ui, sans-serif";
        ctx.fillText(`by #${bestTag.tag}`, 260, isSquare ? 350 : 330);
      }

      // Stats Pills
      let tagY = isSquare ? 470 : 410;
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 22px Inter, system-ui, sans-serif";
      ctx.fillText("TOP MONITORED TAGS", 60, tagY);

      tagY += 35;
      const renderTags = validRankedTags.slice(0, isSquare ? 8 : 4);
      let tX = 60;
      let tY = tagY;

      renderTags.forEach((item) => {
        const text = `#${item.tag} (#${item.currentRank})`;
        const textWidth = ctx.measureText(text).width + 40;

        if (tX + textWidth > width - 60) {
          tX = 60;
          tY += 60;
        }

        ctx.fillStyle = (item.currentRank || 999) <= 10 ? "rgba(34, 197, 94, 0.15)" : "rgba(255, 255, 255, 0.06)";
        ctx.strokeStyle = (item.currentRank || 999) <= 10 ? "rgba(34, 197, 94, 0.4)" : "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tX, tY, textWidth, 48, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = (item.currentRank || 999) <= 10 ? "#4ade80" : "#ffffff";
        ctx.font = "700 18px Inter, system-ui, sans-serif";
        ctx.fillText(text, tX + 20, tY + 31);

        tX += textWidth + 15;
      });

      // Bottom verified badge
      ctx.fillStyle = "#71717a";
      ctx.font = "600 14px Inter, system-ui, sans-serif";
      ctx.fillText("Verified by BeRanked — https://beranked.domcraft.digital", 60, height - 40);
    }

    return canvas;
  };

  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const canvas = drawCard(format);
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `beranked-${format}-${project.title.toLowerCase().replace(/[^a-z0-9]/gi, "-")}.png`;
      link.href = dataUrl;
      link.click();
      showToast(isEn ? "Image downloaded in HD! 📸" : "Карточка отчета успешно скачана! 📸", "success");
    } catch {
      showToast(isEn ? "Failed to export image" : "Не удалось сгенерировать изображение", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyImage = async () => {
    try {
      const canvas = drawCard(format);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showToast(isEn ? "Copied card to clipboard! 📋" : "Карточка скопирована в буфер обмена! 📋", "success");
      });
    } catch {
      showToast(isEn ? "Failed to copy image" : "Не удалось скопировать картинку", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-[#121216] border border-white/10 text-white shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
              📸
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                {t("dashboard.shareModal.title")}
              </h3>
              <p className="text-xs text-white/60">
                {t("dashboard.shareModal.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* FORMAT SELECTOR TABS */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-white/40 block">
            {isEn ? "Select Social Format:" : "Формат для публикации:"}
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFormat("stories")}
              type="button"
              className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                format === "stories"
                  ? "bg-behance-blue border-behance-blue text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/5 border-white/5 text-white/70 hover:text-white"
              }`}
            >
              <span>📱</span>
              <span>Stories (9:16)</span>
            </button>

            <button
              onClick={() => setFormat("post")}
              type="button"
              className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                format === "post"
                  ? "bg-behance-blue border-behance-blue text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/5 border-white/5 text-white/70 hover:text-white"
              }`}
            >
              <span>📸</span>
              <span>Post (1:1)</span>
            </button>

            <button
              onClick={() => setFormat("banner")}
              type="button"
              className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                format === "banner"
                  ? "bg-behance-blue border-behance-blue text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/5 border-white/5 text-white/70 hover:text-white"
              }`}
            >
              <span>📊</span>
              <span>Banner (16:9)</span>
            </button>
          </div>
        </div>

        {/* LIVE PREVIEW CARD */}
        <div className="p-5 rounded-2xl bg-gradient-to-tr from-blue-900/20 to-purple-900/10 border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-behance-blue flex items-center gap-1.5">
              <span>🔥</span>
              <span>{bestTag ? `#${bestTag.tag} — ТОП-${bestTag.currentRank}` : project.title}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-mono text-[10px] font-bold">
              {top10Tags.length} in TOP-10
            </span>
          </div>

          <p className="text-sm font-bold text-white truncate">
            {project.title}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {validRankedTags.slice(0, 4).map((tItem) => (
              <span
                key={tItem.tag}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white/80"
              >
                #{tItem.tag} <span className="text-behance-blue">#{tItem.currentRank}</span>
              </span>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleDownloadPng}
            disabled={isExporting}
            type="button"
            className="flex-1 py-3.5 px-6 rounded-2xl bg-behance-blue hover:bg-behance-darkBlue text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>⬇️</span>
            <span>{isExporting ? (isEn ? "Generating..." : "Генерация...") : t("dashboard.shareModal.downloadBtn")}</span>
          </button>

          <button
            onClick={handleCopyImage}
            type="button"
            className="py-3.5 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/10"
          >
            <span>📋</span>
            <span>{isEn ? "Copy Image" : "Скопировать"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
