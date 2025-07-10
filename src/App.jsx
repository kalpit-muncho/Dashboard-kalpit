import React from "react";
import MinimumScreenSize from "./components/MinimumScreenSize";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <MinimumScreenSize minWidth={900} minHeight={500}>
      <AppRoutes />
    </MinimumScreenSize>
  );
}


export default App;
