import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { getNodeStyle } from '@/renderer/nodeStyles';
import { useComponentNodeStore,ComponentNode } from '@/editor/componentNodeStore';

function ComponentRenderer({ node } : {node: ComponentNode}) {

    const selectedID = useComponentNodeStore(s => s.selectedID);
    const onSelect = useComponentNodeStore(s => s.selectNode);

    const isSelected = selectedID === node.id;
    const handlePress = () => onSelect(node.id);
    const s = getNodeStyle(node, isSelected);

    switch (node.type) {

        case 'View':
            return (
                <View
                    onStartShouldSetResponder={() => true}//allows to have a press function
                    onResponderGrant={handlePress} // onPress function
                    style={s.view}
                >
                    {node.children?.map((child) => (
                        <ComponentRenderer
                            key={child.id}
                            node={child}          // only the node is passed now
                        />
                    ))}
                </View>
            )

        case 'Text':
            return (
                <Text onPress={handlePress} style={s.text}>
                    {node.content}
                </Text>
            )

        case 'Button':
            return (
                <TouchableOpacity onPress={handlePress} style={s.button}>
                    <Text style={s.buttonLabel}>{node.content}</Text>
                </TouchableOpacity>
            )

        case 'Image':
            return (
                <View
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={handlePress}
                    style={s.image}
                >
                    {node.content
                        ? <Image source={{ uri: node.content }} style={s.imageFill} />
                        : <View style={s.imagePlaceholder}>
                            <Text style={s.imagePlaceholderIcon}>🖼️</Text>
                        </View>
                    }
                </View>
            )

    }

}

export default ComponentRenderer;