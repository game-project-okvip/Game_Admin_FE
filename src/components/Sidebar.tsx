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
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, Link } from "react-router-dom";
import logo from '../assets/logo.png';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const drawerWidth = 240;

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("webList");
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
            {/* <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/users")}>
                <LanguageIcon  sx={{ mr:2 }} />
                <ListItemText primary="การจัดการผู้ใช้" />
              </ListItemButton>
            </ListItem> */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/players")}>
                <PersonIcon  sx={{ mr:2 }}/>
                <ListItemText primary="การจัดการผู้เล่น" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/playhistory")}>
                <ManageSearchIcon  sx={{ mr:2 }}/>
                <ListItemText primary="ประวัติการเล่น" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/users")}>
                <GroupIcon  sx={{ mr:2 }}/>
                <ListItemText primary="การจัดการผู้ใช้" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate("/ips")}>
                <DnsIcon sx={{ mr:2 }}/>
                <ListItemText primary="IP การจัดการ" />
              </ListItemButton>
            </ListItem>
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
