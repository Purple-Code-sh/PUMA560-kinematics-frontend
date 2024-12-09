import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';

const WS_URL = "ws://localhost:8000/ws"; 

interface AnglesResponse {
  theta1_deg: number;
  theta2_deg: number;
  theta3_deg: number;
  coords_0_1: [number, number, number];
  coords_0_2: [number, number, number];
  coords_0_3: [number, number, number];
  coords_0_4: [number, number, number];
  error?: string;
}

const WebSocketClient: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [X, setX] = useState<string>("-149.09");
  const [Y, setY] = useState<string>("848.20");
  const [Z, setZ] = useState<string>("20.23");
  const [arm, setArm] = useState<number>(1); // +1 por defecto (brazo derecho)
  const [elbow, setElbow] = useState<number>(1); // +1 por defecto (codo arriba)
  const [step, setStep] = useState<number>(0.01); // Tamaño de paso inicial

  const [theta1, setTheta1] = useState<number | null>(null);
  const [theta2, setTheta2] = useState<number | null>(null);
  const [theta3, setTheta3] = useState<number | null>(null);
  const [coords, setCoords] = useState<[number, number, number][]>([]);
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
        setCoords([]);
      } else if (data.theta1_deg !== undefined && data.theta2_deg !== undefined && data.theta3_deg !== undefined) {
        setTheta1(data.theta1_deg);
        setTheta2(data.theta2_deg);
        setTheta3(data.theta3_deg);

        // Manejar coordenadas, asegurando que estén definidas
        const newCoords: [number, number, number][] = [
          data.coords_0_1 || [0, 0, 0],
          data.coords_0_2 || [0, 0, 0],
          data.coords_0_3 || [0, 0, 0],
          data.coords_0_4 || [0, 0, 0],
        ];
        setCoords(newCoords);
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
        arm: arm,
        elbow: elbow
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
  const minVal = -950.0;
  const maxVal = 950.0;
  const stepGrid = 100;

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
                step={step}
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
                step={step}
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
                step={step}
                value={Z}
                onChange={e => setZ(e.target.value)}
                style={{ marginLeft: '22px', width: '100px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Tamaño de paso:
              <select
                value={step}
                onChange={(e) => setStep(parseFloat(e.target.value))}
                style={{ marginLeft: '10px', width: '120px' }}
              >
                <option value={0.01}>0.01</option>
                <option value={0.1}>0.1</option>
                <option value={1}>1</option>
                <option value={10}>10</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Brazo:
              <select
                value={arm}
                onChange={e => setArm(parseInt(e.target.value))}
                style={{ marginLeft: '10px', width: '120px' }}
              >
                <option value={1}>Brazo derecho</option>
                <option value={-1}>Brazo izquierdo</option>
              </select>
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              Codo:
              <select
                value={elbow}
                onChange={e => setElbow(parseInt(e.target.value))}
                style={{ marginLeft: '10px', width: '120px' }}
              >
                <option value={1}>Codo arriba</option>
                <option value={-1}>Codo abajo</option>
              </select>
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

              <h2>Coordenadas Calculadas:</h2>
              {coords.map((coord, index) => (
                <p key={index}>
                  T0_{index + 1}: ({coord[0].toFixed(2)}, {coord[1].toFixed(2)}, {coord[2].toFixed(2)})
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Sección 3D */}
        <div style={{ width: '50rem', height: '80vh', border: '1px solid #ccc' }}>
          <Canvas 
            camera={{ position: [1100, 1100, 1700], far:5000, near: 1,fov: 50 }}
            onCreated={({ camera }) => {
              // Mantener Z arriba
              camera.up.set(0, 0, 1);
            }}
          >
            <ambientLight intensity={0.8} />
            <pointLight position={[2000, 2000, 2000]} />
            <OrbitControls />

            {/* Etiquetas de ejes */}
            <Text position={[1000, 0, 0]} fontSize={50} color="red">X</Text>
            <Text position={[0, 1000, 0]} fontSize={50} color="green">Y</Text>
            <Text position={[0, 0, 1000]} fontSize={50} color="blue">Z</Text>

            {/* Punto en (X,Y,Z) */}
            <mesh position={[xNum, yNum, zNum]}>
              <sphereGeometry args={[6, 16, 16]} />
              <meshStandardMaterial color="red" />
            </mesh>

            {/* Lineas para formar el "cuadro" en el plano XY y la línea vertical */}
            <Line points={[[0,0,0],[xNum,0,0]]} color="#555" lineWidth={1} />
            <Line points={[[xNum,0,0],[xNum,yNum,0]]} color="#555" lineWidth={1} />
            <Line points={[[xNum,yNum,0],[0,yNum,0]]} color="#555" lineWidth={1} />
            <Line points={[[0,yNum,0],[0,0,0]]} color="#555" lineWidth={1} />

            {/* Línea vertical desde la esquina del cuadro hasta el punto en Z */}
            <Line points={[[xNum,yNum,0],[xNum,yNum,zNum]]} color="#555" lineWidth={1} />

            {/* Etiquetas numéricas en X */}
            {Array.from({length: Math.floor((maxVal - minVal)/stepGrid)+1}, (_, idx) => {
              const val = minVal + idx*stepGrid;
              return (
                <Text 
                  key={`x-label-${val}`} 
                  position={[val, 0, 0.01]} 
                  fontSize={10} 
                  color="black"
                >
                  {val.toFixed(2)}
                </Text>
              );
            })}

            {/* Etiquetas numéricas en Y */}
            {Array.from({length: Math.floor((maxVal - minVal)/stepGrid)+1}, (_, idx) => {
              const val = minVal + idx*stepGrid;
              return (
                <Text 
                  key={`y-label-${val}`} 
                  position={[0, val, 0.01]} 
                  fontSize={10} 
                  color="black"
                >
                  {val.toFixed(2)}
                </Text>
              );
            })}

            {/* Etiquetas numéricas en Z */}
            {Array.from({length: Math.floor((maxVal - minVal)/stepGrid)+1}, (_, idx) => {
              const val = minVal + idx*stepGrid;
              return (
                <Text 
                  key={`z-label-${val}`} 
                  position={[0, 0, val+0.01]} 
                  fontSize={10} 
                  color="black"
                >
                  {val.toFixed(2)}
                </Text>
              );
            })}

            {/* Puntos y líneas */}
            {coords.length > 0 && (
              <>
                {coords.map((coord, index) => (
                  <mesh key={`point-${index}`} position={coord}>
                    <sphereGeometry args={[6, 16, 16]} />
                    <meshStandardMaterial color="yellow" />
                  </mesh>
                ))}
                <Line
                  points={coords} // Lista de puntos
                  color="blue"
                  lineWidth={4}
                />
              </>
            )}

          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default WebSocketClient;
