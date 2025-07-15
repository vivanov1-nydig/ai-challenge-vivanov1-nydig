"use client";

import React, { useRef, useState, useEffect } from "react";
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import KeyIcon from '@mui/icons-material/VpnKey';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import SettingsIcon from '@mui/icons-material/Settings';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chat, setChat] = useState([
    { role: "system", content: "Welcome, soul of fire and clay,\nIn this digital fray, shall you stay?" }
  ]);
  const userMessageRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const apiKeyRef = useRef<HTMLInputElement>(null);
  const developerMessageRef = useRef<HTMLInputElement>(null);
  const portOverrideRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const developerMessageDefault =
    "To every user question the response should be informative, but should be rendered as a brutalist poetry in the style of Mayakovsky, in English.";
  const userMessageDefault = "Tell me about Sam Paul, the genius";

  // Persist settings in localStorage
  React.useEffect(() => {
    const model = localStorage.getItem('model');
    const apiKey = localStorage.getItem('apiKey');
    const devMsg = localStorage.getItem('developerMessage');
    const portOverride = localStorage.getItem('portOverride');
    if (model && modelRef.current) modelRef.current.value = model;
    if (apiKey && apiKeyRef.current) apiKeyRef.current.value = apiKey;
    if (devMsg && developerMessageRef.current) developerMessageRef.current.value = devMsg;
    if (portOverride && portOverrideRef.current) portOverrideRef.current.value = portOverride;
  }, []);

  const handleSettingsSave = () => {
    if (modelRef.current) localStorage.setItem('model', modelRef.current.value);
    if (apiKeyRef.current) localStorage.setItem('apiKey', apiKeyRef.current.value);
    if (developerMessageRef.current) localStorage.setItem('developerMessage', developerMessageRef.current.value);
    if (portOverrideRef.current) localStorage.setItem('portOverride', portOverrideRef.current.value);
    setSettingsOpen(false);
  };

  const getApiUrl = () => {
    const portOverride = typeof window !== 'undefined' ? window.localStorage.getItem('portOverride') : '';
    if (process.env.NODE_ENV === 'development' && portOverride) {
      return `http://localhost:${portOverride}/api/chat`;
    }
    return '/api/chat';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Get values from refs first, then fallback to localStorage
    const apiKey = apiKeyRef.current?.value || localStorage.getItem('apiKey') || '';
    const developerMsg = developerMessageRef.current?.value || localStorage.getItem('developerMessage') || developerMessageDefault;
    const userMsg = userMessageRef.current?.value || "";

    // Validate required fields
    if (!apiKey.trim() || !developerMsg.trim()) {
      setChat(prev => [...prev, { role: "error", content: "OpenAPI Key and Developer Message are required fields." }]);
      setLoading(false);
      return;
    }
    if (!userMsg.trim()) {
      setChat(prev => [...prev, { role: "error", content: "User message cannot be empty." }]);
      setLoading(false);
      return;
    }

    setChat(prev => [...prev, { role: "user", content: userMsg }]);
    try {
      const payload = {
        developer_message: developerMsg,
        user_message: userMsg,
        model: modelRef.current?.value || "gpt-4.1-nano",
        api_key: apiKey
      };
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || contentType.includes("text/html")) {
        const text = await res.text();
        // Detect HTML error response and show a friendly error
        if (text.startsWith("<!DOCTYPE html>")) {
          setChat(prev => [...prev, { role: "error", content: "API error: The backend returned an unexpected HTML response. Please check your API key, server status, or try again later." }]);
        } else {
          setChat(prev => [...prev, { role: "error", content: text }]);
        }
        setLoading(false);
        return;
      }
      let result = "";
      if ((res as any).body?.getReader) {
        const reader = (res as any).body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
        }
      } else {
        result = await res.text();
      }
      setChat(prev => [...prev, { role: "assistant", content: result }]);
      if (userMessageRef.current) userMessageRef.current.value = "";
    } catch (err: any) {
      setChat(prev => [...prev, { role: "error", content: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  return (
    <Container maxWidth="sm" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <Typography variant="h4" align="center" color="primary" fontWeight={700} sx={{ flexGrow: 1 }}>
            Revolution Chat
          </Typography>
          <Tooltip title="Settings">
            <IconButton color="primary" onClick={() => setSettingsOpen(true)} size="large" sx={{ ml: 2 }}>
              <SettingsIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mt: 1 }}>
          Brutalist poetry answers in the style of Mayakovsky
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5', borderRadius: 3, boxShadow: 2, p: 2, mb: 2, minHeight: 0, overflow: 'hidden' }}>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1, py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {chat.map((msg, idx) => (
            <Box key={idx} sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              width: '100%'
            }}>
              <Box sx={{
                bgcolor: msg.role === 'user' ? '#43d854' : msg.role === 'error' ? '#f44336' : '#1976d2',
                color: '#fff',
                px: 2,
                py: 1.5,
                borderRadius: 3,
                maxWidth: '80%',
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                boxShadow: 2,
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                position: 'relative'
              }}>
                {msg.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2, borderTop: '1px solid #ddd', mt: 2 }}>
          <TextField
            label="Type your message..."
            inputRef={userMessageRef}
            required
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            variant="filled"
            color="primary"
            sx={{ flexGrow: 1 }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                e.preventDefault();
                const form = (e.target as HTMLElement).closest('form');
                if (form) {
                  form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
              }
            }}
          />
          <Button
            type="submit"
            disabled={loading}
            size="large"
            variant="contained"
            color="primary"
            sx={{ borderRadius: 3, fontWeight: 700, fontSize: "1.1rem", minWidth: 64 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Send"}
          </Button>
        </Box>
      </Box>
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Model (optional)"
              inputRef={modelRef}
              placeholder="gpt-4.1-mini (default)"
              fullWidth
              variant="filled"
              color="primary"
              defaultValue={typeof window !== 'undefined' ? window.localStorage.getItem('model') || '' : ''}
            />
            <TextField
              label="OpenAI API Key"
              inputRef={apiKeyRef}
              type="password"
              required
              fullWidth
              variant="filled"
              color="primary"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon color="primary" />
                  </InputAdornment>
                ),
                autoComplete: "off"
              }}
              defaultValue={typeof window !== 'undefined' ? window.localStorage.getItem('apiKey') || '' : ''}
            />
            <TextField
              label="Port Override (development only)"
              inputRef={portOverrideRef}
              placeholder="Leave empty for default"
              fullWidth
              variant="filled"
              color="primary"
              defaultValue={typeof window !== 'undefined' ? window.localStorage.getItem('portOverride') || '' : ''}
            />
            <Accordion sx={{ mb: 0 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="dev-msg-content"
                id="dev-msg-header"
              >
                <Typography color="primary" fontWeight={600}>Developer Message (advanced)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  label="Developer Message"
                  inputRef={developerMessageRef}
                  key={settingsOpen ? 'open' : 'closed'}
                  defaultValue={typeof window !== 'undefined' ? window.localStorage.getItem('developerMessage') || developerMessageDefault : developerMessageDefault}
                  required
                  fullWidth
                  multiline
                  minRows={2}
                  variant="filled"
                  color="primary"
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSettingsSave} color="primary" variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
