import { Box, Typography, Button, Container } from '@mui/material';
import { FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <FileQuestion size={80} color="#ed6c02" />
        <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
          404 - Strona nie znaleziona
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Strona, którą szukasz, nie istnieje lub została przeniesiona.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Powrót do pulpitu nawigacyjnego
        </Button>
      </Box>
    </Container>
  );
}

export default NotFoundPage;
