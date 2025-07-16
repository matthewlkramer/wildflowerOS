import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, Play, Pause, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  duration: number; // seconds
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to WildflowerOS',
    description: 'Your comprehensive school management platform for Wildflower Schools Network',
    component: <WelcomeStep />,
    duration: 3
  },
  {
    id: 'navigation',
    title: 'Easy Navigation',
    description: 'Switch between different views and roles seamlessly',
    component: <NavigationStep />,
    duration: 4
  },
  {
    id: 'classroom',
    title: 'Classroom Management',
    description: 'Manage your classroom with attendance, lessons, and observations',
    component: <ClassroomStep />,
    duration: 5
  },
  {
    id: 'observations',
    title: 'Observation Grid',
    description: 'Track student progress with our color-coded observation system',
    component: <ObservationsStep />,
    duration: 6
  },
  {
    id: 'notes-photos',
    title: 'Student Documentation',
    description: 'Add notes and photos for comprehensive student records',
    component: <NotesPhotosStep />,
    duration: 4
  },
  {
    id: 'families',
    title: 'Family Communication',
    description: 'Manage family information, billing, and communication preferences',
    component: <FamiliesStep />,
    duration: 4
  }
];

function WelcomeStep() {
  return (
    <motion.div 
      className="text-center p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="text-6xl mb-4"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🌻
      </motion.div>
      <h2 className="text-3xl font-bold mb-4">WildflowerOS</h2>
      <p className="text-lg text-gray-600">
        The unified platform for Wildflower Schools Network
      </p>
      <div className="mt-6 flex justify-center gap-4">
        <Badge variant="secondary">Teacher-Led</Badge>
        <Badge variant="secondary">Montessori</Badge>
        <Badge variant="secondary">Community-Driven</Badge>
      </div>
    </motion.div>
  );
}

function NavigationStep() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  useEffect(() => {
    const tabs = ['dashboard', 'families', 'classrooms', 'messages'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % tabs.length;
      setActiveTab(tabs[index]);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Role-Based Navigation</h3>
        <div className="flex gap-2 mb-4">
          <motion.div
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            Educator
          </motion.div>
          <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Parent</div>
          <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Board Member</div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="flex border-b bg-gray-50">
          {['Dashboard', 'Families', 'Classrooms', 'Messages'].map((tab, index) => (
            <motion.div
              key={tab}
              className={`px-4 py-2 cursor-pointer ${
                activeTab === tab.toLowerCase() ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
              animate={{
                backgroundColor: activeTab === tab.toLowerCase() ? '#3b82f6' : '#f9fafb',
                color: activeTab === tab.toLowerCase() ? '#ffffff' : '#4b5563'
              }}
              transition={{ duration: 0.3 }}
            >
              {tab}
            </motion.div>
          ))}
        </div>
        <div className="p-4 h-32 flex items-center justify-center text-gray-600">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            Content for {activeTab} section
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function ClassroomStep() {
  const [highlightTab, setHighlightTab] = useState('overview');
  
  useEffect(() => {
    const tabs = ['overview', 'attendance', 'lessons', 'observations'];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % tabs.length;
      setHighlightTab(tabs[index]);
    }, 1200);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-xl font-semibold mb-4">Classroom Management Hub</h3>
      
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'attendance', label: 'Attendance', icon: '✅' },
          { id: 'lessons', label: 'Lessons', icon: '📚' },
          { id: 'observations', label: 'Observations', icon: '👁️' }
        ].map((tab) => (
          <motion.div
            key={tab.id}
            className={`p-3 rounded-lg text-center border ${
              highlightTab === tab.id ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'
            }`}
            animate={{
              scale: highlightTab === tab.id ? 1.05 : 1,
              backgroundColor: highlightTab === tab.id ? '#dbeafe' : '#f9fafb'
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-2xl mb-1">{tab.icon}</div>
            <div className="text-sm font-medium">{tab.label}</div>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Primary Classroom</span>
          <Badge variant="secondary">24 Students</Badge>
        </div>
        <div className="text-sm text-gray-600">
          All classroom functions in one organized interface
        </div>
      </div>
    </motion.div>
  );
}

function ObservationsStep() {
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedCell(prev => ({
        row: Math.floor(Math.random() * 3),
        col: Math.floor(Math.random() * 4)
      }));
    }, 800);
    
    return () => clearInterval(interval);
  }, []);

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];
  const students = ['Alex', 'Emma', 'Liam', 'Sophia'];
  const lessons = ['Pouring Water', 'Pink Tower', 'Sandpaper Letters'];

  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-xl font-semibold mb-4">Color-Coded Observation Grid</h3>
      
      <div className="mb-4 flex gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Presentation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Practice</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span>Observation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span>Mastery</span>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="flex bg-gray-50">
          <div className="w-32 p-2 border-r font-medium text-sm">Lesson</div>
          {students.map((student, colIndex) => (
            <div key={student} className="w-16 p-2 text-center text-xs font-medium border-r">
              {student}
            </div>
          ))}
        </div>
        
        {lessons.map((lesson, rowIndex) => (
          <div key={lesson} className="flex border-t">
            <div className="w-32 p-2 border-r text-sm">{lesson}</div>
            {students.map((student, colIndex) => (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={`w-16 h-12 border-r border-l cursor-pointer ${
                  selectedCell.row === rowIndex && selectedCell.col === colIndex
                    ? colors[colIndex % colors.length]
                    : 'bg-white hover:bg-gray-50'
                }`}
                animate={{
                  backgroundColor: selectedCell.row === rowIndex && selectedCell.col === colIndex
                    ? colors[colIndex % colors.length].replace('bg-', '')
                    : '#ffffff'
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function NotesPhotosStep() {
  const [showNote, setShowNote] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setShowNote(true);
      setTimeout(() => {
        setShowNote(false);
        setShowPhoto(true);
        setTimeout(() => setShowPhoto(false), 1500);
      }, 1500);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-xl font-semibold mb-4">Student Documentation</h3>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        {['Alex', 'Emma', 'Liam', 'Sophia'].map((student, index) => (
          <div key={student} className="text-center">
            <div className="text-sm font-medium mb-2">{student}</div>
            <div className="space-y-1">
              <motion.button
                className="w-full text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                animate={{
                  scale: showNote && index === 0 ? [1, 1.1, 1] : 1,
                  backgroundColor: showNote && index === 0 ? '#bfdbfe' : '#dbeafe'
                }}
                transition={{ duration: 0.5, repeat: showNote && index === 0 ? 2 : 0 }}
              >
                📝 Note
              </motion.button>
              <motion.button
                className="w-full text-xs px-2 py-1 bg-green-100 text-green-700 rounded"
                animate={{
                  scale: showPhoto && index === 1 ? [1, 1.1, 1] : 1,
                  backgroundColor: showPhoto && index === 1 ? '#bbf7d0' : '#dcfce7'
                }}
                transition={{ duration: 0.5, repeat: showPhoto && index === 1 ? 2 : 0 }}
              >
                📸 Photo
              </motion.button>
            </div>
          </div>
        ))}
      </div>
      
      <AnimatePresence>
        {showNote && (
          <motion.div
            className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-sm font-medium text-blue-700 mb-1">Adding note for Alex</div>
            <div className="text-xs text-blue-600">Today's observation: Showed great focus during practical life activities</div>
          </motion.div>
        )}
        
        {showPhoto && (
          <motion.div
            className="bg-green-50 border border-green-200 rounded-lg p-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-sm font-medium text-green-700 mb-1">Adding photo for Emma</div>
            <div className="text-xs text-green-600">Choose from gallery or take new photo</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FamiliesStep() {
  const [highlightCard, setHighlightCard] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightCard(prev => (prev + 1) % 3);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3 className="text-xl font-semibold mb-4">Family Management</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: 'Family Info', icon: '👨‍👩‍👧‍👦', desc: 'Contact details & preferences' },
          { title: 'Enrollment', icon: '📋', desc: 'Application status & documents' },
          { title: 'Billing', icon: '💳', desc: 'Tuition plans & payments' }
        ].map((card, index) => (
          <motion.div
            key={card.title}
            className={`p-4 rounded-lg border text-center ${
              highlightCard === index ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
            animate={{
              scale: highlightCard === index ? 1.05 : 1,
              borderColor: highlightCard === index ? '#93c5fd' : '#e5e7eb',
              backgroundColor: highlightCard === index ? '#eff6ff' : '#ffffff'
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="font-medium text-sm mb-1">{card.title}</div>
            <div className="text-xs text-gray-600">{card.desc}</div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium mb-1">Communication Preferences</div>
        <div className="text-xs text-gray-600">
          Manage how families receive updates, billing notifications, and classroom news
        </div>
      </div>
    </motion.div>
  );
}

export default function AppGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setProgress(prev => {
          const step = GUIDE_STEPS[currentStep];
          const increment = 100 / (step.duration * 10); // Update every 100ms
          
          if (prev >= 100) {
            // Move to next step
            if (currentStep < GUIDE_STEPS.length - 1) {
              setCurrentStep(prev => prev + 1);
              return 0;
            } else {
              // End of guide
              setIsPlaying(false);
              return 100;
            }
          }
          
          return prev + increment;
        });
      }, 100);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, isOpen, currentStep]);

  const nextStep = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setProgress(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setProgress(0);
    }
  };

  const resetGuide = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
      >
        <Play className="h-5 w-5" />
        <span className="ml-2 hidden sm:inline">App Guide</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>WildflowerOS Interactive Guide</DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${((currentStep * 100) + progress) / GUIDE_STEPS.length}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <Card className="h-full">
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {GUIDE_STEPS[currentStep].title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {GUIDE_STEPS[currentStep].description}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {currentStep + 1} of {GUIDE_STEPS.length}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {GUIDE_STEPS[currentStep].component}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex-shrink-0 flex items-center justify-between pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                disabled={currentStep === GUIDE_STEPS.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetGuide}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restart
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}