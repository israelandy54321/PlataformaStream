import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../lib/config';

export default function JoinForm({ onJoin }) {
  const qs = new URLSearchParams(location.search);
  const [roomName, setRoom]     = useState(qs.get('room') || 'test');
  const [identity, setIdentity] = useState(qs.get('name') || '');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!identity) {
      const n = `user_${Math.floor(Math.random()*10000)}`;
      setIdentity(n);
    }
  }, []);

  const join = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = `${BACKEND_URL}/api/stream/token?roomName=${encodeURIComponent(roomName)}&identity=${encodeURIComponent(identity)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.token) throw new Error('No se recibió token');
      onJoin({ token: data.token, roomName, identity });
    } catch (err) {
      setError(err.message || 'Error al generar token');
    } finally {
      setLoading(false);
    }
  };

  const inviteLink = `${location.origin}?room=${encodeURIComponent(roomName)}`;

  return (
    <form className="panel" onSubmit={join} style={{maxWidth: 520, margin: '40px auto'}}>
      <h2>Entrar al Estudio</h2>
      <div style={{display:'grid', gap:10, marginTop:12}}>
        <label>
          Sala
          <input className="btn" style={{width:'100%'}} value={roomName} onChange={e=>setRoom(e.target.value)} />
        </label>
        <label>
          Tu nombre
          <input className="btn" style={{width:'100%'}} value={identity} onChange={e=>setIdentity(e.target.value)} />
        </label>

        <button className="btn primary" disabled={loading}>
          {loading ? 'Conectando…' : 'Entrar'}
        </button>

        {error && <div className="small" style={{color:'#f87171'}}>{error}</div>}

        <div className="small">
          <strong>Link de invitado:</strong>
          <div style={{display:'flex', gap:8, marginTop:6}}>
            <code className="kbd" style={{flex:1, overflow:'hidden', textOverflow:'ellipsis'}}>{inviteLink}</code>
            <button type="button" className="btn" onClick={()=>navigator.clipboard.writeText(inviteLink)}>Copiar</button>
          </div>
          <div className="small">El invitado solo entra, el token se genera automáticamente al abrir el link.</div>
        </div>
      </div>
    </form>
  );
}
