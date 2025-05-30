import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as AIIcon,
  Analytics as AnalyticsIcon,
  Cancel as CancelIcon,
  MonetizationOn as MoneyIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Bolt as BoltIcon,
  TrendingDown as TrendingDownIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { demoLogin } from '../../api/auth';

const DemoShowcase = () => {
  const [activePhase, setActivePhase] = useState<number>(1);
  const [demoRunning, setDemoRunning] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Demo data for showcase
  const demoMetrics = {
    totalMeetingCost: 23420,
    hoursSaved: 34.2,
    efficiencyScore: 78,
    meetingsAnalyzed: 247,
    issuesDetected: 215,
    agendaSuccess: 92,
    timeSaved: 167.5
  };

  const runDemo = async () => {
    setDemoRunning(true);
    for (let phase = 1; phase <= 3; phase++) {
      setActivePhase(phase);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    setDemoRunning(false);
  };

  const NavigationBar = () => (
    <AppBar position="fixed" sx={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
            StopMeet
          </Typography>
          
          {isMobile ? (
            <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ color: '#111827' }}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Stack direction="row" spacing={3} alignItems="center">
              <Typography variant="body1" sx={{ color: '#4b5563', cursor: 'pointer', '&:hover': { color: '#6366f1' } }}>
                Features
              </Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', cursor: 'pointer', '&:hover': { color: '#6366f1' } }}>
                Pricing
              </Typography>
              <Typography variant="body1" sx={{ color: '#4b5563', cursor: 'pointer', '&:hover': { color: '#6366f1' } }}>
                Demo
              </Typography>
              <Button variant="contained" size="small">
                Get Started
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
      
      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box sx={{ width: 280, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Menu</Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <List>
            <ListItem button>
              <ListItemText primary="Features" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Pricing" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Demo" />
            </ListItem>
            <ListItem sx={{ pt: 2 }}>
              <Button variant="contained" fullWidth>
                Get Started
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );

  const HeroSection = () => (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.1,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Chip 
                label="YC-Ready Enterprise Platform" 
                sx={{ 
                  mb: 3, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  fontWeight: 600
                }} 
              />
              
              <Typography 
                variant="h1" 
                sx={{ 
                  color: 'white', 
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.75rem' }
                }}
              >
                Stop Meeting.
                <br />
                Start Achieving.
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  mb: 4, 
                  lineHeight: 1.6,
                  maxWidth: '600px'
                }}
              >
                AI-powered meeting governance platform that saves 25% of meeting costs 
                and creates 167+ hours of focus time monthly. Trusted by forward-thinking teams.
              </Typography>
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
                sx={{ mb: 4 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={demoRunning ? <TimerIcon /> : <PlayIcon />}
                  onClick={runDemo}
                  disabled={demoRunning}
                  sx={{ 
                    bgcolor: 'white',
                    color: '#6366f1',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.125rem',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  {demoRunning ? 'Demo Running...' : 'Watch 15-Second Demo'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 600,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.125rem',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                  onClick={async () => {
                    console.log('Dashboard button clicked, performing demo login...');
                    try {
                      // Check if already logged in
                      const existingToken = localStorage.getItem('token');
                      if (!existingToken) {
                        // Perform demo login
                        const data = await demoLogin();
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                        console.log('Demo login successful');
                      }
                      
                      // Navigate to dashboard
                      console.log('Navigating to dashboard...');
                      navigate('/dashboard');
                    } catch (error) {
                      console.error('Error during demo login:', error);
                      // Fallback navigation
                      navigate('/dashboard');
                    }
                  }}
                >
                  View Dashboard
                </Button>
              </Stack>
              
              {demoRunning && (
                <Box sx={{ mb: 3 }}>
                  <LinearProgress 
                    sx={{ 
                      mb: 1, 
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                    }} 
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    Demonstrating Phase {activePhase} of 3...
                  </Typography>
                </Box>
              )}
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Metrics Dashboard Preview */}
              <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h4" color="success.main" gutterBottom>
                          ${demoMetrics.totalMeetingCost.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Monthly Savings
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" color="primary.main" gutterBottom>
                          {demoMetrics.timeSaved}h
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Focus Time
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <SpeedIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                        <Typography variant="h4" color="info.main" gutterBottom>
                          {demoMetrics.efficiencyScore}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Efficiency Score
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h4" color="warning.main" gutterBottom>
                          25%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Productivity Gain
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  const FeatureSection = () => (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" gutterBottom>
          Three-Phase Implementation
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
          Our systematic approach delivers immediate ROI while building long-term competitive advantages 
          through data-driven meeting optimization.
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {[
          {
            phase: 1,
            title: "Calendar Audit & Cancellations",
            subtitle: "20-30% immediate cost savings",
            icon: <CancelIcon sx={{ fontSize: 48 }} />,
            color: "#ef4444",
            features: [
              "7+ AI detection algorithms",
              "Smart cancellation engine with ML scoring", 
              "Real-time ROI calculations",
              "Bulk operations for maximum impact"
            ]
          },
          {
            phase: 2,
            title: "AI Agenda & Action Assistant",
            subtitle: "25% meeting efficiency improvement",
            icon: <AIIcon sx={{ fontSize: 48 }} />,
            color: "#6366f1",
            features: [
              "GPT-4 powered agenda generation",
              "Industry-specific templates",
              "Native Slack integration",
              "Real-time objective tracking"
            ]
          },
          {
            phase: 3,
            title: "Post-Meeting Insights",
            subtitle: "Predictive optimization & analytics",
            icon: <AnalyticsIcon sx={{ fontSize: 48 }} />,
            color: "#10b981",
            features: [
              "Meeting ROI analytics with trends",
              "Real-time sentiment analysis",
              "AI-extracted action items",
              "Predictive meeting success scoring"
            ]
          }
        ].map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  border: activePhase === feature.phase ? `2px solid ${feature.color}` : 'none',
                  transform: activePhase === feature.phase ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  }
                }}
                onClick={() => setActivePhase(feature.phase)}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Avatar sx={{ bgcolor: feature.color, width: 80, height: 80, mx: 'auto', mb: 3 }}>
                    {feature.icon}
                  </Avatar>
                  
                  <Chip 
                    label={`Phase ${feature.phase}`} 
                    sx={{ mb: 2, bgcolor: feature.color, color: 'white' }} 
                  />
                  
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {feature.subtitle}
                  </Typography>
                  
                  <Stack spacing={1} sx={{ mt: 3 }}>
                    {feature.features.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
                        <CheckIcon sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">{item}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );

  const ROISection = () => (
    <Box sx={{ bgcolor: '#f9fafb', py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h2" gutterBottom>
              Measurable Business Impact
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Join forward-thinking organizations saving thousands monthly while creating 
              meaningful focus time for their teams.
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {[
                { icon: <MoneyIcon />, value: '$24,580', label: 'Average Monthly Savings', sublabel: 'Per 100-person organization' },
                { icon: <ScheduleIcon />, value: '167.5h', label: 'Focus Time Created', sublabel: 'Monthly deep work hours' },
                { icon: <TrendingUpIcon />, value: '34%', label: 'Efficiency Improvement', sublabel: 'Meeting productivity gain' },
                { icon: <BoltIcon />, value: '15 days', label: 'ROI Timeline', sublabel: 'Time to see results' }
              ].map((stat, index) => (
                <Grid item xs={6} key={index}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 1 }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" color="primary.main" gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.sublabel}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Total Addressable Market
              </Typography>
              
              <Stack spacing={3}>
                {[
                  { label: 'TAM', value: '$37B', desc: 'Annual cost of inefficient meetings globally', color: 'error.main' },
                  { label: 'SAM', value: '$12B', desc: 'Knowledge workers in target markets', color: 'warning.main' },
                  { label: 'SOM', value: '$1.2B', desc: 'Addressable with current feature set', color: 'success.main' }
                ].map((market, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {market.label}
                      </Typography>
                      <Typography variant="h5" sx={{ color: market.color, fontWeight: 700 }}>
                        {market.value}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {market.desc}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#ffffff' }}>
      <NavigationBar />
      <HeroSection />
      <FeatureSection />
      <ROISection />
    </Box>
  );
};

export default DemoShowcase; 