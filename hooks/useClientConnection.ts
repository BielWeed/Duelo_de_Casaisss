

import { useState, useEffect, useRef, useCallback } from 'react';
import { PT_BR } from '../utils/translations';
import { PeerDataPayload } from '../types';

declare const Peer: any;
declare type DataConnection = any;

interface UseClientConnectionOptions {
  onDataReceived: (connId: string, data: PeerDataPayload) => void;
}

export const useClientConnection = ({ onDataReceived }: UseClientConnectionOptions) => {
    const [peerId, setPeerId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const peerRef = useRef<any>(null);
    const connRef = useRef<DataConnection | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'>('disconnected');
    const lastHostIdRef = useRef<string | null>(null);
    const connectionStatusRef = useRef(connectionStatus);
    
    useEffect(() => {
        connectionStatusRef.current = connectionStatus;
    }, [connectionStatus]);

    const resetClientError = useCallback((_?: any) => {
        setError(null);
        setConnectionStatus('disconnected');
    }, []);

    const handleCloseOrError = useCallback((err?: any) => {
        if (connectionStatusRef.current === 'connected') {
            setConnectionStatus('reconnecting');
        } else {
            setConnectionStatus(err ? 'error' : 'disconnected');
        }
        if (connRef.current) {
            connRef.current = null;
        }
    }, []);

    useEffect(() => {
        let peer: any = null;

        const cleanup = () => {
            if (connRef.current) {
                connRef.current.close();
                connRef.current = null;
            }
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        };

        try {
            peer = new Peer();
            peerRef.current = peer;
            peer.on('open', (id: string) => { setPeerId(id); });
            peer.on('error', (err: any) => {
                setError(`${PT_BR.connectionLost}: ${err.message}`);
                setConnectionStatus('error');
            });
            peer.on('disconnected', () => {
                setError(PT_BR.connectionLost);
                handleCloseOrError({ type: 'network', message: 'Peer disconnected' });
            });
        } catch(e: any) {
            console.error("PeerJS instantiation error (client):", e);
            setError("Erro ao iniciar a biblioteca de conexão. Seu navegador pode não ser compatível.");
            setConnectionStatus('error');
        }

        return cleanup;
    }, [handleCloseOrError]);

    const connectToHost = useCallback((hostId: string) => {
        if (!peerRef.current) return;
        
        lastHostIdRef.current = hostId;

        if (connRef.current) {
             if(connRef.current.peer === hostId && connRef.current.open) return;
             connRef.current.close();
        }

        setConnectionStatus('connecting');
        const conn = peerRef.current.connect(hostId, { reliable: true });
        connRef.current = conn;
        
        conn.on('open', () => {
            setConnectionStatus('connected');
        });
        conn.on('data', (data: PeerDataPayload) => { if (onDataReceived) onDataReceived(conn.peer, data); });
        conn.on('close', () => handleCloseOrError());
        conn.on('error', (err: any) => {
            let errorMessage = `Erro de conexão. Verifique o código da sala e a conexão do Host.`;
            if (err.type === 'peer-unavailable') {
              errorMessage = 'Host não encontrado. Verifique se o código da sala está correto.';
            } else if (err.message) {
              errorMessage = `${PT_BR.connectionLost}: ${err.message}`;
            }
            setError(errorMessage);
            handleCloseOrError(err);
        });
    }, [onDataReceived, handleCloseOrError]);

    useEffect(() => {
        if (connectionStatus === 'reconnecting' && lastHostIdRef.current) {
            const timer = setTimeout(() => {
                connectToHost(lastHostIdRef.current!);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [connectionStatus, connectToHost]);

    const sendData = useCallback((data: PeerDataPayload) => {
        if (connRef.current && connRef.current.open) {
            connRef.current.send(data);
        }
    }, []);

    return { peerId, error, connectionStatus, connectToHost, sendData, resetClientError };
};