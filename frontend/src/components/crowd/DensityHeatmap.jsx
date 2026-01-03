import { Card, CardContent, Typography } from '@mui/material';

const DensityHeatmap = ({ densityMap }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Density Heatmap
        </Typography>
        <img
          src={`data:image/jpeg;base64,${densityMap}`}
          alt="Density Heatmap"
          style={{ width: '100%', borderRadius: '8px' }}
        />
      </CardContent>
    </Card>
  );
};

export default DensityHeatmap;
