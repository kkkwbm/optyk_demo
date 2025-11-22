import { Box, Typography, Button, Container } from '@mui/material';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function UnauthorizedPage() {
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
        <ShieldAlert size={80} color="#d32f2f" />
        <Typography variant="h3" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
          403 - Brak uprawnień
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Nie masz uprawnień do dostępu na tę stronę.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Powrót do pulpitu nawigacyjnego
        </Button>
      </Box>
    </Container>
  );
}

export default UnauthorizedPage;
