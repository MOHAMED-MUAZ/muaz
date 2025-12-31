import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '@/hooks/useVoice';
import { VoiceIndicator } from '@/components/VoiceIndicator';
import { VoiceButton } from '@/components/VoiceButton';
import { AccessibleCard } from '@/components/AccessibleCard';
import { SkipLink } from '@/components/SkipLink';
import { playTone } from '@/components/AudioFeedback';
import { 
  GraduationCap, 
  FileText, 
  Brain, 
  Building2, 
  Briefcase, 
  History,
  Mic,
  LogOut,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';

type DashboardMode = 'home' | 'teach' | 'exam' | 'level' | 'schemes' | 'jobs' | 'history';

interface ModeConfig {
  id: DashboardMode;
  icon: typeof GraduationCap;
  title: string;
  description: string;
  voiceCommand: string;
  color: string;
}

const modes: ModeConfig[] = [
  {
    id: 'teach',
    icon: GraduationCap,
    title: 'Teach Me',
    description: 'Learn any subject with voice-guided lessons. Step-by-step explanations at your pace.',
    voiceCommand: 'Teach me',
    color: 'text-primary',
  },
  {
    id: 'exam',
    icon: FileText,
    title: 'Exam Preparation',
    description: 'Prepare for UPSC, SSC, and other accessible exams with practice questions.',
    voiceCommand: 'Prepare me for exam',
    color: 'text-accent',
  },
  {
    id: 'level',
    icon: Brain,
    title: 'Check My Level',
    description: 'Assess your knowledge level. I will adapt my teaching style to match.',
    voiceCommand: 'Check my level',
    color: 'text-warning',
  },
  {
    id: 'schemes',
    icon: Building2,
    title: 'Government Schemes',
    description: 'Discover scholarships, pensions, and welfare programs for visually impaired.',
    voiceCommand: 'Find government schemes',
    color: 'text-success',
  },
  {
    id: 'jobs',
    icon: Briefcase,
    title: 'Find Jobs',
    description: 'Explore accessible job opportunities in government and private sectors.',
    voiceCommand: 'Find jobs',
    color: 'text-primary',
  },
  {
    id: 'history',
    icon: History,
    title: 'Continue Learning',
    description: 'Resume where you left off. I remember your progress and preferences.',
    voiceCommand: 'Continue where we stopped',
    color: 'text-muted-foreground',
  },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [currentMode, setCurrentMode] = useState<DashboardMode>('home');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);
  const [wasListening, setWasListening] = useState(false);

  const { 
    isListening, 
    isSpeaking, 
    transcript,
    lastResult,
    startListening, 
    stopListening, 
    speak, 
    isSupported,
    clearTranscript 
  } = useVoice({ continuous: false });

  const speakModeInstructions = (mode: DashboardMode) => {
    const instructions: Record<DashboardMode, string> = {
      home: 'You are on your dashboard. You can say: Teach me, Prepare me for an exam, Find government schemes, Find jobs, Check my level, or Continue where we stopped.',
      teach: 'Teaching mode. Say any subject like mathematics, science, or history. I will explain it step by step.',
      exam: 'Exam preparation mode. Tell me which exam you are preparing for. I know about UPSC, SSC, bank exams, and more.',
      level: 'Level check mode. I will ask you questions to understand your knowledge. Say start when ready.',
      schemes: 'Government schemes for blind people. I can help with scholarships, pensions, skill development, and assistive devices.',
      jobs: 'Job search mode. I can find government jobs, private sector jobs, and work from home opportunities for visually impaired.',
      history: 'Your learning history. I remember your preferences and progress. Would you like to continue your last session?',
    };
    speak(instructions[mode]);
  };

  // Auto-enable mic on initial load
  useEffect(() => {
    if (isSupported && !hasSpokenWelcome) {
      const timer = setTimeout(() => {
        speak('Welcome to your dashboard. You can say: Teach me, Prepare me for an exam, Find government schemes, Find jobs, Check my level, or Repeat options.');
        playTone('start');
        setHasSpokenWelcome(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSpokenWelcome, isSupported, speak]);

  // Auto-enable mic after welcome message finishes
  useEffect(() => {
    if (hasSpokenWelcome && !isSpeaking && !isListening && isSupported) {
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSpokenWelcome, isSpeaking, isListening, isSupported, startListening]);

  // Track when speaking stops to re-enable mic
  useEffect(() => {
    if (isSpeaking) {
      setWasListening(true);
    } else if (wasListening && !isSpeaking && !isListening && isSupported) {
      // Speaking just finished, re-enable mic after a short delay
      const timer = setTimeout(() => {
        startListening();
        setWasListening(false);
      }, 800); // Small delay to avoid cutting off the end of speech
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, wasListening, isListening, isSupported, startListening]);

  // Process voice commands when we get a final result
  useEffect(() => {
    if (!lastResult) return;

    const command = lastResult.toLowerCase().trim();
    console.log('Dashboard command:', command);
    
    if (!isMuted) playTone('notification');
    
    // Navigation commands
    if (command.includes('teach me') || command.includes('teach')) {
      setCurrentMode('teach');
      speak('Teaching mode activated. What subject would you like to learn? You can say mathematics, science, history, or any subject.');
    } else if (command.includes('exam') || command.includes('prepare')) {
      setCurrentMode('exam');
      speak('Exam preparation mode. Which exam are you preparing for? Say UPSC, SSC, or tell me the exam name.');
    } else if (command.includes('level') || command.includes('check')) {
      setCurrentMode('level');
      speak('Level assessment mode. I will ask you some questions to understand your knowledge level. Say start when ready.');
    } else if (command.includes('scheme') || command.includes('government')) {
      setCurrentMode('schemes');
      speak('Government schemes mode. I can help you find scholarships, pensions, and disability support programs. What would you like to explore?');
    } else if (command.includes('job') || command.includes('work') || command.includes('employment')) {
      setCurrentMode('jobs');
      speak('Job search mode. I can find accessible jobs in government, private sector, or work from home opportunities. What type of job interests you?');
    } else if (command.includes('continue') || command.includes('resume') || command.includes('history')) {
      setCurrentMode('history');
      speak('Welcome back! Last time we were learning about mathematics. Would you like to continue, or start something new?');
    } else if (command.includes('home') || command.includes('dashboard') || command.includes('main menu')) {
      setCurrentMode('home');
      speak('You are on the main dashboard. Choose from: Teach me, Exam preparation, Check my level, Government schemes, Find jobs, or Continue learning.');
    } else if (command.includes('repeat') || command.includes('say again')) {
      speakModeInstructions(currentMode);
    } else if (command.includes('logout') || command.includes('log out') || command.includes('exit')) {
      speak('Logging out. Goodbye!');
      setTimeout(() => navigate('/'), 1500);
    } else if (command.includes('help')) {
      speak('You can say: Teach me to learn subjects, Prepare for exam, Check my level, Find government schemes, Find jobs, or Continue learning. Say Home to return to main menu.');
    }
    
    clearTranscript();
  }, [lastResult, currentMode, isMuted, navigate, speak, clearTranscript]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentMode !== 'home') return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, modes.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleModeSelect(modes[selectedIndex].id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMode, selectedIndex]);

  // Announce selected item on change
  useEffect(() => {
    if (currentMode === 'home' && !isSpeaking) {
      const mode = modes[selectedIndex];
      speak(`${mode.title}. ${mode.description}`);
    }
  }, [selectedIndex]);

  const handleModeSelect = (mode: DashboardMode) => {
    playTone('click');
    setCurrentMode(mode);
    speakModeInstructions(mode);
  };

  const voiceStatus = isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle';

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <SkipLink targetId="main-content" />

      {/* Header */}
      <header className="p-4 md:p-6 border-b border-border" role="banner">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-accessible-lg md:text-accessible-xl font-bold text-foreground">
              AI Learning Assistant
            </h1>
            <p className="text-accessible-sm text-muted-foreground">
              {currentMode === 'home' ? 'Your Personal Guide' : modes.find(m => m.id === currentMode)?.title}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="icon-btn"
              aria-label={isMuted ? 'Unmute audio feedback' : 'Mute audio feedback'}
              aria-pressed={isMuted}
            >
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
            
            <button
              onClick={() => {
                speak('Logging out. Goodbye!');
                setTimeout(() => navigate('/'), 1500);
              }}
              className="icon-btn"
              aria-label="Logout"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        id="main-content"
        className="flex-1 p-4 md:p-8"
        tabIndex={-1}
        role="main"
      >
        <div className="max-w-6xl mx-auto">
          {/* Voice Status */}
          <div className="flex flex-col items-center mb-8">
            <VoiceIndicator status={voiceStatus} size="md" />
            <p 
              className="mt-4 text-accessible-base text-muted-foreground text-center"
              role="status"
              aria-live="polite"
            >
              {isListening && 'Listening... Speak now'}
              {isSpeaking && 'Speaking...'}
              {!isListening && !isSpeaking && 'Ready to listen'}
            </p>
            {transcript && isListening && (
              <p className="text-accessible-base text-accent mt-2">
                Heard: "{transcript}"
              </p>
            )}
          </div>

          {/* Home Mode - Feature Cards */}
          {currentMode === 'home' && (
            <div className="slide-up">
              <h2 className="sr-only">Available features</h2>
              
              <div 
                className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3"
                role="listbox"
                aria-label="Features"
              >
                {modes.map((mode, index) => (
                  <div key={mode.id} role="option" aria-selected={selectedIndex === index}>
                    <AccessibleCard
                      icon={mode.icon}
                      title={mode.title}
                      description={mode.description}
                      voiceCommand={mode.voiceCommand}
                      isSelected={selectedIndex === index}
                      as="button"
                      onClick={() => handleModeSelect(mode.id)}
                      onFocus={() => setSelectedIndex(index)}
                    />
                  </div>
                ))}
              </div>

              {/* Quick Commands */}
              <div className="mt-8 p-6 bg-card border-2 border-border rounded-2xl">
                <h3 className="text-accessible-lg font-bold text-foreground mb-4">
                  Quick Voice Commands
                </h3>
                <div className="flex flex-wrap gap-3">
                  {['Repeat options', 'Help', 'Logout'].map(cmd => (
                    <span 
                      key={cmd}
                      className="px-4 py-2 bg-secondary rounded-xl text-accessible-sm text-foreground"
                    >
                      "{cmd}"
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Feature Modes */}
          {currentMode !== 'home' && (
            <div className="slide-up">
              <div className="bg-card border-2 border-border rounded-2xl p-6 md:p-8">
                {/* Mode Header */}
                <div className="flex items-start gap-4 mb-6">
                  {(() => {
                    const mode = modes.find(m => m.id === currentMode);
                    const Icon = mode?.icon || GraduationCap;
                    return (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                          <Icon size={32} className="text-primary" />
                        </div>
                        <div>
                          <h2 className="text-accessible-2xl font-bold text-foreground">
                            {mode?.title}
                          </h2>
                          <p className="text-accessible-base text-muted-foreground mt-1">
                            {mode?.description}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Mode Content */}
                <div className="py-6 border-t border-border">
                  {currentMode === 'teach' && (
                    <div className="space-y-4">
                      <p className="text-accessible-lg text-foreground">
                        I can teach you any subject. Just say the topic name.
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {['Mathematics', 'Science', 'History', 'English', 'Geography', 'Computer'].map(subject => (
                          <button
                            key={subject}
                            className="voice-card text-left"
                            onClick={() => speak(`You said ${subject}. Starting the lesson now. ${subject} is a fascinating subject. Let me explain the basics.`)}
                          >
                            <p className="text-accessible-base font-semibold text-foreground">{subject}</p>
                            <p className="text-accessible-sm text-accent">Say: "{subject}"</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentMode === 'exam' && (
                    <div className="space-y-4">
                      <p className="text-accessible-lg text-foreground">
                        Choose an exam to prepare for, or tell me which exam interests you.
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          { name: 'UPSC', desc: 'Civil Services Examination' },
                          { name: 'SSC', desc: 'Staff Selection Commission' },
                          { name: 'Bank PO', desc: 'Banking Probationary Officer' },
                          { name: 'Railway', desc: 'Railway Recruitment Board' },
                        ].map(exam => (
                          <button
                            key={exam.name}
                            className="voice-card text-left"
                            onClick={() => speak(`${exam.name} exam selected. This exam covers ${exam.desc}. Would you like to start with practice questions or learn the syllabus first?`)}
                          >
                            <p className="text-accessible-base font-semibold text-foreground">{exam.name}</p>
                            <p className="text-accessible-sm text-muted-foreground">{exam.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentMode === 'schemes' && (
                    <div className="space-y-4">
                      <p className="text-accessible-lg text-foreground">
                        I can help you find government support programs. Select a category.
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          { name: 'Education Scholarships', desc: 'Financial aid for students' },
                          { name: 'Disability Pension', desc: 'Monthly financial support' },
                          { name: 'Skill Development', desc: 'Training and employment programs' },
                          { name: 'Assistive Devices', desc: 'Subsidized equipment and aids' },
                        ].map(scheme => (
                          <button
                            key={scheme.name}
                            className="voice-card text-left"
                            onClick={() => speak(`${scheme.name}. ${scheme.desc}. There are several programs available. Would you like me to explain the eligibility and application process?`)}
                          >
                            <p className="text-accessible-base font-semibold text-foreground">{scheme.name}</p>
                            <p className="text-accessible-sm text-muted-foreground">{scheme.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentMode === 'jobs' && (
                    <div className="space-y-4">
                      <p className="text-accessible-lg text-foreground">
                        Find accessible job opportunities. Choose a category.
                      </p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {[
                          { name: 'Government Jobs', desc: 'Reserved positions in public sector' },
                          { name: 'Private Sector', desc: 'Companies with accessibility programs' },
                          { name: 'Work From Home', desc: 'Remote job opportunities' },
                          { name: 'Self Employment', desc: 'Business support and grants' },
                        ].map(job => (
                          <button
                            key={job.name}
                            className="voice-card text-left"
                            onClick={() => speak(`${job.name}. ${job.desc}. I can help you find specific openings and guide you through the application process.`)}
                          >
                            <p className="text-accessible-base font-semibold text-foreground">{job.name}</p>
                            <p className="text-accessible-sm text-muted-foreground">{job.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentMode === 'level' && (
                    <div className="text-center space-y-6">
                      <p className="text-accessible-lg text-foreground">
                        I will ask you some questions to understand your current knowledge level.
                        This helps me teach you better.
                      </p>
                      <VoiceButton
                        variant="primary"
                        size="lg"
                        onClick={() => speak('Starting assessment. I will ask 5 questions. Question 1: What is 15 plus 27?')}
                      >
                        Start Assessment
                      </VoiceButton>
                    </div>
                  )}

                  {currentMode === 'history' && (
                    <div className="space-y-4">
                      <p className="text-accessible-lg text-foreground">
                        Here is your learning history. You can continue any session.
                      </p>
                      <div className="space-y-3">
                        {[
                          { subject: 'Mathematics - Fractions', date: 'Yesterday', progress: '60%' },
                          { subject: 'UPSC - Geography', date: '2 days ago', progress: '40%' },
                          { subject: 'Science - Solar System', date: 'Last week', progress: '80%' },
                        ].map((session, i) => (
                          <button
                            key={i}
                            className="voice-card w-full text-left flex justify-between items-center"
                            onClick={() => speak(`Resuming ${session.subject}. You completed ${session.progress}. Let me continue from where we stopped.`)}
                          >
                            <div>
                              <p className="text-accessible-base font-semibold text-foreground">{session.subject}</p>
                              <p className="text-accessible-sm text-muted-foreground">{session.date}</p>
                            </div>
                            <span className="text-accent font-bold">{session.progress}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Button */}
                <div className="pt-6 border-t border-border">
                  <VoiceButton
                    variant="outline"
                    size="md"
                    voiceCommand="Go home"
                    onClick={() => {
                      setCurrentMode('home');
                      speak('Returning to main dashboard.');
                    }}
                  >
                    Back to Dashboard
                  </VoiceButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Voice Control Footer */}
      <footer className="p-4 border-t border-border bg-card/50" role="contentinfo">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isListening 
                  ? 'bg-voice-listening animate-voice-pulse shadow-glow' 
                  : 'bg-primary hover:shadow-button'
                }
              `}
              aria-label={isListening ? 'Stop listening' : 'Start voice command'}
              aria-pressed={isListening}
            >
              <Mic size={28} className="text-primary-foreground" />
            </button>
          )}
          <p className="text-accessible-sm text-muted-foreground">
            {isListening ? 'Listening... Speak now' : 'Microphone auto-enabled'}
          </p>
        </div>
      </footer>
    </div>
  );
};