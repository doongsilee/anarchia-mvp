export type RootStackParamList = {
  Root: undefined;
};

export type ConnectionStackParamList = {
  DiscoverScreen: undefined;
  ControlScreen: { deviceId: {left : string, right : string} };
};

export type Deivce = {
  id: string;
  name: string;
};
