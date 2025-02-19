import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Search as SearchIcon,
  TwoWheeler as RiderIcon,
  CheckCircle as VerifiedIcon,
} from '@mui/icons-material';
import { getRiders, updateRiderStatus } from '../../store/slices/adminSlice';

const RiderManagement = () => {
  const dispatch = useDispatch();
  const { riders, isLoading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRider, setSelectedRider] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: '',
    status: '',
  });

  useEffect(() => {
    dispatch(getRiders());
  }, [dispatch]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleEditClick = (rider) => {
    setSelectedRider(rider);
    setEditForm({
      name: rider.name,
      email: rider.email,
      phone: rider.phone,
      vehicleType: rider.vehicleType,
      vehicleNumber: rider.vehicleNumber,
      licenseNumber: rider.licenseNumber,
      status: rider.status,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRider(null);
    setEditForm({
      name: '',
      email: '',
      phone: '',
      vehicleType: '',
      vehicleNumber: '',
      licenseNumber: '',
      status: '',
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateRider = async () => {
    if (!selectedRider) return;
    
    try {
      await dispatch(updateRiderStatus({
        riderId: selectedRider._id,
        status: editForm.status
      })).unwrap();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating rider:', error);
    }
  };

  const handleDeleteRider = async (riderId) => {
    if (window.confirm('Are you sure you want to delete this rider?')) {
      try {
        // For now, we'll just suspend the rider instead of deleting
        await dispatch(updateRiderStatus({ 
          riderId, 
          status: 'suspended' 
        })).unwrap();
      } catch (error) {
        console.error('Error suspending rider:', error);
      }
    }
  };

  const handleStatusChange = async (riderId, newStatus) => {
    try {
      await dispatch(updateRiderStatus({ riderId, status: newStatus })).unwrap();
      // No need to fetch riders again as the state is updated automatically
    } catch (error) {
      console.error('Error changing rider status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredRiders = riders.filter(
    (rider) =>
      rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rider.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Rider Management
        </Typography>

        {/* Search Bar */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search riders by name, email, or vehicle number..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>
        </Card>

        {/* Riders Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Vehicle Info</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Earnings</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                filteredRiders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((rider) => (
                    <TableRow key={rider._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <RiderIcon sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="subtitle2">
                              {rider.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {rider.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {rider.vehicleType.charAt(0).toUpperCase() +
                            rider.vehicleType.slice(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rider.vehicleNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Rating
                          value={rider.rating}
                          readOnly
                          size="small"
                          precision={0.5}
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({rider.totalRatings})
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2">
                          ${rider.earnings.total.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Pending: ${rider.earnings.pending.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip
                            label={rider.status}
                            color={getStatusColor(rider.status)}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          {rider.isAvailable && (
                            <Chip
                              label="Online"
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(rider)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleStatusChange(
                              rider._id,
                              rider.status === 'suspended'
                                ? 'approved'
                                : 'suspended'
                            )
                          }
                        >
                          <BlockIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteRider(rider._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredRiders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Edit Rider Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Edit Rider</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={editForm.name}
                    onChange={handleFormChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={editForm.email}
                    onChange={handleFormChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleFormChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={editForm.status}
                      onChange={handleFormChange}
                      label="Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="suspended">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Type</InputLabel>
                    <Select
                      name="vehicleType"
                      value={editForm.vehicleType}
                      onChange={handleFormChange}
                      label="Vehicle Type"
                    >
                      <MenuItem value="bicycle">Bicycle</MenuItem>
                      <MenuItem value="motorcycle">Motorcycle</MenuItem>
                      <MenuItem value="car">Car</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Vehicle Number"
                    name="vehicleNumber"
                    value={editForm.vehicleNumber}
                    onChange={handleFormChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="License Number"
                    name="licenseNumber"
                    value={editForm.licenseNumber}
                    onChange={handleFormChange}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateRider}>
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default RiderManagement;
