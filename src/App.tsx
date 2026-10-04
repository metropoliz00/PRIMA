/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { LoginPage } from './components/auth/LoginPage';
import { LogoutDialog } from './components/auth/LogoutDialog';

// Dashboards
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboardView } from './components/student/StudentDashboardView';

// Student Journey Components
import { SubjectSelector } from './components/subjects/SubjectSelector';
import { TopicSelector } from './components/subjects/TopicSelector';
import { LearningJourneyMap } from './components/journey/LearningJourneyMap';
import { PemantikStep } from './components/journey/steps/PemantikStep';
import { EksplorasiStep } from './components/journey/steps/EksplorasiStep';
import { InteraksiStep } from './components/journey/steps/InteraksiStep';
import { VideoPlayerStep } from './components/journey/steps/VideoPlayerStep';
import { AITutorStep } from './components/journey/steps/AITutorStep';
import { SimulasiStep } from './components/journey/steps/SimulasiStep';
import { CodingChallengeStep } from './components/journey/steps/CodingChallengeStep';
import { HotsChallengeStep } from './components/journey/steps/HotsChallengeStep';
import { AsesmenStep } from './components/journey/steps/AsesmenStep';
import { RefleksiStep } from './components/journey/steps/RefleksiStep';
import { ProgressView } from './components/gamification/ProgressView';
import { StudentActivitiesView } from './components/student/StudentActivitiesView';

import {
  UserRole,
} from './types/auth';
import {
  Subject,
  Topic,
  StudentProgress,
  ClassRoom,
  Material,
  QuestionBankItem,
  Assessment,
  Announcement,
  ReflectionEntry,
  AITutorConfig,
} from './types/learning';
import {
  getStoredSubjects,
  saveSubjects,
  getStoredStudentProgress,
  saveStudentProgress,
  syncSubjectsWithGAS,
  getStudentProgressForId,
  saveStudentProgressForId,
  getStoredQuestionBank,
  saveQuestionBank,
  getStoredAssessments,
  saveAssessments,
} from './data/learningData';
import {
  INITIAL_CLASSES,
  INITIAL_MATERIALS,
  INITIAL_QUESTION_BANK,
  INITIAL_ASSESSMENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_REFLECTIONS,
  INITIAL_AI_CONFIGS,
} from './data/initialData';

function MainAppContent() {
  const { user, role, isAuthenticated, logout, usersList, refreshUsers } = useAuth();

  // Navigation View State
  const [currentView, setCurrentView] = useState<string>('landing');
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Learning & Management Datasets
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<StudentProgress>(getStoredStudentProgress());
  const [classesList] = useState<ClassRoom[]>(INITIAL_CLASSES);
  const [materialsList] = useState<Material[]>(INITIAL_MATERIALS);
  const [questionBankList, setQuestionBankList] = useState<QuestionBankItem[]>(getStoredQuestionBank());
  const [assessmentsList, setAssessmentsList] = useState<Assessment[]>(getStoredAssessments());
  const [announcementsList] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [reflectionsList] = useState<ReflectionEntry[]>(INITIAL_REFLECTIONS);
  const [aiConfigsList] = useState<AITutorConfig[]>(INITIAL_AI_CONFIGS);

  // Selected Active Learning State
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  useEffect(() => {
    const loadedSubs = getStoredSubjects();
    setSubjects(loadedSubs);
    if (loadedSubs.length > 0) {
      setSelectedSubject(loadedSubs[0]);
      if (loadedSubs[0].topics.length > 0) {
        setSelectedTopic(loadedSubs[0].topics[0]);
      }
    }

    // Synchronize with Google Apps Script Sheets DB
    syncSubjectsWithGAS().then((synced) => {
      setSubjects(synced);
      if (synced.length > 0 && !selectedSubject) {
        setSelectedSubject(synced[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (user && user.role === 'MURID') {
      const p = getStudentProgressForId(user.id, user.name, user.avatar);
      setProgress(p);
    }
  }, [user]);

  const persistProgress = (prog: StudentProgress) => {
    setProgress(prog);
    saveStudentProgress(prog);
    if (user && user.role === 'MURID') {
      saveStudentProgressForId(user.id, prog);
    }
  };

  // Sync role redirect upon login
  const handleLoginSuccess = (userRole: UserRole) => {
    if (userRole === 'ADMIN') setCurrentView('admin-dashboard');
    else if (userRole === 'GURU') setCurrentView('teacher-dashboard');
    else setCurrentView('student-dashboard');
  };

  // Role Access Guard Verification (Requirement #4)
  const verifyAccessAndNavigate = (targetView: string) => {
    if (!isAuthenticated && targetView !== 'landing' && targetView !== 'login') {
      setCurrentView('login');
      return;
    }

    if (role === 'MURID' && (targetView.startsWith('guru') || targetView.startsWith('admin'))) {
      setAccessDeniedMessage('Maaf, Anda tidak memiliki akses ke halaman ini.');
      setCurrentView('student-dashboard');
      setTimeout(() => setAccessDeniedMessage(null), 4000);
      return;
    }

    if (role === 'GURU' && targetView.startsWith('admin')) {
      setAccessDeniedMessage('Maaf, Anda tidak memiliki akses ke halaman ini.');
      setCurrentView('teacher-dashboard');
      setTimeout(() => setAccessDeniedMessage(null), 4000);
      return;
    }

    setCurrentView(targetView);
  };

  const handleAddSubject = (newSubject: Subject) => {
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleSelectSubject = (subjectId: string) => {
    const found = subjects.find((s) => s.id === subjectId) || subjects[0];
    setSelectedSubject(found);
    setCurrentView('topic-selector');
  };

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setActiveStepIndex(0);
    setCurrentView('learning-journey');
  };

  // Dynamic Step Advance Handler for Student
  const handleAdvanceStep = (completedIndex: number) => {
    if (!selectedTopic) return;

    const updatedSteps = selectedTopic.steps.map((step, idx) => {
      if (idx === completedIndex) return { ...step, isCompleted: true };
      if (idx === completedIndex + 1) return { ...step, isUnlocked: true };
      return step;
    });

    const updatedTopic = { ...selectedTopic, steps: updatedSteps };
    setSelectedTopic(updatedTopic);

    if (selectedSubject) {
      const updatedSubTopics = selectedSubject.topics.map((t) =>
        t.id === updatedTopic.id ? updatedTopic : t
      );
      const updatedSubject = { ...selectedSubject, topics: updatedSubTopics };
      setSelectedSubject(updatedSubject);

      const updatedSubjects = subjects.map((s) =>
        s.id === updatedSubject.id ? updatedSubject : s
      );
      setSubjects(updatedSubjects);
      saveSubjects(updatedSubjects);
    }

    const stepType = selectedTopic.steps[completedIndex]?.type;
    let badgeToUnlock: string | null = null;
    if (stepType === 'ai_tutor') badgeToUnlock = 'ai_learner';
    if (stepType === 'coding') badgeToUnlock = 'code_creator';
    if (stepType === 'hots') badgeToUnlock = 'critical_thinker';

    const newXp = progress.xp + 20;
    const updatedBadges = progress.badges.map((b) => {
      if (b.id === badgeToUnlock) {
        return { ...b, unlocked: true, unlockedAt: 'Baru saja' };
      }
      return b;
    });

    const updatedProg: StudentProgress = {
      ...progress,
      xp: newXp,
      level: Math.floor(newXp / 100) + 1,
      badges: updatedBadges,
    };
    persistProgress(updatedProg);

    if (completedIndex + 1 < selectedTopic.steps.length) {
      setActiveStepIndex(completedIndex + 1);
    }
  };

  const handleCompleteAssessment = (score: number) => {
    if (!selectedTopic) return;

    const addedXp = score >= 80 ? 150 : 100;
    const newXp = progress.xp + addedXp;

    const updatedBadges = progress.badges.map((b) => {
      if (b.id === 'problem_solver' && score >= 80) {
        return { ...b, unlocked: true, unlockedAt: 'Baru saja' };
      }
      return b;
    });

    const updatedProg: StudentProgress = {
      ...progress,
      xp: newXp,
      level: Math.floor(newXp / 100) + 1,
      badges: updatedBadges,
      topicScores: {
        ...progress.topicScores,
        [selectedTopic.id]: score,
      },
    };
    persistProgress(updatedProg);

    handleAdvanceStep(8);
  };

  const handleFinishTopic = () => {
    const updatedBadges = progress.badges.map((b) => {
      if (b.id === 'prima_master') {
        return { ...b, unlocked: true, unlockedAt: 'Baru saja' };
      }
      return b;
    });

    const newXp = progress.xp + 100;
    const updatedProg: StudentProgress = {
      ...progress,
      xp: newXp,
      level: Math.floor(newXp / 100) + 1,
      completedTopicsCount: progress.completedTopicsCount + 1,
      badges: updatedBadges,
    };
    persistProgress(updatedProg);
    setCurrentView('student-dashboard');
  };

  const handleRewardXp = (points: number, title: string) => {
    const newXp = progress.xp + points;
    const updatedProg: StudentProgress = {
      ...progress,
      xp: newXp,
      level: Math.floor(newXp / 100) + 1,
    };
    persistProgress(updatedProg);
  };

  const handleQuickMenuSelect = (menuId: string) => {
    if (menuId === 'subject-selector') {
      setCurrentView('subject-selector');
    } else if (menuId === 'simulation-menu') {
      setCurrentView('student-activities');
    } else if (menuId === 'progress-view' || menuId === 'badges-menu') {
      setCurrentView('progress-view');
    } else if (selectedTopic) {
      setCurrentView('learning-journey');
      if (menuId === 'video-menu') setActiveStepIndex(3);
      else if (menuId === 'ai-tutor-menu') setActiveStepIndex(4);
      else if (menuId === 'coding-menu') setActiveStepIndex(6);
      else if (menuId === 'assessment-menu') setActiveStepIndex(8);
    } else {
      setCurrentView('student-activities');
    }
  };

  const currentStep = selectedTopic?.steps[activeStepIndex];

  return (
    <div className="min-h-screen flex flex-col bg-app-theme text-slate-800">
      <Toaster position="top-right" />
      
      {/* Access Denied Alert Toast */}
      {accessDeniedMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-2xl border border-rose-400 animate-fadeIn">
          {accessDeniedMessage}
        </div>
      )}

      {/* Conditionally Render Navbar when NOT in landing, login, admin, or teacher views */}
      {currentView !== 'landing' && currentView !== 'login' && currentView !== 'admin-dashboard' && currentView !== 'teacher-dashboard' && (
        <Navbar
          role={role === 'GURU' ? 'teacher' : 'student'}
          onSwitchRole={(r) => {
            if (r === 'teacher') verifyAccessAndNavigate('teacher-dashboard');
            else verifyAccessAndNavigate('student-dashboard');
          }}
          currentView={currentView}
          onNavigate={verifyAccessAndNavigate}
          onRequestLogout={() => setShowLogoutModal(true)}
          xp={progress.xp}
          streak={progress.streakDays}
          studentName={progress.studentName}
        />
      )}

      {/* Router Content */}
      <main className="flex-1">
        
        {/* LANDING PAGE */}
        {currentView === 'landing' && (
          <HeroSection
            onStartLearning={() => {
              if (isAuthenticated) {
                if (role === 'ADMIN') setCurrentView('admin-dashboard');
                else if (role === 'GURU') setCurrentView('teacher-dashboard');
                else setCurrentView('student-dashboard');
              } else {
                setCurrentView('login');
              }
            }}
          />
        )}

        {/* SINGLE UNIFIED LOGIN PAGE */}
        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBackToLanding={() => setCurrentView('landing')}
          />
        )}

        {/* ADMIN DASHBOARD */}
        {currentView === 'admin-dashboard' && user && role === 'ADMIN' && (
          <AdminDashboard
            currentUser={user}
            usersList={usersList}
            subjectsList={subjects}
            classesList={classesList}
            onRefreshData={refreshUsers}
            onRequestLogout={() => setShowLogoutModal(true)}
          />
        )}

        {/* TEACHER DASHBOARD */}
        {currentView === 'teacher-dashboard' && user && role === 'GURU' && (
          <TeacherDashboard
            currentUser={user}
            usersList={usersList}
            subjectsList={subjects}
            classesList={classesList}
            materialsList={materialsList}
            questionBankList={questionBankList}
            assessmentsList={assessmentsList}
            announcementsList={announcementsList}
            reflectionsList={reflectionsList}
            aiConfigsList={aiConfigsList}
            onAddSubject={handleAddSubject}
            onRefreshData={refreshUsers}
            onRequestLogout={() => setShowLogoutModal(true)}
            onUpdateQuestionBank={setQuestionBankList}
            onUpdateAssessments={setAssessmentsList}
          />
        )}

        {/* STUDENT DASHBOARD */}
        {currentView === 'student-dashboard' && user && role === 'MURID' && (
          <StudentDashboardView
            currentUser={user}
            progress={progress}
            subjects={subjects}
            onSelectMenu={handleQuickMenuSelect}
            onSelectSubject={handleSelectSubject}
            onRequestLogout={() => setShowLogoutModal(true)}
          />
        )}

        {/* SUBJECT SELECTOR */}
        {currentView === 'subject-selector' && (
          <SubjectSelector
            subjects={subjects}
            onSelectSubject={handleSelectSubject}
            onAddSubject={handleAddSubject}
          />
        )}

        {/* TOPIC SELECTOR */}
        {currentView === 'topic-selector' && selectedSubject && (
          <TopicSelector
            subject={selectedSubject}
            onBack={() => setCurrentView('subject-selector')}
            onSelectTopic={handleSelectTopic}
          />
        )}

        {/* ACTIVE LEARNING JOURNEY */}
        {currentView === 'learning-journey' && selectedTopic && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <LearningJourneyMap
              topic={selectedTopic}
              activeStepIndex={activeStepIndex}
              onSelectStep={(idx) => setActiveStepIndex(idx)}
            />

            {currentStep && (
              <div>
                {currentStep.type === 'pemantik' && (
                  <PemantikStep 
                    content={currentStep.content} 
                    topicTitle={selectedTopic.title}
                    subjectName={selectedSubject?.name}
                    onNext={() => handleAdvanceStep(0)} 
                  />
                )}
                {currentStep.type === 'eksplorasi' && (
                  <EksplorasiStep 
                    content={currentStep.content} 
                    topicTitle={selectedTopic.title}
                    subjectName={selectedSubject?.name}
                    onNext={() => handleAdvanceStep(1)} 
                  />
                )}
                {currentStep.type === 'interaksi' && (
                  <InteraksiStep content={currentStep.content} onNext={() => handleAdvanceStep(2)} />
                )}
                {currentStep.type === 'video' && (
                  <VideoPlayerStep
                    content={currentStep.content}
                    subjectId={selectedSubject?.id}
                    subjectName={selectedSubject?.name}
                    onNext={() => handleAdvanceStep(3)}
                  />
                )}
                {currentStep.type === 'ai_tutor' && (
                  <AITutorStep
                    content={currentStep.content}
                    topicTitle={selectedTopic.title}
                    subjectName={selectedSubject?.name}
                    onNext={() => handleAdvanceStep(4)}
                  />
                )}
                {currentStep.type === 'simulasi' && (
                  <SimulasiStep content={currentStep.content} onNext={() => handleAdvanceStep(5)} />
                )}
                {currentStep.type === 'coding' && (
                  <CodingChallengeStep 
                    content={currentStep.content} 
                    subjectId={selectedSubject?.id}
                    onNext={() => handleAdvanceStep(6)} 
                  />
                )}
                {currentStep.type === 'hots' && (
                  <HotsChallengeStep content={currentStep.content} onNext={() => handleAdvanceStep(7)} />
                )}
                {currentStep.type === 'asesmen' && (
                  (() => {
                    const activeAss = assessmentsList.find(
                      a => a.subjectId?.toLowerCase() === selectedSubject?.id?.toLowerCase() && a.status === 'AKTIF'
                    );
                    const finalContent = activeAss ? { questions: activeAss.questions } : currentStep.content;
                    return (
                      <AsesmenStep content={finalContent} onComplete={handleCompleteAssessment} />
                    );
                  })()
                )}
                {currentStep.type === 'refleksi' && (
                  <RefleksiStep
                    content={currentStep.content}
                    topicTitle={selectedTopic.title}
                    subjectName={selectedSubject?.name}
                    onFinishTopic={handleFinishTopic}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* PROGRESS VIEW */}
        {currentView === 'progress-view' && (
          <ProgressView progress={progress} onBack={() => setCurrentView('student-dashboard')} />
        )}

        {/* STUDENT ACTIVITIES & SIMULATION VIEW */}
        {currentView === 'student-activities' && (
          <StudentActivitiesView
            subjects={subjects}
            onBack={() => setCurrentView('student-dashboard')}
            onRewardXp={handleRewardXp}
          />
        )}

      </main>

      {/* Conditionally Render Footer */}
      {currentView !== 'landing' && currentView !== 'login' && currentView !== 'admin-dashboard' && currentView !== 'teacher-dashboard' && <Footer />}

      {/* Logout Dialog */}
      <LogoutDialog
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
          setCurrentView('login');
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
