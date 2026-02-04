import { useState, useEffect, useRef } from 'react';

export const useTimer = (initialSeconds: number, onComplete?: () => void) => {
    const [seconds, setSeconds] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef<any>(null);

    const start = () => setIsActive(true);
    const pause = () => setIsActive(false);
    const reset = (newSeconds: number) => {
        setIsActive(false);
        setSeconds(newSeconds);
    };

    useEffect(() => {
        if (isActive && seconds > 0) {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => prev - 1);
            }, 1000);
        } else if (seconds === 0 && isActive) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsActive(false);
            if (onComplete) onComplete();
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, seconds, onComplete]);

    return { seconds, isActive, start, pause, reset };
};
