import React, { useState } from "react";
import {
  Drawer, IconButton, Avatar, Typography, Box, Button, TextField, Switch,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import ColorLensIcon from "@mui/icons-material/ColorLens";

export default function ProfilePanel({ user, onUpdate, onLogout }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(user || { name: "", email: "", mobile: "", dob: "" });
  const [dark, setDark] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleThemeToggle() {
    setDark(!dark);
    // add your color theme switch logic here if needed
  }
  function handleSave() {
    onUpdate(form);
    setOpen(false);
  }
  return (
    <>
      <IconButton sx={{ bgcolor: "#e3f2fd", ml: 2 }} onClick={() => setOpen(true)}>
        <AccountCircleIcon sx={{ fontSize: 36, color: "#38b6ff" }} />
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 340, p: 4, pt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Avatar sx={{ width: 62, height: 62, mr: 2, bgcolor: "#38b6ff" }}>
              {form.name?.charAt(0)?.toUpperCase() || <AccountCircleIcon fontSize="large" />}
            </Avatar>
            <Typography variant="h5" fontWeight={900}>Profile</Typography>
          </Box>
          <TextField
            label="Name" fullWidth name="name" sx={{ mb: 2 }} value={form.name}
            onChange={handleChange} />
          <TextField
            label="Email" fullWidth name="email" sx={{ mb: 2 }} value={form.email}
            onChange={handleChange} />
          <TextField
            label="Mobile" fullWidth name="mobile" sx={{ mb: 2 }} value={form.mobile}
            onChange={handleChange} />
          <TextField
            label="Date of Birth" type="date" InputLabelProps={{ shrink: true }}
            name="dob" fullWidth sx={{ mb: 2 }} value={form.dob}
            onChange={handleChange} />
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <ColorLensIcon sx={{ mr: 1 }} /> Theme &nbsp;
            <Switch checked={dark} onChange={handleThemeToggle} />
            {dark ? "Dark" : "Light"}
          </Box>
          <Button variant="contained" sx={{ my: 2, width: "100%" }} onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="outlined" color="error" sx={{ width: "100%" }} startIcon={<LogoutIcon />} onClick={onLogout}>
            Logout
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
