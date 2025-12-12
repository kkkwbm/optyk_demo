import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { selectUser } from '../authSlice';
import { format } from 'date-fns';

function ProfilePage() {
  const user = useSelector(selectUser);

  if (!user) {
    return (
      <Container maxWidth="md">
        <Typography>Ładowanie...</Typography>
      </Container>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'OWNER':
        return 'warning';
      case 'EMPLOYEE':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Mój profil
      </Typography>

      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Chip
              label={user.role}
              color={getRoleBadgeColor(user.role)}
              size="small"
            />
            <Chip
              label={user.isActive ? 'Aktywny' : 'Nieaktywny'}
              color={user.isActive ? 'success' : 'default'}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* User Details */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Imię
            </Typography>
            <Typography variant="body1">{user.firstName || 'Brak'}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Nazwisko
            </Typography>
            <Typography variant="body1">{user.lastName || 'Brak'}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{user.email}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Telefon
            </Typography>
            <Typography variant="body1">{user.phone || 'Brak'}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Rola
            </Typography>
            <Typography variant="body1">{user.role}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <Typography variant="body1">
              {user.isActive ? 'Aktywny' : 'Nieaktywny'}
            </Typography>
          </Grid>

          {user.lastLogin && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Ostatnie logowanie
              </Typography>
              <Typography variant="body1">
                {format(new Date(user.lastLogin), 'PPpp')}
              </Typography>
            </Grid>
          )}

          {user.createdAt && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Członek od
              </Typography>
              <Typography variant="body1">
                {format(new Date(user.createdAt), 'PP')}
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Assigned Locations */}
        {user.userLocations && user.userLocations.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Przypisane lokalizacje
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {user.userLocations.map((userLocation) => (
                  <Chip
                    key={userLocation.location.id}
                    label={userLocation.location.name}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default ProfilePage;
