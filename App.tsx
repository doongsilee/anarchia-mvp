import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
// import * as SplashScreen from 'expo-splash-screen';

import { StyleSheet, Text, View } from "react-native";

import { BleManager, Device } from "react-native-ble-plx";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigation from "./navigation";
import { BleManagerContext } from "./contexts";

export default function App() {
  const bleManager = new BleManager();

  return (
    <BleManagerContext.Provider value={bleManager}>
      <SafeAreaProvider>
        <Navigation />
        <StatusBar />
      </SafeAreaProvider>
    </BleManagerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
