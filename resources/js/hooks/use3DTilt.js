import { useRef, useState, useCallback } from 'react';

export const use3DTilt = () => {
    const cardRef = useRef(null);
    const [transform, setTransform] = useState(
        'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    );

    const handlePointerMove = useCallback((e) => {
        if (e.pointerType === 'touch') return;
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;

        setTransform(
            `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        );
    }, []);

    const handlePointerLeave = useCallback(() => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    }, []);

    return {
        cardRef,
        transform,
        handlePointerMove,
        handlePointerLeave,
    };
};
