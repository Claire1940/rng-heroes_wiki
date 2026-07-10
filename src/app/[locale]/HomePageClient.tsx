"use client";

import { useState, Suspense, lazy } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Coins,
  Copy,
  Dices,
  ExternalLink,
  Footprints,
  Gamepad2,
  Gift,
  ListChecks,
  Map as MapIcon,
  Newspaper,
  Sparkles,
  Swords,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Tools Grid 导航卡片 ↔ 内容 section 锚点（顺序与 t.tools.cards 一一对应）
const TOOL_SECTION_IDS = [
  "codes",
  "beginner-guide",
  "tier-list",
  "rolling-luck-guide",
  "gold-farming-guide",
  "zones-biomes-guide",
  "monsters-combat-guide",
  "updates-community",
];

// 优先级 → 主题色强度（避免硬编码红/橙/黄，统一用主题色）
function priorityClass(priority: string): string {
  const p = priority.toLowerCase();
  if (p.includes("essential") || p.includes("highest") || p.includes("required")) {
    return "bg-[hsl(var(--nav-theme))] text-white border-transparent";
  }
  if (p.includes("high") || p.includes("do first") || p.includes("core")) {
    return "bg-[hsl(var(--nav-theme)/0.2)] text-[hsl(var(--nav-theme-light))] border-[hsl(var(--nav-theme)/0.4)]";
  }
  return "bg-[hsl(var(--nav-theme)/0.08)] text-[hsl(var(--nav-theme-light))] border-[hsl(var(--nav-theme)/0.3)]";
}

// 模块标题（含主题名）+ 介绍 的统一头部
function ModuleHeader({
  icon,
  title,
  intro,
}: {
  icon: React.ReactNode;
  title: string;
  intro: string;
}) {
  return (
    <div className="mb-8 scroll-reveal text-center md:mb-12">
      <div className="mb-3 flex items-center justify-center gap-3 md:mb-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme)/0.12)] text-[hsl(var(--nav-theme-light))] md:h-12 md:w-12">
          {icon}
        </span>
        <h2 className="text-3xl font-bold md:text-5xl">{title}</h2>
      </div>
      <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
        {intro}
      </p>
    </div>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.rng-heroes.wiki";

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [combatExpanded, setCombatExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 1500);
  };

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "RNG Heroes Wiki",
        description:
          "Complete RNG Heroes Wiki covering working codes, hero rarities, rolls, biomes, monsters, and progression tips for the Roblox RNG hero collection game.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "RNG Heroes - Roblox Hero Collection RNG Game",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "RNG Heroes Wiki",
        alternateName: "RNG Heroes",
        url: siteUrl,
        description:
          "Complete RNG Heroes Wiki resource hub for codes, hero rarities, rolls, biomes, monsters, and progression guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "RNG Heroes Wiki - Roblox Hero Collection RNG Game",
        },
        sameAs: ["https://www.roblox.com/games/108307565942574/RNG-Heroes"],
      },
      {
        "@type": "VideoGame",
        name: "RNG Heroes",
        gamePlatform: ["Roblox"],
        applicationCategory: "Game",
        genre: ["RNG", "Collection", "Adventure", "RPG"],
        numberOfPlayers: { minValue: 1, maxValue: 12 },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/108307565942574/RNG-Heroes",
        },
      },
      {
        "@type": "VideoObject",
        name: "RNG Heroes - Noob to Rarest Hero!",
        description:
          "RNG Heroes gameplay progression: rolling from common heroes to the rarest. A noob-to-pro showcase of the Roblox RNG hero collection game.",
        uploadDate: "2026-06-20",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/78t3CzjFGeg",
        url: "https://www.youtube.com/watch?v=78t3CzjFGeg",
      },
    ],
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                          bg-[hsl(var(--nav-theme)/0.1)]
                          border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs font-medium md:text-sm">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold leading-[1.05] sm:text-5xl md:mb-6 md:text-7xl">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("codes")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <Ticket className="h-5 w-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/108307565942574/RNG-Heroes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-4 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl scroll-reveal">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="78t3CzjFGeg"
              title="RNG Heroes - Noob to Rarest Hero!"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（模块导航区，位于视频区之后、Latest Updates 之前） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 text-center scroll-reveal md:mb-12">
            <h2 className="mb-3 text-3xl font-bold md:mb-4 md:text-5xl">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = TOOL_SECTION_IDS[index];
              return (
                <a
                  key={index}
                  href={`#${sectionId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(sectionId);
                  }}
                  className="scroll-reveal group flex flex-col rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg md:mb-4 md:h-12 md:w-12
                                bg-[hsl(var(--nav-theme)/0.1)]
                                group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))] md:h-6 md:w-6"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold md:text-base">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端方形 / 桌面端横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Latest Updates Section */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      {/* Module 1: RNG Heroes Codes */}
      <section id="codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Ticket className="h-6 w-6" />}
            title={t.modules.rngHeroesCodes.title}
            intro={t.modules.rngHeroesCodes.intro}
          />

          <div className="scroll-reveal space-y-4">
            {t.modules.rngHeroesCodes.codes.map((c: any, index: number) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-white/5"
              >
                {/* 代码头部 */}
                <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between md:p-6">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(c.code)}
                      className="group flex items-center gap-2 rounded-lg border-2 border-dashed border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.08)] px-4 py-2 font-mono text-lg font-bold tracking-wide text-[hsl(var(--nav-theme-light))] transition-colors hover:border-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.15)]"
                      aria-label={`Copy code ${c.code}`}
                    >
                      {c.code}
                      {copiedCode === c.code ? (
                        <Check className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(var(--nav-theme-light))]" />
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--nav-theme))] px-3 py-1 text-xs font-semibold text-white">
                      <Check className="h-3.5 w-3.5" />
                      {c.status}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {c.added}
                    </span>
                  </div>
                </div>

                {/* 奖励 */}
                <div className="flex items-center gap-3 border-b border-border p-5 md:p-6">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.12)]">
                    <Gift className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                  </span>
                  <p className="text-sm font-medium md:text-base">{c.reward}</p>
                </div>

                {/* 兑换步骤 + 故障排查：双列 */}
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {c.redeemSteps?.length > 0 && (
                    <div className="border-b border-border p-5 md:border-b-0 md:border-r md:p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <ListChecks className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                        <h3 className="font-bold">How to Redeem</h3>
                      </div>
                      <ol className="space-y-2">
                        {c.redeemSteps.map((step: string, si: number) => (
                          <li key={si} className="flex items-start gap-2.5">
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.15)] text-xs font-bold text-[hsl(var(--nav-theme-light))]">
                              {si + 1}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {c.troubleshooting?.length > 0 && (
                    <div className="p-5 md:p-6">
                      <div className="mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                        <h3 className="font-bold">If the Code Doesn't Work</h3>
                      </div>
                      <ul className="space-y-2">
                        {c.troubleshooting.map((tip: string, ti: number) => (
                          <li key={ti} className="flex items-start gap-2">
                            <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                            <span className="text-sm text-muted-foreground">
                              {tip}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {t.modules.rngHeroesCodes.noExpiredNote && (
            <p className="mt-4 text-center text-xs text-muted-foreground md:text-sm">
              {t.modules.rngHeroesCodes.noExpiredNote}
            </p>
          )}
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Beginner Progression Guide */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Footprints className="h-6 w-6" />}
            title={t.modules.beginnerProgression.title}
            intro={t.modules.beginnerProgression.intro}
          />

          <div className="scroll-reveal space-y-3 md:space-y-4">
            {t.modules.beginnerProgression.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:gap-4 md:p-6"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)] md:h-12 md:w-12">
                  <span className="text-base font-bold text-[hsl(var(--nav-theme-light))] md:text-xl">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2 md:mb-2">
                    <h3 className="text-lg font-bold md:text-xl">{step.title}</h3>
                    {step.priority && (
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityClass(step.priority)}`}
                      >
                        {step.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 3: Tier List */}
      <section id="tier-list" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Trophy className="h-6 w-6" />}
            title={t.modules.tierList.title}
            intro={t.modules.tierList.intro}
          />

          <div className="scroll-reveal space-y-6">
            {t.modules.tierList.tiers.map((tier: any, ti: number) => (
              <div
                key={ti}
                className="overflow-hidden rounded-2xl border border-border bg-white/5"
              >
                <div className="flex items-center gap-3 border-b border-border bg-[hsl(var(--nav-theme)/0.06)] p-4 md:p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme))] text-lg font-black text-white">
                    {tier.tier}
                  </span>
                  <h3 className="text-base font-bold md:text-lg">{tier.label}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:p-5">
                  {tier.heroes.map((hero: any, hi: number) => (
                    <div
                      key={hi}
                      className="rounded-xl border border-border bg-white/5 p-4 md:p-5"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-lg font-bold text-[hsl(var(--nav-theme-light))]">
                          {hero.name}
                        </h4>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-0.5 text-xs">
                          {hero.rarity}
                        </span>
                      </div>
                      <p className="mb-3 text-xs text-muted-foreground md:text-sm">
                        <span className="font-medium text-foreground">
                          How to get:{" "}
                        </span>
                        {hero.obtainMethod}
                      </p>
                      <ul className="mb-3 space-y-1.5">
                        {hero.strengths.map((s: string, si: number) => (
                          <li key={si} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                            <span className="text-sm text-muted-foreground">
                              {s}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="rounded-lg bg-[hsl(var(--nav-theme)/0.05)] p-3 text-xs text-muted-foreground md:text-sm">
                        {hero.recommendedUse}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 5: 模块之间停顿 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 4: Rolling and Luck Guide */}
      <section id="rolling-luck-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Dices className="h-6 w-6" />}
            title={t.modules.rollingLuck.title}
            intro={t.modules.rollingLuck.intro}
          />

          <div className="scroll-reveal space-y-3 md:space-y-4">
            {t.modules.rollingLuck.rows.map((row: any, index: number) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-base font-bold md:text-lg">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--nav-theme)/0.12)] text-sm text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                    {row.source}
                  </h3>
                  {row.priority && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityClass(row.priority)}`}
                    >
                      {row.priority}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Cost
                    </p>
                    <p className="text-sm">{row.cost}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Effect
                    </p>
                    <p className="text-sm text-muted-foreground">{row.effect}</p>
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Known Value
                    </p>
                    <p className="text-sm text-[hsl(var(--nav-theme-light))]">
                      {row.knownValue}
                    </p>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Recommended Timing
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {row.recommendedTiming}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 5: Gold Farming and Upgrades Guide */}
      <section id="gold-farming-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Coins className="h-6 w-6" />}
            title={t.modules.goldFarming.title}
            intro={t.modules.goldFarming.intro}
          />

          <div className="scroll-reveal space-y-3 md:space-y-4">
            {t.modules.goldFarming.rows.map((row: any, index: number) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 text-base font-bold md:text-lg">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--nav-theme)/0.12)] text-sm text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                    {row.methodOrUpgrade}
                  </h3>
                  {row.priority && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityClass(row.priority)}`}
                    >
                      {row.priority}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Stage
                    </p>
                    <p className="text-sm">{row.stage}</p>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Requirement
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {row.requirement}
                    </p>
                  </div>
                  <div className="lg:col-span-3">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Reward / Effect
                    </p>
                    <p className="text-sm text-[hsl(var(--nav-theme-light))]">
                      {row.rewardOrEffect}
                    </p>
                  </div>
                  <div className="lg:col-span-3">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Recommended Use
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {row.recommendedUse}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 6: Zones and Biomes Guide */}
      <section id="zones-biomes-guide" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<MapIcon className="h-6 w-6" />}
            title={t.modules.zonesBiomes.title}
            intro={t.modules.zonesBiomes.intro}
          />

          <div className="scroll-reveal grid grid-cols-1 gap-4 md:grid-cols-2">
            {t.modules.zonesBiomes.zones.map((zone: any, index: number) => (
              <div
                key={index}
                className="flex flex-col rounded-2xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] text-base font-black text-white">
                    {zone.stage}
                  </span>
                  <h3 className="text-lg font-bold">{zone.name}</h3>
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2.5 py-0.5 text-xs">
                    {zone.enemyDifficulty}
                  </span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Unlock: </span>
                  {zone.unlockRequirement}
                </p>
                <p className="mb-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Rewards: </span>
                  {zone.mainRewards}
                </p>
                <ul className="mb-3 space-y-1.5">
                  {zone.objectives.map((o: string, oi: number) => (
                    <li key={oi} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                      <span className="text-sm text-muted-foreground">{o}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-auto rounded-lg bg-[hsl(var(--nav-theme)/0.05)] p-3 text-xs text-muted-foreground md:text-sm">
                  <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                    Advance when:{" "}
                  </span>
                  {zone.advanceWhen}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Monsters and Combat Guide */}
      <section id="monsters-combat-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Swords className="h-6 w-6" />}
            title={t.modules.monstersCombat.title}
            intro={t.modules.monstersCombat.intro}
          />

          <div className="scroll-reveal space-y-3">
            {t.modules.monstersCombat.panels.map((panel: any, index: number) => {
              const isOpen = combatExpanded === index;
              return (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-border bg-white/5"
                >
                  <button
                    onClick={() =>
                      setCombatExpanded(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-white/5"
                    aria-expanded={isOpen}
                  >
                    <span>
                      <span className="block font-semibold">{panel.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground md:text-sm">
                        {panel.summary}
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-[hsl(var(--nav-theme-light))] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-border px-5 py-4">
                      <ul className="space-y-2">
                        {panel.details.map((d: string, di: number) => (
                          <li key={di} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                            <span className="text-sm text-muted-foreground">
                              {d}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module 8: Updates and Community */}
      <section id="updates-community" className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Newspaper className="h-6 w-6" />}
            title={t.modules.updatesCommunity.title}
            intro={t.modules.updatesCommunity.intro}
          />

          <div className="scroll-reveal relative space-y-6 border-l-2 border-[hsl(var(--nav-theme)/0.3)] pl-6 md:pl-8">
            {t.modules.updatesCommunity.events.map((ev: any, index: number) => (
              <div key={index} className="relative">
                <div className="absolute -left-[1.6rem] h-4 w-4 rounded-full border-2 border-background bg-[hsl(var(--nav-theme))] md:-left-[2.1rem]" />
                <div className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] px-2.5 py-0.5 text-xs">
                      <Clock className="h-3 w-3" />
                      {ev.period}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-border bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground">
                      {ev.category}
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-base font-bold md:text-lg">
                    {ev.headline}
                  </h3>
                  <p className="mb-2 text-sm text-muted-foreground">
                    {ev.details}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-[hsl(var(--nav-theme-light))]">
                      What to do:{" "}
                    </span>
                    <span className="text-muted-foreground">{ev.playerAction}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 官方社群外链 */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:mt-10">
            <a
              href="https://www.roblox.com/games/108307565942574/RNG-Heroes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] px-4 py-2 text-sm transition-colors hover:bg-[hsl(var(--nav-theme)/0.2)]"
            >
              <Gamepad2 className="h-4 w-4" /> RNG Heroes{" "}
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://www.roblox.com/communities/15904375/Heroplay-Studios"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] px-4 py-2 text-sm transition-colors hover:bg-[hsl(var(--nav-theme)/0.2)]"
            >
              <Users className="h-4 w-4" /> Heroplay Studios{" "}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="border-t border-border bg-white/[0.02]">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/games/108307565942574/RNG-Heroes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.robloxGame}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/15904375/Heroplay-Studios"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.robloxGroup}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=78t3CzjFGeg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
