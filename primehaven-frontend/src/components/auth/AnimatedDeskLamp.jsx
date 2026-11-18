import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LAMP_STATES } from './LampStateController';
import './AnimatedDeskLamp.css';

/**
 * Kinematic configuration presets for each interaction state.
 * Angles in degrees:
 * - theta1: lower arm angle from vertical (negative leans toward the login card)
 * - theta2: upper arm angle from vertical (negative extends leftward/downward)
 * - thetaHead: pointing angle of lampshade (150 = angled down-left toward card inputs)
 * - brightness: bulb filament & spotlight intensity (0 to 1.35)
 * - beamWidth: spread angle of the spotlight cone
 * - rootX: horizontal offset for emerging from behind the card
 * - rootY: vertical offset
 */
const POSE_PRESETS = {
  // 1. Entrance Phase A: Hidden deep behind login card, light off
  entrance_start: {
    theta1: -18,
    theta2: -42,
    thetaHead: 185,
    brightness: 0,
    beamWidth: 260,
    rootX: -160, // Tucked deep behind the white login card
    rootY: 25,
  },
  // Entrance Phase B: Upper arm extends, elbow bends, shade peeks around card edge
  entrance_peek: {
    theta1: -28,
    theta2: -76,
    thetaHead: 168,
    brightness: 0.15,
    beamWidth: 300,
    rootX: -45, // Peeking right at the card's right boundary
    rootY: 10,
  },
  // Entrance Phase C: Turns head toward user, bulb clicks on with warm glow
  entrance_turn_on: {
    theta1: -26,
    theta2: -72,
    thetaHead: 150,
    brightness: 1.0,
    beamWidth: 380,
    rootX: 0,
    rootY: 0,
  },
  // 2. Idle: Relaxed natural pose, poised at card edge with subtle breathing
  [LAMP_STATES.IDLE]: {
    theta1: -25,
    theta2: -70,
    thetaHead: 148,
    brightness: 0.95,
    beamWidth: 360,
    rootX: 0,
    rootY: 0,
  },
  // 3. Email focus: Leans forward, shade points directly at email input
  [LAMP_STATES.EMAIL_FOCUSED]: {
    theta1: -32,
    theta2: -80,
    thetaHead: 156, // Aimed at email input height
    brightness: 1.15,
    beamWidth: 340,
    rootX: 0,
    rootY: 0,
  },
  // 4. Email typing: Attentive posture with smoothed keystroke tracking
  [LAMP_STATES.EMAIL_TYPING]: {
    theta1: -32,
    theta2: -80,
    thetaHead: 157,
    brightness: 1.2,
    beamWidth: 350,
    rootX: 0,
    rootY: 0,
  },
  // 5. Valid email format: Approving upward nod with warm golden glow
  [LAMP_STATES.EMAIL_VALID]: {
    theta1: -26,
    theta2: -72,
    thetaHead: 140, // Upward approving nod
    brightness: 1.3,
    beamWidth: 420,
    rootX: 0,
    rootY: -8,
  },
  // 6. Invalid email: Quizzical head tilt, shade dips down (gentle confused gesture)
  [LAMP_STATES.EMAIL_INVALID]: {
    theta1: -20,
    theta2: -62,
    thetaHead: 172, // Tilted down-quizzical
    brightness: 0.75,
    beamWidth: 290,
    rootX: 0,
    rootY: 8,
  },
  // 7. Password focus: Bends toward password field, spotlight targets password input
  [LAMP_STATES.PASSWORD_FOCUSED]: {
    theta1: -36,
    theta2: -84,
    thetaHead: 136, // Lower angle targeting password field
    brightness: 1.15,
    beamWidth: 320,
    rootX: 0,
    rootY: 10,
  },
  // 8. Password typing: Attentive, focused posture
  [LAMP_STATES.PASSWORD_TYPING]: {
    theta1: -36,
    theta2: -84,
    thetaHead: 136,
    brightness: 1.2,
    beamWidth: 320,
    rootX: 0,
    rootY: 10,
  },
  // 9. Password hidden: Playful privacy gesture (shyly averts gaze down/away)
  [LAMP_STATES.PASSWORD_HIDDEN]: {
    theta1: -18,
    theta2: -54,
    thetaHead: 110, // Averts gaze politely downward
    brightness: 0.65,
    beamWidth: 250,
    rootX: 0,
    rootY: 12,
  },
  // 10. Password visible: Curious / surprised head tilt, light brightens
  [LAMP_STATES.PASSWORD_VISIBLE]: {
    theta1: -24,
    theta2: -64,
    thetaHead: 138, // Perks up with curiosity
    brightness: 1.25,
    beamWidth: 420,
    rootX: 0,
    rootY: -10,
  },
  // 11. Form invalid (empty submit): Confused head shake
  [LAMP_STATES.FORM_INVALID]: {
    theta1: -22,
    theta2: -62,
    thetaHead: 164,
    brightness: 0.8,
    beamWidth: 300,
    rootX: 0,
    rootY: 4,
  },
  // 12. Authenticating: Holds focused, concentrated posture toward card
  [LAMP_STATES.AUTHENTICATING]: {
    theta1: -34,
    theta2: -82,
    thetaHead: 148,
    brightness: 1.1,
    beamWidth: 360,
    rootX: 0,
    rootY: 4,
  },
  // 13. Authentication success: Triumphant celebration! Raises shade high, golden burst
  [LAMP_STATES.AUTHENTICATION_SUCCESS]: {
    theta1: -8,
    theta2: -36, // Upper arm straightens upward
    thetaHead: 105, // Head looking upward triumphantly
    brightness: 1.35,
    beamWidth: 500,
    rootX: 0,
    rootY: -28,
  },
  // 14. Authentication error: Lowers shade, restrained disappointed gesture
  [LAMP_STATES.AUTHENTICATION_ERROR]: {
    theta1: -16,
    theta2: -52,
    thetaHead: 176, // Drops head low
    brightness: 0.4,
    beamWidth: 240,
    rootX: 0,
    rootY: 16,
  },
  // 15. Network error: Concerned posture, steady light
  [LAMP_STATES.NETWORK_ERROR]: {
    theta1: -15,
    theta2: -50,
    thetaHead: 132, // Tilted back, concerned
    brightness: 0.75,
    beamWidth: 300,
    rootX: 0,
    rootY: 0,
  },
};

export const AnimatedDeskLamp = ({
  lampState = LAMP_STATES.IDLE,
  pointerPos = { x: 0.5, y: 0.5 },
  isPointerActive = false,
  onEntranceComplete,
}) => {
  // Animated parameters interpolated with spring easing
  const currentPose = useRef({ ...POSE_PRESETS.entrance_start });
  const [renderPose, setRenderPose] = useState({ ...POSE_PRESETS.entrance_start });
  const [entrancePhase, setEntrancePhase] = useState('start');

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Multi-step initial entrance sequence (1.8s - 2.2s)
  useEffect(() => {
    if (prefersReducedMotion) {
      setRenderPose(POSE_PRESETS[LAMP_STATES.IDLE]);
      currentPose.current = { ...POSE_PRESETS[LAMP_STATES.IDLE] };
      if (onEntranceComplete) onEntranceComplete();
      return;
    }

    if (lampState === LAMP_STATES.ENTERING) {
      setEntrancePhase('start');

      // Step 1: Arm extends, elbow bends, shade peeks out from behind the card
      const t1 = setTimeout(() => {
        setEntrancePhase('peek');
      }, 350);

      // Step 2: Head turns toward form, bulb clicks on with warm glow
      const t2 = setTimeout(() => {
        setEntrancePhase('turn_on');
      }, 1100);

      // Step 3: Settle into idle
      const t3 = setTimeout(() => {
        setEntrancePhase('done');
        if (onEntranceComplete) onEntranceComplete();
      }, 2100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [lampState, prefersReducedMotion, onEntranceComplete]);

  // Determine current target pose
  const targetPose = useMemo(() => {
    if (lampState === LAMP_STATES.ENTERING) {
      if (entrancePhase === 'start') return POSE_PRESETS.entrance_start;
      if (entrancePhase === 'peek') return POSE_PRESETS.entrance_peek;
      if (entrancePhase === 'turn_on') return POSE_PRESETS.entrance_turn_on;
    }

    const basePreset = POSE_PRESETS[lampState] || POSE_PRESETS[LAMP_STATES.IDLE];
    const target = { ...basePreset };

    // Subtle pointer tracking when idle
    if (isPointerActive && lampState === LAMP_STATES.IDLE && !prefersReducedMotion) {
      target.theta1 += (pointerPos.x - 0.5) * 6;
      target.thetaHead += (pointerPos.y - 0.5) * 10;
    }

    return target;
  }, [lampState, entrancePhase, isPointerActive, pointerPos, prefersReducedMotion]);

  // Animation loop with critically damped spring interpolation
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const speed = prefersReducedMotion ? 40 : 8.5;
      const curr = currentPose.current;
      const targ = targetPose;

      // Natural subtle breathing micro-motion when idle
      let breathOffset = 0;
      if (lampState === LAMP_STATES.IDLE && !prefersReducedMotion) {
        breathOffset = Math.sin(currentTime / 750) * 1.0;
      }

      curr.theta1 += (targ.theta1 + breathOffset * 0.4 - curr.theta1) * speed * dt;
      curr.theta2 += (targ.theta2 - breathOffset * 0.6 - curr.theta2) * speed * dt;
      curr.thetaHead += (targ.thetaHead + breathOffset * 0.8 - curr.thetaHead) * speed * dt;
      curr.brightness += (targ.brightness - curr.brightness) * speed * dt;
      curr.beamWidth += (targ.beamWidth - curr.beamWidth) * speed * dt;
      curr.rootX += (targ.rootX - curr.rootX) * (speed * 0.9) * dt;
      curr.rootY += (targ.rootY - curr.rootY) * (speed * 0.9) * dt;

      setRenderPose({ ...curr });
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [targetPose, lampState, prefersReducedMotion]);

  // ═════════════════════════════════════════════════════════════════════════
  // KINEMATICS & COORDINATES
  // The login card right edge sits near X ≈ 210 in this 720x640 coordinate frame.
  // When X < 210, the lamp is physically BEHIND the white login card.
  // When X > 210, the lamp is visible in the right-side scene.
  // ═════════════════════════════════════════════════════════════════════════

  const V_WIDTH = 720;
  const V_HEIGHT = 640;

  // Base anchor P0: Grounded in the right scene (X ≈ 520, Y ≈ 540)
  const P0 = {
    x: 520 + renderPose.rootX,
    y: 540 + renderPose.rootY,
  };

  const L1 = 185; // Lower arm length
  const L2 = 175; // Upper arm length
  const L_NECK = 40; // Neck link length
  const SHADE_RADIUS_MOUTH = 48; // Mouth radius
  const SHADE_LENGTH = 72; // Shade length

  const rad1 = (renderPose.theta1 * Math.PI) / 180;
  const rad2 = (renderPose.theta2 * Math.PI) / 180;
  const radHead = (renderPose.thetaHead * Math.PI) / 180;

  // Joint 1: Elbow P1
  const P1 = {
    x: P0.x + L1 * Math.sin(rad1),
    y: P0.y - L1 * Math.cos(rad1),
  };

  // Joint 2: Neck Knuckle P2
  const P2 = {
    x: P1.x + L2 * Math.sin(rad2),
    y: P1.y - L2 * Math.cos(rad2),
  };

  // Shade Dome Apex P_dome
  const P_dome = {
    x: P2.x + L_NECK * Math.cos(radHead),
    y: P2.y + L_NECK * Math.sin(radHead),
  };

  // Mouth Center P_mouth
  const P_mouth = {
    x: P_dome.x + SHADE_LENGTH * Math.cos(radHead),
    y: P_dome.y + SHADE_LENGTH * Math.sin(radHead),
  };

  // Bulb Center (seated inside shade cavity)
  const P_bulb = {
    x: P_mouth.x - 14 * Math.cos(radHead),
    y: P_mouth.y - 14 * Math.sin(radHead),
  };

  // Mouth Opening Edges
  const normHead = radHead + Math.PI / 2;
  const mouthTop = {
    x: P_mouth.x + SHADE_RADIUS_MOUTH * Math.cos(normHead),
    y: P_mouth.y + SHADE_RADIUS_MOUTH * Math.sin(normHead),
  };
  const mouthBottom = {
    x: P_mouth.x - SHADE_RADIUS_MOUTH * Math.cos(normHead),
    y: P_mouth.y - SHADE_RADIUS_MOUTH * Math.sin(normHead),
  };

  // Dome Cap Edges
  const DOME_RADIUS = 20;
  const domeTop = {
    x: P_dome.x + DOME_RADIUS * Math.cos(normHead),
    y: P_dome.y + DOME_RADIUS * Math.sin(normHead),
  };
  const domeBottom = {
    x: P_dome.x - DOME_RADIUS * Math.cos(normHead),
    y: P_dome.y - DOME_RADIUS * Math.sin(normHead),
  };

  // Volumetric Spotlight Target Points
  const BEAM_DISTANCE = 480;
  const halfSpread = renderPose.beamWidth / 2;
  const beamTargetCenter = {
    x: P_mouth.x + BEAM_DISTANCE * Math.cos(radHead),
    y: P_mouth.y + BEAM_DISTANCE * Math.sin(radHead),
  };
  const beamTargetTop = {
    x: beamTargetCenter.x + halfSpread * Math.cos(normHead),
    y: beamTargetCenter.y + halfSpread * Math.sin(normHead),
  };
  const beamTargetBottom = {
    x: beamTargetCenter.x - halfSpread * Math.cos(normHead),
    y: beamTargetCenter.y - halfSpread * Math.sin(normHead),
  };

  const spotlightPath = `M ${mouthTop.x} ${mouthTop.y} L ${beamTargetTop.x} ${beamTargetTop.y} L ${beamTargetBottom.x} ${beamTargetBottom.y} L ${mouthBottom.x} ${mouthBottom.y} Z`;

  // Spring Anchor Pins & Paths
  const spring1_start = {
    x: P0.x + (P1.x - P0.x) * 0.28 + 9 * Math.cos(rad1 + Math.PI / 2),
    y: P0.y + (P1.y - P0.y) * 0.28 + 9 * Math.sin(rad1 + Math.PI / 2),
  };
  const spring1_end = {
    x: P1.x + 12 * Math.cos(rad1 + Math.PI / 2),
    y: P1.y + 12 * Math.sin(rad1 + Math.PI / 2),
  };

  const spring2_start = {
    x: P1.x + 10 * Math.cos(rad2 - Math.PI / 2),
    y: P1.y + 10 * Math.sin(rad2 - Math.PI / 2),
  };
  const spring2_end = {
    x: P1.x + (P2.x - P1.x) * 0.72 + 8 * Math.cos(rad2 - Math.PI / 2),
    y: P1.y + (P2.y - P1.y) * 0.72 + 8 * Math.sin(rad2 - Math.PI / 2),
  };

  const makeSpringPath = (pA, pB, coils = 11, width = 6) => {
    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    let path = `M ${pA.x} ${pA.y}`;
    for (let i = 1; i <= coils; i++) {
      const frac = i / (coils + 1);
      const sign = i % 2 === 0 ? 1 : -1;
      const px = pA.x + ux * len * frac + nx * width * sign;
      const py = pA.y + uy * len * frac + ny * width * sign;
      path += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    path += ` L ${pB.x} ${pB.y}`;
    return path;
  };

  const spring1Path = makeSpringPath(spring1_start, spring1_end, 11, 5.5);
  const spring2Path = makeSpringPath(spring2_start, spring2_end, 10, 5.5);

  // Parallel Twin Rods Offsets
  const STRUT_GAP = 7.5;
  const norm1X = Math.cos(rad1 + Math.PI / 2) * STRUT_GAP;
  const norm1Y = Math.sin(rad1 + Math.PI / 2) * STRUT_GAP;

  const norm2X = Math.cos(rad2 + Math.PI / 2) * STRUT_GAP;
  const norm2Y = Math.sin(rad2 + Math.PI / 2) * STRUT_GAP;

  const isLightActive = renderPose.brightness > 0.05;

  return (
    <div className={`lamp-environment ${lampState}`} aria-label="Interactive Articulated Desk Lamp">
      {/* Floating atmospheric dust particles */}
      {isLightActive && (
        <div className="lamp-dust-container">
          <span className="dust-particle d1" />
          <span className="dust-particle d2" />
          <span className="dust-particle d3" />
          <span className="dust-particle d4" />
        </div>
      )}

      {/* Floor reflection light pool */}
      <div
        className="lamp-floor-pool"
        style={{
          opacity: isLightActive ? Math.min(renderPose.brightness * 0.45, 0.7) : 0,
        }}
      />

      {/* Master Articulated Lamp SVG Vector Character */}
      <div className="lamp-character-wrapper">
        <svg
          viewBox={`0 0 ${V_WIDTH} ${V_HEIGHT}`}
          className="lamp-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="blackMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c2824" />
              <stop offset="40%" stopColor="#1a1815" />
              <stop offset="85%" stopColor="#110f0e" />
              <stop offset="100%" stopColor="#080706" />
            </linearGradient>

            <linearGradient id="specularRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5a524a" />
              <stop offset="50%" stopColor="#2c2824" />
              <stop offset="100%" stopColor="#110f0e" />
            </linearGradient>

            <linearGradient id="brassGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3dd9e" />
              <stop offset="45%" stopColor="#c59f48" />
              <stop offset="80%" stopColor="#8d6e2c" />
              <stop offset="100%" stopColor="#e5c87e" />
            </linearGradient>

            <radialGradient id="shadeInteriorBowl" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#fff2cf" />
              <stop offset="85%" stopColor="#e2be68" />
              <stop offset="100%" stopColor="#a88235" />
            </radialGradient>

            <radialGradient id="bulbCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#fff6db" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#ffdb78" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#b8913f" stopOpacity="0" />
            </radialGradient>

            {/* Dynamic Volumetric Spotlight Beam Gradient */}
            <linearGradient
              id="spotlightBeam"
              x1={`${(P_mouth.x / V_WIDTH) * 100}%`}
              y1={`${(P_mouth.y / V_HEIGHT) * 100}%`}
              x2={`${(beamTargetCenter.x / V_WIDTH) * 100}%`}
              y2={`${(beamTargetCenter.y / V_HEIGHT) * 100}%`}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#fff6db" stopOpacity={0.7 * renderPose.brightness} />
              <stop offset="25%" stopColor="#ffe9ab" stopOpacity={0.45 * renderPose.brightness} />
              <stop offset="65%" stopColor="#b8913f" stopOpacity={0.14 * renderPose.brightness} />
              <stop offset="100%" stopColor="#b8913f" stopOpacity="0" />
            </linearGradient>

            <filter id="castShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
              <feOffset dx="0" dy="8" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.6" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ═══════════════════════════════════════════════════════════
              1. VOLUMETRIC SPOTLIGHT BEAM (Directed from shade toward card)
              ═══════════════════════════════════════════════════════════ */}
          {isLightActive && (
            <g className="spotlight-beam-layer">
              <path
                d={spotlightPath}
                fill="url(#spotlightBeam)"
                style={{ mixBlendMode: 'screen', filter: 'blur(16px)' }}
              />
              <path
                d={spotlightPath}
                fill="url(#spotlightBeam)"
                opacity={renderPose.brightness}
                style={{ mixBlendMode: 'screen', filter: 'blur(6px)' }}
              />
            </g>
          )}

          {/* ═══════════════════════════════════════════════════════════
              2. WEIGHTED BASE (Grounded on floor/desk in right scene)
              ═══════════════════════════════════════════════════════════ */}
          <g className="lamp-base-assembly" filter="url(#castShadow)">
            <ellipse cx={P0.x} cy={P0.y + 38} rx="96" ry="16" fill="rgba(0,0,0,0.68)" />
            <ellipse cx={P0.x} cy={P0.y + 38} rx="65" ry="10" fill="rgba(0,0,0,0.85)" />

            <ellipse cx={P0.x} cy={P0.y + 26} rx="88" ry="17" fill="url(#blackMetal)" />

            <path
              d={`M ${P0.x - 88} ${P0.y + 26} 
                  C ${P0.x - 88} ${P0.y + 34}, ${P0.x + 88} ${P0.y + 34}, ${P0.x + 88} ${P0.y + 26} 
                  L ${P0.x + 86} ${P0.y + 16} 
                  C ${P0.x + 86} ${P0.y + 8}, ${P0.x - 86} ${P0.y + 8}, ${P0.x - 86} ${P0.y + 16} 
                  Z`}
              fill="url(#specularRim)"
            />

            <ellipse cx={P0.x} cy={P0.y + 16} rx="86" ry="15" fill="url(#blackMetal)" stroke="rgba(184,145,63,0.3)" strokeWidth="1.5" />
            <ellipse cx={P0.x} cy={P0.y + 10} rx="44" ry="9" fill="url(#specularRim)" />
            <ellipse cx={P0.x} cy={P0.y + 6} rx="35" ry="7.5" fill="url(#blackMetal)" />

            <rect x={P0.x - 14} y={P0.y - 12} width="28" height="18" rx="3" fill="url(#brassGold)" />
            <circle cx={P0.x} cy={P0.y - 3} r="4" fill="#5c4416" />
          </g>

          {/* ═══════════════════════════════════════════════════════════
              3. BASE HINGE PIVOT (P0)
              ═══════════════════════════════════════════════════════════ */}
          <g className="base-hinge-assembly">
            <rect x={P0.x - 12} y={P0.y - 20} width="6" height="24" rx="2" fill="url(#blackMetal)" />
            <rect x={P0.x + 6} y={P0.y - 20} width="6" height="24" rx="2" fill="url(#blackMetal)" />
            <circle cx={P0.x} cy={P0.y - 10} r="10" fill="url(#blackMetal)" stroke="url(#brassGold)" strokeWidth="2" />
            <circle cx={P0.x} cy={P0.y - 10} r="4.5" fill="url(#brassGold)" />
          </g>

          {/* ═══════════════════════════════════════════════════════════
              4. LOWER ARM STRUTS (Twin Parallel Steel Tubes)
              ═══════════════════════════════════════════════════════════ */}
          <g className="lower-arm-assembly">
            <line
              x1={P0.x - norm1X}
              y1={P0.y - 10 - norm1Y}
              x2={P1.x - norm1X}
              y2={P1.y - norm1Y}
              stroke="url(#blackMetal)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <line
              x1={P0.x - norm1X + 1}
              y1={P0.y - 10 - norm1Y}
              x2={P1.x - norm1X + 1}
              y2={P1.y - norm1Y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            <line
              x1={P0.x + norm1X}
              y1={P0.y - 10 + norm1Y}
              x2={P1.x + norm1X}
              y2={P1.y + norm1Y}
              stroke="url(#blackMetal)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <line
              x1={P0.x + norm1X + 1}
              y1={P0.y - 10 + norm1Y}
              x2={P1.x + norm1X + 1}
              y2={P1.y + norm1Y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            <line
              x1={P0.x + (P1.x - P0.x) * 0.5 - norm1X * 1.4}
              y1={P0.y - 10 + (P1.y - (P0.y - 10)) * 0.5 - norm1Y * 1.4}
              x2={P0.x + (P1.x - P0.x) * 0.5 + norm1X * 1.4}
              y2={P0.y - 10 + (P1.y - (P0.y - 10)) * 0.5 + norm1Y * 1.4}
              stroke="url(#brassGold)"
              strokeWidth="3.5"
            />

            {/* Lower Counterbalance Tension Spring */}
            <path d={spring1Path} stroke="url(#brassGold)" strokeWidth="2.2" fill="none" opacity="0.9" />
          </g>

          {/* ═══════════════════════════════════════════════════════════
              5. CENTRAL MECHANICAL ELBOW JOINT (P1)
              ═══════════════════════════════════════════════════════════ */}
          <g className="elbow-joint-assembly">
            <circle cx={P1.x} cy={P1.y} r="14" fill="url(#blackMetal)" stroke="rgba(184,145,63,0.4)" strokeWidth="1.5" />
            <circle cx={P1.x} cy={P1.y} r="11" fill="url(#specularRim)" />

            <circle cx={spring1_end.x} cy={spring1_end.y} r="3" fill="url(#brassGold)" />
            <circle cx={spring2_start.x} cy={spring2_start.y} r="3" fill="url(#brassGold)" />

            {/* Large Brass Adjustment Thumbscrew */}
            <circle cx={P1.x} cy={P1.y} r="7" fill="url(#brassGold)" />
            <rect x={P1.x - 11} y={P1.y - 3} width="22" height="6" rx="2" fill="url(#brassGold)" />
            <circle cx={P1.x} cy={P1.y} r="3" fill="#5c4416" />
          </g>

          {/* ═══════════════════════════════════════════════════════════
              6. UPPER ARM STRUTS (Twin Parallel Steel Tubes)
              ═══════════════════════════════════════════════════════════ */}
          <g className="upper-arm-assembly">
            <line
              x1={P1.x - norm2X}
              y1={P1.y - norm2Y}
              x2={P2.x - norm2X}
              y2={P2.y - norm2Y}
              stroke="url(#blackMetal)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <line
              x1={P1.x - norm2X + 1}
              y1={P1.y - norm2Y}
              x2={P2.x - norm2X + 1}
              y2={P2.y - norm2Y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            <line
              x1={P1.x + norm2X}
              y1={P1.y + norm2Y}
              x2={P2.x + norm2X}
              y2={P2.y + norm2Y}
              stroke="url(#blackMetal)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <line
              x1={P1.x + norm2X + 1}
              y1={P1.y + norm2Y}
              x2={P2.x + norm2X + 1}
              y2={P2.y + norm2Y}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            <line
              x1={P1.x + (P2.x - P1.x) * 0.5 - norm2X * 1.4}
              y1={P1.y + (P2.y - P1.y) * 0.5 - norm2Y * 1.4}
              x2={P1.x + (P2.x - P1.x) * 0.5 + norm2X * 1.4}
              y2={P1.y + (P2.y - P1.y) * 0.5 + norm2Y * 1.4}
              stroke="url(#brassGold)"
              strokeWidth="3.5"
            />

            {/* Upper Counterbalance Tension Spring */}
            <path d={spring2Path} stroke="url(#brassGold)" strokeWidth="2.2" fill="none" opacity="0.9" />
          </g>

          {/* ═══════════════════════════════════════════════════════════
              7. NECK ARTICULATION KNUCKLE (P2)
              ═══════════════════════════════════════════════════════════ */}
          <g className="neck-joint-assembly">
            <circle cx={P2.x} cy={P2.y} r="10" fill="url(#blackMetal)" stroke="url(#brassGold)" strokeWidth="1.8" />
            <circle cx={P2.x} cy={P2.y} r="4.5" fill="url(#brassGold)" />

            <line
              x1={P2.x}
              y1={P2.y}
              x2={P_dome.x}
              y2={P_dome.y}
              stroke="url(#brassGold)"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>

          {/* ═══════════════════════════════════════════════════════════
              8. CLASSIC BELL / CONICAL LAMPSHADE & BULB
              ═══════════════════════════════════════════════════════════ */}
          <g className="lampshade-assembly">
            <ellipse cx={P_dome.x} cy={P_dome.y} rx="9" ry="5" fill="url(#brassGold)" />
            <rect
              x={P_dome.x - 6}
              y={P_dome.y - 5}
              width="12"
              height="8"
              rx="2"
              fill="url(#blackMetal)"
              transform={`rotate(${(renderPose.thetaHead * 180) / Math.PI + 90}, ${P_dome.x}, ${P_dome.y})`}
            />

            <path
              d={`M ${domeTop.x} ${domeTop.y} 
                  L ${mouthTop.x} ${mouthTop.y} 
                  L ${mouthBottom.x} ${mouthBottom.y} 
                  L ${domeBottom.x} ${domeBottom.y} 
                  Z`}
              fill="url(#blackMetal)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
            />

            <path
              d={`M ${P_dome.x + (domeTop.x - P_dome.x) * 0.4} ${P_dome.y + (domeTop.y - P_dome.y) * 0.4} 
                  L ${P_mouth.x + (mouthTop.x - P_mouth.x) * 0.4} ${P_mouth.y + (mouthTop.y - P_mouth.y) * 0.4}`}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Inner Reflector Rim */}
            <ellipse
              cx={P_mouth.x}
              cy={P_mouth.y}
              rx={SHADE_RADIUS_MOUTH}
              ry="16"
              fill="url(#shadeInteriorBowl)"
              stroke="url(#brassGold)"
              strokeWidth="2.5"
              transform={`rotate(${(renderPose.thetaHead * 180) / Math.PI + 90}, ${P_mouth.x}, ${P_mouth.y})`}
            />

            {/* Bulb & Radiant Filament (visibly inside shade) */}
            {isLightActive && (
              <g className="bulb-filament-group">
                <circle
                  cx={P_bulb.x}
                  cy={P_bulb.y}
                  r={22 * Math.min(renderPose.brightness, 1.2)}
                  fill="url(#bulbCore)"
                  style={{ mixBlendMode: 'screen' }}
                />

                <circle
                  cx={P_bulb.x}
                  cy={P_bulb.y}
                  r="13"
                  fill="#ffffff"
                  opacity={Math.min(renderPose.brightness, 1)}
                  stroke="#ffeaad"
                  strokeWidth="2"
                  filter="drop-shadow(0 0 10px #ffe7a3)"
                />

                <circle
                  cx={P_bulb.x}
                  cy={P_bulb.y}
                  r="6"
                  fill="#ffffff"
                  opacity={renderPose.brightness}
                />
              </g>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default AnimatedDeskLamp;
