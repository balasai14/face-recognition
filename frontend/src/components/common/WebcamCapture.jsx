import { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Box, Button, Paper } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    
    // Convert base64 to blob
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
        onCapture(file);
      });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
      <Box sx={{ mb: 2 }}>
        {imgSrc ? (
          <img src={imgSrc} alt="Captured" style={{ maxWidth: '100%', borderRadius: '8px' }} />
        ) : (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
        )}
      </Box>
      <Button
        variant="contained"
        startIcon={<CameraAltIcon />}
        onClick={capture}
        size="large"
      >
        Capture Photo
      </Button>
      {imgSrc && (
        <Button
          variant="outlined"
          onClick={() => setImgSrc(null)}
          sx={{ ml: 2 }}
          size="large"
        >
          Retake
        </Button>
      )}
    </Paper>
  );
};

export default WebcamCapture;
