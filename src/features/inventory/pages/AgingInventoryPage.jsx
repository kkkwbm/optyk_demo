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
import { TrendingDown } from 'lucide-react';
import PageHeader from '../../../shared/components/PageHeader';
import api from '../../../config/api';
import { useSelector } from 'react-redux';
import { selectCurrentLocation } from '../../locations/locationsSlice';
import { format } from 'date-fns';

function AgingInventoryPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentLocation = useSelector(selectCurrentLocation);

    useEffect(() => {
        const fetchAgingInventory = async () => {
            try {
                setLoading(true);
                const params = {};
                if (currentLocation && currentLocation.id !== 'ALL_STORES') {
                    params.locationId = currentLocation.id;
                }

                const response = await api.get('/inventory/aging', { params });
                setItems(response.data.data);
            } catch (error) {
                console.error('Failed to fetch aging inventory:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAgingInventory();
    }, [currentLocation]);

    return (
        <Container maxWidth="xl">
            <PageHeader
                title="Zalegający towar"
                subtitle="Produkty w magazynie powyżej 2 lat"
                breadcrumbs={[
                    { label: 'Statystyki', href: '/statistics' },
                    { label: 'Zalegający towar' },
                ]}
                icon={<TrendingDown size={24} />}
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
                                    <TableCell sx={{ fontWeight: 600 }}>Produkt</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Marka</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Model/Nazwa</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Data przyjęcia</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Dni w magazynie</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Ilość</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Lokalizacja</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.length > 0 ? (
                                    items.map((item) => {
                                        const daysInStock = Math.floor((new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24));
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.product?.type || '-'}</TableCell>
                                                <TableCell>{item.product?.brand?.name || '-'}</TableCell>
                                                <TableCell>{item.product?.model || item.product?.name || '-'}</TableCell>
                                                <TableCell>{item.createdAt ? format(new Date(item.createdAt), 'dd.MM.yyyy') : '-'}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`${daysInStock} dni`}
                                                        color="error"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{item.location?.name || '-'}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Brak zalegającego towaru
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

export default AgingInventoryPage;
