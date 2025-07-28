import { useState, useEffect, useRef } from 'react';

export const useAnimatedData = (data, keyField = 'name', duration = 500) => {
    const [animatedData, setAnimatedData] = useState(data);
    const frameRef = useRef();
    const previousDataRef = useRef(JSON.parse(JSON.stringify(data)));

    useEffect(() => {
        const startTime = performance.now();
        
        const prevDataMap = new Map(previousDataRef.current.map(d => [d[keyField], d]));
        const currentDataMap = new Map(data.map(d => [d[keyField], d]));
        
        const allKeys = new Set([...prevDataMap.keys(), ...currentDataMap.keys()]);

        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            const frameData = Array.from(allKeys).map(key => {
                const prevPoint = prevDataMap.get(key) || { [keyField]: key, value: 0, ...data.find(d => d[keyField] === key) };
                const currentPoint = currentDataMap.get(key) || { [keyField]: key, value: 0, ...prevPoint };
                
                const value = (prevPoint.value || 0) + ((currentPoint.value || 0) - (prevPoint.value || 0)) * progress;
                
                return { ...currentPoint, value };
            }).filter(d => currentDataMap.has(d[keyField]) || progress < 1);

            setAnimatedData(frameData);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                setAnimatedData(data);
                previousDataRef.current = JSON.parse(JSON.stringify(data));
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(frameRef.current);
    }, [data, duration, keyField]);

    return animatedData;
};
