
import { useState, useEffect, useRef, useCallback } from 'react';
import { PeerDataPayload } from '../types';

// PeerJS is loaded from a script tag, declare types for TypeScript
declare const Peer: any;
declare type DataConnection = any;

const generateShortCode = (length = 4): string => {
  // O and 0 removed to avoid confusion
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

interface HostConnectionArgs {
    onDataReceived: (connId: string, data: PeerDataPayload) => void;
    onConnectionOpened: (conn: DataConnection) => void;
    onConnectionClosed: (connId: string) => void;
}

export const useHostConnection = ({ onDataReceived, onConnectionOpened, onConnectionClosed }: HostConnectionArgs) => {
    const [peerId, setPeerId] = useState<string | null>(null);
    const [connections, setConnections] = useState<Record<string, DataConnection>>({});
    const [error, setError] = useState<string | null>(null);
    const peerRef = useRef<any>(null);

    useEffect(() => {
        let peer: any = null;

        const cleanup = () => {
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        };

        // Host logic from usePeer.ts
        let peerInitializationAttempts = 0;
        const MAX_ATTEMPTS = 10;
        const initializePeer = () => {
            if (peerInitializationAttempts >= MAX_ATTEMPTS) {
                setError("Falha ao criar sala. Verifique a conexão e tente novamente.");
                return;
            }
            peerInitializationAttempts++;
            const shortCode = generateShortCode();
            if (peerRef.current) peerRef.current.destroy();

            try {
              peer = new Peer(shortCode);
            } catch (e: any) {
              console.error("PeerJS instantiation error:", e);
              setError("Erro ao iniciar a biblioteca de conexão. Seu navegador pode não ser compatível.");
              return;
            }
            peerRef.current = peer;

            peer.on('open', (id: string) => { setPeerId(id); peerInitializationAttempts = 0; });
            peer.on('connection', (conn: DataConnection) => {
                setConnections(prev => ({ ...prev, [conn.peer]: conn }));
                if (onConnectionOpened) onConnectionOpened(conn);
                conn.on('data', (data: PeerDataPayload) => { if (onDataReceived) onDataReceived(conn.peer, data); });
                const handleClose = () => {
                    setConnections(prev => {
                        const newConns = { ...prev };
                        delete newConns[conn.peer];
                        return newConns;
                    });
                    if (onConnectionClosed) onConnectionClosed(conn.peer);
                };
                conn.on('close', handleClose);
                conn.on('error', (err: any) => { console.error(`Connection error with ${conn.peer}:`, err); handleClose(); });
            });
            peer.on('error', (err: any) => {
                if (err.type === 'unavailable-id') {
                    initializePeer();
                } else { setError(`Erro de Rede (Host): ${err.message}.`); }
            });
            peer.on('disconnected', () => { if(peerRef.current && !peerRef.current.destroyed && typeof peerRef.current.reconnect === 'function') peerRef.current.reconnect(); });
        };
        initializePeer();

        return cleanup;
    }, [onDataReceived, onConnectionOpened, onConnectionClosed]);

    const sendData = useCallback((data: PeerDataPayload) => {
        Object.values(connections).forEach(conn => {
            if (conn && conn.open) {
                conn.send(data);
            }
        });
    }, [connections]);

    const kickPlayer = useCallback((playerId: string) => {
        const conn = connections[playerId];
        if (conn && conn.open) {
            conn.send({ type: 'KICK', payload: { message: 'Você foi removido da sala pelo Host.' } });
            
            setTimeout(() => {
                conn.close();
            }, 500);
        }
    }, [connections]);

    return { peerId, connections, error, kickPlayer, sendData };
};
