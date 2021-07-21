/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { ColorSchemeName } from "react-native";
import LogoTitle from "../components/common/LogoTitle";
import DiscoverScreen from "../screens/DiscoverScreen";
import ControlScreen from "../screens/ControlScreen";

import { ConnectionStackParamList, RootStackParamList } from "../types";
import LinkingConfiguration from "./LinkingConfiguration";

export default function Navigation() {
  return (
    <NavigationContainer linking={LinkingConfiguration} theme={DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Root"
        component={ConnectionNavigator}
        options={{
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />
    </Stack.Navigator>
  );
}
const ConnectionStack = createStackNavigator<ConnectionStackParamList>();

function ConnectionNavigator() {
  return (
    <ConnectionStack.Navigator>
      <ConnectionStack.Screen
        name="DiscoverScreen"
        component={DiscoverScreen}
        options={{
          headerTitle: (props) => <LogoTitle />,
          headerStyle: { elevation: 0, shadowOpacity: 0 },
        }}
      />
      <ConnectionStack.Screen
        name="ControlScreen"
        component={ControlScreen}
        options={{
          headerTitle: (props) => <LogoTitle />,
          headerStyle: { elevation: 0, shadowOpacity: 0 },
        }}
      />
    </ConnectionStack.Navigator>
  );
}
