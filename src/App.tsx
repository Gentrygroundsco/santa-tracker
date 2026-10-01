import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { Viewer, Cartesian3, Color, Entity, HeightReference, Math as CesiumMath, ModelGraphics, NearFarScalar, PointGraphics, Transforms, HeadingPitchRoll, CallbackProperty, PolylineGraphics } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { FINAL_GIFT_TARGET, ROUTE_START, ROUTE_END, SANTA_ROUTE_2026 } from '@/data/santaRoute2026';
import { snapshotAt, type RouteSnapshot } from '@/lib/routeEngine';
import { formatLocalTime, getCountriesVisited } from '@/lib/timeHelpers';
import { WeatherPanel } from '@/components/WeatherPanel';
import { LaunchCountdown } from '@/components/LaunchCountdown';
import { MissionStats } from '@/components/MissionStats';
import { SearchPanel } from '@/components/SearchPanel';
import { SantaOneInfo } from '@/components/SantaOneInfo';
import { DeveloperPanel } from '@/components/DeveloperPanel';
import type { SantaStop } from '@/data/santaRoute2026';
import './App.css';

const MODEL_URL = 'https://raw.githubusercontent.com/Gentrygroundsco/santa-tracker/main/santa_sleigh%20%281%29.glb';
const format = (n: number) => new Intl.NumberFormat('en-US').format(Math.floor(n));

type ViewMode = 'tracker' | 'stats' | 'santaone' | 'mission';

function App() {
  const globeRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const santaRef = useRef<Entity | null>(null);
  const routeLineRef = useRef<Entity | null>(null);
  const [demo, setDemo] = useState(true);
  const [speed, setSpeed] = useState(25);
  const [simulated, setSimulated] = useState(DateTime.utc(2026, 12, 24, 17));
  const [follow, setFollow] = useState(true);
  const [snapshot, setSnapshot] = useState<RouteSnapshot>(() => snapshotAt(simulated));
  const [viewMode, setViewMode] = useState<ViewMode>('tracker');
  const [selectedStop, setSelectedStop] = useState<SantaStop | null>(null);
  const [sound, setSound] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 768);

  // Initialize Cesium globe
  useEffect(() => {
    if (!globeRef.current) return;
    const viewer = new Viewer(globeRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      selectionIndicator: false,
      infoBox: false,
    });

    // Configure Earth appearance
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.skyAtmosphere.brightnessShift = 0.5;
    viewer.scene.backgroundColor = Color.fromCssColorString('#030912');
    viewer.scene.globe.baseColor = Color.fromCssColorString('#0a1f35');
    viewer.scene.fog.enabled = false;

    // Add route line (visualization of full path)
    const routePositions = SANTA_ROUTE_2026.map((stop) => Cartesian3.fromDegrees(stop.longitude, stop.latitude, 8000));
    const routeLine = viewer.entities.add({
      name: 'Route',
      polyline: new PolylineGraphics({
        positions: new CallbackProperty(() => routePositions, false),
        width: 2,
        material: Color.fromCssColorString('#65e5b1').withAlpha(0.4),
        clampToGround: false,
      }),
    });
    routeLineRef.current = routeLine;

    // Add Santa entity
    const santa = viewer.entities.add({
      name: 'SANTA ONE',
      position: new CallbackProperty(() => Cartesian3.fromDegrees(snapshot.longitude, snapshot.latitude, snapshot.altitudeMeters * 1000), false),
      point: new PointGraphics({
        pixelSize: 12,
        color: Color.fromCssColorString('#ffd700'),
        outlineColor: Color.WHITE,
        outlineWidth: 2,
        scaleByDistance: new NearFarScalar(1e5, 1.5, 1e8, 0.6),
      }),
      model: new ModelGraphics({
        uri: MODEL_URL,
        scale: 120,
        minimumPixelSize: 48,
        heightReference: HeightReference.NONE,
      }),
      orientation: new CallbackProperty(() => {
        const heading = CesiumMath.toRadians(snapshot.longitude - snapshot.current.longitude);
        return Transforms.headingPitchRollQuaternion(
          Cartesian3.fromDegrees(snapshot.longitude, snapshot.latitude, snapshot.altitudeMeters * 1000),
          new HeadingPitchRoll(heading, 0.05, 0)
        );
      }, false),
    });
    santaRef.current = santa;
    viewerRef.current = viewer;

    // Handle window resize for mobile detection
    const handleResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  // Animation loop for demo mode
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(100, now - last);
      last = now;
      if (demo) setSimulated((value) => value.plus(delta * speed));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [demo, speed]);

  // Update Santa position and camera
  useEffect(() => {
    const next = snapshotAt(simulated);
    setSnapshot(next);

    const entity = santaRef.current;
    const viewer = viewerRef.current;
    if (!entity || !viewer) return;

    const position = Cartesian3.fromDegrees(next.longitude, next.latitude, next.altitudeMeters * 1000);

    if (follow) {
      viewer.camera.lookAt(position, new Cartesian3(0, -6500000, 2600000));
    }
  }, [simulated, follow]);

  // Handle mobile responsiveness
  useEffect(() => {
    if (mobile) {
      setFollow(false);
    }
  }, [mobile]);

  const eta = useMemo(() => Math.max(0, Math.round((1 - snapshot.segmentProgress) * 100)), [snapshot]);
  const localTime = formatLocalTime(simulated, snapshot.next.timezone);
  const phase = simulated < ROUTE_START ? 'PREPARING' : simulated > ROUTE_END ? 'MISSION COMPLETE' : snapshot.phase;
  const stopsCompleted = Math.floor(snapshot.progress * SANTA_ROUTE_2026.length);
  const countriesVisited = getCountriesVisited(SANTA_ROUTE_2026.slice(0, stopsCompleted));

  return (
    <main className="app-shell">
      {simulated < ROUTE_START && <LaunchCountdown now={simulated} />}

      <header className="app-header">
        <div className="header-left">
          <div className="brand-group">
            <span className="signal-dot" />
            <span className="brand-text">SANTA TRACKER</span>
            <span className="brand-year">2026</span>
          </div>
        </div>
        <div className="header-center">
          <nav className="nav-tabs">
            <button
              className={`nav-tab ${viewMode === 'tracker' ? 'active' : ''}`}
              onClick={() => setViewMode('tracker')}
            >
              TRACK
            </button>
            <button
              className={`nav-tab ${viewMode === 'stats' ? 'active' : ''}`}
              onClick={() => setViewMode('stats')}
            >
              STATS
            </button>
            <button
              className={`nav-tab ${viewMode === 'santaone' ? 'active' : ''}`}
              onClick={() => setViewMode('santaone')}
            >
              SANTA ONE
            </button>
          </nav>
        </div>
        <div className="header-right">
          <button
            className="icon-btn"
            onClick={() => setSound(!sound)}
            title={sound ? 'Sound On' : 'Sound Off'}
          >
            {sound ? '🔊' : '🔇'}
          </button>
          <span className={`status-badge ${demo ? 'demo' : 'live'}`}>
            <i /> {demo ? 'DEMO' : 'LIVE'}
          </span>
        </div>
      </header>

      <div className="workspace">
        <div ref={globeRef} className="globe-container" />

        <div className="status-banner">
          <div className="banner-item">
            <span>SLEIGH IDENT</span>
            <strong>SANTA ONE</strong>
          </div>
          <div className="banner-sep">•</div>
          <div className="banner-item">
            <span>STATUS</span>
            <strong>{phase}</strong>
          </div>
          <div className="banner-sep">•</div>
          <div className="banner-item">
            <span>GIFTS</span>
            <strong>{format(snapshot.gifts)}</strong>
          </div>
          <div className="banner-sep">•</div>
          <div className="banner-item">
            <span>SPEED</span>
            <strong>{format(snapshot.speedMph)} MPH</strong>
          </div>
        </div>

        {viewMode === 'tracker' && (
          <aside className="side-panel">
            <div className="panel-section">
              <small className="section-label">MISSION CONTROL</small>
              <h1 className="location-title">{snapshot.current.city}</h1>
              <p className="location-subtitle">
                {snapshot.current.region ? `${snapshot.current.region}, ` : ''}
                {snapshot.current.country}
              </p>
            </div>

            <div className="route-status">
              <div className="route-point">
                <small>LAST SEEN</small>
                <strong>{snapshot.previous.city}</strong>
              </div>
              <div className="route-arrow">→</div>
              <div className="route-point">
                <small>HEADING FOR</small>
                <strong>{snapshot.next.city}</strong>
              </div>
            </div>

            <div className="eta-display">
              <span className="eta-label">ARRIVING IN</span>
              <strong className="eta-value">00:{String(eta).padStart(2, '0')}</strong>
            </div>

            <div className="metrics-grid">
              <div className="metric-box">
                <small>GIFTS DELIVERED</small>
                <strong className="large">{format(snapshot.gifts)}</strong>
              </div>
              <div className="metric-box">
                <small>CURRENT SPEED</small>
                <strong>{format(snapshot.speedMph)} MPH</strong>
              </div>
              <div className="metric-box">
                <small>ALTITUDE</small>
                <strong>{format(snapshot.altitudeMeters * 3.28084)} FT</strong>
              </div>
              <div className="metric-box">
                <small>DISTANCE TRAVELED</small>
                <strong>{format(snapshot.distanceMiles)} MI</strong>
              </div>
              <div className="metric-box">
                <small>STOPS COMPLETED</small>
                <strong>{stopsCompleted} / 518</strong>
              </div>
              <div className="metric-box">
                <small>LOCAL TIME</small>
                <strong>{localTime}</strong>
              </div>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${snapshot.progress * 100}%` }} />
            </div>

            <div className="systems-status">
              <div className="system">
                <i className="sys-dot" /> RADAR TRACKING
              </div>
              <div className="system">
                <i className="sys-dot" /> SATELLITE CONNECTED
              </div>
              <div className="system">
                <i className="sys-dot" /> REINDEER NOMINAL
              </div>
              <div className="system">
                <i className="sys-dot" /> SLEIGH NOMINAL
              </div>
            </div>

            <WeatherPanel latitude={snapshot.next.latitude} longitude={snapshot.next.longitude} time={simulated} />

            <div className="demo-controls">
              <button className={`ctrl-btn ${demo ? 'active' : ''}`} onClick={() => setDemo(!demo)}>
                {demo ? '⏸ PAUSE' : '▶ START'} DEMO
              </button>
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="ctrl-select">
                {[1, 5, 10, 25, 50, 100].map((v) => (
                  <option key={v} value={v}>
                    {v}× SPEED
                  </option>
                ))}
              </select>
              <button className={`ctrl-btn ${follow ? 'active' : ''}`} onClick={() => setFollow(!follow)}>
                {follow ? '🎯' : '🔍'} {follow ? 'FOLLOWING' : 'FREE LOOK'}
              </button>
            </div>

            <div className="mission-target">
              <small>FINAL MISSION TARGET</small>
              <strong>{format(FINAL_GIFT_TARGET)}</strong>
            </div>
          </aside>
        )}

        {viewMode === 'stats' && (
          <aside className="side-panel">
            <MissionStats snapshot={snapshot} />
            <SearchPanel onSelect={(stop) => setSelectedStop(stop)} />
            {selectedStop && (
              <div className="selected-stop">
                <h3>{selectedStop.city}</h3>
                <p>{selectedStop.region ? `${selectedStop.region}, ` : ''}{selectedStop.country}</p>
                <p className="timezone">Timezone: {selectedStop.timezone}</p>
              </div>
            )}
          </aside>
        )}

        {viewMode === 'santaone' && (
          <aside className="side-panel">
            <SantaOneInfo />
          </aside>
        )}
      </div>

      <DeveloperPanel
        onTimeChange={setSimulated}
        onSpeedChange={setSpeed}
        currentTime={simulated}
        currentSpeed={speed}
      />
    </main>
  );
}

export default App;
