import React, { useEffect, useState } from "react";
import {
  Box, Button, Paper, Table, TableBody,TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Pagination, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Typography,  Checkbox, FormControlLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

interface User {
  _id: string;
  username: string;
  name: string;
  role?: string;
}

interface Permission {
  [module: string]: {
    GET: boolean;
    POST: boolean;
    PATCH: boolean;
    DELETE: boolean;
  };
}

interface Role {
  _id: string;
  role: string;
  isSuperAdmin: boolean;
  permission: Permission;
}

const UserManagement: React.FC = () => {
  const raw: any = localStorage.getItem("role");
  const roleFromStorage = JSON.parse(raw) as Role;

  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [roles, setRoles] = useState<Role[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formName, setFormName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleId, setFormRoleId] = useState<string>("");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/user");
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get("/role");
      const list: Role[] = res.data?.data || [];
      setRoles(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedUsers = users.slice(start, end);

  //Create
  const handleOpenCreate = () => {
    setFormUsername("");
    setFormName("");
    setFormPassword("");
    setFormRoleId("");
    setOpenCreate(true);
  };

  const handleCreate = async () => {
    try {
      await api.post("/user", {
        username: formUsername,
        name: formName,
        password: formPassword,
        role: formRoleId,
      });
      setOpenCreate(false);
      fetchUsers();
      setFormUsername("");
      setFormName("");
      setFormPassword("");
      setFormRoleId("");
    } catch (err) {
      console.error(err);
    }
  };

  // EDIT
  const handleEditOpen = async (id: string) => {
    try {
      const res = await api.get(`/user/detail?id=${id}`);
      const data: User = res.data?.data ?? res.data;
      setCurrentUser(data);
      setFormUsername(data.username);
      setFormName(data.name);
      setFormRoleId(data.role || "");
      setOpenEdit(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSave = async () => {
    if (!currentUser) return;
    try {
      await api.patch("/user", {
        id: currentUser._id,
        name: formName,
        role: formRoleId,
      });
      setOpenEdit(false);
      fetchUsers();
      setCurrentUser(null);
      setFormUsername("");
      setFormName("");
      setFormRoleId("");
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบผู้ใช้รายนี้หรือไม่?")) return;
    try {
      await api.delete("/user", { data: { id } });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}/>
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin 0.3s, width 0.3s",
          display: "flex", 
          flexDirection: "column", 
          alignItems: "flex-start", 
        }}
        >
        <Typography variant="h4" mb={2}>การจัดการผู้ใช้</Typography>
        
        <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpenCreate()} > 
          <AddIcon sx={{ mr: 1 }} />สร้างผู้ใช้
        </Button>

        <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ชื่อ</TableCell>
                <TableCell>ชื่อ</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>การกระทำ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton color="primary" onClick={() => handleEditOpen(user._id)}>
                      <EditIcon />
                    </IconButton>
                    {(roleFromStorage as any).role === "Super Admin" && (
                      <IconButton color="error" onClick={() => handleDelete(user._id)}>
                        <DeleteIcon />
                      </IconButton>                    
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {users.length / rowsPerPage > 1 && (
          <Pagination
            count={Math.max(1, Math.ceil(users.length / rowsPerPage))}
            page={page}
            onChange={(_, value) => setPage(value)}
            sx={{ mt: 2, alignSelf: "flex-start" }}
          />
        )}

        {/* CREATE MODAL */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
          <DialogTitle>สร้างผู้ใช้</DialogTitle>
          <DialogContent>
            <TextField
              label="ชื่อผู้ใช้"
              fullWidth
              margin="normal"
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
            />
            <TextField
              label="ชื่อ"
              fullWidth
              margin="normal"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              />
            <TextField
              label="รหัสผ่าน"
              type="password"
              fullWidth
              margin="normal"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              />
            <TextField
              select
              label="บทบาท"
              fullWidth
              margin="normal"
              value={formRoleId}
              onChange={(e) => setFormRoleId(e.target.value)}
            >
              {roles.map((r) => (
                <MenuItem key={r._id} value={r._id}>
                  {r.role}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenCreate(false);
              setFormUsername("");
              setFormName("");
              setFormPassword("");
              setFormRoleId("");  
            }}>ยกเลิก</Button>
            <Button onClick={handleCreate} variant="contained" color="primary">สร้าง</Button>
          </DialogActions>
        </Dialog>

        {/* EDIT MODAL */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>แก้ไขผู้ใช้</DialogTitle>
            <DialogContent>
            <TextField
              label="ชื่อ"
              fullWidth margin="normal"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <TextField 
              select
              label="บทบาท"
              fullWidth
              margin="normal"
              value={formRoleId}
              onChange={(e) => setFormRoleId(e.target.value)}
              >
            {roles.map((r) => (
              <MenuItem key={r._id} value={r._id}>
                {r.role}
              </MenuItem>
            ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenEdit(false);
              setFormUsername("");
              setFormName("");
              setFormRoleId("");
                setCurrentUser(null);
            }}>ยกเลิก</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">บันทึก</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UserManagement;
