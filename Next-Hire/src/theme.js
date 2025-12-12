// src/theme.js
import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: { main: "#1976D2" },
    secondary: { main: "#FF4081" }
  },
  typography: {
    fontFamily: "'Montserrat','Poppins','Roboto',Arial,sans-serif"
  }
});

export default theme;
