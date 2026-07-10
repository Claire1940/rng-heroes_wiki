"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * 视频特性区
 *
 * 自动播放策略：
 * - 视频区域进入视口时，由 IntersectionObserver 触发静音自动播放（autoplay=1&mute=1&loop=1）
 * - 用户点击 poster 上的播放按钮（真实用户手势）时，以有声模式加载并播放
 * - 不支持 IntersectionObserver 的环境退化为点击后备
 * - active=false 时只渲染 YouTube 缩略图 + 播放按钮，SSR / hydration 安全
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const watchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${videoId}`,
    [videoId],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);

  // 进入视口自动播放（静音 + 循环）。YouTube 单视频循环必须带 playlist=<id>。
  const autoplayEmbedUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`,
    [videoId],
  );

  // 点击播放（用户手势）→ 有声播放
  const clickEmbedUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`,
    [videoId],
  );

  const embedUrl = muted ? autoplayEmbedUrl : clickEmbedUrl;

  useEffect(() => {
    if (active) return;
    if (typeof IntersectionObserver === "undefined") return;

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(true);
            setMuted(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  const handlePlayClick = () => {
    setActive(true);
    setMuted(false);
  };

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black/40"
        style={{ paddingBottom: "56.25%" }}
      >
        {active ? (
          <iframe
            className="absolute top-0 left-0 h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label={`Play ${title}`}
            className="group absolute top-0 left-0 h-full w-full"
          >
            {/* YouTube 缩略图（懒加载，SSR 安全） */}
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] shadow-lg ring-4 ring-[hsl(var(--nav-theme)/0.3)] transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-1 h-7 w-7 fill-white text-white" />
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
