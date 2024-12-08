import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';

const WS_URL = "ws://localhost:8000/ws"; 

interface AnglesResponse {
  theta1_deg: number;
  theta2_deg: number;
  theta3_deg: number;
  error?: string;
}

const WebSocketClient: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [X, setX] = useState<string>("0.02");
  const [Y, setY] = useState<string>("-0.15");
  const [Z, setZ] = useState<string>("0.67");
  const [config, setConfig] = useState<string>("lun");

  const [theta1, setTheta1] = useState<number | null>(null);
  const [theta2, setTheta2] = useState<number | null>(null);
  const [theta3, setTheta3] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Conexión WebSocket establecida');
    };

    ws.onmessage = (event) => {
      const data: Partial<AnglesResponse> = JSON.parse(event.data);
      if (data.error) {
        setError(data.error);
        setTheta1(null);
        setTheta2(null);
        setTheta3(null);
      } else if (data.theta1_deg !== undefined && data.theta2_deg !== undefined && data.theta3_deg !== undefined) {
        setTheta1(data.theta1_deg);
        setTheta2(data.theta2_deg);
        setTheta3(data.theta3_deg);
        setError(null);
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('Error en la conexión WebSocket.');
    };

    ws.onclose = () => {
      console.log('WebSocket cerrado');
    };

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        X: parseFloat(X),
        Y: parseFloat(Y),
        Z: parseFloat(Z),
        config: config
      };
      socket.send(JSON.stringify(message));
    } else {
      setError("WebSocket no está conectado");
    }
  };

  const xNum = parseFloat(X);
  const yNum = parseFloat(Y);
  const zNum = parseFloat(Z);

  // Rango e incrementos para etiquetas numéricas
  const minVal = -1.0;
  const maxVal = 1.0;
  const step = 0.1;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h1>Visualización 3D Punto</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ maxWidth: '400px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label>
              X:
              <input
                type="number"
                step="0.01"
                value={X}
                onChange={e => setX(e.target.value)}
                style={{ marginLeft: '10px', width: '100px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Y:
              <input
                type="number"
                step="0.01"
                value={Y}
                onChange={e => setY(e.target.value)}
                style={{ marginLeft: '22px', width: '100px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Z:
              <input
                type="number"
                step="0.01"
                value={Z}
                onChange={e => setZ(e.target.value)}
                style={{ marginLeft: '22px', width: '100px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Config:
              <input
                type="text"
                value={config}
                onChange={e => setConfig(e.target.value)}
                style={{ marginLeft: '10px', width: '100px' }}
              />
              <span style={{ fontSize: '12px', marginLeft: '10px' }}>
                (ej: 'lun', 'run', etc.)
              </span>
            </label>
          </div>
          <button onClick={sendMessage}>Calcular Inversa</button>

          {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}

          {(theta1 !== null && theta2 !== null && theta3 !== null) && (
            <div style={{ marginTop: '20px' }}>
              <h2>Ángulos Calculados (Grados):</h2>
              <p>θ1: {theta1.toFixed(2)}°</p>
              <p>θ2: {theta2.toFixed(2)}°</p>
              <p>θ3: {theta3.toFixed(2)}°</p>
            </div>
          )}
        </div>

        {/* Sección 3D */}
        <div style={{ width: '50rem', height: '80vh', border: '1px solid #ccc' }}>
          <Canvas 
            camera={{ position: [0.75, 0.75, 1.5], fov: 50 }}
            onCreated={({ camera }) => {
              // Mantener Z arriba
              camera.up.set(0, 0, 1);
            }}
          >
            <ambientLight intensity={0.8} />
            <pointLight position={[2, 2, 2]} />
            <OrbitControls />

            {/* Etiquetas de ejes */}
            <Text position={[1.1, 0, 0]} fontSize={0.05} color="red">X</Text>
            <Text position={[0, 1.1, 0]} fontSize={0.05} color="green">Y</Text>
            <Text position={[0, 0, 1.1]} fontSize={0.05} color="blue">Z</Text>

            {/* Punto en (X,Y,Z) */}
            <mesh position={[xNum, yNum, zNum]}>
              <sphereGeometry args={[0.01, 16, 16]} />
              <meshStandardMaterial color="red" />
            </mesh>

            {/* Lineas para formar el "cuadro" en el plano XY y la línea vertical */}
            <Line points={[[0,0,0],[xNum,0,0]]} color="#555" lineWidth={2} />
            <Line points={[[xNum,0,0],[xNum,yNum,0]]} color="#555" lineWidth={2} />
            <Line points={[[xNum,yNum,0],[0,yNum,0]]} color="#555" lineWidth={2} />
            <Line points={[[0,yNum,0],[0,0,0]]} color="#555" lineWidth={2} />

            {/* Línea vertical desde la esquina del cuadro hasta el punto en Z */}
            <Line points={[[xNum,yNum,0],[xNum,yNum,zNum]]} color="#555" lineWidth={2} />

            {/* Etiquetas numéricas en X */}
            {Array.from({length: Math.floor((maxVal - minVal)/step)+1}, (_, idx) => {
              const val = minVal + idx*step;
              return (
                <Text 
                  key={`x-label-${val}`} 
                  position={[val, 0, 0.01]} 
                  fontSize={0.02} 
                  color="black"
                >
                  {val.toFixed(2)}
                </Text>
              );
            })}

            {/* Etiquetas numéricas en Y */}
            {Array.from({length: Math.floor((maxVal - minVal)/step)+1}, (_, idx) => {
              const val = minVal + idx*step;
              return (
                <Text 
                  key={`y-label-${val}`} 
                  position={[0, val, 0.01]} 
                  fontSize={0.02} 
                  color="black"
                >
                  {val.toFixed(2)}
                </Text>
              );
            })}

            {/* Etiquetas numéricas en Z */}
            {Array.from({length: Math.floor((maxVal - minVal)/step)+1}, (_, idx) => {
              const val = minVal + idx*step;
              return (
                <Text 
                  key={`z-label-${val}`} 
                  position={[0, 0, val+0.01]} 
                  fontSize={0.02} 
                  color="black"
                >
                  {val.toFixed(2)}
                </Text>
              );
            })}

          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default WebSocketClient;
