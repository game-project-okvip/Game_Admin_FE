import React from "react";
import {
  Box, Drawer, List, ListItem,
  ListItemButton, ListItemText, IconButton, Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from '@mui/icons-material/Person';
import DnsIcon from '@mui/icons-material/Dns';
import GroupIcon from '@mui/icons-material/Group';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, Link } from "react-router-dom";
import logo from '../assets/logo.png';
import type { UserRole } from "../types/role.type";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const drawerWidth = 240;

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const rawRole = localStorage.getItem("role");
  const roleData = rawRole ? (JSON.parse(rawRole) as UserRole) : null;
  const permission = roleData?.permission ?? {};

  const isSA = !!roleData?.isSuperAdmin;

  const pages = [
    {
      key: "player",
      label: "การจัดการผู้เล่น",
      icon: <PersonIcon sx={{ mr: 2 }} />,
      path: "/players",
    },
    {
      key: "playhistory",
      label: "ประวัติการเล่น",
      icon: <ManageSearchIcon sx={{ mr: 2 }} />,
      path: "/playhistory",
    },
    {
      key: "playertransction",
      label: "การทำธุรกรรมของผู้เล่น",
      icon: <ReceiptLongOutlinedIcon sx={{ mr: 2 }} />,
      path: "/playertransction",
    },
    {
      key: "user",
      label: "การจัดการผู้ใช้",
      icon: <GroupIcon sx={{ mr: 2 }} />,
      path: "/users",
    },
    {
      key: "whitelist",
      label: "IP การจัดการ",
      icon: <DnsIcon sx={{ mr: 2 }} />,
      path: "/ips",
    },
  ];

  const visiblePages = pages.filter(
    (page) => isSA || permission?.[page.key]?.GET
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <>
      {/* Small toggle button when collapsed */}
      {!open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1300,
            bgcolor: "background.paper",
            boxShadow: 3
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <IconButton onClick={() => setOpen(!open)}><MenuIcon /></IconButton>
            {open && (
              <Link to="/" style={{ textDecoration: "none" }}>
                <Box
                  sx={{ ml: 2, cursor: "pointer" }}
                  component="img"
                  src={logo}
                  width={100}
                  draggable={false}
                />
              </Link>
            )}
          </Box>
          <List sx={{ flexGrow: 1 }}>
            {visiblePages.map((page) => (
              <ListItem disablePadding key={page.key}>
                <ListItemButton onClick={() => navigate(page.path)}>
                  {page.icon}
                  <ListItemText primary={page.label} />
                </ListItemButton>
              </ListItem>
            ))}
            </List>
            
          <Box sx={{ p: 2 }}>
            <Button variant="outlined" color="secondary" fullWidth onClick={handleLogout}><LogoutIcon sx={{mr: 2}}/>ออกจากระบบ</Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
