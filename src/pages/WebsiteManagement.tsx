import React, { useEffect, useState } from "react";
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Pagination, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Typography, Checkbox, FormControlLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

interface LinkItem {
  url: string;
  status: boolean;
  only_mobile: boolean;
  _id?: string;
}

interface Website {
  _id: string;
  name: string;
  url: string;
  link_list: LinkItem[];
  createdAt?: string;
}

const getWebList = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem("webList") || "[]");
  } catch {
    return [];
  }
};
const setWebList = (ids: string[]) => {
  localStorage.setItem("webList", JSON.stringify(ids));
};

const WebsiteManagement: React.FC = () => {
  const role = (localStorage.getItem("role") as "admin" | "user") || "user";

  const [availableWebsites, setAvailableWebsites] = useState<Website[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [current, setCurrent] = useState<Website | null>(null);

  const [formName, setFormName] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formLinks, setFormLinks] = useState<LinkItem[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchWebsites = async () => {
    try {
      const res = await api.get("/admin/websites");
      const allWebsites: Website[] = res.data || [];

      const webList = getWebList();
      const filtered = allWebsites.filter((w) => webList.includes(w._id));
      setAvailableWebsites(filtered);
    } catch (err) {
      console.error("fetchWebsites:", err);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredWebsites = availableWebsites.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const start = (page - 1) * rowsPerPage;
  const paginated = filteredWebsites.slice(start, start + rowsPerPage);

  const resetForm = () => {
    setFormName("");
    setFormUrl("");
    setFormLinks([]);
    setCurrent(null);
  };

  /* ---------- Create ---------- */
  const handleCreateOpen = () => {
    resetForm();
    // default one link row
    setFormLinks([{ url: "", status: true, only_mobile: false }]);
    setOpenCreate(true);
  };

  const handleCreate = async () => {
    try {
      const filteredLinks = formLinks
      .map(l => ({ ...l, url: l.url?.trim() ?? "" }))
      .filter(l => l.url.length > 0);

      const payload = { name: formName, url: formUrl, link_list: filteredLinks };
      const res = await api.post("/admin/websites", payload);
      const newId: string | undefined = res?.data?.id;

      if (role === "admin" && newId) {
        const curr = getWebList();
        if (!curr.includes(newId)) setWebList([...curr, newId]);
      }

      setOpenCreate(false);
      resetForm();
      await fetchWebsites();
    } catch (err) {
      console.error("create website:", err);
    }
  };

  /* ---------- Edit ---------- */
  const handleEditOpen = async (id: string) => {
    try {
      const res = await api.get(`/admin/websites/getwebsiteinfo?id=${id}`);
      const w: Website = res.data;
      setCurrent(w);
      setFormName(w.name);
      setFormUrl(w.url);
      setFormLinks(w.link_list ?? []);
      setOpenEdit(true);
    } catch (err) {
      console.error("open edit:", err);
    }
  };

  const handleEditSave = async () => {
    if (!current) return;
    try {
      const filteredLinks = formLinks
      .map(l => ({ ...l, url: l.url?.trim() ?? "" }))
      .filter(l => l.url.length > 0);

      await api.put("/admin/websites", {
        id: current._id,
        name: formName,
        url: formUrl,
        link_list: filteredLinks
      });
      setOpenEdit(false);
      resetForm();
      fetchWebsites();
    } catch (err) {
      console.error("save edit:", err);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบเว็บไซต์นี้ใช่ไหม?")) return;
    try {
      await api.delete("/admin/websites", { data: { id } });
     
      if (role === "admin") {
        const curr = getWebList();
        if (curr.includes(id)) setWebList(curr.filter(x => x !== id));
      }
      fetchWebsites();
    } catch (err) {
      console.error("delete website:", err);
    }
  };

  /* ---------- link_list helpers ---------- */
  const addLinkRow = () => {
    setFormLinks(prev => [...prev, { url: "", status: true, only_mobile: false }]);
  };
  const removeLinkRow = (index: number) => {
    setFormLinks(prev => prev.filter((_, i) => i !== index));
  };
  const updateLinkRow = (index: number, patch: Partial<LinkItem>) => {
    setFormLinks(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${sidebarOpen ? 240 : 0}px)`,
          boxSizing: 'border-box',
          transition: 'margin-left 0.3s',
          ml: sidebarOpen ? '-20%' : '-40%',
          mr: sidebarOpen ? '-20%' : '-20%',
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          paddingTop: "12px !important"
        }}
      >
        <Typography variant="h4" mb={2}>การจัดการเว็บไซต์</Typography>

        <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          {role === "admin" && (
            <Button variant="contained" color="primary" onClick={handleCreateOpen}>
              <AddIcon sx={{ mr: 1 }} /> สร้างเว็บไซต์
            </Button>
          )}

          <TextField
            placeholder="ค้นหาเว็บไซต์..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {/* LISTING */}
        <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ชื่อ</TableCell>
                <TableCell>URL</TableCell>
                <TableCell sx={{ textAlign: "center" }}>การกระทำ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map(w => (
                <TableRow key={w._id}>
                  <TableCell sx={role === "admin" ? { py: 1 } : {}}>{w.name}</TableCell>
                  <TableCell sx={role === "admin" ? { py: 1 } : {}}>
                    {w.url.split(" or ").map((url, index, arr) => (
                      <React.Fragment key={url}>
                        <a
                          href={url.trim()}
                          style={{ textDecoration: "none", color: "#FFF" }}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {url.trim()}
                        </a>
                        {index < arr.length - 1 && " or "}
                      </React.Fragment>
                    ))}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", py: 1 }}>
                  <IconButton color="primary" onClick={() => handleEditOpen(w._id)}><EditIcon /></IconButton>
                  {role === "admin" && (
                      <IconButton color="error" onClick={() => handleDelete(w._id)}><DeleteIcon /></IconButton>
                  )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredWebsites.length / rowsPerPage > 1 && (
          <Pagination
            count={Math.max(1, Math.ceil(filteredWebsites.length / rowsPerPage))}
            page={page}
            onChange={(_, value) => setPage(value)}
            sx={{ mt: 2, alignSelf: "flex-start" }}
          />
        )}

        {/* ---------- CREATE DIALOG ---------- */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="md">
          <DialogTitle>สร้างเว็บไซต์</DialogTitle>
          <DialogContent>
            <TextField
              label="ชื่อ"
              fullWidth
              margin="normal"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            <TextField
              label="URL หลัก"
              fullWidth
              margin="normal"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://example.com/"
            />

            <Typography variant="subtitle1" mt={1}>ลิงค์</Typography>

            {formLinks.map((link, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
                <TextField
                  label="URL"
                  value={link.url}
                  onChange={(e) => updateLinkRow(idx, { url: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={<Checkbox checked={link.status} onChange={(e) => updateLinkRow(idx, { status: e.target.checked })} />}
                  label="ใช้งาน"
                />
                <FormControlLabel
                  control={<Checkbox checked={link.only_mobile} onChange={(e) => updateLinkRow(idx, { only_mobile: e.target.checked })} />}
                  label="เฉพาะบนมือถือ"
                />
                <Button color="error" onClick={() => removeLinkRow(idx)}><DeleteIcon /></Button>
              </Box>
            ))}

            <Box mt={1}>
              <Button startIcon={<AddIcon />} onClick={addLinkRow}>เพิ่มลิงค์</Button>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenCreate(false)}>ยกเลิก</Button>
            <Button onClick={handleCreate} variant="contained" color="primary">สร้าง</Button>
          </DialogActions>
        </Dialog>

        {/* ---------- EDIT DIALOG ---------- */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="md">
          <DialogTitle>แก้ไขเว็บไซต์</DialogTitle>
          <DialogContent>
            <TextField
              label="ชื่อ"
              fullWidth
              margin="normal"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              slotProps={{
                input: {
                  readOnly: role === "user"
                }
              }}
            />
            <TextField
              label="URL"
              fullWidth
              margin="normal"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://example.com/"
              slotProps={{
                input: {
                  readOnly: role === "user"
                }
              }}
            />

            <Typography variant="subtitle1" mt={1}>ลิงค์</Typography>

            {formLinks.map((link, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
                <TextField
                  label="URL"
                  value={link.url}
                  onChange={(e) => updateLinkRow(idx, { url: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={<Checkbox checked={link.status} onChange={(e) => updateLinkRow(idx, { status: e.target.checked })} />}
                  label="ใช้งาน"
                />
                <FormControlLabel
                  control={<Checkbox checked={link.only_mobile} onChange={(e) => updateLinkRow(idx, { only_mobile: e.target.checked })} />}
                  label="เฉพาะบนมือถือ"
                />
                <Button color="error" onClick={() => removeLinkRow(idx)}><DeleteIcon /></Button>
              </Box>
            ))}

            <Box mt={1}>
              <Button startIcon={<AddIcon />} onClick={addLinkRow}>เพิ่มลิงค์</Button>
            </Box>
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

export default WebsiteManagement;