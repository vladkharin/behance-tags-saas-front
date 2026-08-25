import React, { useRef, useState } from "react";
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

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  project,
  tags,
  views = 0,
  appreciations = 0,
}) => {
  const { t } = useTranslation();
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
      ctx.beginPath();
      ctx.arc(width - 200, 150, 450, 0, Math.PI * 2);
      ctx.fill();

      // 2. Header logo
      ctx.fillStyle = "#0057ff";
      ctx.font = "900 24px Inter, system-ui, sans-serif";
      ctx.fillText("BERANKED", 60, 70);

      ctx.fillStyle = "#71717a";
      ctx.font = "700 16px Inter, system-ui, sans-serif";
      ctx.fillText("BEHANCE SEO ANALYTICS", 215, 70);

      ctx.font = "500 16px monospace";
      const dateStr = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
      ctx.fillText(dateStr, width - 200, 70);

      // Divider line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 100);
      ctx.lineTo(width - 60, 100);
      ctx.stroke();

      // 3. Project title
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px Inter, system-ui, sans-serif";
      const truncatedTitle = project.title.length > 45 ? project.title.substring(0, 42) + "..." : project.title;
      ctx.fillText(truncatedTitle, 60, 160);

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "600 18px Inter, system-ui, sans-serif";
      ctx.fillText(t("dashboard.matrix.tagListSubtitle"), 60, 195);

      // 4. Highlight Stat Box
      ctx.fillStyle = "rgba(0, 87, 255, 0.12)";
      ctx.strokeStyle = "rgba(0, 87, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(60, 230, 520, 140, 20);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#60a5fa";
      ctx.font = "800 14px Inter, system-ui, sans-serif";
      ctx.fillText(bestTag ? t("modals.share.bestTag").toUpperCase() : t("modals.share.tagsOnMonitor").toUpperCase(), 90, 265);

      if (bestTag && bestTag.currentRank) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 48px Inter, system-ui, sans-serif";
        ctx.fillText(`#${bestTag.currentRank}`, 90, 335);

        ctx.fillStyle = "#93c5fd";
        ctx.font = "700 20px Inter, system-ui, sans-serif";
        ctx.fillText(`by #${bestTag.tag}`, 210, 330);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 36px Inter, system-ui, sans-serif";
        ctx.fillText(`${tags.length} tags`, 90, 325);
      }

      // 5. Metrics Grid Box
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(610, 230, 530, 140, 20);
      ctx.fill();
      ctx.stroke();

      // Metrics columns
      const mY = 270;
      const vY = 325;

      // TOP-10
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "800 12px Inter, system-ui, sans-serif";
      ctx.fillText(t("modals.share.top10").toUpperCase(), 640, mY);
      ctx.fillStyle = "#60a5fa";
      ctx.font = "900 36px Inter, system-ui, sans-serif";
      ctx.fillText(String(top10Tags.length), 640, vY);

      // Views
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "800 12px Inter, system-ui, sans-serif";
      ctx.fillText(t("modals.share.views").toUpperCase(), 810, mY);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px Inter, system-ui, sans-serif";
      ctx.fillText(views.toLocaleString(), 810, vY);

      // Likes
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "800 12px Inter, system-ui, sans-serif";
      ctx.fillText(t("modals.share.likes").toUpperCase(), 990, mY);
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 36px Inter, system-ui, sans-serif";
      ctx.fillText(appreciations.toLocaleString(), 990, vY);

      // 6. Top tags badges
      let tagX = 60;
      const tagY = 430;
      validRankedTags.slice(0, 5).forEach((tItem) => {
        const text = `#${tItem.tag} #${tItem.currentRank}`;
        ctx.font = "700 15px Inter, system-ui, sans-serif";
        const tWidth = ctx.measureText(text).width + 30;

        ctx.fillStyle = (tItem.currentRank || 999) <= 10 ? "rgba(0, 87, 255, 0.2)" : "rgba(255, 255, 255, 0.07)";
        ctx.strokeStyle = (tItem.currentRank || 999) <= 10 ? "rgba(0, 87, 255, 0.5)" : "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tWidth, 42, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = (tItem.currentRank || 999) <= 10 ? "#93c5fd" : "#e4e4e7";
        ctx.fillText(text, tagX + 15, tagY + 26);

        tagX += tWidth + 12;
      });

      // 7. Footer URL
      ctx.fillStyle = "#52525b";
      ctx.font = "700 16px Inter, system-ui, sans-serif";
      ctx.fillText("⚡ beranked.domcraft.digital — Behance SEO Engine", 60, 560);

      // Download triggered link
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `beranked-${project.title.toLowerCase().replace(/[^a-z0-9]/gi, "-")}.png`;
      link.href = dataUrl;
      link.click();

      showToast("Карточка отчета успешно скачана! 📸", "success");
    } catch (err) {
      console.error(err);
      showToast("Не удалось сгенерировать PNG файл", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-xl w-full p-6 md:p-8 rounded-[2.5rem] bg-[#121319] border border-white/10 text-white shadow-2xl space-y-6">
        {/* HEADER */}
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-behance-blue px-3 py-1 rounded-full bg-behance-blue/10">
            Social Card Generator
          </span>
          <h2 className="text-xl md:text-2xl font-black mt-1">{t("modals.share.title")}</h2>
          <p className="text-xs text-zinc-400 mt-1">
            {t("modals.share.subtitle")}
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
              {new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black text-white line-clamp-1">{project.title}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">{t("dashboard.matrix.tagListSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {bestTag && bestTag.currentRank ? (
              <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30">
                <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider block">
                  {t("modals.share.bestTag")}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white">#{bestTag.currentRank}</span>
                  <span className="text-xs font-bold text-green-300">по #{bestTag.tag}</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">{t("modals.share.tagsOnMonitor")}</span>
                <span className="text-base font-bold text-white mt-1 block">{t("modals.share.monitoredCount", { count: tags.length })}</span>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex justify-around items-center text-center">
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase block">{t("modals.share.top10")}</span>
                <span className="text-lg font-black text-blue-400">{top10Tags.length}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase block">{t("modals.share.views")}</span>
                <span className="text-lg font-black text-white">{views.toLocaleString()}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase block">{t("modals.share.likes")}</span>
                <span className="text-lg font-black text-white">{appreciations.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {validRankedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {validRankedTags.slice(0, 4).map((tItem) => (
                <span
                  key={tItem.tag}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                    (tItem.currentRank || 999) <= 10
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                      : "bg-white/5 border-white/10 text-zinc-300"
                  }`}
                >
                  #{tItem.tag} <span className="opacity-60">#{tItem.currentRank}</span>
                </span>
              ))}
            </div>
          )}
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
            <span>{isExporting ? t("modals.share.generating") : t("modals.share.downloadPng")}</span>
          </button>

          <button
            onClick={onClose}
            type="button"
            className="py-3.5 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
          >
            {t("modals.share.close")}
          </button>
        </div>
      </div>
    </div>
  );
};
