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

interface PlayerDetail {
  username: string;
  name: string;
  balance: number;
  histories: {
    _id: string;
    game: string;
    status: string;
    amount: number;
    createdAt: string;
  }[];
}

const PlayerManagement: React.FC = () => {
  const raw: any = localStorage.getItem("role");
  const roleFromStorage = JSON.parse(raw) as UserRole;
  const userPerm = (roleFromStorage?.permission?.player ?? {
    GET: false, POST: false, PATCH: false, DELETE: false,
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [openDetail, setOpenDetail] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetail | null>(null);
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
      const { client, histories } = res.data.data;
      setSelectedPlayer({ ...client, histories });
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
          width: `calc(100% - ${sidebarOpen ? 240 : 0}px)`,
          ml: sidebarOpen ? '-20%' : '-40%',
          mr: sidebarOpen ? '-20%' : '-20%',
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
        <Dialog open={openDetail} onClose={handleDetailClose} maxWidth="md" fullWidth>
          <DialogTitle>รายละเอียดผู้เล่น</DialogTitle>
          <DialogContent dividers>
            {selectedPlayer ? (
              <Box sx={{ minWidth: "100%"}}>
                {/* Basic Info */}
                <Typography variant="subtitle1" gutterBottom>
                  <strong>ชื่อผู้ใช้ - </strong>
                  <span style={{ color: "#fff" }}>{selectedPlayer.username}</span>
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>ชื่อ - </strong>
                  <span style={{ color: "#fff" }}> {selectedPlayer.name}</span>
                </Typography>
                <Typography variant="subtitle1" gutterBottom mb={3}>
                  <strong>ยอดเงิน - </strong>
                  <span style={{ color: "#fff" }}> {selectedPlayer.balance}</span>
                </Typography>

                {/* History Table */}
                <Typography variant="h6" gutterBottom>
                  ประวัติการเล่นล่าสุด (10 Records)
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ color: "#4ade80" }}>
                  Total Win - {selectedPlayer.histories
                  ?.filter((h: any) => h.status === "Win")
                  .reduce((sum: number, h: any) => sum + h.amount, 0)
                  .toFixed(2)}
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ color: "#f87171" }}>
                  Total Lose - {selectedPlayer.histories
                  ?.filter((h: any) => h.status === "Lose")
                  .reduce((sum: number, h: any) => sum + h.amount, 0)
                  .toFixed(2)}
                </Typography>

                {selectedPlayer.histories && selectedPlayer.histories.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell align="center"><strong>เกม</strong></TableCell>
                          <TableCell align="center"><strong>สถานะ</strong></TableCell>
                          <TableCell align="right"><strong>จำนวน</strong></TableCell>
                          <TableCell align="center"><strong>วันเวลา</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedPlayer.histories.map((h: any) => (
                          <TableRow key={h._id}>
                            <TableCell align="center">{h.game}</TableCell>
                            <TableCell align="center">
                              {h.status === "Win" ? (
                                <Typography color="green">ชนะ</Typography>
                              ) : h.status === "Lose" ? (
                                <Typography color="red">แพ้</Typography>
                              ) : (
                                <Typography color="gray">เสมอ</Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">{h.amount}</TableCell>
                            <TableCell align="center">
                              {new Date(h.createdAt).toLocaleString("th-TH", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography sx={{ mt: 1 }}>ไม่มีข้อมูลประวัติการเล่น</Typography>
                )}
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
