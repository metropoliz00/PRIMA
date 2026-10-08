/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  InteractiveVideo,
} from './types/learning';
import {
  getStoredSubjects,
  saveSubjects,
  getStoredStudentProgress,
  saveStudentProgress,
  syncSubjectsWithGAS,
  getStudentProgressForId,
  saveStudentProgressForId,
  syncProgressWithGAS,
  getStoredQuestionBank,
  saveQuestionBank,
  syncQuestionsWithGAS,
  getStoredAssessments,
  saveAssessments,
  syncAssessmentsWithGAS,
  getStoredCodingChallenges,
  saveCodingChallenges,
  syncCodingChallengesWithGAS,
  CodingChallengeItem,
  getStoredMaterials,
  saveMaterials,
  syncMaterialsWithGAS,
  syncMaterialsWithSubjects,
  getStoredActivities,
  saveActivities,
  syncActivitiesWithGAS,
  InteractiveActivity,
  getStoredVideos,
  saveVideos,
  syncVideosWithGAS,
  getStoredClasses,
  saveClasses,
  syncClassesWithGAS,
  getStoredAnnouncements,
  saveAnnouncements,
  syncAnnouncementsWithGAS,
  getStoredReflections,
  saveReflections,
  syncReflectionsWithGAS,
  getStoredAiConfigs,
  saveAiConfigs,
  syncAiConfigsWithGAS,
} from './data/learningData';

function MainAppContent() {
  const { user, role, isAuthenticated, logout, usersList, refreshUsers } = useAuth();

  // Navigation View State
  const [currentView, setCurrentView] = useState<string>('landing');
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Logout Modal State
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Learning & Management Datasets
  const [subjects, setSubjects] = useState<Subject[]>(getStoredSubjects());
  const [progress, setProgress] = useState<StudentProgress>(getStoredStudentProgress());
  const [classesList, setClassesList] = useState<ClassRoom[]>(getStoredClasses());
  const [materialsList, setMaterialsList] = useState<Material[]>(getStoredMaterials());
  const [questionBankList, setQuestionBankList] = useState<QuestionBankItem[]>(getStoredQuestionBank());
  const [assessmentsList, setAssessmentsList] = useState<Assessment[]>(getStoredAssessments());
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>(getStoredAnnouncements());
  const [reflectionsList, setReflectionsList] = useState<ReflectionEntry[]>(getStoredReflections());
  const [aiConfigsList, setAiConfigsList] = useState<AITutorConfig[]>(getStoredAiConfigs());
  const [codingChallengesList, setCodingChallengesList] = useState<CodingChallengeItem[]>(getStoredCodingChallenges());
  const [activitiesList, setActivitiesList] = useState<InteractiveActivity[]>(getStoredActivities());
  const [videosList, setVideosList] = useState<InteractiveVideo[]>(getStoredVideos());

  // Selected Active Learning State
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  useEffect(() => {
    const loadedSubs = getStoredSubjects();
    const loadedMats = getStoredMaterials();
    setMaterialsList(loadedMats);
    const syncedSubs = syncMaterialsWithSubjects(loadedSubs, loadedMats);
    setSubjects(syncedSubs);
    if (syncedSubs.length > 0) {
      setSelectedSubject(syncedSubs[0]);
      if (syncedSubs[0].topics && syncedSubs[0].topics.length > 0) {
        setSelectedTopic(syncedSubs[0].topics[0]);
      }
    }

    // Synchronize all entities with Google Apps Script Sheets Database
    syncSubjectsWithGAS().then((synced) => {
      setSubjects((prev) => {
        const mergedWithMats = syncMaterialsWithSubjects(synced, materialsList);
        if (mergedWithMats.length > 0 && !selectedSubject) {
          setSelectedSubject(mergedWithMats[0]);
        }
        return mergedWithMats;
      });
    }).catch(() => {});

    syncVideosWithGAS().then((synced) => {
      if (synced) setVideosList(synced);
    }).catch(() => {});

    syncMaterialsWithGAS().then((synced) => {
      if (synced) {
        setMaterialsList(synced);
        setSubjects((prev) => syncMaterialsWithSubjects(prev, synced));
      }
    }).catch(() => {});

    syncQuestionsWithGAS().then((synced) => {
      if (synced) setQuestionBankList(synced);
    }).catch(() => {});

    syncAssessmentsWithGAS().then((synced) => {
      if (synced) setAssessmentsList(synced);
    }).catch(() => {});

    syncCodingChallengesWithGAS().then((synced) => {
      if (synced) setCodingChallengesList(synced);
    }).catch(() => {});

    syncActivitiesWithGAS().then((synced) => {
      if (synced) setActivitiesList(synced);
    }).catch(() => {});

    syncClassesWithGAS().then((synced) => {
      if (synced) setClassesList(synced);
    }).catch(() => {});

    syncAnnouncementsWithGAS().then((synced) => {
      if (synced) setAnnouncementsList(synced);
    }).catch(() => {});

    syncReflectionsWithGAS().then((synced) => {
      if (synced) setReflectionsList(synced);
    }).catch(() => {});

    syncAiConfigsWithGAS().then((synced) => {
      if (synced) setAiConfigsList(synced);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (user && user.role === 'MURID') {
      const p = getStudentProgressForId(user.id, user.name, user.avatar);
      setProgress(p);

      // Async sync from Google Sheets database for real XP/Streak/Level/etc
      syncProgressWithGAS(user.id, user.name, user.avatar).then((synced) => {
        setProgress(synced);
      }).catch(() => {});
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

  const handleAddSubject = useCallback((newSubject: Subject) => {
    setSubjects((prev) => {
      const updated = [...prev, newSubject];
      saveSubjects(updated);
      return updated;
    });
  }, []);

  const handleUpdateMaterials = useCallback((newMaterials: Material[]) => {
    setMaterialsList(newMaterials);
    saveMaterials(newMaterials);
    setSubjects((prevSubs) => {
      const updated = syncMaterialsWithSubjects(prevSubs, newMaterials);
      saveSubjects(updated);
      return updated;
    });
  }, []);

  const handleSelectSubject = useCallback((subjectId: string) => {
    setSubjects((prevSubs) => {
      const found = prevSubs.find((s) => s.id === subjectId) || prevSubs[0];
      setSelectedSubject(found);
      return prevSubs;
    });
    setCurrentView('topic-selector');
  }, []);

  const handleSelectTopic = useCallback((topic: Topic) => {
    setSelectedTopic(topic);
    setActiveStepIndex(0);
    setCurrentView('learning-journey');
  }, []);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleRewardXp = useCallback((points: number) => {
    setProgress((prev) => {
      const newXp = prev.xp + points;
      const updatedProg: StudentProgress = {
        ...prev,
        xp: newXp,
        level: Math.floor(newXp / 100) + 1,
      };
      persistProgress(updatedProg);
      return updatedProg;
    });
  }, []);

  const handleQuickMenuSelect = useCallback((menuId: string) => {
    if (menuId === 'subject-selector') {
      if (role === 'MURID') {
        setCurrentView('student-dashboard');
      } else {
        setCurrentView('subject-selector');
      }
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
  }, [selectedTopic]);

  const handleUpdateVideos = useCallback((updated: InteractiveVideo[]) => {
    setVideosList(updated);
    saveVideos(updated);
  }, []);

  const handleSelectVideoFromDashboard = useCallback((vid: InteractiveVideo) => {
    const vidSubStr = String(vid.subjectId || '').toLowerCase();
    const vidTitleStr = String(vid.title || '').toLowerCase();
    const sub = subjects.find(
      (s) => String(s.id || '').toLowerCase() === vidSubStr || String(s.name || '').toLowerCase().includes(vidSubStr)
    ) || subjects[0];

    if (sub) {
      setSelectedSubject(sub);
      if (sub.topics && sub.topics.length > 0) {
        const matchedTopic = sub.topics.find((t) => {
          const tTitleStr = String(t.title || '').toLowerCase();
          return tTitleStr.includes(vidTitleStr) || vidTitleStr.includes(tTitleStr);
        }) || sub.topics[0];

        const updatedSteps = matchedTopic.steps.map((step) => {
          if (step.type === 'video') {
            return {
              ...step,
              content: {
                ...step.content,
                videoUrl: vid.videoUrl,
                title: vid.title,
                checkpoints: vid.checkpoints,
              },
            };
          }
          return step;
        });

        setSelectedTopic({ ...matchedTopic, steps: updatedSteps });
      }
      setActiveStepIndex(3);
      setCurrentView('learning-journey');
    }
  }, [subjects]);

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
      <main className="flex-1 relative z-10">
        
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
            codingChallengesList={codingChallengesList}
            activitiesList={activitiesList}
            onAddSubject={handleAddSubject}
            onRefreshData={refreshUsers}
            onRequestLogout={() => setShowLogoutModal(true)}
            onUpdateQuestionBank={setQuestionBankList}
            onUpdateAssessments={setAssessmentsList}
            onUpdateCodingChallenges={setCodingChallengesList}
            onUpdateMaterials={handleUpdateMaterials}
            onUpdateActivities={setActivitiesList}
            onUpdateVideos={handleUpdateVideos}
            interactiveVideosList={videosList}
          />
        )}

        {/* STUDENT DASHBOARD */}
        {currentView === 'student-dashboard' && user && role === 'MURID' && (
          <StudentDashboardView
            currentUser={user}
            progress={progress}
            subjects={subjects}
            materials={materialsList}
            videosList={videosList}
            onSelectMenu={handleQuickMenuSelect}
            onSelectSubject={handleSelectSubject}
            onSelectVideo={handleSelectVideoFromDashboard}
            onRequestLogout={() => setShowLogoutModal(true)}
          />
        )}

        {/* SUBJECT SELECTOR (Only for Teachers / Admins) */}
        {currentView === 'subject-selector' && (
          role === 'MURID' ? (
            <StudentDashboardView
              currentUser={user!}
              progress={progress}
              subjects={subjects}
              materials={materialsList}
              videosList={videosList}
              onSelectMenu={handleQuickMenuSelect}
              onSelectSubject={handleSelectSubject}
              onSelectVideo={handleSelectVideoFromDashboard}
              onRequestLogout={() => setShowLogoutModal(true)}
            />
          ) : (
            <SubjectSelector
              subjects={subjects}
              canAddSubject={role === 'GURU' || role === 'ADMIN'}
              onSelectSubject={handleSelectSubject}
              onAddSubject={handleAddSubject}
              onBackToHome={() => {
                if (role === 'GURU') setCurrentView('teacher-dashboard');
                else if (role === 'ADMIN') setCurrentView('admin-dashboard');
                else setCurrentView('student-dashboard');
              }}
            />
          )
        )}

        {/* TOPIC SELECTOR */}
        {currentView === 'topic-selector' && selectedSubject && (
          <TopicSelector
            subject={selectedSubject}
            onBack={() => {
              if (role === 'MURID') {
                setCurrentView('student-dashboard');
              } else if (role === 'GURU') {
                setCurrentView('teacher-dashboard');
              } else {
                setCurrentView('subject-selector');
              }
            }}
            onSelectTopic={handleSelectTopic}
          />
        )}

        {/* ACTIVE LEARNING JOURNEY */}
        {currentView === 'learning-journey' && selectedTopic && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <LearningJourneyMap
              topic={selectedTopic}
              activeStepIndex={activeStepIndex}
              onBack={() => {
                if (role === 'MURID') {
                  setCurrentView('student-dashboard');
                } else if (selectedSubject) {
                  setCurrentView('topic-selector');
                } else {
                  setCurrentView('teacher-dashboard');
                }
              }}
              onSelectStep={(idx) => {
                const isUnlocked = idx === 0 || selectedTopic.steps.slice(0, idx).every(s => Boolean(s.isCompleted));
                if (isUnlocked) {
                  setActiveStepIndex(idx);
                } else {
                  const firstIncompleteIdx = selectedTopic.steps.findIndex((s) => !s.isCompleted);
                  setActiveStepIndex(firstIncompleteIdx !== -1 ? firstIncompleteIdx : 0);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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
                    videosList={videosList}
                    topicTitle={selectedTopic?.title}
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
                    challengesList={codingChallengesList}
                    onNext={() => handleAdvanceStep(6)} 
                  />
                )}
                {currentStep.type === 'hots' && (
                  <HotsChallengeStep content={currentStep.content} onNext={() => handleAdvanceStep(7)} />
                )}
                {currentStep.type === 'asesmen' && (
                  (() => {
                    const activeAss = assessmentsList.find(
                      a => String(a.subjectId || '').toLowerCase() === String(selectedSubject?.id || '').toLowerCase() && a.status === 'AKTIF'
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
            activitiesList={activitiesList}
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
          // Preserve persistent curriculum & teacher databases before clearing session cache
          const DB_KEYS = [
            'prima_interactive_videos',
            'prima_subjects',
            'prima_materials',
            'prima_question_bank',
            'prima_assessments',
            'prima_coding_challenges',
            'prima_activities',
            'prima_users',
            'prima_tts_enabled',
          ];
          const preserved: Record<string, string> = {};
          DB_KEYS.forEach((k) => {
            const val = localStorage.getItem(k);
            if (val) preserved[k] = val;
          });
          localStorage.clear();
          sessionStorage.clear();
          if (typeof window !== 'undefined' && 'caches' in window) {
            caches.keys().then((names) => names.forEach((n) => caches.delete(n))).catch(() => {});
          }
          // Restore curriculum & teacher database
          Object.entries(preserved).forEach(([k, val]) => {
            localStorage.setItem(k, val);
          });
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
