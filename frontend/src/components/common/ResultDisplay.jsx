import { Paper, Typography, Box, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const ResultDisplay = ({ result, confidenceScore, processingTime }) => {
  const isSuccess = result?.authenticated || result?.faceCount >= 0;

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {isSuccess ? (
          <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
        ) : (
          <CancelIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
        )}
        <Typography variant="h5">
          {isSuccess ? 'Success' : 'Failed'}
        </Typography>
      </Box>

      {result?.name && (
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Name:</strong> {result.name}
        </Typography>
      )}

      {confidenceScore !== undefined && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Confidence:</strong> {(confidenceScore * 100).toFixed(2)}%
          </Typography>
          <Chip
            label={confidenceScore >= 0.85 ? 'High Confidence' : 'Low Confidence'}
            color={confidenceScore >= 0.85 ? 'success' : 'warning'}
          />
        </Box>
      )}

      {result?.faceCount !== undefined && (
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Face Count:</strong> {result.faceCount}
        </Typography>
      )}

      {processingTime && (
        <Typography variant="body2" color="text.secondary">
          Processing Time: {processingTime}ms
        </Typography>
      )}
    </Paper>
  );
};

export default ResultDisplay;
