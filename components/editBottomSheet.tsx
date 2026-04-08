import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function EditBottomSheet() {
    const bottomSheetRef = useRef<BottomSheet>(null);

    // Snap points (many to feel like free dragging)
    const snapPoints = [
        '5%', '10%', '15%', '20%', '25%',
        '30%', '35%', '40%', '45%', '50%',
        '60%', '70%', '80%', '90%'
    ];

    const [index, setIndex] = useState(3);

    // Track real-time position of the bottom sheet
    const animatedPosition = useSharedValue(0);

    // Callback when snap point changes
    const handleSheetChanges = useCallback((newIndex: number) => {
        setIndex(newIndex);
    }, []);

    // Animated style for handle
    const Handle = () => {
        const animatedStyle = useAnimatedStyle(() => {
            // Fade handle based on position
            const opacity = animatedPosition.value < 300
                ? 1
                : 0.2
            return { opacity };
        });

        return <Animated.View style={[styles.handle, animatedStyle]} />;
    };

    return (
        <>
            <BottomSheet
                ref={bottomSheetRef}
                index={index}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                enablePanDownToClose={false}   // don’t allow closing
                enableOverDrag={true}          // smooth dragging past snap points
                animatedPosition={animatedPosition}
                handleComponent={Handle}        // use custom animated handle
            >
                <BottomSheetView style={styles.contentContainer}>
                    <Text style={styles.text}>Awesome 🎉</Text>
                </BottomSheetView>
            </BottomSheet>
        </>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    handle: {
        height: 6,
        width: 40,
        backgroundColor: '#ccc',
        borderRadius: 3,
        alignSelf: 'center',
        marginVertical: 10,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});