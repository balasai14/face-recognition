import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import ImageUploader from '../common/ImageUploader';
import DensityHeatmap from './DensityHeatmap';
import { crowdService } from '../../services/crowdService';

const CrowdCounter = () => {
  const [formData, setFormData] = useState({
    location: '',
    eventName: '',
  });
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (files) => {
    setImage(files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!image) {
      setError('Please upload a crowd image');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('image', image);
      data.append('location', formData.location);
      data.append('eventName', formData.eventName);

      const response = await crowdService.countCrowd(data);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Crowd counting failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Crowd Face Counting
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Event Name"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <ImageUploader onImageSelect={handleImageSelect} />
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            disabled={loading || !image}
          >
            {loading ? 'Counting...' : 'Count Faces'}
          </Button>
        </Box>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Count Results
                    </Typography>
                    <Box sx={{ textAlign: 'center', my: 3 }}>
                      <Typography variant="h2" color="primary">
                        {result.faceCount}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Faces Detected
                      </Typography>
                    </Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Accuracy:</strong> {(result.accuracy * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Crowd Density:</strong> {result.crowdDensity || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Processing Time: {result.processingTime}ms
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <DensityHeatmap densityMap={result.densityMap} />
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CrowdCounter;
