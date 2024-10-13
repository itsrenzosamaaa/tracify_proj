import React from "react";
import SidebarComponent from "../components/SidebarComponent";
import HomeIcon from "@mui/icons-material/Home";

const navigation = [
  { icon: <HomeIcon />, menu: "Home", url: "/admin/dashboard" },
  { icon: <HomeIcon />, menu: "Basic Department", url: "/admin/basic_department" },
  { icon: <HomeIcon />, menu: "Higher Department", url: "/admin/higher_department" },
  { icon: <HomeIcon />, menu: "Roles", url: "/admin/roles" },
  { icon: <HomeIcon />, menu: "Users", url: "/admin/users" },
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
