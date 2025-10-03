export const Styles: { [styleAlias: string]: Partial<CSSStyleDeclaration> | any} = {
  Error: {
    color: "red",
  },
  Alert: {
    error: {
      color: "red",
      fontWeight: "bold"
    },
    warning: {
      color: "#f80",
      fontWeight: "bold"
    },
    info: {
      color: "black"
    }
  },
  Darken: {
    position: "fixed",
    top: 0,
    left: 0,
    opacity: 0.5,
    backgroundColor: "#000",
    width: "100vw",
    height: "100vh",
    zIndex: 150,
    webkitBackdropFilter: "blur(2px)",
    backdropFilter: "blur(2px)",
  },
  DialogOuter: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: 150,
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    padding: "16px",
    boxSizing: "border-box"
  },
  DialogInner: {
    position: "relative",
    color: "#222",
    backgroundColor: "#fff",
    padding: "24px",
    marginBottom: "2em",
    maxWidth: "400px",
    width: "100%",
    maxHeight: "90%",
    overflowY: "auto",
    border: "3px solid #3d3d5d",
    borderRadius: "8px",
    boxShadow: "0 0 80px 10px #666",
    fontFamily: "sans-serif",
    boxSizing: "border-box"
  },
  Input: {
    height: "35px",
    width: "100%",
    maxWidth: "100%",
    borderColor: "#ccf4",
    outline: "none",
    fontSize: "16px",
    padding: "8px",
    boxSizing: "border-box"
  },
  Button: {
    padding: "10px 20px",
    margin: "0 4px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    transition: "all 0.2s ease"
  },
  PrimaryButton: {
    padding: "10px 20px",
    margin: "0 4px",
    border: "1px solid #3b82f6",
    borderRadius: "6px",
    backgroundColor: "#3b82f6",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease"
  },
  ButtonsDiv: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "20px"
  },
  Label: {
    display: "block",
    marginBottom: "12px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333"
  },
  WindowHeader: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px"
  }
};
