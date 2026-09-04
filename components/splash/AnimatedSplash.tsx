import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';

// Playback contract with tools/coin-frame-exporter.html:
// 64 frames, row-major, 8 cols x 8 rows in a square sprite sheet.
const FRAME_COUNT = 64;
const SPRITE_COLS = 8;
const FPS = 30;
const PLAYBACK_MS = Math.round((FRAME_COUNT / FPS) * 1000);
const FADE_DURATION_MS = 200;
const REDUCED_MOTION_HOLD_MS = 1000;
const REDUCED_MOTION_FADE_MS = 300;
const MIN_VISIBLE_MS = PLAYBACK_MS + FADE_DURATION_MS;
const PRELOAD_TIMEOUT_MS = 6000;
// The coin fills ~68% of each cell; 264dp keeps it at ~180dp on screen.
const DISPLAY = 264;
const SPRITE_SOURCE = require('@/assets/splash/coin-sprite.png');

type Props = {
    onDone: () => void;
};

export default function AnimatedSplash({ onDone }: Props) {
    const progress = useSharedValue(0);
    const opacity = useSharedValue(1);
    const [spriteReady, setSpriteReady] = useState(false);
    const doneRef = useRef(false);
    const mountTimeRef = useRef(0);
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    function complete() {
        if (doneRef.current) return;
        doneRef.current = true;
        onDoneRef.current();
    }

    function finish() {
        if (doneRef.current) return;
        const remaining = MIN_VISIBLE_MS - (Date.now() - mountTimeRef.current);
        if (remaining > 0) {
            setTimeout(complete, remaining);
        } else {
            complete();
        }
    }

    const fadeStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const spriteStyle = useAnimatedStyle(() => {
        const index = Math.min(FRAME_COUNT - 1, Math.floor(progress.value));
        const col = index % SPRITE_COLS;
        const row = Math.floor(index / SPRITE_COLS);
        return {
            transform: [{ translateX: -col * DISPLAY }, { translateY: -row * DISPLAY }],
        };
    });

    useEffect(() => {
        mountTimeRef.current = Date.now();
        // Reveal this overlay immediately. The native splash sits on top of
        // all JS views, so the splash would otherwise run invisibly beneath it.
        void SplashScreen.hideAsync().catch(() => {});

        let cancelled = false;

        function fadeOutAndFinish(duration: number) {
            opacity.value = withTiming(0, { duration }, (finished) => {
                if (finished) runOnJS(finish)();
            });
        }

        function startPlayback() {
            if (cancelled || doneRef.current) return;
            setSpriteReady(true);
            progress.value = withTiming(
                FRAME_COUNT - 1,
                { duration: PLAYBACK_MS, easing: Easing.linear },
                (finished) => {
                    if (finished) runOnJS(fadeOutAndFinish)(FADE_DURATION_MS);
                }
            );
        }

        // Static logo.jpg is bundled and instant; the 1MB sprite downloads
        // separately. Hold the static frame and start the clock only once
        // the sprite pixels are ready, otherwise playback runs on a blank.
        function fallbackToStatic(fadeMs: number) {
            setTimeout(() => {
                if (!doneRef.current) fadeOutAndFinish(fadeMs);
            }, REDUCED_MOTION_HOLD_MS);
        }

        void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
            if (cancelled || doneRef.current) return;
            if (reduced) {
                fallbackToStatic(REDUCED_MOTION_FADE_MS);
                return;
            }
            let settled = false;
            const timer = setTimeout(() => {
                if (!settled) {
                    settled = true;
                    fallbackToStatic(FADE_DURATION_MS);
                }
            }, PRELOAD_TIMEOUT_MS);
            void Asset.loadAsync(SPRITE_SOURCE).then(
                () => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    startPlayback();
                },
                () => {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    fallbackToStatic(FADE_DURATION_MS);
                }
            );
        });

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'background' && !doneRef.current) {
                complete();
            }
        });

        return () => {
            cancelled = true;
            subscription.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.fade, fadeStyle]}>
                <View style={styles.window}>
                    {spriteReady ? (
                        <Animated.Image
                            source={SPRITE_SOURCE}
                            style={[styles.sprite, spriteStyle]}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.staticWrap}>
                            <Image
                                source={require('@/assets/logo.jpg')}
                                style={styles.staticLogo}
                                resizeMode="contain"
                            />
                        </View>
                    )}
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        zIndex: 100,
        elevation: 100,
    },
    fade: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    window: {
        width: DISPLAY,
        height: DISPLAY,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sprite: {
        width: DISPLAY * SPRITE_COLS,
        height: DISPLAY * SPRITE_COLS,
    },
    staticWrap: {
        width: DISPLAY,
        height: DISPLAY,
        alignItems: 'center',
        justifyContent: 'center',
    },
    staticLogo: {
        width: 180,
        height: 180,
        borderRadius: 20,
    },
});
