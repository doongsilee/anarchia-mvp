import React from "react";

// Make sure the shape of the default value passed to
// createContext matches the shape that the consumers expect!
export const BleManagerContext = React.createContext<any>(null);

export const withBLEContext = (Component: any) => (props: any) =>
  (
    <BleManagerContext.Consumer>
      {(value) => <Component {...props} bleManager={value} />}
    </BleManagerContext.Consumer>
  );
