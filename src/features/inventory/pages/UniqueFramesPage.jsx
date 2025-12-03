import { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Chip,
    CircularProgress
} from '@mui/material';
import { Glasses } from 'lucide-react';
import PageHeader from '../../../shared/components/PageHeader';
import api from '../../../config/api';
import { useSelector } from 'react-redux';
import { selectCurrentLocation } from '../../locations/locationsSlice';

function UniqueFramesPage() {
    const [frames, setFrames] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentLocation = useSelector(selectCurrentLocation);

    useEffect(() => {
        const fetchFrames = async () => {
            try {
                setLoading(true);
                const params = {};
                if (currentLocation && currentLocation.id !== 'ALL_STORES') {
                    params.locationId = currentLocation.id;
                }

                const response = await api.get('/inventory/unique-frames', { params });
                setFrames(response.data.data);
            } catch (error) {
                console.error('Failed to fetch unique frames:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFrames();
    }, [currentLocation]);

    return (
        <Container maxWidth="xl">
            <PageHeader
                title="Różne modele oprawek"
                subtitle="Lista unikalnych modeli oprawek w magazynie"
                breadcrumbs={[
                    { label: 'Statystyki', href: '/statistics' },
                    { label: 'Modele oprawek' },
                ]}
                icon={<Glasses size={24} />}
            />

            <Paper sx={{ p: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Marka</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Kolor</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Rozmiar</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Cena</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Ilość</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Lokalizacja</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {frames.length > 0 ? (
                                    frames.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.product?.brand?.name || '-'}</TableCell>
                                            <TableCell>{item.product?.model || '-'}</TableCell>
                                            <TableCell>{item.product?.color || '-'}</TableCell>
                                            <TableCell>{item.product?.size || '-'}</TableCell>
                                            <TableCell>{item.product?.sellingPrice ? `${item.product.sellingPrice.toFixed(2)} zł` : '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={item.quantity}
                                                    color={item.quantity > 0 ? "success" : "default"}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{item.location?.name || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Brak oprawek w magazynie
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
}

export default UniqueFramesPage;
