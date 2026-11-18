import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/auth/LoginForm';
import BridgeLamp from '../../components/auth/BridgeLamp';
import { LAMP_STATES } from '../../components/auth/LampStateController';
import './AuthPage.css';

// Premium luxury sunset interior photograph — warm penthouse living room
const INTERIOR_PHOTO_URL = '/interior-living-room.jpg';

export const SignInPage = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Lamp state management — initialize from URL ?focus=... if present, else start with ENTERING (wake-up)
  const [lampState, setLampState] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('focus');
      if (p === 'email') return LAMP_STATES.EMAIL_FOCUSED;
      if (p === 'password') return LAMP_STATES.PASSWORD_FOCUSED;
    }
    return LAMP_STATES.ENTERING;
  });
  const [pointerPos, setPointerPos] = useState({ x: 0.5, y: 0.5 });
  const [isPointerActive, setIsPointerActive] = useState(false);
  const containerRef = useRef(null);

  // If already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else if (role === 'AGENT') navigate('/agent/dashboard', { replace: true });
      else navigate('/client/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  // Handle entrance sequence completion -> transition to idle
  const handleEntranceComplete = () => {
    setLampState(LAMP_STATES.IDLE);
  };

  // Derive focus mode for dynamic spotlight tracking & card dimming
  const isEmailActive = [
    LAMP_STATES.EMAIL_FOCUSED,
    LAMP_STATES.EMAIL_TYPING,
    LAMP_STATES.EMAIL_VALID,
    LAMP_STATES.EMAIL_INVALID,
  ].includes(lampState);

  const isPasswordActive = [
    LAMP_STATES.PASSWORD_FOCUSED,
    LAMP_STATES.PASSWORD_TYPING,
    LAMP_STATES.PASSWORD_HIDDEN,
    LAMP_STATES.PASSWORD_VISIBLE,
  ].includes(lampState);

  const focusMode = isEmailActive ? 'email' : isPasswordActive ? 'password' : 'none';

  // Subtle pointer tracking across the page
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setPointerPos({ x, y });
    setIsPointerActive(true);
  };

  const handleMouseLeave = () => {
    setIsPointerActive(false);
    setPointerPos({ x: 0.5, y: 0.5 });
  };

  return (
    <div
      className="auth-page"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="auth-split-container">
        {/* ═══ Left: Form Column with Integrated Lamp Stage ═══ */}
        <div className="auth-form-column">
          {/* Subtle foreground botanical silhouette for cinematic depth */}
          <div className="auth-ambient-foliage-top" aria-hidden="true" />
          <div className="auth-ambient-foliage-bottom" aria-hidden="true" />

          {/* Radial ambient wall glow behind lamp */}
          <div className={`auth-wall-lamp-glow focus-${focusMode}`} aria-hidden="true" />

          <div className="auth-card-stage">
            {/* LAYER 1: Lamp — Anchored to card, emerges to the right (z-index: 4) */}
            <div className="auth-lamp-behind">
              <BridgeLamp
                lampState={lampState}
                pointerPos={pointerPos}
                isPointerActive={isPointerActive}
                onEntranceComplete={handleEntranceComplete}
              />
            </div>

            {/* LAYER 2: Login Card — Foreground white panel (z-index: 10) */}
            <LoginForm
              onLampStateChange={setLampState}
              currentLampState={lampState}
            />

            {/* LAYER 3: Dynamic Spotlight Beam Layer (z-index: 15, pointer-events: none) */}
            <div className={`auth-card-light-beam focus-${focusMode}`} aria-hidden="true">
              <svg
                className="auth-beam-svg"
                viewBox="0 0 680 620"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* Soft wide golden atmospheric wash with feathered falloff */}
                  <linearGradient id="beamWashGrad" x1="100%" y1="18%" x2="0%" y2="55%">
                    <stop offset="0%" stopColor="#ffebad" stopOpacity="0.55" />
                    <stop offset="22%" stopColor="#fcd877" stopOpacity="0.30" />
                    <stop offset="50%" stopColor="#f5bd42" stopOpacity="0.12" />
                    <stop offset="78%" stopColor="#dca842" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#b8913f" stopOpacity="0" />
                  </linearGradient>

                  {/* Brilliant core beam radiating from the lamp mouth */}
                  <linearGradient id="beamCoreGrad" x1="100%" y1="18%" x2="0%" y2="55%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.80" />
                    <stop offset="20%" stopColor="#ffea9f" stopOpacity="0.40" />
                    <stop offset="45%" stopColor="#f5c252" stopOpacity="0.14" />
                    <stop offset="75%" stopColor="#dca842" stopOpacity="0" />
                  </linearGradient>

                  <filter id="beamWashBlur" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="16" />
                  </filter>
                  <filter id="beamCoreBlur" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="6" />
                  </filter>
                </defs>

                {/* ── CONE 1: USERNAME / EMAIL TARGETED BEAM ── */}
                <g className="beam-group beam-group-email">
                  <path
                    d="M 462 115 L 462 150 L 30 320 L 30 160 Z"
                    fill="url(#beamWashGrad)"
                    filter="url(#beamWashBlur)"
                  />
                  <path
                    d="M 462 122 L 462 144 L 60 280 L 60 195 Z"
                    fill="url(#beamCoreGrad)"
                    filter="url(#beamCoreBlur)"
                  />
                  {/* Subtle, sparse dust particles inside beam */}
                  <g className="beam-dust-particles">
                    <circle cx="360" cy="165" r="1.4" className="dust-speck speck-1" />
                    <circle cx="280" cy="205" r="1.8" className="dust-speck speck-2" />
                    <circle cx="190" cy="195" r="1.2" className="dust-speck speck-3" />
                    <circle cx="130" cy="225" r="1.5" className="dust-speck speck-4" />
                  </g>
                </g>

                {/* ── CONE 2: PASSWORD TARGETED BEAM ── */}
                <g className="beam-group beam-group-password">
                  <path
                    d="M 460 135 L 460 170 L 30 425 L 30 265 Z"
                    fill="url(#beamWashGrad)"
                    filter="url(#beamWashBlur)"
                  />
                  <path
                    d="M 460 142 L 460 164 L 60 385 L 60 300 Z"
                    fill="url(#beamCoreGrad)"
                    filter="url(#beamCoreBlur)"
                  />
                  {/* Subtle, sparse dust particles inside beam */}
                  <g className="beam-dust-particles">
                    <circle cx="360" cy="200" r="1.4" className="dust-speck speck-1" />
                    <circle cx="275" cy="305" r="1.8" className="dust-speck speck-2" />
                    <circle cx="190" cy="290" r="1.2" className="dust-speck speck-3" />
                    <circle cx="130" cy="325" r="1.5" className="dust-speck speck-4" />
                  </g>
                </g>

                {/* ── CONE 3: BALANCED IDLE AMBIENT BEAM ── */}
                <g className="beam-group beam-group-idle">
                  <path
                    d="M 462 125 L 462 160 L 40 400 L 40 180 Z"
                    fill="url(#beamWashGrad)"
                    filter="url(#beamWashBlur)"
                  />
                  <path
                    d="M 462 132 L 462 154 L 80 340 L 80 230 Z"
                    fill="url(#beamCoreGrad)"
                    filter="url(#beamCoreBlur)"
                  />
                  {/* Subtle, sparse dust particles inside beam */}
                  <g className="beam-dust-particles">
                    <circle cx="310" cy="225" r="1.6" className="dust-speck speck-2" />
                    <circle cx="205" cy="255" r="1.3" className="dust-speck speck-3" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* ═══ Right: Luxury Sunset Interior Photograph ═══ */}
        <div className="auth-visual-column">
          <img
            src={INTERIOR_PHOTO_URL}
            alt="PrimeHaven Luxury Living Room"
            className="auth-visual-photo"
            loading="eager"
          />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-ambient-light" />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;