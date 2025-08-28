import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LiveKitRoom, VideoConference, useRoomContext } from '@livekit/components-react';
import { Room, Track } from 'livekit-client';
import { BACKEND_URL, LIVEKIT_URL } from '../lib/config';

function Controls({ roomName }) {
  const room = useRoomContext();
  const [platform, setPlatform] = useState('youtube');
  const [banner, setBanner] = useState('');
  const [showBanner, setShowBanner] = useState(false);
  const [busy, setBusy] = useState(false);

  // Publicar imagen como "pantalla compartida" (canvas -> track)
  const publishImage = async (file) => {
    if (!file || !room) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    const canvas = document.createElement('canvas');
    // tamaño 1280x720 para HD básico
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');

    // dibujar imagen centrada con letterbox
    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      const iw = img.width, ih = img.height;
      const scale = Math.min(canvas.width/iw, canvas.height/ih);
      const w = iw*scale, h = ih*scale;
      const x = (canvas.width - w)/2;
      const y = (canvas.height - h)/2;
      ctx.drawImage(img, x, y, w, h);
    };
    draw();

    const stream = canvas.captureStream(30);
    const track = stream.getVideoTracks()[0];

    // Publicamos como ScreenShare para que se diferencie de la cámara
    await room.localParticipant.publishTrack(track, {
      name: 'Imagen',
      source: Track.Source.ScreenShare,
    });
  };

  // Publicar video local como "pantalla compartida" (video element -> track)
  const publishVideo = async (file) => {
    if (!file || !room) return;
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.playsInline = true;
    await video.play(); // necesario antes de captureStream()

    const stream = video.captureStream(30);
    const track = stream.getVideoTracks()[0];

    await room.localParticipant.publishTrack(track, {
      name: 'Video',
      source: Track.Source.ScreenShare,
    });
  };

  const unpublishScreenShares = async () => {
    if (!room) return;
    const pubs = room.localParticipant.tracks;
    pubs.forEach(pub => {
      if (pub.source === Track.Source.ScreenShare && pub.track) {
        room.localParticipant.unpublishTrack(pub.track, false);
        pub.track.stop();
      }
    });
  };

  const startStreaming = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/stream/start`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ platform })
      });
      const data = await res.json();
      alert(data.message || 'Transmisión iniciada');
    } catch (e) {
      alert('Error al iniciar transmisión');
    } finally {
      setBusy(false);
    }
  };

  const stopStreaming = async () => {
    setBusy(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/stream/stop`, { method:'POST' });
      const data = await res.json();
      alert(data.message || 'Transmisión detenida');
    } catch (e) {
      alert('Error al detener transmisión');
    } finally {
      setBusy(false);
    }
  };

  // Límite de participantes (8). Solo muestra aviso si se supera.
  useEffect(() => {
    const handle = () => {
      const count = room?.participants?.size ?? 0;
      if (count + 1 > 8) { // +1 incluye al local
        console.warn('⚠️ Límite de 8 participantes superado');
      }
    };
    room?.on('participantConnected', handle);
    room?.on('participantDisconnected', handle);
    handle();
    return () => {
      room?.off('participantConnected', handle);
      room?.off('participantDisconnected', handle);
    };
  }, [room]);

  return (
    <div className="rightcol">
      {/* Streaming */}
      <div className="panel">
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <strong>Retransmitir a:</strong>
          <select className="btn" value={platform} onChange={e=>setPlatform(e.target.value)}>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
          </select>
          <button className="btn success" onClick={startStreaming} disabled={busy}>Iniciar</button>
          <button className="btn danger" onClick={stopStreaming} disabled={busy}>Detener</button>
        </div>
        <div className="small" style={{marginTop:8}}>
          Usa tus variables <code>YOUTUBE_RTMP</code> / <code>FACEBOOK_RTMP</code> en el backend.
        </div>
      </div>

      {/* Medios */}
      <div className="panel uploader">
        <strong>Medios en el Estudio</strong>
        <div className="small">Publica como “pantalla compartida” (aparece como fuente extra).</div>
        <label className="btn" style={{display:'inline-block'}}>
          Cargar imagen
          <input type="file" accept="image/*" style={{display:'none'}}
                 onChange={e=>publishImage(e.target.files?.[0])}/>
        </label>
        <label className="btn" style={{display:'inline-block'}}>
          Cargar video
          <input type="file" accept="video/*" style={{display:'none'}}
                 onChange={e=>publishVideo(e.target.files?.[0])}/>
        </label>
        <button className="btn" onClick={unpublishScreenShares}>Quitar medios publicados</button>
      </div>

      {/* Banner */}
      <div className="panel">
        <strong>Banner/Overlay</strong>
        <input className="btn" style={{width:'100%', marginTop:8}} placeholder="Texto del banner"
               value={banner} onChange={e=>setBanner(e.target.value)} />
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <button className="btn" onClick={()=>setShowBanner(true)}>Mostrar</button>
          <button className="btn" onClick={()=>setShowBanner(false)}>Ocultar</button>
        </div>
        <div className="small" style={{marginTop:8}}>Se superpone visualmente al video del estudio (no embebe en la señal RTMP).</div>
      </div>

      {/* Info */}
      <div className="panel">
        <div className="small">
          Sala: <strong>{roomName}</strong><br/>
          Nota: <em>si quieres forzar un layout “Speaker”, usa los controles del componente de LiveKit (barra inferior)</em>.
        </div>
      </div>

      {/* Overlay render (banner) */}
      <OverlayPortal banner={showBanner ? banner : ''} />
    </div>
  );
}

// Renderiza overlays dentro del área de video (usa un portal simple)
function OverlayPortal({ banner }) {
  // LiveKitRoom monta el video en el DOM; para un prototipo simple, insertamos
  // un contenedor overlay al final del body y lo posicionamos encima de .gridarea.
  const [container] = useState(() => {
    const el = document.createElement('div');
    el.className = 'overlay';
    el.style.position = 'fixed';
    el.style.left = '12px';
    el.style.right = '332px'; // deja espacio a la columna derecha (320 + gap)
    el.style.top = '76px';    // debajo de la topbar
    el.style.bottom = '12px';
    el.style.pointerEvents = 'none';
    return el;
  });

  useEffect(() => {
    document.body.appendChild(container);
    return () => document.body.removeChild(container);
  }, [container]);

  useEffect(() => {
    container.innerHTML = '';
    if (banner) {
      const b = document.createElement('div');
      b.className = 'banner';
      b.textContent = banner;
      container.appendChild(b);
    }
  }, [banner, container]);

  return null;
}

export default function Studio({ token, roomName }) {
  return (
    <div className="layout">
      <div className="gridarea">
        <LiveKitRoom
          serverUrl={LIVEKIT_URL}
          token={token}
          connectOptions={{ autoSubscribe: true }}
          video={true}
          audio={true}
          onDisconnected={() => location.reload()}
          style={{ height: '100%', width: '100%' }}
        >
          {/* UI prediseñada de LiveKit */}
          <VideoConference />

          {/* 👇 Controls ahora DENTRO del LiveKitRoom */}
          <Controls roomName={roomName} />
        </LiveKitRoom>
      </div>
    </div>
  );
}

