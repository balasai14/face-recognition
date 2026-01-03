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
  Chip,
} from '@mui/material';
import ImageUploader from '../common/ImageUploader';
import { groupService } from '../../services/groupService';
import { useNavigate } from 'react-router-dom';

const GroupAuthentication = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventId: '',
    eventName: '',
    location: '',
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
      setError('Please upload a group image');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('image', image);
      data.append('eventId', formData.eventId);
      data.append('eventName', formData.eventName);
      data.append('location', formData.location);

      const response = await groupService.authenticateGroup(data);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Group authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Group Authentication</Typography>
          <Button variant="outlined" onClick={() => navigate('/group/history')}>
            View History
          </Button>
        </Box>

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
                label="Event ID"
                name="eventId"
                value={formData.eventId}
                onChange={handleChange}
                required
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
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
            {loading ? 'Processing...' : 'Authenticate Group'}
          </Button>
        </Box>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Authentication Results
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Total Faces
                    </Typography>
                    <Typography variant="h4">{result.totalFaces}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Identified
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {result.identified.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">
                      Unidentified
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {result.unidentified}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Identified Attendees:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {result.identified.map((person, index) => (
                      <Chip
                        key={index}
                        label={`${person.name} (${(person.confidence * 100).toFixed(0)}%)`}
                        color="primary"
                      />
                    ))}
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Processing Time: {result.processingTime}ms
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default GroupAuthentication;
