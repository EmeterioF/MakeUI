import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import { useAiSuggestionStore } from '@/editor/aiSuggestionStore';
import { useComponentNodeStore } from '@/editor/componentNodeStore';
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
  const canvasConfig = useComponentNodeStore((s) => s.canvasConfig);

  const scrollRef = useRef<ScrollView>(null);
  const [expanded, setExpanded] = useState(false);

  // Collapse the notes whenever the page changes so descriptions
  // never cover the picture uninvited.
  useEffect(() => {
    setExpanded(false);
  }, [selectedIndex]);

  // A fresh set of suggestions always starts the pager back on Original.
  useEffect(() => {
    scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  }, [aiSuggestions]);

  if (!showAiPreview || !aiSuggestions) return null;

  const currentImprovements = selectedIndex > 0
    ? (aiSuggestions[selectedIndex - 1]?.improvements ?? [])
    : [];

  // Render each page inside the live canvas flex config and background,
  // so what you see here is what Apply produces. Width still differs
  // slightly (the modal is narrower than the canvas), so treat this as
  // a faithful approximation, not a pixel proof.
  const canvasPreviewStyle = {
    flexDirection: canvasConfig.style.flexDirection,
    justifyContent: canvasConfig.style.justifyContent,
    alignItems: canvasConfig.style.alignItems,
    flexWrap: canvasConfig.style.flexWrap,
    gap: canvasConfig.style.gap,
    padding: canvasConfig.style.padding,
    backgroundColor: canvasConfig.style.backgroundColor,
  };

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
            <Text style={styles.pageLabel} numberOfLines={1}>
              {currentLabel}
            </Text>
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
                <View style={[styles.preview, canvasPreviewStyle]}>
                  {aiOriginalTree?.map((node) => (
                    <ComponentRenderer key={node.id} node={node} interactive={false} />
                  ))}
                </View>
              </View>

              {aiSuggestions.map((suggestion, index) => (
                <View key={index} style={styles.carouselPage}>
                  <View style={[styles.preview, canvasPreviewStyle]}>
                    {suggestion.componentTree.map((node) => (
                      <ComponentRenderer key={node.id} node={node} interactive={false} />
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {currentImprovements.length > 0 && (
            <View style={styles.whyBox}>
              <Pressable
                onPress={() => setExpanded((v) => !v)}
                style={styles.whyToggle}
                accessibilityRole="button"
                accessibilityLabel={expanded ? 'Hide improvement notes' : 'Show improvement notes'}
              >
                <Text style={styles.whyToggleText}>
                  Why this works {expanded ? '▴' : '▾'}
                </Text>
              </Pressable>
              {expanded && (
                <View style={styles.whyList}>
                  {currentImprovements.map((item, i) => (
                    <Text key={i} style={styles.whyItem}>• {item}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

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
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  pageCounter: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  whyBox: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 140,
  },
  whyToggle: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  whyToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  whyList: {
    marginTop: 4,
    gap: 2,
  },
  whyItem: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
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
