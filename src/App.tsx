import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import { Viewer, Cartesian3, Color, Entity, HeightReference, Math as CesiumMath, ModelGraphics, NearFarScalar, PointGraphics, Transforms, HeadingPitchRoll } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { FINAL_GIFT_TARGET, ROUTE_START, ROUTE_END } from '@/data/santaRoute2026';
import { snapshotAt, type RouteSnapshot } from '@/lib/routeEngine';
import './styles.css';

const MODEL_URL = 'https://raw.githubusercontent.com/Gentrygroundsco/santa-tracker/main/santa_sleigh%20%281%29.glb';
const format = (n: number) => new Intl.NumberFormat('en-US').format(Math.floor(n));

function App() {
  const globeRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const santaRef = useRef<Entity | null>(null);
  const [demo, setDemo] = useState(true);
  const [speed, setSpeed] = useState(25);
  const [simulated, setSimulated] = useState(DateTime.utc(2026, 12, 24, 17));
  const [follow, setFollow] = useState(false);
  const [snapshot, setSnapshot] = useState<RouteSnapshot>(() => snapshotAt(simulated));

  useEffect(() => {
    if (!globeRef.current) return;
    const viewer = new Viewer(globeRef.current, { animation: false, timeline: false, baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false, navigationHelpButton: false, fullscreenButton: false, selectionIndicator: false, infoBox: false });
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.showGroundAtmosphere = true;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.backgroundColor = Color.fromCssColorString('#030912');
    viewer.scene.globe.baseColor = Color.fromCssColorString('#0a2030');
    const santa = viewer.entities.add({ name: 'SANTA ONE', position: Cartesian3.fromDegrees(snapshot.longitude, snapshot.latitude, snapshot.altitudeMeters), point: new PointGraphics({ pixelSize: 12, color: Color.fromCssColorString('#ffcc66'), outlineColor: Color.WHITE, outlineWidth: 2, scaleByDistance: new NearFarScalar(1e5, 1.5, 1e8, 0.6) }), model: new ModelGraphics({ uri: MODEL_URL, scale: 120, minimumPixelSize: 48, heightReference: HeightReference.NONE }) });
    santaRef.current = santa;
    viewerRef.current = viewer;
    return () => { viewer.destroy(); viewerRef.current = null; };
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(100, now - last); last = now;
      if (demo) setSimulated((value) => value.plus(delta * speed));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [demo, speed]);

  useEffect(() => {
    const next = snapshotAt(simulated);
    setSnapshot(next);
    const entity = santaRef.current;
    const viewer = viewerRef.current;
    if (!entity || !viewer) return;
    const position = Cartesian3.fromDegrees(next.longitude, next.latitude, next.altitudeMeters);
    entity.position = position as never;
    const heading = CesiumMath.toRadians(next.longitude - next.current.longitude);
    entity.orientation = Transforms.headingPitchRollQuaternion(position, new HeadingPitchRoll(heading, 0.05, 0)) as never;
    if (follow) viewer.camera.lookAt(position, new Cartesian3(0, -6500000, 2600000));
  }, [simulated, follow]);

  const eta = useMemo(() => Math.max(0, Math.round((1 - snapshot.segmentProgress) * 100)), [snapshot]);
  const localTime = DateTime.fromMillis(simulated.toMillis()).setZone(snapshot.next.timezone).toFormat('h:mm a ZZZZ');
  const phase = simulated < ROUTE_START ? 'PREPARING' : simulated > ROUTE_END ? 'MISSION COMPLETE' : snapshot.phase;

  return <main className="shell"><header className="topbar"><div className="brand"><span className="signal" /> SANTA TRACKER <b>2026</b></div><div className="top-actions"><span className="live"><i /> {demo ? 'DEMO LINK' : 'LIVE'}</span><button onClick={() => setFollow(!follow)}>{follow ? 'FOLLOWING SANTA' : 'FOLLOW SANTA'}</button></div></header><section className="workspace"><div ref={globeRef} className="globe" /><div className="map-badge"><small>SLEIGH IDENT</small><strong>SANTA ONE</strong><span>{phase}</span></div><aside className="panel"><div className="eyebrow">MISSION CONTROL / CHRISTMAS EVE</div><h1>{snapshot.current.city}</h1><p className="muted">{snapshot.current.region ? `${snapshot.current.region}, ` : ''}{snapshot.current.country}</p><div className="route-card"><div><small>LAST SEEN</small><strong>{snapshot.previous.city}</strong></div><div className="arrow">→</div><div><small>HEADING FOR</small><strong>{snapshot.next.city}</strong></div></div><div className="eta"><span>ARRIVING IN</span><strong>00:{String(eta).padStart(2, '0')}</strong></div><div className="metrics"><Metric label="GIFTS DELIVERED" value={format(snapshot.gifts)} wide /><Metric label="CURRENT SPEED" value={`${format(snapshot.speedMph)} MPH`} /><Metric label="ALTITUDE" value={`${format(snapshot.altitudeMeters * 3.28084)} FT`} /><Metric label="DISTANCE TRAVELED" value={`${format(snapshot.distanceMiles)} MI`} /><Metric label="STOPS" value={`${Math.floor(snapshot.progress * 518)} / 518`} /><Metric label="LOCAL TIME" value={localTime} /></div><div className="progress"><span style={{ width: `${snapshot.progress * 100}%` }} /></div><div className="systems"><span><i /> RADAR TRACKING</span><span><i /> SATELLITE CONNECTED</span><span><i /> REINDEER NOMINAL</span></div><div className="controls"><button onClick={() => setDemo(!demo)}>{demo ? 'PAUSE' : 'START'} DEMO</button><select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>{[1, 5, 10, 25, 50, 100].map((v) => <option key={v} value={v}>{v}× SPEED</option>)}</select></div><div className="target">FINAL MISSION TARGET <b>{format(FINAL_GIFT_TARGET)}</b></div></aside></section></main>;
}

function Metric({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) { return <div className={`metric ${wide ? 'wide' : ''}`}><small>{label}</small><strong>{value}</strong></div>; }
export default App;
