import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

const WORD_DELAY_MS = 350;
const WORD_MS = 500;
const HOLD_MS = 500;
const FADE_DURATION_MS = 250;
const MIN_VISIBLE_MS = WORD_DELAY_MS + WORD_MS + HOLD_MS + FADE_DURATION_MS;
const REDUCED_MOTION_HOLD_MS = 1000;
const REDUCED_MOTION_FADE_MS = 300;
const LOGO_SIZE = 144;
const LOGO_START_SCALE = 0.7;
const WORD_GAP = 12;
const WORD_FONT_SIZE = 32;
const WORD_FALLBACK_WIDTH = 150;

type Props = {
    onDone: () => void;
};

export default function AnimatedSplash({ onDone }: Props) {
    const logoScale = useSharedValue(LOGO_START_SCALE);
    const logoOpacity = useSharedValue(0);
    const wordIn = useSharedValue(0);
    const wordX = useSharedValue(0);
    const opacity = useSharedValue(1);
    const [wordWidth, setWordWidth] = useState(WORD_FALLBACK_WIDTH);
    const wordWidthRef = useRef(WORD_FALLBACK_WIDTH);
    const doneRef = useRef(false);
    const mountTimeRef = useRef(0);
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    function later(ms: number, fn: () => void) {
        const id = setTimeout(fn, ms);
        timeoutsRef.current.push(id);
    }

    function complete() {
        if (doneRef.current) return;
        doneRef.current = true;
        onDoneRef.current();
    }

    function finish() {
        if (doneRef.current) return;
        const remaining = MIN_VISIBLE_MS - (Date.now() - mountTimeRef.current);
        if (remaining > 0) {
            later(remaining, complete);
        } else {
            complete();
        }
    }

    const fadeStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    // Static clip: the text is always laid out at full width inside a
    // full-size mask, so Yoga never measures it inside a zero-width box
    // (which cached an empty layout on Android and left the word invisible).
    const wordStyle = useAnimatedStyle(() => ({
        opacity: wordIn.value,
        transform: [{ translateX: wordX.value }],
    }));

    useEffect(() => {
        mountTimeRef.current = Date.now();
        // Reveal this overlay immediately. The native splash sits on top of
        // all JS views, so the intro would otherwise play invisibly beneath it.
        void SplashScreen.hideAsync().catch(() => {});

        function fadeOutAndFinish(duration: number) {
            opacity.value = withTiming(0, { duration }, (finished) => {
                if (finished) runOnJS(finish)();
            });
        }

        function startIntro() {
            // Logo pops in with a spring overshoot while fading in.
            logoScale.value = withSpring(1, { damping: 12, stiffness: 130 });
            logoOpacity.value = withTiming(1, { duration: 300 });
            // Wordmark drifts out from behind the logo, staggered behind it.
            wordX.value = -wordWidthRef.current;
            later(WORD_DELAY_MS, () => {
                if (doneRef.current) return;
                wordIn.value = withTiming(1, { duration: WORD_MS });
                wordX.value = withTiming(0, {
                    duration: WORD_MS,
                    easing: Easing.out(Easing.cubic),
                });
            });
            later(WORD_DELAY_MS + WORD_MS + HOLD_MS, () => {
                if (!doneRef.current) fadeOutAndFinish(FADE_DURATION_MS);
            });
        }

        function showStaticFinalFrame() {
            logoScale.value = 1;
            logoOpacity.value = 1;
            wordIn.value = 1;
            later(REDUCED_MOTION_HOLD_MS, () => {
                if (!doneRef.current) fadeOutAndFinish(REDUCED_MOTION_FADE_MS);
            });
        }

        let cancelled = false;
        void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
            if (cancelled || doneRef.current) return;
            if (reduced) {
                showStaticFinalFrame();
            } else {
                startIntro();
            }
        });

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'background' && !doneRef.current) {
                complete();
            }
        });

        const pendingTimeouts = timeoutsRef.current;
        return () => {
            cancelled = true;
            subscription.remove();
            pendingTimeouts.forEach(clearTimeout);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.overlay}>
            <Animated.View style={[styles.fade, fadeStyle]}>
                <Animated.View style={styles.row}>
                    <Animated.View style={logoStyle}>
                        <Image
                            source={require('@/assets/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </Animated.View>
                    <View style={[styles.mask, { width: wordWidth }]}>
                        <Animated.View style={[styles.wordSlide, wordStyle]}>
                            <Text
                                style={styles.word}
                                numberOfLines={1}
                                onLayout={(event) => {
                                    const { width } = event.nativeEvent.layout;
                                    if (width > 0 && width !== wordWidthRef.current) {
                                        wordWidthRef.current = width;
                                        setWordWidth(width);
                                    }
                                }}
                            >
                                MakeUI
                            </Text>
                        </Animated.View>
                    </View>
                </Animated.View>
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        borderRadius: 20,
    },
    mask: {
        overflow: 'hidden',
        marginLeft: WORD_GAP,
    },
    wordSlide: {
        justifyContent: 'center',
    },
    word: {
        fontSize: WORD_FONT_SIZE,
        fontWeight: '800',
        letterSpacing: 0.5,
        color: '#111111',
    },
});
