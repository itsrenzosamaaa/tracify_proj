import React from "react";
import SidebarComponent from "../components/SidebarComponent";

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <title>Dashboard</title>
      </head>
      <body style={{ backgroundColor: "whitesmoke", }}>
        <SidebarComponent />
        {children}
      </body>
    </html>
  );
}
