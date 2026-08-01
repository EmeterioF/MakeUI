import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import { useAiSuggestionStore } from '@/editor/aiSuggestionStore';
import ComponentRenderer from '@/renderer/componentRenderer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH * 0.9;

export function AiPreviewOverlay() {
  const {
    aiSuggestions,
    aiOriginalTree,
    selectedIndex,
    showAiPreview,
    selectSuggestion,
    applySuggestions,
    discardSuggestions,
    fetchSuggestions,
  } = useAiSuggestionStore();

  const scrollRef = useRef<ScrollView>(null);
  const [showInfo, setShowInfo] = useState(false);

  if (!showAiPreview || !aiSuggestions) return null;

  const currentImprovements = selectedIndex > 0
    ? (aiSuggestions[selectedIndex - 1]?.improvements ?? [])
    : [];

  const totalPages = 1 + aiSuggestions.length;
  const currentLabel = selectedIndex === 0
    ? 'Original'
    : aiSuggestions[selectedIndex - 1]?.label || `Suggestion ${selectedIndex}`;

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffset / CAROUSEL_WIDTH);
    if (page !== selectedIndex) {
      selectSuggestion(page);
    }
  };

  const scrollToPage = (page: number) => {
    scrollRef.current?.scrollTo({ x: page * CAROUSEL_WIDTH, animated: true });
    selectSuggestion(page);
  };

  const handleRegenerate = async () => {
    await fetchSuggestions();
  };

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Layout Suggestions</Text>
            <View style={styles.headerActions}>
              <Pressable
                style={styles.headerBtn}
                onPress={handleRegenerate}
                accessibilityLabel="Regenerate suggestions"
              >
                <Text style={styles.headerBtnText}>↻</Text>
              </Pressable>
              <Pressable
                style={styles.headerBtn}
                onPress={discardSuggestions}
                accessibilityLabel="Close"
              >
                <Text style={styles.headerBtnText}>✕</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.labelRow}>
            <View style={styles.labelLeft}>
              <Text style={styles.pageLabel}>{currentLabel}</Text>
              {currentImprovements.length > 0 && (
                <Pressable onPress={() => setShowInfo((v) => !v)} style={styles.infoBtn} hitSlop={8}>
                  <Text style={styles.infoBtnText}>?</Text>
                </Pressable>
              )}
            </View>
            <Text style={styles.pageCounter}>
              {selectedIndex + 1} / {totalPages}
            </Text>
          </View>

          {showInfo && currentImprovements.length > 0 && (
            <>
              <Pressable style={styles.tooltipBackdrop} onPress={() => setShowInfo(false)} />
              <View style={styles.infoTooltip}>
                <Text style={styles.infoTooltipTitle}>Improvements:</Text>
                {currentImprovements.slice(0, 3).map((item, i) => (
                  <Text key={i} style={styles.infoTooltipItem}>• {item}</Text>
                ))}
              </View>
            </>
          )}

          <View style={styles.carouselContainer}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              contentOffset={{ x: 0, y: 0 }}
            >
              <View style={styles.carouselPage}>
                <View style={styles.preview}>
                  {aiOriginalTree?.map((node) => (
                    <ComponentRenderer key={node.id} node={node} />
                  ))}
                </View>
              </View>

              {aiSuggestions.map((suggestion, index) => (
                <View key={index} style={styles.carouselPage}>
                  <View style={styles.preview}>
                    {suggestion.componentTree.map((node) => (
                      <ComponentRenderer key={node.id} node={node} />
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.dotsRow}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <Pressable
                key={index}
                onPress={() => scrollToPage(index)}
                accessibilityLabel={`Go to ${index === 0 ? 'original' : `suggestion ${index}`}`}
              >
                <View
                  style={[
                    styles.dot,
                    index === selectedIndex && styles.dotActive,
                  ]}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.discardBtn} onPress={discardSuggestions}>
              <Text style={styles.discardText}>Discard</Text>
            </Pressable>
            {selectedIndex > 0 && (
              <Pressable style={styles.applyBtn} onPress={applySuggestions}>
                <Text style={styles.applyText}>Apply</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 18,
    color: '#333',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  pageLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  pageCounter: {
    fontSize: 13,
    color: '#999',
  },
  carouselContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  carouselPage: {
    width: CAROUSEL_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    width: '100%',
    marginHorizontal: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  dotActive: {
    backgroundColor: '#007AFF',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  infoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    marginTop: -1,
  },
  tooltipBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  infoTooltip: {
    position: 'absolute',
    top: 82,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoTooltipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoTooltipItem: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  discardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});
