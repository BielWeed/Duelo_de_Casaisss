import { useState, useCallback } from 'react';
import * as soundManager from '../utils/soundManager';

export const useUIState = () => {
    const [isMuted, setIsMuted] = useState(soundManager.isMuted());
    const [roundBriefing, setRoundBriefing] = useState<{
        title: string;
        message: string | React.ReactNode;
        onContinue: () => void;
        icon?: 'trophy' | 'info' | 'none';
        autoContinueDelay?: number;
        buttonText?: string;
        p1Name?: string;
        p1Score?: number;
        p2Name?: string;
        p2Score?: number;
    } | null>(null);
    const [errorToast, setErrorToast] = useState<{ id: number; message: string } | null>(null);
    const [showInstructionModal, setShowInstructionModal] = useState(false);

    const addErrorToast = useCallback((message: string) => {
      setErrorToast({ id: Date.now(), message });
    }, []);

    const handleToggleMute = useCallback(() => {
        soundManager.toggleMute();
        setIsMuted(soundManager.isMuted());
    }, []);

    return {
        isMuted,
        handleToggleMute,
        roundBriefing,
        setRoundBriefing,
        errorToast,
        setErrorToast,
        addErrorToast,
        showInstructionModal,
        setShowInstructionModal,
    };
};
