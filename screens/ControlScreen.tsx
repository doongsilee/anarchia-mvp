import { RouteProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Image } from "react-native";
import { Button, Icon, Text } from "react-native-elements";
import { BleManager, Characteristic, Device } from "react-native-ble-plx";
import { ConnectionStackParamList } from "../types";

import { buttonStyle } from "../styles";
import { withBLEContext } from "../contexts";
import { Base64 } from "../utils";
import MaskedView from "@react-native-community/masked-view";
import { PanGestureHandler } from "react-native-gesture-handler";

import TouchedMaskView from "../components/controlScreen/TouchedMaskView";

const leftFootImage = require("../assets/left.png");
const rightFootImage = require("../assets/right.png");

const Buffer = require("buffer/").Buffer;

const ReadWriteCharacteristicId = 9;
const NotifyCharacteristicId = 10;

const RRWCharacteristicId = 20;
const RNotifyCharacteristicId = 21;

type ControlScreennRouteProp = RouteProp<
  ConnectionStackParamList,
  "ControlScreen"
>;

type Props = {
  route: ControlScreennRouteProp;
  bleManager: BleManager;
};

const ControlScreen = ({ route, bleManager }: Props) => {
  const { deviceId } = route.params;

  const [leftDevice, setLeftDevice] = useState<Device>();
  const [rightDevice, setRightDevice] = useState<Device>();

  const [leftRwCharacteristic, setLeftRwCharacteristic] =
    useState<Characteristic>();
  const [leftNotiCharacteristic, setLeftNotiCharacteristic] =
    useState<Characteristic>();

  const [rightRwCharacteristic, setRightRwCharacteristic] =
    useState<Characteristic>();
  const [rightNotiCharacteristic, setRightNotiCharacteristic] =
    useState<Characteristic>();

  const [leftTempConfig, setLeftTemp] = useState(0);
  const [rightTempConfig, setRightTemp] = useState(0);

  // 0 is off 1 is on
  const [leftPower, setLeftPower] = useState(0);
  const [rightPower, setRightPower] = useState(0);

  const [leftBattery, setLeftBattery] = useState(0);
  const [rightBattery, setRightBattery] = useState(0);

  const [leftCurTemp, setLeftCurTemp] = useState(0);
  const [rightCurTemp, setRightCurTemp] = useState(0);

  useEffect(() => {
    connectToDevices();
    return () => disconnectAll();
  }, [deviceId]);

  const connectToDevices = async () => {
    const { left, right } = deviceId;

    try {
      if (!(await checkDeviceConnection(leftDevice))) {
        const leftDevice = await bleManager?.connectToDevice(left);
        setLeftDevice(leftDevice);
      }

      if (!(await checkDeviceConnection(rightDevice))) {
        const rightDevice = await bleManager?.connectToDevice(right);
        setRightDevice(rightDevice);
      }
    } catch (error) {
      console.log("디바이스 연결에 문제가 발생했습니다.");
      console.warn(error);
    }
  };

  const disconnectAll = () => {
    if (leftDevice) {
      leftDevice.isConnected().then(() => {
        bleManager.cancelDeviceConnection(leftDevice.id);
        // setLeftDevice(undefined);
        // setLeftRwCharacteristic(undefined);
        // setLeftNotiCharacteristic(undefined);
      });
    }
    if (rightDevice) {
      rightDevice.isConnected().then(() => {
        bleManager.cancelDeviceConnection(rightDevice.id);
        // setRightDevice(undefined);
        // setRightRwCharacteristic(undefined);
        // setRightNotiCharacteristic(undefined);
      });
    }
  };

  useEffect(() => {
    if (leftDevice === undefined) {
      return;
    }
    const unsubsriber = bleManager?.onDeviceDisconnected(
      leftDevice.id,
      (error, device) => {
        bleManager
          ?.connectToDevice(leftDevice.id)
          .then((device) => setLeftDevice(device));
      }
    );
    checkServiceId("left", leftDevice);
    return () => unsubsriber.remove();
  }, [leftDevice]);

  useEffect(() => {
    if (rightDevice === undefined) {
      return;
    }
    const unsubsriber = bleManager?.onDeviceDisconnected(
      rightDevice.id,
      (error, device) => {
        bleManager
          ?.connectToDevice(rightDevice.id)
          .then((device) => setRightDevice(device));
      }
    );
    checkServiceId("right", rightDevice);
    return () => unsubsriber.remove();
  }, [rightDevice]);

  const checkServiceId = async (type: string, device: Device | undefined) => {
    try {
      // @ts-ignore
      const _device = await device.discoverAllServicesAndCharacteristics();
      const services = await _device.services();
      //   console.log(services);

      services.map(async (service) => {
        console.log(`${type} service:${service.uuid}`);
        const characteristics = await service.characteristics();

        characteristics.map(async (characteristic) => {
          console.log(
            `${type} characteristic:${characteristic.uuid} ${characteristic.id}`
          );

          if (type === "left") {
            if (characteristic.id === ReadWriteCharacteristicId) {
              setLeftRwCharacteristic(characteristic);
            }

            if (characteristic.id === NotifyCharacteristicId) {
              setLeftNotiCharacteristic(characteristic);
            }
          } else {
            if (characteristic.id === RRWCharacteristicId) {
              setRightRwCharacteristic(characteristic);
            }

            if (characteristic.id === RNotifyCharacteristicId) {
              setRightNotiCharacteristic(characteristic);
            }
          }
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (leftNotiCharacteristic !== undefined) {
      const subscription = handleLeftNotify();

      return () => {
        subscription?.remove();
      };
    }
  }, [leftNotiCharacteristic]);

  useEffect(() => {
    if (rightNotiCharacteristic !== undefined) {
      const subscription = handleRightNotify();

      return () => {
        subscription?.remove();
      };
    }
  }, [rightNotiCharacteristic]);

  const handleLeftPressPower = () => {
    //전원 꺼져있음
    if (leftPower === 1) {
      const data = Buffer.from("0000", "hex").toString("base64");
      leftRwCharacteristic?.writeWithoutResponse(data);
    } else {
      const data = Buffer.from("0001", "hex").toString("base64");
      leftRwCharacteristic?.writeWithoutResponse(data);

      const decimal = 11;
      const level = Buffer.from(`01${decimal.toString(16)}`, "hex").toString(
        "base64"
      );
      leftRwCharacteristic?.writeWithoutResponse(level);
    }

    setLeftPower(leftPower === 0 ? 1 : 0);
  };

  const handleRightPressPower = () => {
    //전원 꺼져있음
    if (rightPower === 1) {
      const data = Buffer.from("0000", "hex").toString("base64");
      rightRwCharacteristic?.writeWithoutResponse(data);
    } else {
      const data = Buffer.from("0001", "hex").toString("base64");
      rightRwCharacteristic?.writeWithoutResponse(data);

      const decimal = 11;
      const level = Buffer.from(`01${decimal.toString(16)}`, "hex").toString(
        "base64"
      );
      rightRwCharacteristic?.writeWithoutResponse(level);
    }

    setRightPower(rightPower === 0 ? 1 : 0);
  };

  const handleLeftNotify = () => {
    const subscription = leftNotiCharacteristic?.monitor(
      (error, characteristic) => {
        if (error) {
          console.log(error.errorCode);
          return;
        }
        if (characteristic) {
          const buffer = Buffer.from(characteristic.value, "base64");
          const bufString: String = buffer?.toString("hex");

          console.log(bufString);

          const battery = parseInt(bufString.substr(0, 2), 16);
          const currentTemperature = parseInt(bufString.substr(2, 2), 16);
          const settingTemperature = bufString.substr(4, 2);
          const output = bufString.substr(6, 2);
          const powerStatus = parseInt(bufString.substr(8, 2), 16);

          console.log(
            `Left battery: ${battery} currentTemperature : ${currentTemperature} targetTemperature : ${settingTemperature} output: ${output} powerStatus: ${powerStatus}`
          );

          if (powerStatus !== leftPower) {
            setLeftPower(powerStatus);
          }

          if (leftBattery !== battery) {
            setLeftBattery(battery);
          }

          if (leftCurTemp !== currentTemperature) {
            setLeftCurTemp(currentTemperature);
          }

          // bufString.substr()
        }
      }
    );

    return subscription;
  };

  const handleRightNotify = () => {
    const subscription = rightNotiCharacteristic?.monitor(
      (error, characteristic) => {
        if (error) {
          console.log(error.errorCode);
          return;
        }
        if (characteristic) {
          const buffer = Buffer.from(characteristic.value, "base64");
          const bufString: String = buffer?.toString("hex");

          console.log(bufString);

          const battery = parseInt(bufString.substr(0, 2), 16);
          const currentTemperature = parseInt(bufString.substr(2, 2), 16);
          const settingTemperature = bufString.substr(4, 2);
          const output = bufString.substr(6, 2);
          const powerStatus = parseInt(bufString.substr(8, 2), 16);

          console.log(
            `Right battery: ${bufString.substr(
              0,
              2
            )} currentTemperature : ${currentTemperature} targetTemperature : ${settingTemperature} output: ${output} powerStatus: ${powerStatus}`
          );

          if (powerStatus !== rightPower) {
            setRightPower(powerStatus);
          }

          if (rightBattery !== battery) {
            setRightBattery(battery);
          }

          if (rightCurTemp !== currentTemperature) {
            setRightCurTemp(currentTemperature);
          }

          // bufString.substr()
        }
      }
    );

    return subscription;
  };

  const handleLeftTempControl = (e: any) => {
    const { y } = e.nativeEvent;

    let temp;
    if (y > 240) {
      temp = 0;
    } else if (y > 210 && y <= 240) {
      temp = 1;
    } else if (y > 180 && y <= 210) {
      temp = 2;
    } else if (y > 150 && y <= 180) {
      temp = 3;
    } else if (y > 120 && y <= 150) {
      temp = 4;
    } else if (y > 90 && y <= 120) {
      temp = 5;
    } else if (y > 60 && y <= 90) {
      temp = 6;
    } else if (y > 30 && y <= 60) {
      temp = 7;
    } else {
      temp = 8;
    }
    setLeftTemp(temp);
    console.log(temp);

    const decimal = 11 * temp;

    const data = Buffer.from(`01${decimal.toString(16)}`, "hex").toString(
      "base64"
    );
    console.log(`01${decimal.toString(16)}`);
    console.log(data);
    leftRwCharacteristic?.writeWithoutResponse(data);
  };

  const handleRightTempControl = (e: any) => {
    const { y } = e.nativeEvent;

    let temp;
    if (y > 240) {
      temp = 0;
    } else if (y > 210 && y <= 240) {
      temp = 1;
    } else if (y > 180 && y <= 210) {
      temp = 2;
    } else if (y > 150 && y <= 180) {
      temp = 3;
    } else if (y > 120 && y <= 150) {
      temp = 4;
    } else if (y > 90 && y <= 120) {
      temp = 5;
    } else if (y > 60 && y <= 90) {
      temp = 6;
    } else if (y > 30 && y <= 60) {
      temp = 7;
    } else {
      temp = 8;
    }
    setRightTemp(temp);
    console.log(temp);

    const data = Buffer.from(`01${11 * temp}`, "hex").toString("base64");

    console.log(`01${11 * (temp + 1)}`);
    console.log(data);
    rightRwCharacteristic?.writeWithoutResponse(data);
  };

  const getBatteryStatus = (batteryLeft: number, isCharging: boolean) => {
    let base = "battery";

    if (isCharging) {
      return `${base}-charging`;
    } else {
      if (batteryLeft === 100) {
        return base;
      } else if (batteryLeft === 0) {
        return `${base}-outline`;
      } else {
        const level = Math.floor(batteryLeft / 20) * 20;
        return `${base}-${level}`;
      }
    }
  };

  const checkDeviceConnection = async (device: Device | undefined) => {
    if (device === undefined) {
      return false;
    } else {
      const isConnected = await device.isConnected();
      return isConnected;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.upperBar}>
        <Image
          source={require("../assets/sample_show_image.png")}
          style={styles.productImage}
        />
        <Text h3 style={{ textAlign: "center", marginRight: 16 }}>
          A-3 R Class B
        </Text>
        <Icon name="setting" type="antdesign" />
      </View>

      <View style={styles.body}>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
          }}
        >
          <View
            style={{
              alignItems: "center",
              height: 80,
            }}
          >
            {leftDevice === undefined ? (
              <>
                <Button
                  title="다시 연결하기"
                  buttonStyle={[buttonStyle.blackButton, { height: 30 }]}
                  containerStyle={{ marginBottom: 12 }}
                  onPress={() => connectToDevices()}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Icon type="material" name={"bluetooth-disabled"} size={24} />
                  <Text
                    style={{ textAlign: "center", fontSize: 24, marginLeft: 4 }}
                  >
                    Left
                  </Text>
                </View>
              </>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Button
                  type="clear"
                  icon={
                    <Icon
                      type="material-community"
                      name={"power"}
                      size={32}
                      color={
                        leftPower === 0 || leftPower === 2 ? "grey" : "black"
                      }
                    />
                  }
                  title={leftPower === 0 || leftPower === 2 ? "Off" : "On"}
                  titleStyle={{
                    textAlign: "center",
                    fontSize: 24,
                    marginLeft: 4,
                    color:
                      leftPower === 0 || leftPower === 2 ? "grey" : "black",
                  }}
                  onPress={handleLeftPressPower}
                />
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                width: "100%",
                marginTop: 4,
                marginBottom: 8,
              }}
            >
              <View>
                <Text
                  style={{ textAlign: "center", fontSize: 18, color: "grey" }}
                >
                  설정 레벨
                </Text>
                <Text style={{ textAlign: "center", fontSize: 32 }}>
                  {!leftDevice || leftPower === 0 ? "-" : leftTempConfig + 1}
                </Text>
              </View>
              <View>
                <Text
                  style={{ textAlign: "center", fontSize: 18, color: "grey" }}
                >
                  현재 온도
                </Text>
                <Text style={{ textAlign: "center", fontSize: 32 }}>
                  {!leftDevice ? "-" : leftCurTemp}
                </Text>
              </View>
            </View>
            <TouchedMaskView
              handleTempControl={handleLeftTempControl}
              device={leftDevice}
              powerState={leftPower}
              targetTemp={leftTempConfig}
              maskedImage={leftFootImage}
            />
            <View
              style={{
                width: "100%",
                justifyContent: "flex-end",
                flexDirection: "row",
                top: -30,
              }}
              pointerEvents="none"
            >
              {/* {leftBattery !== 0 && ( */}
              <View style={{ justifyContent: "center" }}>
                <Icon
                  type="material-community"
                  name={getBatteryStatus(
                    leftBattery,
                    leftPower === 2 || leftPower === 3 ? true : false
                  )}
                  size={32}
                  color={"black"}
                />
                {leftPower !== 2 && leftPower !== 3 && (
                  <Text>{`${leftBattery}%`}</Text>
                )}
              </View>

              {/* TODO:: 배터리 100이면 숫자 없애기 , 충전중 표시로 변경 */}
            </View>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View
            style={{
              alignItems: "center",
              height: 80,
            }}
          >
            {rightDevice === undefined ? (
              <>
                <Button
                  title="다시 연결하기"
                  buttonStyle={[buttonStyle.blackButton, { height: 30 }]}
                  containerStyle={{ marginBottom: 12 }}
                  onPress={() => connectToDevices()}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Icon type="material" name={"bluetooth-disabled"} size={24} />
                  <Text
                    style={{ textAlign: "center", fontSize: 24, marginLeft: 4 }}
                  >
                    Right
                  </Text>
                </View>
              </>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Button
                  type="clear"
                  icon={
                    <Icon
                      type="material-community"
                      name={"power"}
                      size={32}
                      color={
                        rightPower === 0 || rightPower === 2 ? "grey" : "black"
                      }
                    />
                  }
                  title={rightPower === 0 || rightPower === 2 ? "Off" : "On"}
                  titleStyle={{
                    textAlign: "center",
                    fontSize: 24,
                    marginLeft: 4,
                    color:
                      rightPower === 0 || rightPower === 2 ? "grey" : "black",
                  }}
                  onPress={handleRightPressPower}
                />
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                width: "100%",
                marginTop: 4,
                marginBottom: 8,
              }}
            >
              <View>
                <Text
                  style={{ textAlign: "center", fontSize: 18, color: "grey" }}
                >
                  설정 레벨
                </Text>
                <Text style={{ textAlign: "center", fontSize: 32 }}>
                  {!rightDevice || rightPower === 0 ? "-" : rightTempConfig + 1}
                </Text>
              </View>
              <View>
                <Text
                  style={{ textAlign: "center", fontSize: 18, color: "grey" }}
                >
                  현재 온도
                </Text>
                <Text style={{ textAlign: "center", fontSize: 32 }}>
                  {!rightDevice ? "-" : rightCurTemp}
                </Text>
              </View>
            </View>
            <TouchedMaskView
              handleTempControl={handleRightTempControl}
              device={rightDevice}
              powerState={rightPower}
              targetTemp={rightTempConfig}
              maskedImage={rightFootImage}
            />
            <View
              style={{
                width: "100%",
                justifyContent: "flex-end",
                flexDirection: "row",
                top: -30,
              }}
              pointerEvents="none"
            >
              {/* {rightBattery !== 0 && ( */}
              <View style={{ justifyContent: "center" }}>
                <Icon
                  type="material-community"
                  name={getBatteryStatus(
                    rightBattery,
                    rightPower === 2 || rightPower === 3 ? true : false
                  )}
                  size={32}
                  color={"black"}
                />
                {rightPower !== 2 && rightPower !== 3 && (
                  <Text>{`${rightBattery}%`}</Text>
                )}
              </View>
              {/* )} */}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default withBLEContext(ControlScreen);

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  upperBar: {
    backgroundColor: "white",
    flexDirection: "row",
    paddingVertical: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: 56,
    height: 34,
    marginRight: 16,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 24,
  },
  connectionStatusSection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignSelf: "stretch",
  },
  leftSection: {
    flex: 1,
    flexDirection: "column",
  },
  rightSection: {
    flex: 1,
    flexDirection: "column",
  },
  temperaturePanel: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    marginVertical: 50,
  },
});
