import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LAMP_STATES } from './LampStateController';
import './BridgeLamp.css';

/**
 * BridgeLamp — Luxury articulated desk lamp emerging from behind the login card.
 *
 * Coordinate system (viewBox 0 0 680 620):
 * - Login card right boundary sits at X ≈ 440.
 * - Base mounting bracket is attached at X = 446, Y = 312 (partially behind card).
 * - Lower articulated arm extends up-right to elbow joint P1 at X ≈ 580, Y ≈ 190.
 * - Upper arm reaches up-left to knuckle joint P2 at X ≈ 528, Y ≈ 84.
 * - Lampshade bell emerges gracefully, mouth sits at X ≈ 462, Y ≈ 130.
 * - Features an ADORABLE, PROPERLY ALIGNED CHARACTER FACE inside the illuminated lampshade:
 *   Two tiny dark-brown oval eyes aligned side-by-side horizontally, with an endearing
 *   subtle smile, natural blinking, wake-up sequence, curious narrowing, privacy mode,
 *   surprised widening, happy sparkles, and intelligent gaze tracking.
 */

const POSE_TARGETS = {
  [LAMP_STATES.ENTERING]: {
    p1: { x: 574, y: 202 },
    p2: { x: 520, y: 98 },
    thetaHead: 138,
    brightness: 0.65,
    mouthRadius: 34,
    shadeLength: 55,
  },
  [LAMP_STATES.IDLE]: {
    p1: { x: 580, y: 190 },
    p2: { x: 528, y: 84 },
    thetaHead: 142,
    brightness: 1.0,
    mouthRadius: 35,
    shadeLength: 56,
  },
  [LAMP_STATES.EMAIL_FOCUSED]: {
    p1: { x: 586, y: 180 },
    p2: { x: 534, y: 76 },
    thetaHead: 154,
    brightness: 1.25,
    mouthRadius: 36,
    shadeLength: 58,
  },
  [LAMP_STATES.EMAIL_TYPING]: {
    p1: { x: 586, y: 180 },
    p2: { x: 534, y: 76 },
    thetaHead: 155,
    brightness: 1.3,
    mouthRadius: 36,
    shadeLength: 58,
  },
  [LAMP_STATES.EMAIL_VALID]: {
    p1: { x: 582, y: 175 },
    p2: { x: 530, y: 72 },
    thetaHead: 148,
    brightness: 1.35,
    mouthRadius: 36,
    shadeLength: 58,
  },
  [LAMP_STATES.EMAIL_INVALID]: {
    p1: { x: 578, y: 195 },
    p2: { x: 524, y: 92 },
    thetaHead: 160,
    brightness: 0.8,
    mouthRadius: 34,
    shadeLength: 55,
  },
  [LAMP_STATES.PASSWORD_FOCUSED]: {
    p1: { x: 570, y: 212 },
    p2: { x: 520, y: 110 },
    thetaHead: 130,
    brightness: 1.25,
    mouthRadius: 36,
    shadeLength: 58,
  },
  [LAMP_STATES.PASSWORD_TYPING]: {
    p1: { x: 562, y: 226 },
    p2: { x: 512, y: 124 },
    thetaHead: 112,
    brightness: 0.8,
    mouthRadius: 34,
    shadeLength: 56,
  },
  [LAMP_STATES.PASSWORD_HIDDEN]: {
    p1: { x: 562, y: 226 },
    p2: { x: 512, y: 124 },
    thetaHead: 110,
    brightness: 0.7,
    mouthRadius: 33,
    shadeLength: 54,
  },
  [LAMP_STATES.PASSWORD_VISIBLE]: {
    p1: { x: 572, y: 206 },
    p2: { x: 522, y: 104 },
    thetaHead: 134,
    brightness: 1.35,
    mouthRadius: 36,
    shadeLength: 58,
  },
  [LAMP_STATES.FORM_INVALID]: {
    p1: { x: 574, y: 200 },
    p2: { x: 520, y: 96 },
    thetaHead: 158,
    brightness: 0.85,
    mouthRadius: 35,
    shadeLength: 56,
  },
  [LAMP_STATES.AUTHENTICATING]: {
    p1: { x: 582, y: 184 },
    p2: { x: 528, y: 80 },
    thetaHead: 142,
    brightness: 1.35,
    mouthRadius: 36,
    shadeLength: 58,
  },
  [LAMP_STATES.AUTHENTICATION_SUCCESS]: {
    p1: { x: 568, y: 165 },
    p2: { x: 514, y: 64 },
    thetaHead: 102,
    brightness: 1.45,
    mouthRadius: 38,
    shadeLength: 60,
  },
  [LAMP_STATES.AUTHENTICATION_ERROR]: {
    p1: { x: 572, y: 202 },
    p2: { x: 518, y: 100 },
    thetaHead: 160,
    brightness: 0.55,
    mouthRadius: 33,
    shadeLength: 54,
  },
  [LAMP_STATES.NETWORK_ERROR]: {
    p1: { x: 568, y: 208 },
    p2: { x: 515, y: 106 },
    thetaHead: 125,
    brightness: 0.75,
    mouthRadius: 35,
    shadeLength: 56,
  },
  [LAMP_STATES.SIGNUP_HOVERED]: {
    p1: { x: 576, y: 210 },
    p2: { x: 524, y: 106 },
    thetaHead: 136,
    brightness: 1.15,
    mouthRadius: 35,
    shadeLength: 56,
  },
};

export const BridgeLamp = ({
  lampState = LAMP_STATES.IDLE,
  pointerPos = { x: 0.5, y: 0.5 },
  isPointerActive = false,
  onEntranceComplete,
}) => {
  const initialPreset = POSE_TARGETS[lampState] || POSE_TARGETS[LAMP_STATES.IDLE];
  const currentPose = useRef({
    p1: { ...initialPreset.p1 },
    p2: { ...initialPreset.p2 },
    thetaHead: initialPreset.thetaHead,
    brightness: initialPreset.brightness,
    mouthRadius: initialPreset.mouthRadius,
    shadeLength: initialPreset.shadeLength,
  });

  const [renderPose, setRenderPose] = useState({
    p1: { ...initialPreset.p1 },
    p2: { ...initialPreset.p2 },
    thetaHead: initialPreset.thetaHead,
    brightness: initialPreset.brightness,
    mouthRadius: initialPreset.mouthRadius,
    shadeLength: initialPreset.shadeLength,
  });

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // ═════════════════════════════════════════════════════════════════════════
  // CHARACTER FACE CONTROLLER: WAKE UP, BLINKING & EXPRESSIONS
  // ═════════════════════════════════════════════════════════════════════════
  const [isAwake, setIsAwake] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isCuriousNarrowed, setIsCuriousNarrowed] = useState(false);
  const [isConcernedActive, setIsConcernedActive] = useState(false);

  // 1. Wake up sequence on entrance
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsAwake(true);
      if (onEntranceComplete) onEntranceComplete();
      return;
    }

    if (lampState === LAMP_STATES.ENTERING) {
      setIsAwake(false);
      // Gentle waking flutter
      const t1 = setTimeout(() => setIsBlinking(true), 300);
      const t2 = setTimeout(() => {
        setIsBlinking(false);
        setIsAwake(true);
      }, 550);
      const t3 = setTimeout(() => {
        if (onEntranceComplete) onEntranceComplete();
      }, 1400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setIsAwake(true);
    }
  }, [lampState, prefersReducedMotion, onEntranceComplete]);

  // 2. Curious narrowing when user focuses password field
  useEffect(() => {
    if (lampState === LAMP_STATES.PASSWORD_FOCUSED) {
      setIsCuriousNarrowed(true);
      const t = setTimeout(() => {
        setIsCuriousNarrowed(false);
      }, 850);
      return () => clearTimeout(t);
    } else {
      setIsCuriousNarrowed(false);
    }
  }, [lampState]);

  // 3. Concerned expression on form invalid
  useEffect(() => {
    if (lampState === LAMP_STATES.FORM_INVALID || lampState === LAMP_STATES.EMAIL_INVALID) {
      setIsConcernedActive(true);
      const t = setTimeout(() => {
        setIsConcernedActive(false);
      }, 1600);
      return () => clearTimeout(t);
    } else {
      setIsConcernedActive(false);
    }
  }, [lampState]);

  // 4. Natural randomized blinking engine
  useEffect(() => {
    if (prefersReducedMotion || !isAwake) return;

    let timeoutId;
    let blinkDurationId;

    const scheduleNextBlink = () => {
      // Natural randomized interval between 3.2s and 6.2s
      const delay = 3200 + Math.random() * 3000;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);

        // Closing duration: 160ms
        blinkDurationId = setTimeout(() => {
          setIsBlinking(false);

          // 25% chance of a friendly double-blink
          if (Math.random() < 0.25) {
            timeoutId = setTimeout(() => {
              setIsBlinking(true);
              blinkDurationId = setTimeout(() => {
                setIsBlinking(false);
                scheduleNextBlink();
              }, 140);
            }, 130);
          } else {
            scheduleNextBlink();
          }
        }, 160);
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(blinkDurationId);
    };
  }, [isAwake, prefersReducedMotion]);

  // 5. Active Target Pose Interpolation
  const target = useMemo(() => {
    const base = POSE_TARGETS[lampState] || POSE_TARGETS[LAMP_STATES.IDLE];
    const res = {
      p1: { ...base.p1 },
      p2: { ...base.p2 },
      thetaHead: base.thetaHead,
      brightness: base.brightness,
      mouthRadius: base.mouthRadius,
      shadeLength: base.shadeLength,
    };

    // Subtle pointer interactivity in idle mode
    if (isPointerActive && lampState === LAMP_STATES.IDLE && !prefersReducedMotion) {
      res.thetaHead += (pointerPos.y - 0.5) * 4;
      res.p2.x += (pointerPos.x - 0.5) * 5;
      res.p2.y += (pointerPos.y - 0.5) * 3;
    }

    return res;
  }, [lampState, isPointerActive, pointerPos, prefersReducedMotion]);

  // Spring animation loop with buttery lerp
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const speed = prefersReducedMotion ? 40 : 8.5;
      const c = currentPose.current;

      // Gentle organic breathing in idle state
      let breathOffset = 0;
      if (lampState === LAMP_STATES.IDLE && !prefersReducedMotion) {
        breathOffset = Math.sin(currentTime / 900) * 0.4;
      }

      c.p1.x += (target.p1.x - c.p1.x) * speed * dt;
      c.p1.y += (target.p1.y - c.p1.y) * speed * dt;
      c.p2.x += (target.p2.x - c.p2.x) * speed * dt;
      c.p2.y += (target.p2.y + breathOffset - c.p2.y) * speed * dt;
      c.thetaHead += (target.thetaHead + breathOffset * 0.7 - c.thetaHead) * speed * dt;
      c.brightness += (target.brightness - c.brightness) * speed * dt;
      c.mouthRadius += (target.mouthRadius - c.mouthRadius) * speed * dt;
      c.shadeLength += (target.shadeLength - c.shadeLength) * speed * dt;

      setRenderPose({
        p1: { ...c.p1 },
        p2: { ...c.p2 },
        thetaHead: c.thetaHead,
        brightness: c.brightness,
        mouthRadius: c.mouthRadius,
        shadeLength: c.shadeLength,
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [target, lampState, prefersReducedMotion]);

  // ═════════════════════════════════════════════════════════════════════════
  // KINEMATICS & GEOMETRY
  // ═════════════════════════════════════════════════════════════════════════
  // P0: Wall mount base pivot — sits right at the edge of the card (X=446, Y=312)
  const P0 = { x: 446, y: 312 };
  const P1 = renderPose.p1;
  const P2 = renderPose.p2;

  // Angles and normals for arm struts
  const angle1 = Math.atan2(P1.y - P0.y, P1.x - P0.x);
  const norm1X = Math.sin(angle1) * 3.5;
  const norm1Y = -Math.cos(angle1) * 3.5;

  const angle2 = Math.atan2(P2.y - P1.y, P2.x - P1.x);
  const norm2X = Math.sin(angle2) * 3.5;
  const norm2Y = -Math.cos(angle2) * 3.5;

  // Neck & Lampshade positioning
  const radHead = (renderPose.thetaHead * Math.PI) / 180;
  const normHead = radHead + Math.PI / 2;

  const L_NECK = 26;
  const P_dome = {
    x: P2.x + L_NECK * Math.cos(radHead),
    y: P2.y + L_NECK * Math.sin(radHead),
  };

  const P_mouth = {
    x: P_dome.x + renderPose.shadeLength * Math.cos(radHead),
    y: P_dome.y + renderPose.shadeLength * Math.sin(radHead),
  };

  const DOME_RADIUS = 15;
  const domeTop = {
    x: P_dome.x + DOME_RADIUS * Math.cos(normHead),
    y: P_dome.y + DOME_RADIUS * Math.sin(normHead),
  };
  const domeBottom = {
    x: P_dome.x - DOME_RADIUS * Math.cos(normHead),
    y: P_dome.y - DOME_RADIUS * Math.sin(normHead),
  };

  const mouthTop = {
    x: P_mouth.x + renderPose.mouthRadius * Math.cos(normHead),
    y: P_mouth.y + renderPose.mouthRadius * Math.sin(normHead),
  };
  const mouthBottom = {
    x: P_mouth.x - renderPose.mouthRadius * Math.cos(normHead),
    y: P_mouth.y - renderPose.mouthRadius * Math.sin(normHead),
  };

  // ═════════════════════════════════════════════════════════════════════════
  // GAZE & EXPRESSIONS IN HORIZONTAL SCREEN COORDINATES
  // ═════════════════════════════════════════════════════════════════════════
  const isSurprised = lampState === LAMP_STATES.PASSWORD_VISIBLE;
  const isHappy = lampState === LAMP_STATES.EMAIL_VALID || lampState === LAMP_STATES.AUTHENTICATION_SUCCESS;
  const isPrivacyAvert =
    lampState === LAMP_STATES.PASSWORD_TYPING || lampState === LAMP_STATES.PASSWORD_HIDDEN;
  const isSleepy = !isAwake;

  // Gaze direction in screen-horizontal coordinates (Negative X = Left towards card, Positive Y = Down towards fields)
  const gaze = useMemo(() => {
    let gx = -0.5;
    let gy = 0.5;

    if (lampState === LAMP_STATES.EMAIL_FOCUSED || lampState === LAMP_STATES.EMAIL_TYPING) {
      // Attentively glance left and down toward the username/email input
      gx = -1.8;
      gy = 1.2;
    } else if (lampState === LAMP_STATES.PASSWORD_FOCUSED) {
      // Curiously glance left and further down toward the password input
      gx = -1.8;
      gy = 2.0;
    } else if (isPrivacyAvert) {
      // Playfully look UP and RIGHT to respect user privacy!
      gx = 1.8;
      gy = -1.5;
    } else if (isConcernedActive) {
      // Slightly lower gaze when concerned
      gx = -0.8;
      gy = 1.8;
    } else if (lampState === LAMP_STATES.SIGNUP_HOVERED) {
      // Look down toward the signup link
      gx = -1.0;
      gy = 2.6;
    } else if (isPointerActive && !prefersReducedMotion) {
      gx += (pointerPos.x - 0.5) * 1.2;
      gy += (pointerPos.y - 0.5) * 1.2;
    }

    return { x: gx, y: gy };
  }, [lampState, isPrivacyAvert, isConcernedActive, isPointerActive, pointerPos, prefersReducedMotion]);

  // Tension springs
  const spring1Start = {
    x: P0.x + (P1.x - P0.x) * 0.22 - norm1X * 1.5,
    y: P0.y + (P1.y - P0.y) * 0.22 - norm1Y * 1.5,
  };
  const spring1End = {
    x: P1.x - norm1X * 1.5,
    y: P1.y - norm1Y * 1.5,
  };

  const spring2Start = {
    x: P1.x + norm2X * 1.5,
    y: P1.y + norm2Y * 1.5,
  };
  const spring2End = {
    x: P1.x + (P2.x - P1.x) * 0.78 + norm2X * 1.5,
    y: P1.y + (P2.y - P1.y) * 0.78 + norm2Y * 1.5,
  };

  const generateSpringPath = (start, end, coils = 10, amp = 3.2) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) return '';
    const nx = -dy / dist;
    const ny = dx / dist;

    let path = `M ${start.x.toFixed(1)} ${start.y.toFixed(1)}`;
    for (let i = 1; i <= coils; i++) {
      const t = i / (coils + 1);
      const sign = i % 2 === 0 ? 1 : -1;
      const px = start.x + dx * t + nx * amp * sign;
      const py = start.y + dy * t + ny * amp * sign;
      path += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    path += ` L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
    return path;
  };

  const spring1Path = generateSpringPath(spring1Start, spring1End, 10, 3.0);
  const spring2Path = generateSpringPath(spring2Start, spring2End, 9, 3.0);

  const isLightActive = renderPose.brightness > 0.1;

  // Eye scale calculations
  let eyeScaleY = 1.0;
  let eyeScaleX = 1.0;
  if (isSleepy || isBlinking) {
    eyeScaleY = 0.08;
  } else if (isPrivacyAvert) {
    eyeScaleY = 0.28;
  } else if (isCuriousNarrowed) {
    eyeScaleY = 0.72;
  } else if (isSurprised) {
    eyeScaleX = 1.25;
    eyeScaleY = 1.25;
  } else if (isHappy) {
    eyeScaleY = 0.85;
  }

  return (
    <svg
      className="bridge-lamp-svg"
      viewBox="0 0 680 620"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* Polished Champagne Brass Gradients */}
        <linearGradient id="blBrassGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7d885" />
          <stop offset="35%" stopColor="#d4a34b" />
          <stop offset="70%" stopColor="#b8863b" />
          <stop offset="100%" stopColor="#8c6023" />
        </linearGradient>

        <linearGradient id="blBrassHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff6d8" />
          <stop offset="45%" stopColor="#e5b654" />
          <stop offset="100%" stopColor="#966d25" />
        </linearGradient>

        {/* Satin Brass / Gold Lampshade Gradient */}
        <linearGradient id="blGoldShadeGrad" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#f7e1a0" />
          <stop offset="20%" stopColor="#dfad51" />
          <stop offset="55%" stopColor="#ba812b" />
          <stop offset="85%" stopColor="#8c5816" />
          <stop offset="100%" stopColor="#5c380b" />
        </linearGradient>

        {/* Golden Interior Dish Reflector */}
        <radialGradient id="blShadeInterior" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#ffe999" />
          <stop offset="70%" stopColor="#e5af44" />
          <stop offset="100%" stopColor="#9c6d20" />
        </radialGradient>

        {/* Golden Interior Cavity Backlight Wash */}
        <radialGradient id="blCavityGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%" stopColor="#ffe99e" stopOpacity="0.85" />
          <stop offset="65%" stopColor="#f0b643" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#9c6d20" stopOpacity="0" />
        </radialGradient>

        {/* Radiant Bulb Filament / Core */}
        <radialGradient id="blBulbRadial" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="30%" stopColor="#fff5d0" stopOpacity="0.9" />
          <stop offset="65%" stopColor="#fed776" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#d4a34b" stopOpacity="0" />
        </radialGradient>

        {/* Polished Brass Lip Rim */}
        <linearGradient id="blBrassLipRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3ce" />
          <stop offset="25%" stopColor="#e5b85a" />
          <stop offset="50%" stopColor="#fef0cb" />
          <stop offset="75%" stopColor="#aa7322" />
          <stop offset="100%" stopColor="#e2b252" />
        </linearGradient>

        {/* ─── TWO TINY EYES GRADIENTS ─── */}
        {/* Small Dark-Brown Oval Eyes — Elegant, warm espresso tone */}
        <radialGradient id="tinyEyeDarkBrown" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4a2a14" />
          <stop offset="55%" stopColor="#2c1709" />
          <stop offset="100%" stopColor="#180b03" />
        </radialGradient>

        {/* Mouth Aperture Clip Boundary — strictly bounds eyes inside lampshade opening */}
        <clipPath id="blMouthApertureClip">
          <ellipse cx="0" cy="0" rx="20" ry={renderPose.mouthRadius} />
        </clipPath>

        {/* Drop Shadows */}
        <filter id="blCastShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="3" dy="5" stdDeviation="5" floodColor="#1e1810" floodOpacity="0.32" />
        </filter>
      </defs>

      {/* ═══════════════════════════════════════════════════════════
          1. WALL MOUNTING BRACKET (Emerges from behind card edge)
          ═══════════════════════════════════════════════════════════ */}
      <g className="bl-wall-mount" filter="url(#blCastShadow)">
        <rect
          x="438"
          y="262"
          width="18"
          height="92"
          rx="5"
          fill="rgba(24, 18, 12, 0.25)"
        />
        <rect
          x="440"
          y="260"
          width="16"
          height="90"
          rx="5"
          fill="url(#blBrassGold)"
          stroke="#7a5217"
          strokeWidth="1.2"
        />
        <circle cx="448" cy="270" r="2.6" fill="#54380f" />
        <circle cx="448" cy="270" r="1.3" fill="#f7d885" />
        <circle cx="448" cy="340" r="2.6" fill="#54380f" />
        <circle cx="448" cy="340" r="1.3" fill="#f7d885" />

        <circle cx={P0.x} cy={P0.y} r="14" fill="#241d15" stroke="url(#blBrassGold)" strokeWidth="2" />
        <circle cx={P0.x} cy={P0.y} r="10" fill="url(#blBrassHighlight)" />
        <circle cx={P0.x} cy={P0.y} r="5" fill="#54380f" />
        <circle cx={P0.x} cy={P0.y} r="2.2" fill="#fff2c6" />
      </g>

      {/* ═══════════════════════════════════════════════════════════
          2. LOWER ARTICULATED ARM (Twin Parallel Brass Struts)
          ═══════════════════════════════════════════════════════════ */}
      <g className="bl-lower-arm" filter="url(#blCastShadow)">
        <line
          x1={P0.x - norm1X}
          y1={P0.y - norm1Y}
          x2={P1.x - norm1X}
          y2={P1.y - norm1Y}
          stroke="url(#blBrassGold)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1={P0.x - norm1X + 0.6}
          y1={P0.y - norm1Y - 0.6}
          x2={P1.x - norm1X + 0.6}
          y2={P1.y - norm1Y - 0.6}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <line
          x1={P0.x + norm1X}
          y1={P0.y + norm1Y}
          x2={P1.x + norm1X}
          y2={P1.y + norm1Y}
          stroke="url(#blBrassGold)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1={P0.x + norm1X + 0.6}
          y1={P0.y + norm1Y - 0.6}
          x2={P1.x + norm1X + 0.6}
          y2={P1.y + norm1Y - 0.6}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <circle
          cx={P0.x + (P1.x - P0.x) * 0.5}
          cy={P0.y + (P1.y - P0.y) * 0.5}
          r="4"
          fill="url(#blBrassGold)"
          stroke="#54380f"
          strokeWidth="1"
        />

        {spring1Path && (
          <path d={spring1Path} stroke="url(#blBrassGold)" strokeWidth="1.8" fill="none" opacity="0.9" />
        )}
      </g>

      {/* ═══════════════════════════════════════════════════════════
          3. ELBOW ARTICULATED JOINT (Outside the card)
          ═══════════════════════════════════════════════════════════ */}
      <g className="bl-elbow-joint" filter="url(#blCastShadow)">
        <circle cx={P1.x} cy={P1.y} r="14" fill="#241d15" stroke="url(#blBrassGold)" strokeWidth="1.8" />
        <circle cx={P1.x} cy={P1.y} r="9.5" fill="url(#blBrassHighlight)" />
        {/* Knurled Thumbscrew Wing Handle */}
        <rect
          x={P1.x - 13}
          y={P1.y - 3.8}
          width="26"
          height="7.6"
          rx="2.5"
          fill="url(#blBrassGold)"
          stroke="#634412"
          strokeWidth="1"
        />
        <circle cx={P1.x} cy={P1.y} r="4" fill="#4a310c" />
        <circle cx={P1.x} cy={P1.y} r="1.8" fill="#fff5d0" />
      </g>

      {/* ═══════════════════════════════════════════════════════════
          4. UPPER ARTICULATED ARM (Twin Parallel Brass Struts)
          ═══════════════════════════════════════════════════════════ */}
      <g className="bl-upper-arm" filter="url(#blCastShadow)">
        <line
          x1={P1.x - norm2X}
          y1={P1.y - norm2Y}
          x2={P2.x - norm2X}
          y2={P2.y - norm2Y}
          stroke="url(#blBrassGold)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1={P1.x - norm2X + 0.6}
          y1={P1.y - norm2Y - 0.6}
          x2={P2.x - norm2X + 0.6}
          y2={P2.y - norm2Y - 0.6}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <line
          x1={P1.x + norm2X}
          y1={P1.y + norm2Y}
          x2={P2.x + norm2X}
          y2={P2.y + norm2Y}
          stroke="url(#blBrassGold)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1={P1.x + norm2X + 0.6}
          y1={P1.y + norm2Y - 0.6}
          x2={P2.x + norm2X + 0.6}
          y2={P2.y + norm2Y - 0.6}
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <circle
          cx={P1.x + (P2.x - P1.x) * 0.5}
          cy={P1.y + (P2.y - P1.y) * 0.5}
          r="4"
          fill="url(#blBrassGold)"
          stroke="#54380f"
          strokeWidth="1"
        />

        {spring2Path && (
          <path d={spring2Path} stroke="url(#blBrassGold)" strokeWidth="1.8" fill="none" opacity="0.9" />
        )}
      </g>

      {/* ═══════════════════════════════════════════════════════════
          5. KNUCKLE / SWIVEL SOCKET
          ═══════════════════════════════════════════════════════════ */}
      <g className="bl-knuckle" filter="url(#blCastShadow)">
        <circle cx={P2.x} cy={P2.y} r="10" fill="#241d15" stroke="url(#blBrassGold)" strokeWidth="1.8" />
        <circle cx={P2.x} cy={P2.y} r="5" fill="url(#blBrassHighlight)" />
        <line
          x1={P2.x}
          y1={P2.y}
          x2={P_dome.x}
          y2={P_dome.y}
          stroke="url(#blBrassGold)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* ═══════════════════════════════════════════════════════════
          6. CLASSIC BELL LAMPSHADE WITH PROPERLY ALIGNED FACE
          ═══════════════════════════════════════════════════════════ */}
      <g className="bl-lampshade" filter="url(#blCastShadow)">
        {/* Brass Collar at Shade Top */}
        <ellipse
          cx={P_dome.x}
          cy={P_dome.y}
          rx={DOME_RADIUS - 3}
          ry="7"
          fill="url(#blBrassGold)"
          stroke="#6e4912"
          strokeWidth="1.2"
          transform={`rotate(${renderPose.thetaHead + 90}, ${P_dome.x}, ${P_dome.y})`}
        />

        {/* Satin Brass Shade Shell (Flared Bell) */}
        <path
          d={`M ${domeTop.x.toFixed(1)} ${domeTop.y.toFixed(1)} 
             C ${(P_dome.x + (mouthTop.x - P_dome.x) * 0.35 + 5 * Math.cos(normHead)).toFixed(1)} ${(P_dome.y + (mouthTop.y - P_dome.y) * 0.35 + 5 * Math.sin(normHead)).toFixed(1)},
               ${(mouthTop.x - 12 * Math.cos(radHead)).toFixed(1)} ${(mouthTop.y - 12 * Math.sin(radHead)).toFixed(1)},
               ${mouthTop.x.toFixed(1)} ${mouthTop.y.toFixed(1)}
             L ${mouthBottom.x.toFixed(1)} ${mouthBottom.y.toFixed(1)}
             C ${(mouthBottom.x - 12 * Math.cos(radHead)).toFixed(1)} ${(mouthBottom.y - 12 * Math.sin(radHead)).toFixed(1)},
               ${(P_dome.x + (mouthBottom.x - P_dome.x) * 0.35 - 5 * Math.cos(normHead)).toFixed(1)} ${(P_dome.y + (mouthBottom.y - P_dome.y) * 0.35 - 5 * Math.sin(normHead)).toFixed(1)},
               ${domeBottom.x.toFixed(1)} ${domeBottom.y.toFixed(1)} Z`}
          fill="url(#blGoldShadeGrad)"
          stroke="#7a4e12"
          strokeWidth="1.2"
        />

        {/* Specular Ridge Line along top curvature */}
        <path
          d={`M ${(P_dome.x + (domeTop.x - P_dome.x) * 0.4).toFixed(1)} ${(P_dome.y + (domeTop.y - P_dome.y) * 0.4).toFixed(1)}
             L ${(P_mouth.x + (mouthTop.x - P_mouth.x) * 0.4).toFixed(1)} ${(P_mouth.y + (mouthTop.y - P_mouth.y) * 0.4).toFixed(1)}`}
          stroke="rgba(255, 245, 205, 0.75)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* ═══════════════════════════════════════════════════════════
            7. LAMPSHADE MOUTH CHAMBER WITH PROPERLY ALIGNED FACE
            ═══════════════════════════════════════════════════════════ */}
        {isLightActive && (
          <g
            className="bl-mouth-chamber"
            transform={`translate(${P_mouth.x.toFixed(1)}, ${P_mouth.y.toFixed(1)}) rotate(${(renderPose.thetaHead - 180).toFixed(1)})`}
          >
            {/* Deep Warm Golden Interior Dish Cavity */}
            <ellipse
              cx="0"
              cy="0"
              rx="20"
              ry={renderPose.mouthRadius}
              fill="url(#blShadeInterior)"
            />

            {/* Radiant Ambient Light Wash radiating from mouth */}
            <ellipse
              cx="-2"
              cy="0"
              rx="26"
              ry={renderPose.mouthRadius * 1.1}
              fill="url(#blCavityGlow)"
              style={{ mixBlendMode: 'screen' }}
            />

            {/* Subtle bulb filament glow in the back of cavity */}
            <ellipse
              cx="7"
              cy="0"
              rx="5.5"
              ry="9.5"
              fill="url(#blBulbRadial)"
            />

            {/* ─── PROPERLY ALIGNED FACE: CLIPPED INSIDE SHADE, ROTATED TO BE PERFECTLY LEVEL ─── */}
            <g clipPath="url(#blMouthApertureClip)">
              {/* Upper internal socket depth shadow */}
              <ellipse
                cx="0"
                cy={-renderPose.mouthRadius * 0.7}
                rx="16"
                ry="7"
                fill="rgba(55, 30, 8, 0.22)"
              />

              {/* ═══ LEVEL HORIZONTAL FACE CLUSTER (Un-rotates so eyes are side-by-side horizontally) ═══ */}
              <g
                className={`bl-face-cluster ${isHappy ? 'is-happy' : ''} ${isConcernedActive ? 'is-concerned' : ''}`}
                transform={`rotate(${(180 - renderPose.thetaHead).toFixed(1)})`}
              >
                {/* ── LEFT EYE (x = -6.8, y = -1.0) ── */}
                <g
                  className="bl-tiny-eye-container left-eye"
                  style={{
                    transform: 'translate(-6.8px, -1.0px)',
                  }}
                >
                  {isHappy ? (
                    <path
                      d="M -3.2,0.8 Q 0,-2.8 3.2,0.8"
                      fill="none"
                      stroke="#2c1709"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  ) : (
                    <g
                      className="bl-eye-ball-group"
                      style={{
                        transform: `scale(${eyeScaleX}, ${eyeScaleY})`,
                        transformOrigin: '0px 0px',
                        transition: isBlinking ? 'transform 0.08s ease-in' : 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      <ellipse cx="0" cy="0" rx="3.2" ry="4.8" fill="url(#tinyEyeDarkBrown)" />
                      {/* Primary crisp white catchlight */}
                      <ellipse
                        cx={-0.9 + gaze.x * 0.35}
                        cy={-1.3 + gaze.y * 0.35}
                        rx={isSurprised ? '1.4' : '1.1'}
                        ry={isSurprised ? '1.6' : '1.3'}
                        fill="#ffffff"
                        opacity={0.96}
                      />
                      {/* Secondary delicate sparkle */}
                      <ellipse
                        cx={0.9 + gaze.x * 0.25}
                        cy={1.2 + gaze.y * 0.25}
                        rx="0.55"
                        ry="0.65"
                        fill="#fff5d0"
                        opacity={0.85}
                      />
                    </g>
                  )}
                </g>

                {/* ── RIGHT EYE (x = 6.8, y = -1.0) ── */}
                <g
                  className="bl-tiny-eye-container right-eye"
                  style={{
                    transform: 'translate(6.8px, -1.0px)',
                  }}
                >
                  {isHappy ? (
                    <path
                      d="M -3.2,0.8 Q 0,-2.8 3.2,0.8"
                      fill="none"
                      stroke="#2c1709"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  ) : (
                    <g
                      className="bl-eye-ball-group"
                      style={{
                        transform: `scale(${eyeScaleX}, ${eyeScaleY})`,
                        transformOrigin: '0px 0px',
                        transition: isBlinking ? 'transform 0.08s ease-in' : 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    >
                      <ellipse cx="0" cy="0" rx="3.2" ry="4.8" fill="url(#tinyEyeDarkBrown)" />
                      {/* Primary crisp white catchlight */}
                      <ellipse
                        cx={-0.9 + gaze.x * 0.35}
                        cy={-1.3 + gaze.y * 0.35}
                        rx={isSurprised ? '1.4' : '1.1'}
                        ry={isSurprised ? '1.6' : '1.3'}
                        fill="#ffffff"
                        opacity={0.96}
                      />
                      {/* Secondary delicate sparkle */}
                      <ellipse
                        cx={0.9 + gaze.x * 0.25}
                        cy={1.2 + gaze.y * 0.25}
                        rx="0.55"
                        ry="0.65"
                        fill="#fff5d0"
                        opacity={0.85}
                      />
                    </g>
                  )}
                </g>

                {/* ── ADORABLE SUBTLE SMILE MOUTH (x = 0, y = 3.6) ── */}
                <g className="bl-mouth-group">
                  {isSurprised ? (
                    <ellipse cx="0" cy="4.2" rx="1.6" ry="2.2" fill="#2c1709" />
                  ) : isHappy ? (
                    <path
                      d="M -4.2,3.0 Q 0,7.4 4.2,3.0"
                      fill="none"
                      stroke="#2c1709"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  ) : isConcernedActive ? (
                    <path
                      d="M -3.2,5.0 Q 0,3.2 3.2,5.0"
                      fill="none"
                      stroke="#2c1709"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  ) : isPrivacyAvert ? (
                    <path
                      d="M -2.5,4.0 Q 0,5.4 2.5,4.0"
                      fill="none"
                      stroke="#2c1709"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  ) : (
                    <path
                      d="M -3.2,3.6 Q 0,5.8 3.2,3.6"
                      fill="none"
                      stroke="#2c1709"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              </g>
            </g>

            {/* Polished Brass Lip Rim */}
            <ellipse
              cx="0"
              cy="0"
              rx="20"
              ry={renderPose.mouthRadius}
              fill="none"
              stroke="url(#blBrassLipRim)"
              strokeWidth="4.0"
            />

            {/* Specular glint on golden rim edge */}
            <ellipse
              cx="-0.6"
              cy="0"
              rx="18.8"
              ry={renderPose.mouthRadius - 1.2}
              fill="none"
              stroke="#fffbe8"
              strokeWidth="1.0"
              opacity="0.8"
            />

            {/* Subtle warm golden ambient rays when happy or surprised */}
            {(isHappy || isSurprised) && (
              <g className="bl-head-spark-rays" opacity="0.85">
                <path d="M 24,-12 L 31,-16" stroke="#ffe89e" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 26,0 L 34,0" stroke="#ffe89e" strokeWidth="2.0" strokeLinecap="round" />
                <path d="M 24,12 L 31,16" stroke="#ffe89e" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}
      </g>
    </svg>
  );
};

export default BridgeLamp;
