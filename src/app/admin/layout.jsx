import React from "react";
import SidebarComponent from "../components/SidebarComponent";

const navigation = [
  { forMenu: true, menu: "Home", url: "/admin/dashboard" },
  { forMenu: true, menu: "Basic Department", url: "/admin/basic_department" },
  { forMenu: true, menu: "Higher Department", url: "/admin/higher_department" },
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
