import * as React from "react";
import { Image, StyleSheet, Text } from "react-native";

export default function LogoTitle() {
  return (
    // <Image
    //   style={{ width: 152, height: 33 }}
    //   resizeMethod={'resize'}
    //   source={require("../../assets/icon.png")}
    // />
    <Text style={styles.titleText}>ANARCHIA</Text>
  );
}

const styles = StyleSheet.create({
  titleText: {
    // fontFamily: "Roboto",
    fontSize: 24,
    fontWeight: "bold",
    color: 'black',
    textAlign: "center",
    letterSpacing: 2
  },
});
