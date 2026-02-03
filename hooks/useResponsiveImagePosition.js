import { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { useAppDimensions } from '../contexts/DimensionsContext';

// --- HOOK DE POSITIONNEMENT RESPONSIVE ---
// Permet de positionner des éléments de façon responsive sur une image
const useResponsiveImagePosition = (imageSource) => {
  const { width: screenW, height: screenH } = useAppDimensions();
  const [imageDimensions, setImageDimensions] = useState({ width: 1080, height: 1920 });

  useEffect(() => {
    // Le useEffect sert à charger les dimensions de l'image sur le web
    if (!Image.resolveAssetSource && typeof imageSource === 'number') {
      const imgUri = imageSource?.default || imageSource;
      if (typeof window !== 'undefined' && imgUri) {
        const img = new window.Image();
        img.onload = () => {
          setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          console.log(`[Web] Dimensions réelles de l'image: ${img.naturalWidth}x${img.naturalHeight}`);
        };
        img.src = imgUri;
      }
    }
  }, [imageSource]);

  let imageData = null;
  if (Image.resolveAssetSource) {
    imageData = Image.resolveAssetSource(imageSource);
  } else {
    imageData = imageDimensions;
  }

  const { width: originalW, height: originalH } = imageData;
  const screenRatio = screenW / screenH;
  const imageRatio = originalW / originalH;

  let scale, xOffset, yOffset;

  if (screenRatio > imageRatio) {
    scale = screenW / originalW;
    xOffset = 0;
    yOffset = (screenH - originalH * scale) / 2;
  } else {
    scale = screenH / originalH;
    yOffset = 0;
    xOffset = (screenW - originalW * scale) / 2;
  }

  const getPos = (originalX, originalY) => ({
    left: xOffset + originalX * scale,
    top: yOffset + originalY * scale,
    position: 'absolute',
  });

  return {
    getPos,
    scale,
    originalW,
    originalH,
  };
};

export default useResponsiveImagePosition;
