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
} from '@mui/material';
import ImageUploader from '../common/ImageUploader';
import WebcamCapture from '../common/WebcamCapture';
import { individualService } from '../../services/individualService';

const IndividualRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    department: '',
  });
  const [images, setImages] = useState([]);
  const [useWebcam, setUseWebcam] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (files) => {
    setImages(Array.from(files));
  };

  const handleWebcamCapture = (file) => {
    setImages([...images, file]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (images.length < 5) {
      setError('Please upload at least 5 images');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('age', formData.age);
      data.append('gender', formData.gender);
      data.append('department', formData.department);

      images.forEach((image) => {
        data.append('images', image);
      });

      const response = await individualService.register(data);
      setResult(response);
      setImages([]);
      setFormData({ name: '', age: '', gender: '', department: '' });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Individual Registration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Register a new individual by uploading at least 5 facial images
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Registration successful! {result.imagesCount} images processed.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setUseWebcam(!useWebcam)}
              sx={{ mb: 2 }}
            >
              {useWebcam ? 'Use File Upload' : 'Use Webcam'}
            </Button>

            {useWebcam ? (
              <WebcamCapture onCapture={handleWebcamCapture} />
            ) : (
              <ImageUploader onImageSelect={handleImageSelect} multiple />
            )}

            <Typography variant="body2" sx={{ mt: 2 }}>
              Images selected: {images.length} (minimum 5 required)
            </Typography>
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            disabled={loading || images.length < 5}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default IndividualRegistration;
