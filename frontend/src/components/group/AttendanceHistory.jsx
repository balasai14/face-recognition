import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { groupService } from '../../services/groupService';

const AttendanceHistory = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventId: '',
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await groupService.getAttendanceHistory(filters);
      setRecords(response.records);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchHistory();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Attendance History
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Event ID"
            name="eventId"
            value={filters.eventId}
            onChange={handleFilterChange}
          />
          <Button variant="contained" onClick={handleSearch} disabled={loading}>
            Search
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Event ID</TableCell>
                <TableCell>Event Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Total Faces</TableCell>
                <TableCell>Identified</TableCell>
                <TableCell>Unidentified</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>
                    {new Date(record.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{record.eventId}</TableCell>
                  <TableCell>{record.eventName || '-'}</TableCell>
                  <TableCell>{record.location || '-'}</TableCell>
                  <TableCell>{record.totalFacesDetected}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.attendees.length}
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.unidentifiedFaces}
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {records.length === 0 && !loading && (
          <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
            No records found
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default AttendanceHistory;
