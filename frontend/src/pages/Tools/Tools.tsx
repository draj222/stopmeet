import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Cancel as CancelIcon,
  Psychology as AIIcon,
  Analytics as AnalyticsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tools-tabpanel-${index}`}
      aria-labelledby={`tools-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for demonstration
const mockAuditResults = [
  {
    id: '1',
    type: 'NO_AGENDA',
    title: 'Weekly Engineering Standup',
    severity: 'HIGH',
    description: '45 meetings without agendas found this month',
    estimatedSavings: 15.5,
    affectedMeetings: 45,
    suggestions: [
      'Generate AI-powered agendas before each meeting',
      'Require agenda creation as meeting prerequisite',
      'Use template-based agenda for recurring meetings'
    ]
  },
  {
    id: '2',
    type: 'TOO_MANY_ATTENDEES',
    title: 'Product Review Meetings',
    severity: 'MEDIUM',
    description: '12 meetings with excessive attendees (>10 people)',
    estimatedSavings: 8.2,
    affectedMeetings: 12,
    suggestions: [
      'Reduce attendees by 40% for non-decision meetings',
      'Create separate update vs. discussion tracks',
      'Use async communication for status updates'
    ]
  },
  {
    id: '3',
    type: 'BACK_TO_BACK',
    title: 'Calendar Overload Pattern',
    severity: 'CRITICAL',
    description: '67 instances of back-to-back meetings without buffers',
    estimatedSavings: 22.3,
    affectedMeetings: 67,
    suggestions: [
      'Add 15-minute buffers between meetings',
      'Block focus time in calendar',
      'Implement meeting-free zones (e.g., Friday mornings)'
    ]
  }
];

const mockCancellationCandidates = [
  {
    id: '1',
    title: 'Daily Marketing Sync',
    score: 85,
    estimatedSavings: 2.5,
    reason: 'Low engagement, can be replaced with async updates',
    attendees: 8,
    frequency: 'Daily',
    lastAttendance: '45%'
  },
  {
    id: '2',
    title: 'Quarterly Business Review Prep',
    score: 78,
    estimatedSavings: 4.0,
    reason: 'Duplicate agenda with existing weekly reviews',
    attendees: 12,
    frequency: 'Weekly',
    lastAttendance: '60%'
  },
  {
    id: '3',
    title: 'Platform Architecture Discussion',
    score: 72,
    estimatedSavings: 3.2,
    reason: 'Too many participants for effective decision-making',
    attendees: 15,
    frequency: 'Bi-weekly',
    lastAttendance: '70%'
  }
];

const mockAgendaTemplates = [
  {
    id: '1',
    name: 'Engineering Standup',
    duration: 30,
    items: [
      { topic: 'Sprint Progress Review', duration: 10, type: 'update' },
      { topic: 'Blockers & Issues', duration: 15, type: 'discussion' },
      { topic: 'Next Steps Planning', duration: 5, type: 'decision' }
    ],
    usage: 156
  },
  {
    id: '2',
    name: 'Product Strategy Session',
    duration: 60,
    items: [
      { topic: 'Market Analysis Review', duration: 15, type: 'presentation' },
      { topic: 'Feature Prioritization', duration: 30, type: 'discussion' },
      { topic: 'Resource Allocation', duration: 15, type: 'decision' }
    ],
    usage: 89
  },
  {
    id: '3',
    name: '1:1 Manager Meeting',
    duration: 45,
    items: [
      { topic: 'Goal Progress Check', duration: 15, type: 'update' },
      { topic: 'Challenge Discussion', duration: 20, type: 'discussion' },
      { topic: 'Growth Planning', duration: 10, type: 'planning' }
    ],
    usage: 234
  }
];

const Tools = () => {
  const [tabValue, setTabValue] = useState(0);
  const [auditRunning, setAuditRunning] = useState(false);
  const [agendaDialog, setAgendaDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState('');
  const [bulkCancelDialog, setBulkCancelDialog] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRunAudit = () => {
    setAuditRunning(true);
    setTimeout(() => setAuditRunning(false), 3000);
  };

  const handleGenerateAgenda = () => {
    setAgendaDialog(true);
  };

  const handleBulkCancel = () => {
    setBulkCancelDialog(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            mb: 2,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block'
          }}
        >
          Meeting Optimization Toolkit
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          AI-powered tools for maximum meeting efficiency and ROI
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="meeting tools tabs">
          <Tab 
            label="Phase 1: Audit & Cancel" 
            icon={<SearchIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Phase 2: AI Agendas" 
            icon={<AIIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Phase 3: Insights & Analytics" 
            icon={<AnalyticsIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Phase 1: Calendar Audit & Cancellation Engine */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Audit Controls */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <SearchIcon sx={{ mr: 1 }} />
                  Calendar Audit Engine
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  AI-powered analysis to identify meeting inefficiencies and cost optimizations
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleRunAudit}
                    disabled={auditRunning}
                    startIcon={auditRunning ? <LinearProgress /> : <PlayIcon />}
                    fullWidth
                  >
                    {auditRunning ? 'Running Audit...' : 'Run Full Audit'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleBulkCancel}
                    fullWidth
                  >
                    Bulk Cancel Meetings
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    fullWidth
                  >
                    Export Audit Report
                  </Button>
                </Stack>

                {auditRunning && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Analyzing calendar patterns...
                    </Typography>
                    <LinearProgress />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Audit Results */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Detected Issues & Optimization Opportunities
            </Typography>
            
            <Stack spacing={2}>
              {mockAuditResults.map((result) => (
                <Accordion key={result.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">
                          {result.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.description}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip
                          label={result.severity}
                          color={getSeverityColor(result.severity) as any}
                          size="small"
                        />
                        <Chip
                          label={`${result.estimatedSavings}h saved`}
                          color="success"
                          size="small"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Impact:</strong> {result.affectedMeetings} meetings affected
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Potential Savings:</strong> {result.estimatedSavings} hours/month
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Recommended Actions:</strong>
                    </Typography>
                    <List dense>
                      {result.suggestions.map((suggestion, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={suggestion} />
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ mt: 2 }}>
                      <Button variant="contained" size="small" sx={{ mr: 1 }}>
                        Apply Fix
                      </Button>
                      <Button variant="outlined" size="small">
                        Schedule Later
                      </Button>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Grid>

          {/* Cancellation Candidates */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              High-Impact Cancellation Candidates
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {mockCancellationCandidates.map((candidate) => (
                  <Grid item xs={12} md={6} lg={4} key={candidate.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" component="div">
                            {candidate.title}
                          </Typography>
                          <Chip
                            label={`Score: ${candidate.score}`}
                            color={candidate.score > 80 ? 'error' : 'warning'}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {candidate.reason}
                        </Typography>
                        
                        <Stack spacing={1} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Potential Savings:</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {candidate.estimatedSavings}h/week
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Attendees:</Typography>
                            <Typography variant="body2">{candidate.attendees}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Last Attendance:</Typography>
                            <Typography variant="body2">{candidate.lastAttendance}</Typography>
                          </Box>
                        </Stack>
                        
                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" size="small" color="error">
                            Cancel
                          </Button>
                          <Button variant="outlined" size="small">
                            Optimize
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Phase 2: AI Agenda Generation */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {/* Agenda Generator */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AIIcon sx={{ mr: 1 }} />
                  AI Agenda Generator
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Generate structured, time-boxed agendas using AI based on meeting context
                </Typography>
                
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Select Meeting</InputLabel>
                    <Select
                      value={selectedMeeting}
                      label="Select Meeting"
                      onChange={(e) => setSelectedMeeting(e.target.value)}
                    >
                      <MenuItem value="standup">Engineering Standup</MenuItem>
                      <MenuItem value="product">Product Review</MenuItem>
                      <MenuItem value="oneonone">1:1 Meeting</MenuItem>
                      <MenuItem value="planning">Sprint Planning</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGenerateAgenda}
                    startIcon={<AIIcon />}
                    fullWidth
                  >
                    Generate AI Agenda
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    fullWidth
                  >
                    Share Template
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Popular Templates */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Popular Agenda Templates
            </Typography>
            <Stack spacing={2}>
              {mockAgendaTemplates.map((template) => (
                <Card key={template.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1">
                        {template.name}
                      </Typography>
                      <Chip
                        label={`${template.usage} uses`}
                        size="small"
                        color="primary"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Duration: {template.duration} minutes
                    </Typography>
                    
                    <List dense>
                      {template.items.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {item.duration}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={item.topic}
                            secondary={`${item.duration}min • ${item.type}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button variant="outlined" size="small" fullWidth>
                        Use Template
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Phase 3: Insights & Analytics */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="h6">Coming Soon: Advanced Analytics</Typography>
              <Typography>
                Real-time meeting sentiment analysis, automated action item tracking, 
                and predictive meeting success scoring powered by GPT-4.
              </Typography>
            </Alert>
          </Grid>
          
          {/* Analytics Preview */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Meeting ROI Analytics
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Total Cost Saved:</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      $24,580
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Hours Reclaimed:</Typography>
                    <Typography fontWeight="bold" color="primary.main">
                      167.5h
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Efficiency Improvement:</Typography>
                    <Typography fontWeight="bold" color="info.main">
                      +34%
                    </Typography>
                  </Box>
                  <Divider />
                  <Typography variant="body2" color="text.secondary">
                    Analytics based on 247 meetings analyzed this month
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Features
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Sentiment Analysis"
                      secondary="Real-time meeting mood tracking"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Action Item Intelligence"
                      secondary="Auto-extracted and tracked commitments"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AnalyticsIcon color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Predictive Scoring"
                      secondary="AI-powered meeting success predictions"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Dialogs */}
      <Dialog open={agendaDialog} onClose={() => setAgendaDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate AI Agenda</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Agenda generated successfully! Added time-boxed items and clear objectives.
          </Alert>
          <Typography variant="body1">
            The AI has analyzed your meeting pattern and created an optimized agenda 
            with proper time allocation and clear outcomes.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgendaDialog(false)}>Close</Button>
          <Button variant="contained">Send to Attendees</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkCancelDialog} onClose={() => setBulkCancelDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Meeting Cancellation</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will cancel {selectedCandidates.length} meetings and save approximately 
            15.7 hours this week. Attendees will be notified automatically.
          </Alert>
          <Typography variant="body1">
            Are you sure you want to proceed with canceling these meetings?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkCancelDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error">
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tools; 