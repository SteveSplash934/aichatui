import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./hook/useTheme";
import App from "./App";
import "./styles/global.css";
import { inject } from '@vercel/analytics';
import { Toaster } from "react-hot-toast";

inject();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <>
          <App />
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                padding: "12px 16px",
                borderRadius: "8px",
                fontSize: "14px",
              },
            }}
          />
        </>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
