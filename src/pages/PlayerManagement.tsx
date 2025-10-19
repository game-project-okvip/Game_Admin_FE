import React, { useEffect, useState } from "react";
import {
  Box, Button, Paper, Table, TableBody,TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Pagination, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Typography
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import type { UserRole } from "../types/role.type";

interface Player {
  _id: string;
  username: string;
  name: string;
  balance: number;
}

const PlayerManagement: React.FC = () => {
  const raw: any = localStorage.getItem("role");
  const roleFromStorage = JSON.parse(raw) as UserRole;
  const userPerm = (roleFromStorage?.permission?.user ?? {
    GET: false, POST: false, PATCH: false, DELETE: false,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const isSA = !!roleFromStorage?.isSuperAdmin;
  const canView = isSA || !!userPerm.GET;

  const fetchPlayers = async () => {
    try {
      const res = await api.get("/player");
      setPlayers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const filteredPlayers = players.filter(p =>
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedPlayers = filteredPlayers.slice(start, end);

  // EDIT
  const handleDetailOpen  = async (id: string) => {
    try {
      const res = await api.get(`/player/detail?id=${id}`);
      const data: Player = res.data?.data ?? res.data;
      setSelectedPlayer(data);
      setOpenDetail(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetailClose = () => {
    setOpenDetail(false);
    setSelectedPlayer(null);
  }

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
        <Typography variant="h4" mb={2}>การจัดการผู้เล่น</Typography>
        <Box sx={{ width: "100%", display: "flex", justifyContent: "end", alignItems: "center", mb: 2 }}>
          <TextField
            placeholder="ค้นหาเว็บไซต์..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ชื่อ</TableCell>
                <TableCell>ชื่อ</TableCell>
                <TableCell>สมดุล</TableCell>
                {canView && ( <TableCell sx={{ textAlign: 'center' }}>การกระทำ</TableCell> )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPlayers.map((player) => (
                <TableRow key={player._id}>
                  <TableCell>{player.username}</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.balance}</TableCell>
                  { canView && (
                    <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton color="primary" onClick={() => handleDetailOpen(player._id)}>
                    <VisibilityIcon />
                  </IconButton>
                  </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredPlayers.length / rowsPerPage > 1 && (
          <Pagination
            count={Math.max(1, Math.ceil(filteredPlayers.length / rowsPerPage))}
            page={page}
            onChange={(_, value) => setPage(value)}
            sx={{ mt: 2, alignSelf: "flex-start" }}
          />
        )}

        {/* DETAIL MODAL */}
        <Dialog open={openDetail} onClose={handleDetailClose}>
          <DialogTitle>รายละเอียดผู้เล่น</DialogTitle>
            <DialogContent>
              {selectedPlayer ? (
                 <Box sx={{ minWidth: "300px" }}>
                  <Typography variant="subtitle1"><strong>ชื่อผู้ใช้:</strong> {selectedPlayer.username}</Typography>
                  <Typography variant="subtitle1"><strong>ชื่อ:</strong> {selectedPlayer.name}</Typography>
                  <Typography variant="subtitle1"><strong>ยอดเงิน:</strong> {selectedPlayer.balance}</Typography>
                </Box>
              ) : (
                <Typography>กำลังโหลด...</Typography>
              )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDetailClose}>ปิด</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default PlayerManagement;
