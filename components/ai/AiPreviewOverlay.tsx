import React, { useRef } from 'react';
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

  if (!showAiPreview || !aiSuggestions) return null;

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
            <Text style={styles.pageLabel}>{currentLabel}</Text>
            <Text style={styles.pageCounter}>
              {selectedIndex + 1} / {totalPages}
            </Text>
          </View>

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

          {selectedIndex > 0 && aiSuggestions[selectedIndex - 1]?.improvements?.length > 0 && (
            <View style={styles.improvementsContainer}>
              <Text style={styles.improvementsTitle}>Improvements:</Text>
              {aiSuggestions[selectedIndex - 1].improvements.slice(0, 3).map((item, i) => (
                <Text key={i} style={styles.improvementItem}>• {item}</Text>
              ))}
            </View>
          )}

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
  improvementsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  improvementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  improvementItem: {
    fontSize: 11,
    color: '#888',
    lineHeight: 16,
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
