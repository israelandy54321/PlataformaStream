import React, { useState } from 'react';
import JoinForm from './components/JoinForm.jsx';
import Studio from './components/Studio.jsx';

export default function App() {
  const [session, setSession] = useState(null);

  return (
    <div className="app">
      <div className="topbar">
        <div className="grow"><strong>PlataformaStream</strong> · Estudio</div>
        {session && (
          <button className="btn" onClick={()=>location.reload()}>Salir</button>
        )}
      </div>

      {!session ? (
        <div style={{display:'grid', placeItems:'center', height:'100%'}}>
          <JoinForm onJoin={setSession} />
        </div>
      ) : (
        <Studio token={session.token} roomName={session.roomName} />
      )}
    </div>
  );
}
