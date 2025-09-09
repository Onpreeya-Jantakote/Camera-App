import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [torch, setTorch] = useState(false);
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === "granted");
    };
    requestPermission();
  }, []);

  if (!cameraPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!hasMediaLibraryPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting media library permission...</Text>
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const newPhoto = await cameraRef.current.takePictureAsync({ quality: 1 });
        setImage(newPhoto.uri);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveToGallery = async () => {
    if (image) {
      try {
        await MediaLibrary.createAssetAsync(image);
        setImage(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (image) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: image }} style={styles.previewImage} />
        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setImage(null)}>
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FF6B6B" }]}
            onPress={handleSaveToGallery}
          >
            <Ionicons name="download-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={torch}
      />
      <View style={styles.topControls}>
        <TouchableOpacity onPress={() => setTorch(!torch)}>
          <Ionicons
            name={torch ? "flash" : "flash-off"}
            size={28}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setFacing(facing === "back" ? "front" : "back")
          }
        >
          <Ionicons name="camera-reverse" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.captureButton} onPress={handleTakePicture} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  topControls: {
    position: "absolute",
    top: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  bottomControls: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6B6B",
    borderWidth: 4,
    borderColor: "#fff",
  },
  previewImage: {
    flex: 1,
    width: "100%",
    resizeMode: "cover",
  },
  previewActions: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  actionButton: {
    backgroundColor: "#4ECDC4",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
