import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building,
  ArrowRight,
  ShieldCheck,
  CalendarCheck2,
  Sparkles,
  Award,
  Users2,
  ChevronDown,
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import propertyApi from '../../services/propertyApi';
import { PROPERTY_IMAGES, getPropertyImage } from '../../utils/propertyImages';
import { useAuth } from '../../context/AuthContext';
import './HomePage.css';

/* ─── PENTHOUSE ROOMS ARCHITECTURE ─── */
const ROOMS = [
  {
    id: 'salon',
    number: '01',
    name: 'Grand Living Salon',
    label: 'Grand Salon',
    image:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'gallery',
    number: '02',
    name: 'Curated Gallery',
    label: 'Curated Gallery',
    image:
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'typologies',
    number: '03',
    name: 'Architectural Typologies',
    label: 'Typologies',
    image:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'atelier',
    number: '04',
    name: 'The PrimeHaven Standard',
    label: 'The Standard',
    image:
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'terrace',
    number: '05',
    name: 'Private Terrace & Journey',
    label: 'Private Terrace',
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85',
  },
  {
    id: 'portal',
    number: '06',
    name: 'Executive Portal & Closing',
    label: 'Executive Portal',
    image:
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=2000&q=85',
  },
];

/* ─── CATEGORIES ─── */
const CATEGORIES = [
  {
    type: 'Villa',
    title: 'Luxury Villas',
    desc: 'Contemporary private estates with sculptured pools and architectural grounds.',
    image:
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'Apartment',
    title: 'Modern Penthouses',
    desc: 'Panoramic skyline vistas with private elevators and bespoke finishes.',
    image:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'House',
    title: 'Architectural Estates',
    desc: 'Multi-level residences celebrating natural light, poured concrete, and cedar.',
    image:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'Commercial',
    title: 'Flagship Spaces',
    desc: 'Class-A headquarters, ateliers, and exclusive private gallery residences.',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
];

/* ─── FEATURES ─── */
const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verified Architecture',
    desc: 'Every listing audited for title integrity, physical condition, and design provenance.',
  },
  {
    icon: Users2,
    title: 'Dedicated Advisory',
    desc: 'Discrete, boutique representation by senior directors of luxury acquisition.',
  },
  {
    icon: CalendarCheck2,
    title: 'Seamless Tours',
    desc: 'Private walkthroughs and escorted property previews arranged effortlessly.',
  },
  {
    icon: Award,
    title: 'Transparent Process',
    desc: 'Complete digital tracking from introductory enquiry through to legal closing.',
  },
];

/* ─── STEPS ─── */
const STEPS = [
  {
    number: '01',
    title: 'Explore & Curate',
    text: 'Discover extraordinary homes through curated architectural parameters and custom typologies.',
  },
  {
    number: '02',
    title: 'Private Showing',
    text: 'Coordinate a private escorted viewing with the designated property representative.',
  },
  {
    number: '03',
    title: 'Direct Advisory',
    text: 'Access full architectural documentation, floor elevations, and acquisition terms.',
  },
  {
    number: '04',
    title: 'Seamless Closing',
    text: 'Finalize your acquisition with escrow security and end-to-end legal verification.',
  },
];

/* ─── FALLBACK PROPERTIES ─── */
const FALLBACK_PROPERTIES = [
  {
    id: 1,
    title: 'The Glass Pavilion',
    price: 4850000,
    location: 'Beverly Hills, CA',
    imageUrl: PROPERTY_IMAGES[0],
    propertyType: 'Villa',
  },
  {
    id: 2,
    title: 'Tribeca Sky Penthouse',
    price: 6200000,
    location: 'Tribeca, New York',
    imageUrl: PROPERTY_IMAGES[7],
    propertyType: 'Apartment',
  },
  {
    id: 3,
    title: 'Bel Air Minimalist Villa',
    price: 8900000,
    location: 'Bel Air, Los Angeles',
    imageUrl: PROPERTY_IMAGES[2],
    propertyType: 'Villa',
  },
];

/* ─── CURRENCY HELPER ─── */
const fmt = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export const HomePage = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Search state */
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('ALL');
  const [searchMaxPrice, setSearchMaxPrice] = useState('');

  /* Active room state (for HUD & dots) */
  const [activeRoom, setActiveRoom] = useState(0);

  /* Element Refs for high-performance direct style manipulation */
  const roomRefs = useRef([]);
  const bgImgRefs = useRef([]);
  const contentRefs = useRef([]);
  const doorwayRefs = useRef([]);
  const currentPos = useRef(0);
  const targetPosRef = useRef(0);
  const activeRoomRef = useRef(0);
  const animFrame = useRef(null);

  /* ─── Load Properties ─── */
  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      try {
        const data = await propertyApi.getAll();
        if (live) {
          setProperties(
            Array.isArray(data) && data.length > 0
              ? data.slice(0, 3)
              : FALLBACK_PROPERTIES
          );
        }
      } catch {
        if (live) setProperties(FALLBACK_PROPERTIES);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  /* ─── Scroll-driven Cinematic Room Walkthrough ─── */
  useEffect(() => {
    const isMobile = () => window.innerWidth <= 768;
    const isReduced = () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const applyMobileState = () => {
      roomRefs.current.forEach((r, i) => {
        if (r) {
          r.style.opacity = '1';
          r.style.zIndex = '1';
          r.style.pointerEvents = 'auto';
        }
        if (contentRefs.current[i]) {
          contentRefs.current[i].style.opacity = '1';
          contentRefs.current[i].style.transform = 'none';
          contentRefs.current[i].style.pointerEvents = 'auto';
        }
        if (bgImgRefs.current[i]) {
          bgImgRefs.current[i].style.transform = 'none';
        }
        if (doorwayRefs.current[i]) {
          doorwayRefs.current[i].style.opacity = '0';
        }
      });
    };

    const onScroll = () => {
      if (isMobile() || isReduced()) return;
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      targetPosRef.current = (window.scrollY / maxScroll) * 5;
    };

    const updateRooms = () => {
      if (isMobile() || isReduced()) return;

      /* Smooth lerp interpolation toward targetPos */
      currentPos.current += (targetPosRef.current - currentPos.current) * 0.1;
      if (Math.abs(currentPos.current - targetPosRef.current) < 0.001) {
        currentPos.current = targetPosRef.current;
      }
      const pos = currentPos.current;

      /* Track active room for navigation HUD */
      const activeIdx = Math.min(5, Math.max(0, Math.round(pos)));
      if (activeIdx !== activeRoomRef.current) {
        activeRoomRef.current = activeIdx;
        setActiveRoom(activeIdx);
      }

      /* Update visual state for each of the 6 rooms */
      for (let i = 0; i < 6; i++) {
        const rEl = roomRefs.current[i];
        const imgEl = bgImgRefs.current[i];
        const cEl = contentRefs.current[i];
        const dEl = doorwayRefs.current[i];
        if (!rEl) continue;

        const diff = pos - i;
        const dist = Math.abs(diff);

        if (dist < 1.0) {
          const opacity = Math.max(0, Math.min(1, 1 - dist));
          const contentOpacity = Math.max(0, Math.min(1, 1 - dist * 1.3));
          const scale = 1.0 + dist * 0.06;
          const contentY = -diff * 30;
          const zIndex = dist < 0.5 ? 3 : 2;

          rEl.style.opacity = opacity.toFixed(3);
          rEl.style.zIndex = zIndex;
          rEl.style.pointerEvents = dist < 0.4 ? 'auto' : 'none';

          if (imgEl) {
            imgEl.style.transform = `scale(${scale.toFixed(4)})`;
          }
          if (cEl) {
            cEl.style.opacity = contentOpacity.toFixed(3);
            cEl.style.transform = `translateY(${contentY.toFixed(1)}px)`;
            cEl.style.pointerEvents = dist < 0.4 ? 'auto' : 'none';
          }
        } else {
          /* Inactive room completely hidden */
          rEl.style.opacity = '0';
          rEl.style.zIndex = '0';
          rEl.style.pointerEvents = 'none';
          if (cEl) {
            cEl.style.opacity = '0';
            cEl.style.pointerEvents = 'none';
          }
        }

        /* Doorway framing transition effect */
        if (dEl) {
          if (diff >= 0 && diff < 1) {
            const doorwayPeak = Math.sin(diff * Math.PI) * 0.35;
            dEl.style.opacity = doorwayPeak.toFixed(3);
          } else {
            dEl.style.opacity = '0';
          }
        }
      }

      animFrame.current = requestAnimationFrame(updateRooms);
    };

    if (isMobile() || isReduced()) {
      applyMobileState();
    } else {
      /* Initial setup */
      if (roomRefs.current[0]) roomRefs.current[0].style.opacity = '1';
      window.addEventListener('scroll', onScroll, { passive: true });
      animFrame.current = requestAnimationFrame(updateRooms);
    }

    const onResize = () => {
      if (isMobile() || isReduced()) {
        cancelAnimationFrame(animFrame.current);
        window.removeEventListener('scroll', onScroll);
        applyMobileState();
      } else {
        cancelAnimationFrame(animFrame.current);
        window.removeEventListener('scroll', onScroll);
        window.addEventListener('scroll', onScroll, { passive: true });
        animFrame.current = requestAnimationFrame(updateRooms);
      }
    };

    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  /* ─── Jump to specific room ─── */
  const jumpToRoom = useCallback((idx) => {
    targetPosRef.current = idx;
    setActiveRoom(idx);

    if (window.innerWidth <= 768) {
      const el = roomRefs.current[idx];
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const maxScroll = Math.max(
      1,
      document.documentElement.scrollHeight - window.innerHeight
    );
    const targetScroll = (idx / 5) * maxScroll;
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }, []);

  /* ─── Search Form Handler ─── */
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (searchLocation.trim()) params.set('search', searchLocation.trim());
      if (searchType !== 'ALL') params.set('propertyType', searchType);
      if (searchMaxPrice) params.set('maxPrice', searchMaxPrice);
      navigate(`/properties?${params.toString()}`);
    },
    [navigate, searchLocation, searchType, searchMaxPrice]
  );

  return (
    <div className="luxury-home">
      <PublicNavbar />

      {/* ── Fixed Penthouse Navigation Dots ── */}
      <nav className="room-nav" aria-label="Penthouse walkthrough navigation">
        {ROOMS.map((r, i) => (
          <button
            key={r.id}
            type="button"
            className={`room-dot${activeRoom === i ? ' active' : ''}`}
            data-label={r.label}
            onClick={() => jumpToRoom(i)}
            aria-label={r.label}
          />
        ))}
      </nav>

      {/* ── Fixed Penthouse HUD Indicator ── */}
      <div className="room-hud">
        <span className="room-hud-num">{ROOMS[activeRoom].number} / 06</span>
        <span className="room-hud-divider" />
        <span className="room-hud-name">{ROOMS[activeRoom].name}</span>
      </div>

      {/* ── Sticky Fullscreen Viewport for Walkthrough ── */}
      <div className="rooms-viewport">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROOM 01: GRAND LIVING SALON (Hero & Search)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          className="room-layer room-01"
          ref={(el) => (roomRefs.current[0] = el)}
        >
          <div className="room-bg">
            <img
              ref={(el) => (bgImgRefs.current[0] = el)}
              className="room-bg-img"
              src={ROOMS[0].image}
              alt="Grand Living Salon"
              loading="eager"
            />
          </div>
          <div className="room-atmosphere">
            <div className="room-vignette" />
            <div className="room-warm-tint" />
            <div className="light-cone lc-1" />
            <div className="light-cone lc-2" />
            <div className="light-cone lc-3" />
            <div className="window-glow" />
            <div className="skirting-line" />
            <div className="floor-shadow" />
            <div className="ceiling-shadow" />
            <div className="room-grain" />
          </div>
          <div
            className="doorway-overlay"
            ref={(el) => (doorwayRefs.current[0] = el)}
          />
          <div
            className="room-content"
            ref={(el) => (contentRefs.current[0] = el)}
          >
            <div className="hero-layout">
              <div className="glass-panel">
                <div className="room-eyebrow">
                  <Sparkles /> PrimeHaven Private Residences
                </div>
                <h1 className="room-heading">Architecture of Distinction</h1>
                <div className="bronze-line" />
                <p className="room-desc">
                  Step into an extraordinary world of prime residential estates,
                  curated penthouses, and bespoke architectural landmarks across
                  the globe.
                </p>

                <div className="btn-row">
                  <Link to="/properties" className="ph-btn ph-btn-gold">
                    Explore Collection <ArrowRight />
                  </Link>
                  <button
                    type="button"
                    className="ph-btn ph-btn-outline"
                    onClick={() => jumpToRoom(1)}
                  >
                    Begin Tour
                  </button>
                </div>

                {/* Integrated Architectural Search Console */}
                <form className="search-bar" onSubmit={handleSearch}>
                  <div className="search-field">
                    <label>Location</label>
                    <input
                      type="text"
                      placeholder="City, state, or enclave..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </div>
                  <div className="search-field">
                    <label>Typology</label>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                    >
                      <option value="ALL">All Typologies</option>
                      <option value="Villa">Luxury Villa</option>
                      <option value="Apartment">Penthouse / Flat</option>
                      <option value="House">Architectural Estate</option>
                      <option value="Commercial">Flagship Commercial</option>
                    </select>
                  </div>
                  <div className="search-field">
                    <label>Max Budget</label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={searchMaxPrice}
                      onChange={(e) => setSearchMaxPrice(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="search-go">
                    <Search /> Search
                  </button>
                </form>
              </div>
            </div>

            <div className="scroll-hint">
              <ChevronDown /> Scroll to explore penthouse
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROOM 02: CURATED GALLERY (Featured Properties)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          className="room-layer room-02"
          ref={(el) => (roomRefs.current[1] = el)}
        >
          <div className="room-bg">
            <img
              ref={(el) => (bgImgRefs.current[1] = el)}
              className="room-bg-img"
              src={ROOMS[1].image}
              alt="Curated Gallery"
              loading="eager"
            />
          </div>
          <div className="room-atmosphere">
            <div className="room-vignette" />
            <div className="room-warm-tint" />
            <div className="light-cone lc-1" />
            <div className="light-cone lc-3" />
            <div className="skirting-line" />
            <div className="floor-shadow" />
            <div className="room-grain" />
          </div>
          <div
            className="doorway-overlay"
            ref={(el) => (doorwayRefs.current[1] = el)}
          />
          <div
            className="room-content"
            ref={(el) => (contentRefs.current[1] = el)}
          >
            <div className="gallery-layout">
              <div className="glass-panel glass-panel-wide glass-panel-center">
                <div className="room-eyebrow">
                  <Sparkles /> Curated Selection
                </div>
                <h2 className="room-heading-sm">Featured Estates & Residences</h2>
                <div
                  className="bronze-line"
                  style={{ margin: '0 auto 14px' }}
                />
                <p className="room-desc">
                  Handpicked architectural masterpieces currently available for
                  private acquisition.
                </p>

                <div className="property-gallery-grid">
                  {loading
                    ? [1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="prop-card skeleton"
                          style={{ height: '240px' }}
                        />
                      ))
                    : properties.map((property) => (
                        <Link
                          key={property.id}
                          to={`/properties/${property.id}`}
                          className="prop-card"
                        >
                          <div className="prop-card-img">
                            <img
                              src={
                                property.imageUrl ||
                                getPropertyImage(
                                  property.id,
                                  property.propertyType
                                )
                              }
                              alt={property.title}
                              loading="eager"
                            />
                          </div>
                          <div className="prop-card-body">
                            <h4>{property.title}</h4>
                            <div className="prop-price">
                              {fmt(property.price)}
                            </div>
                            <div className="prop-location">
                              <MapPin /> {property.location || 'Prime Location'}
                            </div>
                          </div>
                        </Link>
                      ))}
                </div>

                <div className="view-all-row">
                  <Link to="/properties" className="view-all-link">
                    Browse All Available Residences <ArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROOM 03: TYPOLOGY PAVILION (Categories)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          className="room-layer room-03"
          ref={(el) => (roomRefs.current[2] = el)}
        >
          <div className="room-bg">
            <img
              ref={(el) => (bgImgRefs.current[2] = el)}
              className="room-bg-img"
              src={ROOMS[2].image}
              alt="Typology Pavilion"
              loading="eager"
            />
          </div>
          <div className="room-atmosphere">
            <div className="room-vignette" />
            <div className="room-warm-tint" />
            <div className="light-cone lc-2" />
            <div className="window-glow" />
            <div className="skirting-line" />
            <div className="floor-shadow" />
            <div className="room-grain" />
          </div>
          <div
            className="doorway-overlay"
            ref={(el) => (doorwayRefs.current[2] = el)}
          />
          <div
            className="room-content"
            ref={(el) => (contentRefs.current[2] = el)}
          >
            <div className="categories-layout">
              <div className="glass-panel glass-panel-wide glass-panel-center">
                <div className="room-eyebrow">
                  <Building /> Architectural Typologies
                </div>
                <h2 className="room-heading-sm">Explore By Sanctuary Type</h2>
                <div
                  className="bronze-line"
                  style={{ margin: '0 auto 14px' }}
                />
                <p className="room-desc">
                  Every lifestyle demands distinct spatial proportions, light
                  orientations, and craftsmanship.
                </p>

                <div className="cat-grid">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.type}
                      to={`/properties?propertyType=${cat.type}`}
                      className="cat-card"
                    >
                      <div className="cat-card-img">
                        <img src={cat.image} alt={cat.title} loading="eager" />
                      </div>
                      <div className="cat-card-label">
                        <h4>{cat.title}</h4>
                        <p>{cat.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROOM 04: THE STANDARD (Atelier / Features)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          className="room-layer room-04"
          ref={(el) => (roomRefs.current[3] = el)}
        >
          <div className="room-bg">
            <img
              ref={(el) => (bgImgRefs.current[3] = el)}
              className="room-bg-img"
              src={ROOMS[3].image}
              alt="The PrimeHaven Standard"
              loading="eager"
            />
          </div>
          <div className="room-atmosphere">
            <div className="room-vignette" />
            <div className="room-warm-tint" />
            <div className="light-cone lc-1" />
            <div className="light-cone lc-2" />
            <div className="skirting-line" />
            <div className="floor-shadow" />
            <div className="room-grain" />
          </div>
          <div
            className="doorway-overlay"
            ref={(el) => (doorwayRefs.current[3] = el)}
          />
          <div
            className="room-content"
            ref={(el) => (contentRefs.current[3] = el)}
          >
            <div className="advantages-layout">
              <div className="glass-panel">
                <div className="room-eyebrow">
                  <Award /> The PrimeHaven Standard
                </div>
                <h2 className="room-heading-sm">Built On Trust & Discretion</h2>
                <div className="bronze-line" />
                <p className="room-desc">
                  We serve high-net-worth clients, architectural purists, and
                  forward-thinking investors with uncompromised integrity.
                </p>

                <div className="features-grid">
                  {FEATURES.map((feat, idx) => {
                    const IconComp = feat.icon;
                    return (
                      <div key={idx} className="feat-card">
                        <div className="feat-icon">
                          <IconComp />
                        </div>
                        <h4>{feat.title}</h4>
                        <p>{feat.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROOM 05: PRIVATE TERRACE (Journey & CTA)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          className="room-layer room-05"
          ref={(el) => (roomRefs.current[4] = el)}
        >
          <div className="room-bg">
            <img
              ref={(el) => (bgImgRefs.current[4] = el)}
              className="room-bg-img"
              src={ROOMS[4].image}
              alt="Private Terrace & Journey"
              loading="eager"
            />
          </div>
          <div className="room-atmosphere">
            <div className="room-vignette" />
            <div className="room-warm-tint" />
            <div className="light-cone lc-2" />
            <div className="light-cone lc-3" />
            <div className="window-glow" />
            <div className="skirting-line" />
            <div className="floor-shadow" />
            <div className="room-grain" />
          </div>
          <div
            className="doorway-overlay"
            ref={(el) => (doorwayRefs.current[4] = el)}
          />
          <div
            className="room-content"
            ref={(el) => (contentRefs.current[4] = el)}
          >
            <div className="journey-layout">
              <div className="glass-panel glass-panel-wide glass-panel-center">
                <div className="room-eyebrow">
                  <Sparkles /> Seamless Acquisition
                </div>
                <h2 className="room-heading-sm">Your Journey to Ownership</h2>
                <div
                  className="bronze-line"
                  style={{ margin: '0 auto 14px' }}
                />
                <p className="room-desc">
                  From initial private curation to key handover, every milestone
                  is orchestrated with concierge precision.
                </p>

                <div className="steps-row">
                  {STEPS.map((s) => (
                    <div key={s.number} className="step-item">
                      <div className="step-num">{s.number}</div>
                      <h4>{s.title}</h4>
                      <p>{s.text}</p>
                    </div>
                  ))}
                </div>

                <div className="cta-box">
                  <h3>Ready to Experience Extraordinary Spaces?</h3>
                  <p>
                    Schedule a private tour with one of our senior property
                    advisors or list your distinctive residence with our
                    international network.
                  </p>
                  <div
                    className="btn-row"
                    style={{ justifyContent: 'center' }}
                  >
                    <Link to="/properties" className="ph-btn ph-btn-gold">
                      Explore Collection <ArrowRight />
                    </Link>
                    <Link to="/contact" className="ph-btn ph-btn-outline">
                      Schedule Private Consultation
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ROOM 06: EXECUTIVE PORTAL (Closing & Footer)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          className="room-layer room-06"
          ref={(el) => (roomRefs.current[5] = el)}
        >
          <div className="room-bg">
            <img
              ref={(el) => (bgImgRefs.current[5] = el)}
              className="room-bg-img"
              src={ROOMS[5].image}
              alt="Executive Portal"
              loading="eager"
            />
          </div>
          <div className="room-atmosphere">
            <div className="room-vignette" />
            <div className="room-warm-tint" />
            <div className="light-cone lc-1" />
            <div className="light-cone lc-2" />
            <div className="skirting-line" />
            <div className="floor-shadow" />
            <div className="room-grain" />
          </div>
          <div
            className="doorway-overlay"
            ref={(el) => (doorwayRefs.current[5] = el)}
          />
          <div
            className="room-content"
            ref={(el) => (contentRefs.current[5] = el)}
          >
            <div className="closing-layout">
              <div
                className="glass-panel glass-panel-center"
                style={{ textAlign: 'center', marginBottom: '24px' }}
              >
                <div
                  className="room-eyebrow"
                  style={{ justifyContent: 'center' }}
                >
                  <Sparkles /> PrimeHaven Network
                </div>
                <h2 className="room-heading-sm">
                  Global Reach. Timeless Architecture.
                </h2>
                <div
                  className="bronze-line"
                  style={{ margin: '0 auto 14px' }}
                />
                <p className="room-desc">
                  Connecting distinguished properties with discerning individuals
                  across North America, Europe, Asia, and the Middle East.
                </p>
                <div
                  className="btn-row"
                  style={{ justifyContent: 'center', marginTop: '16px' }}
                >
                  {isAuthenticated ? (
                    <Link
                      to={
                        role === 'ADMIN'
                          ? '/admin/dashboard'
                          : role === 'AGENT'
                          ? '/agent/dashboard'
                          : '/client/dashboard'
                      }
                      className="ph-btn ph-btn-gold"
                    >
                      Access Your Portal <ArrowRight />
                    </Link>
                  ) : (
                    <>
                      <Link to="/register" className="ph-btn ph-btn-gold">
                        Create VIP Account <ArrowRight />
                      </Link>
                      <Link to="/login" className="ph-btn ph-btn-outline">
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <footer className="apt-footer">
                <div className="footer-brand">PRIMEHAVEN REAL ESTATE</div>
                <div className="footer-links">
                  <Link to="/properties">Properties</Link>
                  <Link to="/contact">Contact</Link>
                  <Link to="/login">Client Portal</Link>
                  <Link to="/register">Register</Link>
                </div>
                <div className="footer-copy">
                  &copy; {new Date().getFullYear()} PrimeHaven International
                  Realty. All rights reserved. Architectural excellence verified.
                </div>
              </footer>
            </div>
          </div>
        </section>
      </div>

      {/* ── Scroll Spacer: Drives the 6-room transition distance ── */}
      <div className="scroll-spacer" style={{ height: '600vh' }} />
    </div>
  );
};

export default HomePage;
