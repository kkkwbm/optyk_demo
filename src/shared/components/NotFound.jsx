import { useNavigate } from 'react-router-dom';
import { Container, Paper, Box, Typography, Button } from '@mui/material';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.300',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <FileQuestion size={64} color="#757575" />
        </Box>

        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          404 - Page Not Found
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Home size={20} />}
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={20} />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default NotFound;
