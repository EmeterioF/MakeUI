import { Asset } from 'expo-asset';
import tutorialSteps from './tutorialSteps';

let preloadPromise: Promise<void> | null = null;

/**
 * Downloads and decodes the tutorial screenshots ahead of time so the
 * first tutorial step renders instantly. Safe to call from multiple
 * screens: the work runs once and later calls reuse the same promise.
 */
export function preloadTutorialAssets(): Promise<void> {
    if (!preloadPromise) {
        preloadPromise = Asset.loadAsync(tutorialSteps).then(
            () => undefined,
            () => {
                // Local bundled assets should always resolve; allow a
                // retry on the next call if they somehow do not.
                preloadPromise = null;
            }
        );
    }
    return preloadPromise;
}
