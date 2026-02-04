import { View, Text, StyleSheet, Pressable, Image } from 'react-native';

export default function ChapterButton({ chapterNumber, chapterName, progressNb, onPress, style }) {
  const imageSource =
    chapterNumber <= progressNb ? require('../assets/feudebois.png') : require('../assets/feusansfeu.png');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, style, pressed && styles.pressed]}>
      <Image source={imageSource} style={styles.image} />
      <View style={styles.labelContainer}>
        <Text style={styles.label} numberOfLines={1}>
          {chapterName}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    width: 70,
    height: 70,
    marginBottom: 0,
  },
  labelContainer: {
    flexDirection: 'row',
  },
  label: {
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});
