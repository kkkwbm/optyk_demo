import { Card, CardContent, Skeleton, Box } from '@mui/material';

function CardSkeleton({ height = 200, showActions = false }) {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={height} sx={{ mb: 2 }} />
        {showActions && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Skeleton variant="rectangular" width={80} height={36} />
            <Skeleton variant="rectangular" width={80} height={36} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default CardSkeleton;
