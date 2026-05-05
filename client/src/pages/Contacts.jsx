import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';

import PeopleIcon from '@mui/icons-material/People';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { getContacts } from '../api/contacts';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getContacts()
      .then((res) => setContacts(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Contacts</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
          All contacts across your applications
        </Typography>
      </Box>

      {loading ? (
        <Paper>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={52} sx={{ mx: 2, my: 0.5 }} />
          ))}
        </Paper>
      ) : contacts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography sx={{ color: 'text.secondary' }}>
            No contacts yet. Add contacts from any job's detail page.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                {['Name', 'Title', 'Company', 'Job', 'Email', 'Links', 'Notes'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  sx={{ '&:last-child td': { borderBottom: 0 } }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{c.title || '—'}</TableCell>
                  <TableCell>
                    {c.company ? (
                      <Chip
                        label={c.company.name}
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/companies/${c.company.id}`)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    {c.job ? (
                      <Chip
                        label={c.job.roleTitle}
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/jobs/${c.job.id}`)}
                        sx={{ cursor: 'pointer', maxWidth: 180 }}
                      />
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    {c.email ? (
                      <Link href={`mailto:${c.email}`} underline="hover" sx={{ color: 'primary.main', fontSize: '0.875rem' }}>
                        {c.email}
                      </Link>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {c.linkedinUrl && (
                        <Tooltip title="LinkedIn">
                          <IconButton
                            size="small"
                            href={c.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            component="a"
                            sx={{ color: '#60A5FA' }}
                          >
                            <LinkedInIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', maxWidth: 200 }}>
                    <Typography variant="body2" noWrap title={c.notes}>{c.notes || '—'}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
