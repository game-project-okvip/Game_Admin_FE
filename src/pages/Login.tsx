import React, { useState , useEffect} from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import logo from '../assets/logo.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/"); 
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      const response = await api.post("/auth/login", { username, password });
      const { token, role } = response.data.data;
      console.log("response", response.data.data);
      localStorage.setItem("token", token);
      localStorage.setItem("role", JSON.stringify(role));

      if (role.role === "Super Admin") {
        navigate("/players");
      } else {
        navigate("/users");
      }
      //navigate("/");
    } catch (err: any){
      setError(err.response?.data?.message || "Login failed");
    }
    console.log({ username, password });
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 22,
        p: 4,
        border: "2px solid",
        borderColor: "gold",
        borderRadius: 2,
        boxShadow: 6,
        backgroundColor: "#1e1e1e", 
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
        <Box component={"img"} src={logo} draggable={false} width={100} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          ระบบจัดการเว็บไซต์
        </Typography>
      </Box>
      
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="ชื่อผู้ใช้"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="รหัสผ่าน"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" fullWidth onClick={handleLogin} sx={{ mt: 2 }}>
        เข้าสู่ระบบ
      </Button>
    </Box>
  );
};

export default Login;
