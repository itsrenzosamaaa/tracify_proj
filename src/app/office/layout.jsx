import React from "react";
import SidebarComponent from "../components/SidebarComponent";

const navigation = [
  { forMenu: true, menu: "Home", url: "/office/dashboard" },
  { forMenu: true, menu: "Items", url: "/office/items" },
  { forMenu: true, menu: "Requests", url: "/office/request" },
  { forMenu: true, menu: "Users", url: "/office/users" },
];

export default function Layout({ children }) {
  return (
    <html>  
      <head>
        <title>Office Dashboard</title>
      </head>
      <body style={{ backgroundColor: "whitesmoke", color: '#333333' }}>
        <SidebarComponent arr={navigation} avtr="Office" />
        {children}
      </body>
    </html>
  );
}
