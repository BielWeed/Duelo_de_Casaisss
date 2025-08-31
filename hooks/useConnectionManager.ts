
import { useHostConnection } from './useHostConnection';
import { PeerDataPayload } from '../types';

// PeerJS is loaded from a script tag, declare types for TypeScript
declare type DataConnection = any;

// The arguments for our new hook. It takes the two main callbacks.
interface ConnectionManagerArgs {
    onDataReceived: (connId: string, data: PeerDataPayload) => void;
    onPlayerConnected: (conn: DataConnection) => void;
    onPlayerDisconnected: (connId:string) => void;
}

/**
 * A hook to manage the host's network connection logic.
 * It encapsulates the use of `useHostConnection` and provides a clean
 * interface for sending data and managing players.
 */
export const useConnectionManager = ({ onDataReceived, onPlayerConnected, onPlayerDisconnected }: ConnectionManagerArgs) => {
    // The useHostConnection hook is now called here, isolated from game state.
    const { peerId, connections, kickPlayer, sendData } = useHostConnection({
        onDataReceived,
        onConnectionOpened: onPlayerConnected,
        onConnectionClosed: onPlayerDisconnected,
    });

    // It returns the same interface that useHostConnection did.
    return { peerId, connections, kickPlayer, sendData };
};
