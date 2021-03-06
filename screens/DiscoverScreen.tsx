import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Image,
  Platform,
  Linking,
  TouchableOpacity,
  PermissionsAndroid,
} from "react-native";
import { Button, Text } from "react-native-elements";
import { ConnectionStackParamList } from "../types";

//@ts-ignore
// import { BluetoothStatus } from "react-native-bluetooth-status";
import { BleManager, Device, State } from "react-native-ble-plx";

import AndroidOpenSettings from "react-native-android-open-settings";
import { withBLEContext } from "../contexts";

// 임시 디바이스 네임
// const DEV_DEVICE_NAME_1 = "[TV] Serif";
// const DEV_DEVICE_NAME_2 = "UHD3";

const DEV_DEVICE_NAME_1 = "ANARCHIA_1";
const DEV_DEVICE_NAME_2 = "ANARCHIA_2";

type DiscoverScreenNavigationProp = StackNavigationProp<
  ConnectionStackParamList,
  "DiscoverScreen"
>;

type Props = {
  navigation: DiscoverScreenNavigationProp;
  bleManager: BleManager;
};

// const BleManagerModule = NativeModules.BleManager;
// const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const DiscoverScreen = ({ navigation, bleManager }: Props) => {
  const [step, setStep] = useState(0);
  // const [bleManager, setBleManger] = useState<BleManager>();

  const [devices, setDevices] = useState<Device[]>([]);

  // const [deviceName, setDeviceNames] = useState<String[]>([]);
  // const [deviceIds, setDeviceIds] = useState<String[]>([]);

  const [devDeviceLeft, setDevDeviceLeft] = useState<Device>();
  const [devDeviceRight, setDevDeviceRight] = useState<Device>();
  // const [scannedDevies, setScannedDevies] = useState<Set<Device>>(new Set());

  // const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    let timerId = -817213; //ID 로 리턴될 가능성이 없는 랜덤값
    if (step === 1) {
      timerId = setTimeout(() => {
        getBluetoothState();
      }, 1000);
    } else if (step === 3) {
      scanDevices();
      timerId = setTimeout(() => {
        bleManager?.stopDeviceScan();
        // handleStopScan();
        if (devDeviceLeft === undefined || devDeviceRight === undefined) {
          setStep(4);
        } else {
          setStep(5);
        }
      }, 30000);
    } else if (step === 6) {
      handleConnect();
    }

    if (timerId != 817213) {
      return () => clearTimeout(timerId);
    }
  }, [step]);

  const getBluetoothState = async () => {
    const state = await bleManager?.state();
    console.log(state);
    if (state === State.PoweredOn) {
      requestBluetoothPermission();
      //@ts-ignore
      // try {
      //   setStep(3);
      // } catch (error) {
      //   console.error(error);
      // }
    } else {
      setStep(2);
    }
  };

  const requestBluetoothPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: "아나키아 블루투스 퍼미션",
          message: "아나키아 앱서비스를 이용하기 위해 권한이 필요합니다.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the bluetooth");
        setStep(3);
      } else {
        console.log("permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleStopScan = async () => {
    // const devices = await bleManager?.devices([]);
    // console.log(devices);
    // setScannedDevies(devices);
  };

  const handleConnect = async () => {
    console.log(devDeviceLeft);
    // const deviceLeft = await bleManager?.connectToDevice(
    //   // @ts-ignore
    //   devDeviceLeft?.id
    // );

    // if (deviceLeft) {

    navigation.replace("ControlScreen", {
      deviceId: {
        left: devDeviceLeft ? devDeviceLeft.id : "",
        right: devDeviceRight ? devDeviceRight.id : "",
      },
    });
    // }
    // console.log(device);
  };

  const goToSettings = () =>
    Platform.OS === "ios"
      ? Linking.openURL("App-Prefs:Bluetooth")
      : AndroidOpenSettings.bluetoothSettings();

  const scanDevices = () => {
    // bleManagerEmitter.addListener("BleManagerStopScan", handleStopScan);

    //@ts-ignore
    bleManager.startDeviceScan(
      null,
      { allowDuplicates: false },
      async (error, device) => {
        if (error) {
          // Handle error (scanning will be stopped automatically)
          console.error(error);
          return;
        }

        if (!device) {
          //handle error
          console.error("No Device found");
          return;
        }
        console.log("scanning bluetooth deivces...");
        console.log(
          `id: ${device.id} , name: ${device.name}, localName: ${device.localName}, manufacturerData: ${device.manufacturerData}`
        );

        setDevices((prev) => [...prev, device]);
      }

      // if (device.name === DEV_DEVICE_NAME_1) {
      //   setDevDeviceLeft(device);
      // }

      // if (device.name === DEV_DEVICE_NAME_2) {
      //   setDevDeviceRight(device);
      // }

      // if (devDeviceLeft !== undefined && devDeviceRight !== undefined) {
      //   setStep(5);
      //   bleManager.stopDeviceScan();
      // }
    );
  };

  useEffect(() => {
    console.log("device 값이 변경되었습니다.");
    if (devices.length > 0) {
      const left = devices.find((device) => device.name === DEV_DEVICE_NAME_1);
      const right = devices.find((device) => device.name === DEV_DEVICE_NAME_2);

      if (left && right) {
        setDevDeviceLeft(left);
        setDevDeviceRight(right);

        console.log("다찾음!");
        bleManager.stopDeviceScan();
        setStep(5);
      }
    }
  }, [devices]);

  if (step === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.welcomeText}>ANARCHIA 에 오신것을 환영합니다.</Text>
        <Text style={styles.welcomeText}>
          지금 부터 설정 작업을 시작합니다.
        </Text>
        <Button
          title="시작하기"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.blackButton}
          titleStyle={{ fontSize: 22 }}
          onPress={() => setStep(1)}
        />
      </View>
    );
  } else if (step === 1) {
    return (
      <View style={styles.container}>
        <Text h2 style={{ marginBottom: 8 }}>
          {" "}
          STEP 1
        </Text>
        <Text style={styles.welcomeText}>블루투스 기능을 확인중입니다...</Text>
        <ActivityIndicator
          color="black"
          size="large"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  } else if (step === 2) {
    return (
      <View style={styles.container}>
        <Text h2 style={{ marginBottom: 8 }}>
          블루투스 확인 오류
        </Text>
        <Text style={styles.welcomeText}>블루투스 기능 확인이 필요합니다.</Text>
        <Button
          title="설정 바로가기"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.blackButton}
          onPress={() => goToSettings()}
        />
        <Button
          title="다시 확인"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.blackButton}
          onPress={() => setStep(1)}
        />
      </View>
    );
  } else if (step === 3) {
    return (
      <View style={styles.container}>
        <Text h2 style={{ marginBottom: 8 }}>
          STEP 2
        </Text>
        <Text style={styles.welcomeText}>
          사용 가능한 제품을 찾고 있습니다...
        </Text>
        {[...new Set(devices.map(device => device.id))].map((name, index) => (
          <Text key={index}>{`${name}`}</Text>
        ))}
        <ActivityIndicator
          color="black"
          size="large"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  } else if (step === 4) {
    return (
      <View style={styles.container}>
        <Text h2 style={{ marginBottom: 8 }}>
          제품을 찾지 못했어요
        </Text>
        <Text style={styles.welcomeText}>
          제품의 전원이 켜져 있는지 확인해주세요
        </Text>
        <Button
          title="다시 찾아보기"
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.blackButton}
          onPress={() => setStep(1)}
        />
      </View>
    );
  } else if (step === 5) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setStep(6)}>
          <Image source={require("../assets/sample_show_image.png")} />
          <Text h4 style={{ textAlign: "center" }}>
            밴딩 워커 A-3 R Class B
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else if (step === 6) {
    return (
      <View style={styles.container}>
        <Image source={require("../assets/sample_show_image.png")} />
        <Text h3 style={{ textAlign: "center" }}>
          연결중입니다.
        </Text>
        <ActivityIndicator color="black" size="large" />
      </View>
    );
  }
  return <View style={styles.container}></View>;
};

export default withBLEContext(DiscoverScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "400",
    marginBottom: 14,
    textAlign: 'center',
  },
  blackButton: {
    marginTop: 28,
    backgroundColor: "#000",
    paddingHorizontal: 48,
    paddingVertical: 12,
  },
  buttonContainer: {},
});
