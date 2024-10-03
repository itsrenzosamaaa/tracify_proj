import React from "react";
import SidebarComponent from "../components/SidebarComponent";

const navigation = [
  { menu: "Home", url: "/office/dashboard" },
  { menu: "Profile", url: "/office/profile" },
  { menu: "Items", url: "/office/items" },
  { menu: "Requests", url: "/office/request" },
  { menu: "Users", url: "/office/users" },
];

export default function Layout({ children }) {
  return (
    <html>  
      <head>
        <title>Office Dashboard</title>
      </head>
      <body style={{ backgroundColor: "whitesmoke", }}>
        <SidebarComponent arr={navigation} avtr="Office" />
        {children}
      </body>
    </html>
  );
}
