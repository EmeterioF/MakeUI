import { useEffect, useRef } from 'react';
import { AccessibilityInfo, AppState, Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const FLIP_DEGREES = 720;
const FLIP_DURATION_MS = 1600;
const FADE_DURATION_MS = 200;
const REDUCED_MOTION_FADE_MS = 300;

type Props = {
    onDone: () => void;
};

export default function AnimatedSplash({ onDone }: Props) {
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(1);
    const doneRef = useRef(false);
    const onDoneRef = useRef(onDone);
    onDoneRef.current = onDone;

    function finish() {
        if (doneRef.current) return;
        doneRef.current = true;
        onDoneRef.current();
    }

    const flipStyle = useAnimatedStyle(() => ({
        transform: [{ perspective: 800 }, { rotateY: `${rotation.value}deg` }],
    }));

    const fadeStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    useEffect(() => {
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
                fadeOutAndFinish(REDUCED_MOTION_FADE_MS);
            } else {
                startFlip();
            }
        });

        const subscription = AppState.addEventListener('change', (state) => {
            if ((state === 'background' || state === 'inactive') && !doneRef.current) {
                finish();
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
                <Animated.View style={flipStyle}>
                    <Image
                        source={require('@/assets/logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
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
    logo: {
        width: 180,
        height: 180,
    },
});
