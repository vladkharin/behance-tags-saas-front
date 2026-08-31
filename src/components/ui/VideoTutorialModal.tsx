import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContextInstance";
import { fireConfetti } from "../../utils/confetti";

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_DURATION_SEC = 32;

export const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [customVideoUrl, setCustomVideoUrl] = useState<string>("");
  const [showCustomUrlInput, setShowCustomUrlInput] = useState<boolean>(false);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const steps = [
    {
      title: t("onboarding.videoModal.step1Title"),
      desc: t("onboarding.videoModal.step1Desc"),
      icon: "🔗",
      timeRange: [0, 8],
      highlight: t("onboarding.videoModal.step1Highlight"),
    },
    {
      title: t("onboarding.videoModal.step2Title"),
      desc: t("onboarding.videoModal.step2Desc"),
      icon: "🤖",
      timeRange: [8, 16],
      highlight: t("onboarding.videoModal.step2Highlight"),
    },
    {
      title: t("onboarding.videoModal.step3Title"),
      desc: t("onboarding.videoModal.step3Desc"),
      icon: "🚀",
      timeRange: [16, 24],
      highlight: t("onboarding.videoModal.step3Highlight"),
    },
    {
      title: t("onboarding.videoModal.step4Title"),
      desc: t("onboarding.videoModal.step4Desc"),
      icon: "🎯",
      timeRange: [24, 32],
      highlight: t("onboarding.videoModal.step4Highlight"),
    },
  ];

  // Auto-play timeline animation loop
  useEffect(() => {
    if (!isOpen) {
      setPlaybackTime(0);
      setIsPlaying(true);
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current !== null && isPlaying) {
        const delta = (time - lastTimeRef.current) / 1000;
        setPlaybackTime((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= TOTAL_DURATION_SEC) {
            return 0; // Loop seamlessly
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
    };
  }, [isOpen, isPlaying, playbackSpeed]);

  // Sync active step with playback time
  useEffect(() => {
    const currentIdx = steps.findIndex(
      (s) => playbackTime >= s.timeRange[0] && playbackTime < s.timeRange[1],
    );
    if (currentIdx !== -1 && currentIdx !== activeStep) {
      setActiveStep(currentIdx);
      if (currentIdx === 3 && Math.floor(playbackTime) === 28) {
        fireConfetti();
      }
    }
  }, [playbackTime, activeStep, steps]);

  const handleStepClick = (stepIdx: number) => {
    setActiveStep(stepIdx);
    setPlaybackTime(steps[stepIdx].timeRange[0]);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setPlaybackTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `0${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div
        className={`max-w-4xl w-full rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl overflow-hidden flex flex-col transition-all max-h-[92vh] ${
          isDark ? "bg-[#0d0d0d] border-white/10 text-white" : "bg-white border-behance-border text-behance-black"
        }`}
      >
        {/* MODAL HEADER */}
        <div className="p-5 md:p-7 border-b border-behance-border dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-behance-blue/10 flex items-center justify-center text-behance-blue text-lg font-black shrink-0">
              ▶️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-black uppercase tracking-tight">
                  {t("onboarding.videoModal.title")}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                  {t("onboarding.videoModal.badge")}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                {t("onboarding.videoModal.subtitle")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-200/60 dark:bg-white/10 flex items-center justify-center text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
          {/* CUSTOM VIDEO OR LIVE MOTION STAGE */}
          {customVideoUrl.trim() ? (
            <div className="relative rounded-3xl overflow-hidden aspect-video bg-black shadow-2xl border border-behance-border dark:border-white/10">
              <iframe
                src={customVideoUrl}
                title="BeRanked Video Guide"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            /* LIVE MOTION ANIMATION CANVAS STAGE */
            <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden aspect-video bg-gradient-to-b from-[#0a0a0f] to-[#12121c] border border-white/10 shadow-2xl p-4 md:p-8 flex flex-col justify-between select-none">
              {/* Background Glow */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

              {/* STAGE HEADER BAR */}
              <div className="relative z-10 flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40 ml-2">
                    beranked.app/dashboard
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-behance-blue/20 text-blue-400 border border-blue-500/30">
                    {t("onboarding.videoModal.scene", { num: activeStep + 1, name: steps[activeStep].title.split(". ")[1] || steps[activeStep].title })}
                  </span>
                </div>
              </div>

              {/* DYNAMIC SCENES */}
              <div className="relative z-10 flex-1 flex items-center justify-center py-4">
                {/* SCENE 1: LINK IMPORT */}
                {activeStep === 0 && (
                  <div className="w-full max-w-lg space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="text-center space-y-1">
                      <span className="text-xs font-black uppercase text-blue-400 tracking-widest">
                        {t("onboarding.videoModal.step1StageHeader")}
                      </span>
                      <h4 className="text-lg md:text-xl font-black uppercase text-white tracking-tight">
                        {t("onboarding.videoModal.step1StageTitle")}
                      </h4>
                    </div>

                    <div className="relative bg-white/5 border border-blue-500/40 rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center justify-between text-xs font-mono text-white">
                        <span className="truncate pr-4 text-blue-300">
                          https://www.behance.net/gallery/198242/Nike-Identity
                        </span>
                        <span className="text-[9px] font-black uppercase bg-green-500/20 text-green-400 px-2 py-0.5 rounded-md shrink-0">
                          {t("onboarding.videoModal.step1Recognized")}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-center gap-2">
                      {["+branding", "+ui/ux", "+3d render", "+typography"].map((chip, idx) => (
                        <span
                          key={chip}
                          className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-white/10 text-white/80 border border-white/5 transition-all ${
                            idx === 0 ? "scale-105 bg-blue-500 text-white shadow-md shadow-blue-500/30" : ""
                          }`}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    <div className="w-full py-3.5 rounded-2xl bg-behance-blue text-white text-xs font-black uppercase tracking-widest text-center shadow-lg shadow-blue-500/30 animate-pulse">
                      {t("onboarding.videoModal.step1LaunchBtn")}
                    </div>
                  </div>
                )}

                {/* SCENE 2: ROBOT SCANNING */}
                {activeStep === 1 && (
                  <div className="w-full max-w-md text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-purple-500/40 animate-ping" />
                      <div className="absolute -inset-2 rounded-full border border-blue-500/30 animate-pulse" />
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-purple-500/40">
                        🤖
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base md:text-lg font-black uppercase text-white tracking-tight">
                        {t("onboarding.videoModal.stage2Scanning")}
                      </h4>
                      <p className="text-[11px] text-white/60 font-medium mt-1">
                        {t("onboarding.videoModal.stage2Searching")}
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
                      {[
                        { tag: "#branding", status: t("dashboard.status.checking") || "Scanning..." },
                        { tag: "#visual identity", status: t("dashboard.matrix.filterTop10") || "TOP-10!" },
                        { tag: "#logo design", status: t("dashboard.status.checking") || "Scanning..." },
                      ].map((item, idx) => (
                        <span
                          key={item.tag}
                          className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                            idx === 1
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-white/10 text-white/70 border-white/10 animate-pulse"
                          }`}
                        >
                          {item.tag} • {item.status}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* SCENE 3: REALTIME RANK BREAKTHROUGH */}
                {activeStep === 2 && (
                  <div className="w-full max-w-lg space-y-3.5 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center text-white px-2">
                      <span className="text-xs font-black uppercase tracking-wider text-green-400">
                        {t("onboarding.videoModal.stage3Results")}
                      </span>
                      <span className="text-[10px] font-black uppercase bg-green-500/20 text-green-400 px-2.5 py-0.5 rounded-full border border-green-500/30">
                        {t("onboarding.videoModal.stage3Visibility")}
                      </span>
                    </div>

                    {/* MINI RANK MATRIX */}
                    <div className="space-y-2">
                      {[
                        { tag: "branding", rank: "#2", trend: "+44", isTop: true },
                        { tag: "visual identity", rank: "#7", trend: "+28", isTop: true },
                        { tag: "typography", rank: "#14", trend: "+12", isTop: false },
                      ].map((item) => (
                        <div
                          key={item.tag}
                          className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/10 text-white"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs font-black uppercase">#{item.tag}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md">
                              ▲ {item.trend}
                            </span>
                            <span
                              className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                                item.isTop
                                  ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {item.rank}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SCENE 4: GRAPH & EXPORT CELEBRATION */}
                {activeStep === 3 && (
                  <div className="w-full max-w-md text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-4 rounded-3xl bg-gradient-to-tr from-green-500/20 to-blue-500/10 border border-green-500/30 space-y-2">
                      <span className="text-2xl">🎉</span>
                      <h4 className="text-base md:text-lg font-black uppercase text-white">
                        {t("onboarding.videoModal.stage4Reach")}
                      </h4>
                      <p className="text-[11px] text-white/70 font-medium leading-relaxed">
                        {t("onboarding.videoModal.stage4Desc")}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1 py-3 rounded-2xl bg-behance-blue text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 scale-105">
                        <span>🎯</span>
                        <span>{t("onboarding.videoModal.stage4CopyBtn")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PLAYER CONTROLS BAR */}
              <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/10 space-y-2">
                <div className="flex items-center gap-3">
                  {/* Play / Pause */}
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    type="button"
                    className="w-8 h-8 rounded-xl bg-behance-blue text-white flex items-center justify-center text-xs font-black hover:scale-105 transition-transform cursor-pointer"
                  >
                    {isPlaying ? "⏸" : "▶"}
                  </button>

                  {/* Scrubber */}
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max={TOTAL_DURATION_SEC}
                      step="0.1"
                      value={playbackTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-[10px] font-mono text-white/60 shrink-0">
                      {formatTime(playbackTime)} / {formatTime(TOTAL_DURATION_SEC)}
                    </span>
                  </div>

                  {/* Speed switch */}
                  <div className="flex gap-1">
                    {[1, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        type="button"
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                          playbackSpeed === s
                            ? "bg-white text-black"
                            : "bg-white/10 text-white/50 hover:text-white"
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP BY STEP INTERACTIVE TIMELINE */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {steps.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStepClick(idx)}
                  type="button"
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeStep === idx
                      ? "border-behance-blue bg-behance-blue/10 shadow-md scale-[1.02]"
                      : "border-transparent bg-gray-100/70 dark:bg-white/5 opacity-50 hover:opacity-100"
                  }`}
                >
                  <span className="text-base block mb-1">{s.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider block truncate">
                    {t("onboarding.videoModal.stepPrefix", { num: idx + 1 })}
                  </span>
                </button>
              ))}
            </div>

            {/* ACTIVE STEP DETAILS CARD */}
            <div
              className={`p-6 rounded-3xl border transition-all ${
                isDark ? "bg-white/5 border-white/5" : "bg-behance-grayBg border-behance-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{steps[activeStep].icon}</span>
                <h4 className="text-sm md:text-base font-black uppercase tracking-tight text-behance-blue">
                  {steps[activeStep].title}
                </h4>
              </div>
              <p className="text-xs md:text-sm opacity-70 leading-relaxed font-medium mb-3">
                {steps[activeStep].desc}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-behance-blue/10 text-behance-blue text-[10px] font-black uppercase tracking-wider">
                <span>{t("onboarding.videoModal.howItWorks")}</span>
                <span>{steps[activeStep].highlight}</span>
              </div>
            </div>
          </div>

          {/* OPTIONAL EXTERNAL VIDEO URL LINK TOGGLE */}
          <div className="pt-2 border-t border-behance-border dark:border-white/5">
            {!showCustomUrlInput ? (
              <button
                onClick={() => setShowCustomUrlInput(true)}
                type="button"
                className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-opacity tracking-widest"
              >
                {t("onboarding.videoModal.customVideoBtn")}
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("onboarding.videoModal.customVideoPlaceholder")}
                  value={customVideoUrl}
                  onChange={(e) => setCustomVideoUrl(e.target.value)}
                  className={`flex-1 rounded-xl px-4 py-2 text-xs outline-none border ${
                    isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-300 text-black"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCustomUrlInput(false)}
                  className="px-3 py-2 rounded-xl text-xs opacity-50 hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-5 md:p-7 border-t border-behance-border dark:border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50 dark:bg-white/5">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 hidden sm:inline">
            BeRanked SEO Suite • 2026
          </span>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-behance-blue text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
          >
            {t("onboarding.videoModal.closeBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};
