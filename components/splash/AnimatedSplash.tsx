import { useEffect, useRef } from 'react';
import { AccessibilityInfo, AppState, Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';

const FLIP_DEGREES = 360;
const FLIP_DURATION_MS = 3000;
const FADE_DURATION_MS = 200;
const REDUCED_MOTION_HOLD_MS = 1000;
const REDUCED_MOTION_FADE_MS = 300;
const MIN_VISIBLE_MS = FLIP_DURATION_MS + FADE_DURATION_MS;
const COIN_SIZE = 180;
const RIM_WIDTH = 10;
const SHEEN_WIDTH = 64;
const SHEEN_TRAVEL = 130;

type Props = {
    onDone: () => void;
};

export default function AnimatedSplash({ onDone }: Props) {
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(1);
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

    const frontStyle = useAnimatedStyle(() => ({
        transform: [{ perspective: 800 }, { rotateY: `${rotation.value}deg` }],
    }));

    const backStyle = useAnimatedStyle(() => ({
        transform: [{ perspective: 800 }, { rotateY: `${rotation.value + 180}deg` }],
    }));

    const rimStyle = useAnimatedStyle(() => {
        const rad = (rotation.value * Math.PI) / 180;
        return { opacity: Math.abs(Math.sin(rad)) };
    });

    const sheenStyle = useAnimatedStyle(() => {
        const rad = (rotation.value * Math.PI) / 180;
        const tilt = Math.abs(Math.sin(rad));
        return {
            opacity: 0.28 * tilt,
            transform: [{ translateX: -Math.cos(rad) * SHEEN_TRAVEL }, { rotate: '20deg' }],
        };
    });

    const shadowStyle = useAnimatedStyle(() => {
        const rad = (rotation.value * Math.PI) / 180;
        const faceOn = Math.abs(Math.cos(rad));
        return {
            opacity: 0.3 + 0.7 * faceOn,
            transform: [{ scaleX: 0.45 + 0.55 * faceOn }],
        };
    });

    useEffect(() => {
        mountTimeRef.current = Date.now();
        // Reveal this overlay immediately. The native splash sits on top of
        // all JS views, so the flip would otherwise play invisibly beneath it.
        void SplashScreen.hideAsync().catch(() => {});

        function fadeOutAndFinish(duration: number) {
            opacity.value = withTiming(0, { duration }, (finished) => {
                if (finished) runOnJS(finish)();
            });
        }

        function startFlip() {
            rotation.value = withTiming(
                FLIP_DEGREES,
                { duration: FLIP_DURATION_MS, easing: Easing.linear },
                (finished) => {
                    if (finished) runOnJS(fadeOutAndFinish)(FADE_DURATION_MS);
                }
            );
        }

        let cancelled = false;
        void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
            if (cancelled || doneRef.current) return;
            if (reduced) {
                setTimeout(() => {
                    if (!doneRef.current) fadeOutAndFinish(REDUCED_MOTION_FADE_MS);
                }, REDUCED_MOTION_HOLD_MS);
            } else {
                startFlip();
            }
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
                <View style={styles.coinColumn}>
                    <View style={styles.coin}>
                        <Animated.View style={[styles.face, frontStyle]}>
                            <Image
                                source={require('@/assets/logo.jpg')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.View style={[styles.face, backStyle]}>
                            <Image
                                source={require('@/assets/logo.jpg')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        <Animated.View style={[styles.rim, rimStyle]} pointerEvents="none">
                            <LinearGradient
                                colors={['#0A0A0A', '#9CA3AF', '#0A0A0A']}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.rimGradient}
                            />
                        </Animated.View>
                        <Animated.View style={[styles.sheen, sheenStyle]} pointerEvents="none">
                            <LinearGradient
                                colors={['transparent', 'rgba(255,255,255,0.9)', 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.sheenGradient}
                            />
                        </Animated.View>
                    </View>
                    <Animated.View style={[styles.shadowWrap, shadowStyle]} pointerEvents="none">
                        <View style={styles.shadowOuter} />
                        <View style={styles.shadowMid} />
                        <View style={styles.shadowInner} />
                    </Animated.View>
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
    coinColumn: {
        alignItems: 'center',
    },
    coin: {
        width: COIN_SIZE,
        height: COIN_SIZE,
        borderRadius: 20,
        overflow: 'hidden',
    },
    face: {
        ...StyleSheet.absoluteFillObject,
        backfaceVisibility: 'hidden',
    },
    logo: {
        width: COIN_SIZE,
        height: COIN_SIZE,
    },
    rim: {
        position: 'absolute',
        left: (COIN_SIZE - RIM_WIDTH) / 2,
        top: 0,
        width: RIM_WIDTH,
        height: COIN_SIZE,
        borderRadius: RIM_WIDTH / 2,
        overflow: 'hidden',
    },
    rimGradient: {
        flex: 1,
    },
    sheen: {
        position: 'absolute',
        left: (COIN_SIZE - SHEEN_WIDTH) / 2,
        top: -20,
        width: SHEEN_WIDTH,
        height: COIN_SIZE + 40,
    },
    sheenGradient: {
        flex: 1,
    },
    shadowWrap: {
        marginTop: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shadowOuter: {
        position: 'absolute',
        width: 150,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#000000',
        opacity: 0.07,
    },
    shadowMid: {
        position: 'absolute',
        width: 110,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#000000',
        opacity: 0.09,
    },
    shadowInner: {
        width: 70,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#000000',
        opacity: 0.11,
    },
});
