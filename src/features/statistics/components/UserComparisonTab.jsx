import { Box, Paper, Typography } from '@mui/material';

function UserComparisonTab({ userSalesStatistics }) {
  const formatCurrency = (value) => {
    return `${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Porównanie użytkowników
        </Typography>
        {userSalesStatistics?.userSales && userSalesStatistics.userSales.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {userSalesStatistics.userSales.map((user, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    #{user.rank} {user.userName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.userEmail}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Liczba sprzedaży
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {user.salesCount}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Łączna kwota sprzedaży
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(user.totalSales)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Średnia wartość sprzedaży
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatCurrency(user.averageSaleValue)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      Łączna liczba operacji
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {user.totalOperations || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Brak danych użytkowników za ten okres
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default UserComparisonTab;
