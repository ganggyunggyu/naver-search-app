import type { Options as ConfettiOptions, Shape } from 'canvas-confetti';

// ============================================================
// Types
// ============================================================

export interface ConfettiFireConfig {
  particleRatio: number;
  spread: number;
  startVelocity?: number;
  decay?: number;
  scalar?: number;
}

export interface ConfettiBaseConfig {
  particleCount: number;
  origin: { x?: number; y: number };
  zIndex: number;
}

export interface RainDropConfig {
  particleCount: number;
  origin: { x: number; y: number };
  delay?: number;
}

export interface RainEffectConfig {
  startVelocity: number;
  spread: number;
  ticks: number;
  zIndex: number;
  colors: string[];
  shapes: Shape[];
  gravity: number;
  scalar: number;
  drift: number;
}

export interface LoseTextStyle {
  /** 그라데이션 사용 시 CSS 클래스로 처리 */
  useGradient: boolean;
  /** 폴백 단색 (그라데이션 미지원 시) */
  fallbackColor: string;
  /** 그라데이션 색상 (위 → 아래) */
  gradientColors: {
    top: string;
    middle: string;
    bottom: string;
  };
  /** 외곽선 색상 */
  strokeColors: {
    inner: string;
    outer: string;
  };
  /** 베벨 라인 색상 */
  bevelColor: string;
  /** text-shadow CSS */
  textShadow: string;
  /** 애니메이션 지속 시간 (ms) */
  duration: number;
  /** 배경 색상 (노란 보드) */
  backgroundColor: string;
}

// ============================================================
// Success Effect (Confetti Celebration)
// ============================================================

export const CONFETTI_SUCCESS_BASE: ConfettiBaseConfig = {
  particleCount: 200,
  origin: { y: 0.7 },
  zIndex: 9999,
};

export const CONFETTI_SUCCESS_FIRES: ConfettiFireConfig[] = [
  { particleRatio: 0.25, spread: 26, startVelocity: 55 },
  { particleRatio: 0.2, spread: 60 },
  { particleRatio: 0.35, spread: 100, decay: 0.91, scalar: 0.8 },
  { particleRatio: 0.1, spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 },
  { particleRatio: 0.1, spread: 120, startVelocity: 45 },
];

// ============================================================
// Failure Effect (Rain Drops)
// ============================================================

export const RAIN_EFFECT_BASE: RainEffectConfig = {
  startVelocity: 10,
  spread: 360,
  ticks: 100,
  zIndex: 9998,
  colors: ['#60A5FA', '#3B82F6', '#2563EB', '#93C5FD'],
  shapes: ['circle'] as Shape[],
  gravity: 1.5,
  scalar: 0.8,
  drift: 0,
};

export const RAIN_DROPS_INITIAL: RainDropConfig[] = [
  { particleCount: 30, origin: { x: 0.2, y: 0 } },
  { particleCount: 30, origin: { x: 0.5, y: 0 } },
  { particleCount: 30, origin: { x: 0.8, y: 0 } },
];

export const RAIN_DROPS_DELAYED: RainDropConfig[] = [
  { particleCount: 20, origin: { x: 0.3, y: 0 }, delay: 200 },
  { particleCount: 20, origin: { x: 0.7, y: 0 }, delay: 200 },
];

// ============================================================
// LOSE!! Text Effect (Crazy Arcade Style)
// ============================================================

export const LOSE_TEXT_STYLE: LoseTextStyle = {
  useGradient: true,
  fallbackColor: '#CBCBCB',
  gradientColors: {
    top: '#F8FFFF',
    middle: '#CBCBCB',
    bottom: '#8A8E96',
  },
  strokeColors: {
    inner: '#414044',
    outer: '#252428',
  },
  bevelColor: '#66646C',
  // 이중 외곽선 + 베벨 + 드롭섀도우
  textShadow: `
    /* 안쪽 스트로크 (inner: #414044) */
    -2px -2px 0 #414044,
    2px -2px 0 #414044,
    -2px 2px 0 #414044,
    2px 2px 0 #414044,
    0 -2px 0 #414044,
    0 2px 0 #414044,
    -2px 0 0 #414044,
    2px 0 0 #414044,
    /* 바깥쪽 스트로크 (outer: #252428) */
    -4px -4px 0 #252428,
    4px -4px 0 #252428,
    -4px 4px 0 #252428,
    4px 4px 0 #252428,
    0 -4px 0 #252428,
    0 4px 0 #252428,
    -4px 0 0 #252428,
    4px 0 0 #252428,
    /* 드롭 섀도우 */
    6px 6px 12px rgba(0, 0, 0, 0.5)
  `,
  duration: 1200,
  backgroundColor: '#B68117',
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Success confetti 발사 헬퍼
 */
export const fireSuccessConfetti = (
  confettiFn: (opts: ConfettiOptions) => void
) => {
  const { particleCount, origin, zIndex } = CONFETTI_SUCCESS_BASE;

  CONFETTI_SUCCESS_FIRES.forEach((fire) => {
    confettiFn({
      particleCount: Math.floor(particleCount * fire.particleRatio),
      spread: fire.spread,
      startVelocity: fire.startVelocity,
      decay: fire.decay,
      scalar: fire.scalar,
      origin,
      zIndex,
    });
  });
};

/**
 * Failure rain 발사 헬퍼
 */
export const fireRainEffect = (
  confettiFn: (opts: ConfettiOptions) => void
) => {
  // 즉시 발사
  RAIN_DROPS_INITIAL.forEach((drop) => {
    confettiFn({
      ...RAIN_EFFECT_BASE,
      particleCount: drop.particleCount,
      origin: drop.origin,
    });
  });

  // 딜레이 발사
  const delayedDrops = RAIN_DROPS_DELAYED.filter((d) => d.delay);
  if (delayedDrops.length > 0) {
    const delay = delayedDrops[0].delay!;
    setTimeout(() => {
      delayedDrops.forEach((drop) => {
        confettiFn({
          ...RAIN_EFFECT_BASE,
          particleCount: drop.particleCount,
          origin: drop.origin,
        });
      });
    }, delay);
  }
};
