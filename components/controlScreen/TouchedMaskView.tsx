import React from "react";
import MaskedView from "@react-native-community/masked-view";
import { PanGestureHandler } from "react-native-gesture-handler";
import { View, Image } from "react-native";

type Props = {
  handleTempControl: any;
  device: any;
  powerState: number;
  targetTemp: number;
  maskedImage: any;
};

const TouchedMaskView = ({
  handleTempControl,
  device,
  powerState,
  targetTemp,
  maskedImage
}: Props) => (
  <PanGestureHandler onGestureEvent={handleTempControl}>
    <MaskedView
      style={{ height: 270, flexDirection: "column", width: "100%" }}
      maskElement={
        <View
          style={{
            // Transparent background because mask is based off alpha channel.
            backgroundColor: "transparent",
            alignItems: "center",
          }}
        >
          <Image
            source={maskedImage}
            style={{ height: 270, width: 130 }}
          />
        </View>
      }
    >
      <View
        style={{
          flex: 1,
          width: "100%",
          backgroundColor:
            !device || powerState === 0 || powerState === 2
              ? "#eaeaea"
              : targetTemp > 7
              ? "#FC4308"
              : "grey",
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor:
            !device || powerState === 0 || powerState === 2
              ? "#eaeaea"
              : targetTemp > 6
              ? "#FC6C08"
              : "grey",
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor:
            !device || powerState === 0 || powerState === 2
              ? "#eaeaea"
              : targetTemp > 5
              ? "#FD9309"
              : "grey",
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor:
            !device || powerState === 0 || powerState === 2
              ? "#eaeaea"
              : targetTemp > 4
              ? "#FDA909"
              : "grey",
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor:
            !device || powerState === 0 || powerState === 2
              ? "#eaeaea"
              : targetTemp > 3
              ? "#FEBF09"
              : "grey",
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor:
            !device || powerState === 0 || powerState === 2
              ? "#eaeaea"
              : targetTemp > 2
              ? "#FED70A"
              : "grey",
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor:
            !device || powerState === 0 || powerState === 2
              ? "#eaeaea"
              : targetTemp > 1
              ? "#FFF30A"
              : "grey",
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor:
            !device || powerState === 0 || powerState === 2
              ? "#eaeaea"
              : targetTemp > 0
              ? "#FFFF66"
              : "grey",
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor:
            !device || powerState === 0 || powerState === 2
              ? "#eaeaea"
              : targetTemp > -1
              ? "#FFFFC0"
              : "grey",
        }}
      />
    </MaskedView>
  </PanGestureHandler>
);

export default TouchedMaskView;