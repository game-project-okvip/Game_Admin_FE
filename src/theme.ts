import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark", // dark mode base
    primary: {
      main: "#FFD700", // gold
      contrastText: "#000000", // black text on gold buttons
    },
    secondary: {
      main: "#4ade80", // a slightly darker gold
    },
    background: {
      default: "#000000", // black background
      paper: "#1c1c1c",  // dark gray for cards/paper
    },
    text: {
      primary: "#FFD700", // gold text
      secondary: "#FFFFFF", // white text
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h4: {
      fontWeight: 700,
      color: "#FFD700",
    },
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: "#FFD700",
          color: "#000",
          "&:hover": {
            backgroundColor: "#FFC700",
          },
        },
        outlinedSecondary: {
          borderColor: "#FFD700",
          color: "#FFD700",
          "&:hover": {
            borderColor: "#FFC700",
            backgroundColor: "#1c1c1c",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#1c1c1c",
          color: "#FFD700",
          fontWeight: "bold",
        },
        body: {
          color: "#FFFFFF",
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "#FFD700",
          "&.Mui-selected": {
            backgroundColor: "#FFD700",
            color: "#000000",
          },
        },
      },
    },
  },
});

export default theme;
