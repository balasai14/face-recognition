import { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ImageUploader = ({ onImageSelect, maxSize = 10485760, multiple = false }) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError('');

    // Validate files
    for (let file of files) {
      if (!file.type.match('image/(jpeg|jpg|png)')) {
        setError('Only JPEG and PNG images are allowed');
        return;
      }
      if (file.size > maxSize) {
        setError('File size exceeds 10MB limit');
        return;
      }
    }

    // Create preview for single image
    if (!multiple && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }

    onImageSelect(files);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
      <input
        accept="image/jpeg,image/png"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        multiple={multiple}
        onChange={handleFileChange}
      />
      <label htmlFor="image-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          size="large"
        >
          Upload Image{multiple ? 's' : ''}
        </Button>
      </label>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {preview && (
        <Box sx={{ mt: 3 }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default ImageUploader;
