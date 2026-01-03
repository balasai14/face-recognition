import { useState } from 'react';
import { Container, Paper, Typography, Button, Box, Alert, Tabs, Tab } from '@mui/material';
import ImageUploader from '../common/ImageUploader';
import WebcamCapture from '../common/WebcamCapture';
import ResultDisplay from '../common/ResultDisplay';
import { individualService } from '../../services/individualService';
import { useNavigate } from 'react-router-dom';

const IndividualAuthentication = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (files) => {
    setImage(files[0]);
  };

  const handleWebcamCapture = (file) => {
    setImage(file);
  };

  const handleAuthenticate = async () => {
    if (!image) {
      setError('Please select or capture an image');
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await individualService.authenticate(formData);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Individual Authentication</Typography>
          <Button variant="outlined" onClick={() => navigate('/individual/register')}>
            Register New Person
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab label="Upload Image" />
          <Tab label="Use Webcam" />
        </Tabs>

        <Box sx={{ mb: 3 }}>
          {tabValue === 0 ? (
            <ImageUploader onImageSelect={handleImageSelect} />
          ) : (
            <WebcamCapture onCapture={handleWebcamCapture} />
          )}
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleAuthenticate}
          disabled={loading || !image}
        >
          {loading ? 'Authenticating...' : 'Authenticate'}
        </Button>

        {result && (
          <ResultDisplay
            result={result}
            confidenceScore={result.confidence}
            processingTime={result.processingTime}
          />
        )}
      </Paper>
    </Container>
  );
};

export default IndividualAuthentication;
