import React, { ReactNode, forwardRef, useImperativeHandle, useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { DEFAULT_SNAP_POINTS } from '@/components/bottomModal/config';

type BottomSheetProps = {
    children: ReactNode;
    index?: number;
    snapPoints?: string[];
    onDismiss?: () => void;
};

export const BottomSheetModalComponent = forwardRef<BottomSheetModal, BottomSheetProps>(
    ({ children, index = 3, snapPoints, onDismiss }, ref) => {
        const internalRef = useRef<BottomSheetModal>(null);
        useImperativeHandle(ref, () => internalRef.current!);

        return (
            <BottomSheetModal
                ref={internalRef}
                index={index}
                snapPoints={snapPoints ?? DEFAULT_SNAP_POINTS}
                enablePanDownToClose={false}
                enableOverDrag
                backdropComponent={undefined}
                containerStyle={{ backgroundColor: 'transparent' }}
                onDismiss={onDismiss}
            >
                {children}
            </BottomSheetModal>
        );
    }
);

BottomSheetModalComponent.displayName = 'BottomSheetModalComponent';
