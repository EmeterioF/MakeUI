import { useState, useEffect, useCallback } from 'react';
import { getSetting, setSetting } from '@/data/appSettings';

const TUTORIAL_SEEN_KEY = 'tutorial_seen';

export function useTutorial() {
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getSetting(TUTORIAL_SEEN_KEY).then((val) => {
            setIsLoading(false);
            if (val !== 'true') {
                setVisible(true);
            }
        });
    }, []);

    const showTutorial = useCallback(() => setVisible(true), []);

    const dismissTutorial = useCallback(() => {
        setVisible(false);
        setSetting(TUTORIAL_SEEN_KEY, 'true');
    }, []);

    return { visible, showTutorial, dismissTutorial, isLoading };
}
