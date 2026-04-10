import React, { ReactNode, forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet} from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

type BottomSheetProps = {
    children: ReactNode;
    index?: number; // default snap index
    snapPoints?: string[]; // optional custom snap points
};

export const BottomSheetModalComponent = forwardRef<BottomSheetModal, BottomSheetProps>(
    ({ children, index = 3 }, ref, ) => {
        const internalRef = useRef<BottomSheetModal>(null);

        // Expose the internal ref methods to the parent using forwardRef
        useImperativeHandle(ref, () => internalRef.current!);

        // Default snap points if none provided
        const defaultSnapPoints = [
            '5%', '10%', '15%', '20%', '25%',
            '30%', '35%', '40%', '45%', '50%',
            '60%', '70%', '80%', '90%',
        ];

        return (
            <BottomSheetModal
                ref={internalRef}
                index={index}
                snapPoints={defaultSnapPoints}
                enablePanDownToClose={false}
                enableOverDrag={true}
                backdropComponent={undefined}
                containerStyle={{ backgroundColor: 'transparent' }}  // ← this
            >
                <BottomSheetView style={styles.contentContainer }>
                    {children}
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

BottomSheetModalComponent.displayName = 'BottomSheetModalComponent';

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
});