import React, { useState } from "react";
import {
  Box, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography, Collapse,
  IconButton, TextField, MenuItem, Pagination
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import type { UserRole } from "../types/role.type";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Client {
  _id: string;
  username: string;
  balance: number;
}

interface HistoryItem {
  _id: string;
  clientId: Client;
  amount: number;
  type: string;
  createdAt: string;
}

interface GroupedHistory {
  client: Client;
  records: HistoryItem[];
}

const PlayerTransction: React.FC = () => {
  const raw: any = localStorage.getItem("role");
  const roleFromStorage = JSON.parse(raw) as UserRole;
  const userPerm = (roleFromStorage?.permission?.playhistory ?? {
    GET: false, POST: false, PATCH: false, DELETE: false,
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    name: "",
    type: "",
    start: "",
    end: new Date().toISOString().split("T")[0],
  });

  const [transctions, setTransctions] = useState<GroupedHistory[]>([]);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const [rowPages, setRowPages] = useState<Record<string, number>>({});

  const isSA = !!roleFromStorage?.isSuperAdmin;
  const canView = isSA || !!userPerm.GET;

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownload = () => {
    if (!canView) return alert("คุณไม่มีสิทธิ์ในการดาวน์โหลด");
    if (transctions.length === 0) {
      alert("ไม่มีข้อมูลสำหรับดาวน์โหลด");
      return;
    }

    // Flatten grouped data into one list
    const exportData = transctions.flatMap((group) =>
      group.records.map((rec) => ({
        "Player Name": group.client.username,
        "Balance": group.client.balance,
        "Type": rec.type,
        "Amount": rec.amount,
        "DateTime": new Date(rec.createdAt).toLocaleString("en-GB", {
          dateStyle: "short",
          timeStyle: "short",
        }),
      }))
    );

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Player Transction");

    // Export to file
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const today = new Date().toISOString().split("T")[0];
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `Player_Transction_${today}.xlsx`);
  };

  const handleSearch = async () => {
    if (!canView) return alert("คุณไม่มีสิทธิ์ในการดู");
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });

      const res = await api.get(`/playertransction?${params.toString()}`);
      const items: HistoryItem[] = res.data?.data?.items || [];

      const grouped: Record<string, HistoryItem[]> = {};
      const clientMap: Record<string, Client> = {};

      items.forEach((item) => {
        const cid = item.clientId._id;
        if (!grouped[cid]) grouped[cid] = [];
        grouped[cid].push(item);
        clientMap[cid] = item.clientId;
      });

      const formatted = Object.entries(grouped).map(([cid, records]) => ({
        client: clientMap[cid],
        records,
      }));

      setTransctions(formatted);
    } catch (err) {
      console.error("Failed to fetch transction:", err);
    }
  };

  const toggleRow = (id: string) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginated = transctions.slice(start, end);

  return (
   <Box sx={{ display: "flex", bgcolor: "#000", color: "#fff", minHeight: "100vh" }}>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${sidebarOpen ? 240 : 0}px)`,
          boxSizing: "border-box",
          transition: "margin-left 0.3s, width 0.3s",
          ml: sidebarOpen ? "-20%" : "-40%",
          mr: sidebarOpen ? "-20%" : "-20%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Typography variant="h4" mb={2}>
          รายการประวัติการเล่น
        </Typography>

        {/* Filters Row */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            mb: 3,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TextField
            label="ชื่อ"
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            sx={{ flex: 1, minWidth: 200, bgcolor: "#222", input: { color: "#fff" }, label: { color: "#aaa" } }}
          />
          <TextField
            select
            label="พิมพ์"
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            sx={{ flex: 1, minWidth: 200, bgcolor: "#222", label: { color: "#aaa" } }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Deposit">Deposit</MenuItem>
            <MenuItem value="Withdraw">Withdraw</MenuItem>
          </TextField>
          <TextField
            label="วันที่เริ่มต้น"
            type="date"
            slotProps={{
              inputLabel: {
                shrink: true
              }
            }}
            value={filters.start}
            onChange={(e) => handleFilterChange("start", e.target.value)}
            sx={{ flex: 1, minWidth: 200, bgcolor: "#222", label: { color: "#aaa" } }}
          />
          <TextField
            label="วันที่สิ้นสุด"
            type="date"
            slotProps={{
              inputLabel: {
                shrink: true
              }
            }}
            value={filters.end}
            onChange={(e) => handleFilterChange("end", e.target.value)}
            sx={{ flex: 1, minWidth: 200, bgcolor: "#222", label: { color: "#aaa" } }}
          />
          <Button
            variant="contained"
            sx={{ height: "56px", minWidth: 150 }}
            color="primary"
            onClick={handleSearch}
          >
            ค้นหา
          </Button>
          <Button
            variant="contained"
            sx={{ height: "56px", minWidth: 150 }}
            color="secondary"
            onClick={handleDownload}
          >
            ดาวน์โหลด Excel
          </Button>
        </Box>

        {/* Table */}
        {paginated.length === 0 ? (
          <Typography sx={{ textAlign: "center", mt: 4 }}>ใช้ตัวกรองและค้นหา</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: "#1e1e1e" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#ffeb3b" }} />
                  <TableCell sx={{ color: "#ffeb3b" }}><strong>ชื่อผู้เล่น</strong></TableCell>
                  <TableCell sx={{ color: "#ffeb3b" }} align="center"><strong>ยอดเงินคงเหลือ</strong></TableCell>
                  <TableCell sx={{ color: "#ffeb3b" }} align="center"><strong>จำนวนเกม</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((group) => (
                  <React.Fragment key={group.client._id}>
                    <TableRow>
                      <TableCell>
                        <IconButton size="small" onClick={() => toggleRow(group.client._id)} sx={{ color: "#fff" }}>
                          {openRows[group.client._id] ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ color: "#fff" }}>{group.client.username}</TableCell>
                      <TableCell align="center" sx={{ color: "#4ade80" }}>
                        {group.client.balance.toFixed(2)}
                      </TableCell>
                      <TableCell align="center" sx={{ color: "#fff" }}>
                        {group.records.length}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0 }}>
                        <Collapse in={openRows[group.client._id]} timeout="auto" unmountOnExit>
                          <Box sx={{ m: 2 }}>
                            <Typography variant="subtitle1" gutterBottom sx={{ color: "#ffeb3b" }}>
                              <strong>ยอดฝากทั้งหมด - </strong>
                              <span style={{ color: "#4ade80" }}> {group.records
                              ?.filter((h: any) => h.type === "Deposit")
                              .reduce((sum: number, h: any) => sum + h.amount, 0)
                              .toFixed(2)}</span> 
                            </Typography>

                            <Typography variant="subtitle1" gutterBottom sx={{ color: "#ffeb3b", marginBottom: "15px" }}>
                              <strong>ยอดถอนทั้งหมด - </strong>
                              <span style={{ color: "#f87171" }}> {group.records
                              ?.filter((h: any) => h.type === "Withdraw")
                              .reduce((sum: number, h: any) => sum + h.amount, 0)
                              .toFixed(2)}</span> 
                            </Typography>

                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ color: "#ffeb3b" }}>พิมพ์</TableCell>
                                  <TableCell sx={{ color: "#ffeb3b" }} align="center">จำนวนเงิน</TableCell>
                                  <TableCell sx={{ color: "#ffeb3b" }} align="center">วันและเวลา</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(() => {
                                  // Collapse table pagination
                                  const rowsPerPlayer = 10;
                                  const currentPage = rowPages[group.client._id] || 1;
                                  const startIdx = (currentPage - 1) * rowsPerPlayer;
                                  const paginatedRecords = group.records.slice(startIdx, startIdx + rowsPerPlayer);

                                  return (
                                    <>
                                      {paginatedRecords.map((h) => (
                                        <TableRow key={h._id}>
                                          <TableCell
                                            sx={{
                                              color:
                                                h.type === "Deposit"
                                                  ? "#4ade80"
                                                  : h.type === "Withdraw"
                                                  ? "#f87171"
                                                  : "#9ca3af",
                                              fontSize: "16px",
                                            }}
                                          >
                                            {h.type}
                                          </TableCell>
                                          <TableCell align="center" 
                                            sx={{ 
                                              color: 
                                                h.type === "Deposit"
                                                ? "#4ade80"
                                                : "#f87171",
                                              fontSize: "16px",
                                            }}>
                                            {h.amount}
                                          </TableCell>
                                          <TableCell align="center" sx={{ color: "#fff", fontSize: "16px" }}>
                                            {new Date(h.createdAt).toLocaleString("en-GB", {
                                              dateStyle: "short",
                                              timeStyle: "short",
                                            })}
                                          </TableCell>
                                        </TableRow>
                                      ))}

                                      {group.records.length > rowsPerPlayer && (
                                        <TableRow>
                                          <TableCell colSpan={4} align="right">
                                            <Pagination
                                              size="small"
                                              count={Math.ceil(group.records.length / rowsPerPlayer)}
                                              page={currentPage}
                                              onChange={(_, page) =>
                                                setRowPages((prev) => ({ ...prev, [group.client._id]: page }))
                                              }
                                              sx={{
                                                "& .MuiPaginationItem-root": { color: "#fff" },
                                                mt: 1,
                                              }}
                                            />
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </>
                                  );
                                })()}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {transctions.length / rowsPerPage > 1 && (
            <Pagination
              count={Math.max(1, Math.ceil(transctions.length / rowsPerPage))}
              page={page}
              onChange={(_, value) => setPage(value)}
              sx={{
                mt: 2,
                alignSelf: "flex-start",
                "& .MuiPaginationItem-root": { color: "#fff" },
              }}
            />
          )}
      </Box>
    </Box>
  );
};

export default PlayerTransction;
