import React, { useEffect, useState } from "react";
import {
  Box, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Pagination, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import type { UserRole} from "../types/role.type";

interface IP {
  _id: string;
  ip: string;
  description: string;
}

const IPManagement: React.FC = () => {
  const raw: any = localStorage.getItem("role");
  const roleFromStorage = JSON.parse(raw) as UserRole;
  const userPerm = (roleFromStorage?.permission?.whitelist ?? {
    GET: false, POST: false, PATCH: false, DELETE: false,
  });

  const [ips, setIps] = useState<IP[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [openCreate, setOpenCreate] = useState(false);
  const [formIp, setFormIp] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const isSA = !!roleFromStorage?.isSuperAdmin;
  const canCreate = isSA || !!userPerm.POST;
  const canEdit   = isSA || !!userPerm.PATCH;
  const canDelete = isSA || !!userPerm.DELETE;
  const canActCol = canEdit || canDelete;

  const fetchIPs = async () => {
    try {
      const res = await api.get("/whitelist");
      setIps(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIPs();
  }, []);

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedIps = ips.slice(start, end);

  //Create
  const handleCreate = async () => {
    try {
      await api.post("/whitelist", {
        ip: formIp,
        description: formDescription,
      });
      setOpenCreate(false);
      fetchIPs();
      setFormIp("");
      setFormDescription("");
    } catch (err) {
      console.error(err);
    }
  };
  
  // Edit
  const handleEditOpen = (ip: IP) => {
    setEditId(ip._id);
    setFormIp(ip.ip);
    setFormDescription(ip.description);
    setOpenEdit(true);
  };

  const handleEditSave = async () => {
    if (!editId) return;
    try {
      await api.patch(`/whitelist?id=${editId}`, {
        ip: formIp,
        description: formDescription,
      });
      setOpenEdit(false);
      setEditId(null);
      setFormIp("");
      setFormDescription("");
      fetchIPs();
    } catch (err) {
      console.error("Error editing whitelist:", err);
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบ IP นี้หรือไม่?")) return;
    try {
      await api.delete(`/whitelist?id=${id}`);
      fetchIPs();
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
        <Typography variant="h4" mb={2}>IP ไวท์ลิสต์ การจัดการ</Typography>

        {canCreate && (
          <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setOpenCreate(true)} > 
          <AddIcon sx={{ mr: 1 }} />สร้าง ไวท์ลิสต์
        </Button>
        )}
        
        <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>IP</TableCell>
                <TableCell>คำอธิบาย</TableCell>
                {canActCol && ( <TableCell sx={{ textAlign: 'center' }}>การกระทำ</TableCell> )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedIps.map((ip) => (
                <TableRow key={ip._id}>
                  <TableCell>{ip.ip}</TableCell>
                  <TableCell>{ip.description}</TableCell>
                  {canActCol && (
                    <TableCell sx={{ textAlign: 'center' }}>
                      {canEdit && (
                        <IconButton color="primary" onClick={() => handleEditOpen(ip)}>
                          <EditIcon />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton color="error" onClick={() => handleDelete(ip._id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {ips.length / rowsPerPage > 1 && (
          <Pagination
            count={Math.max(1, Math.ceil(ips.length / rowsPerPage))}
            page={page}
            onChange={(_, value) => setPage(value)}
            sx={{ mt: 2, alignSelf: "flex-start" }}
          />
        )}

        {/* CREATE MODAL */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
          <DialogTitle>สร้าง IP ไวท์ลิสต์</DialogTitle>
          <DialogContent>
            <TextField
              label="IP"
              fullWidth
              margin="normal"
              value={formIp}
              onChange={(e) => setFormIp(e.target.value)}
            />
            <TextField
              label="คำอธิบาย"
              fullWidth
              margin="normal"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />

          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenCreate(false);
              setFormIp("");
              setFormDescription("");
            }}>ยกเลิก</Button>
            <Button onClick={handleCreate} variant="contained" color="primary">สร้าง</Button>
          </DialogActions>
        </Dialog>

        {/* EDIT MODAL */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <DialogTitle>แก้ไข IP ไวท์ลิสต์</DialogTitle>
          <DialogContent>
            <TextField
              label="IP"
              fullWidth
              margin="normal"
              value={formIp}
              onChange={(e) => setFormIp(e.target.value)}
            />
            <TextField
              label="คำอธิบาย"
              fullWidth
              margin="normal"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>ยกเลิก</Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">บันทึก</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default IPManagement;