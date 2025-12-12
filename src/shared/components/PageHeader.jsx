import { memo } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * PageHeader Component
 * Consistent page headers with title, breadcrumbs, and actions
 *
 * @param {Object} props
 * @param {String} props.title - Page title
 * @param {String} props.subtitle - Page subtitle
 * @param {Array} props.breadcrumbs - Breadcrumb items
 * @param {Array} props.actions - Action buttons
 */
const PageHeader = memo(function PageHeader({ title, subtitle, breadcrumbs = [], actions = [] }) {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator="/"
          aria-label="breadcrumb"
          sx={{ mb: 1 }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={item.label} color="text.primary" variant="body2">
                {item.label}
              </Typography>
            ) : (
              <Link
                key={item.label}
                component={RouterLink}
                to={item.to}
                color="inherit"
                underline="hover"
                variant="body2"
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Title and Actions Row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {/* Title Section */}
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: subtitle ? 0.5 : 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions Section */}
        {actions.length > 0 && (
          <Stack direction="row" spacing={1}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                startIcon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                {...action.props}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
});

export default PageHeader;
