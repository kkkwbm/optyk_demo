import { Component } from 'react';
import { Container, Paper, Box, Typography, Button } from '@mui/material';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service (e.g., Sentry, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send error to logging service
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              bgcolor: 'error.lighter',
              border: '1px solid',
              borderColor: 'error.light',
            }}
          >
            <Box sx={{ mb: 3 }}>
              <AlertTriangle size={64} color="#d32f2f" />
            </Box>

            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Ups! Coś poszło nie tak
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Przepraszamy za niedogodności. Wystąpił nieoczekiwany błąd.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
              <Button
                variant="contained"
                startIcon={<RefreshCw size={20} />}
                onClick={this.handleReset}
              >
                Spróbuj ponownie
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home size={20} />}
                onClick={this.handleGoHome}
              >
                Wróć do strony głównej
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  textAlign: 'left',
                  mt: 4,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Szczegóły błędu (tylko dla deweloperów):
                </Typography>
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: 'error.main',
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: 'text.secondary',
                      mt: 2,
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
