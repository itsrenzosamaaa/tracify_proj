import React from "react";
import SidebarComponent from "../components/SidebarComponent";

const navigation = [
  { forMenu: true, menu: "Home", url: "/admin/dashboard" },
];

export default function Layout({ children }) {
  return (
    <html>  
      <head>
        <title>Admin Dashboard</title>
      </head>
      <body style={{ backgroundColor: "whitesmoke", }}>
        <SidebarComponent arr={navigation} avtr="Admin" />
        {children}
      </body>
    </html>
  );
}
