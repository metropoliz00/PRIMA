/**
 * Service to interact with the Google Apps Script Backend (Google Sheets DB)
 */

export const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwMtS3jHnfS2ubEKJskJh-WtYmbJh8KCow45xhFL4YzfLUUgjGUfC1nbdkRcLOhAXaL/exec';

/**
 * Fetch data from a specific sheet in Google Spreadsheet via GAS
 */
export const fetchAppData = async <T = any>(sheetName: string): Promise<T[]> => {
  try {
    const url = `${GAS_WEB_APP_URL}?action=read&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`[AppsScript] Failed to fetch data from sheet "${sheetName}":`, error);
    return [];
  }
};

/**
 * Push data to Google Spreadsheet via GAS (Create or Update or Cleanup)
 * Note: Uses text/plain to avoid CORS preflight OPTIONS rejection in Google Apps Script Web App
 */
export const pushAppData = async (sheetName: string, action: 'create' | 'update' | 'cleanupDuplicates', data: any): Promise<boolean> => {
  try {
    const url = `${GAS_WEB_APP_URL}?action=${action}&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      console.warn(`[AppsScript] Server responded with error status ${response.status}`);
      return false;
    }
    const resText = await response.text();
    return resText.includes('Success');
  } catch (error) {
    console.warn(`[AppsScript] Failed to push data (${action}) to "${sheetName}":`, error);
    return false;
  }
};

export const cleanupRemoteDuplicates = async (sheetName: string): Promise<boolean> => {
  return pushAppData(sheetName, 'cleanupDuplicates', {});
};

// --- Entity-specific Helpers ---

// Users (Admin, Guru, Murid)
export const getRemoteUsers = () => fetchAppData('Users');
export const createRemoteUser = (userData: any) => pushAppData('Users', 'create', userData);
export const updateRemoteUser = (userData: any) => pushAppData('Users', 'update', userData);

// Subjects (Mata Pelajaran)
export const getRemoteSubjects = () => fetchAppData('Subjects');
export const createRemoteSubject = (subjectData: any) => pushAppData('Subjects', 'create', subjectData);
export const updateRemoteSubject = (subjectData: any) => pushAppData('Subjects', 'update', subjectData);

// Materials (Materi Pembelajaran)
export const getRemoteMaterials = () => fetchAppData('Materials');
export const createRemoteMaterial = (materialData: any) => pushAppData('Materials', 'create', materialData);

// Assessments (Asesmen & Kuis)
export const getRemoteAssessments = () => fetchAppData('Assessments');
export const createRemoteAssessment = (assessmentData: any) => pushAppData('Assessments', 'create', assessmentData);

// Announcements (Pengumuman)
export const getRemoteAnnouncements = () => fetchAppData('Announcements');
export const createRemoteAnnouncement = (announcementData: any) => pushAppData('Announcements', 'create', announcementData);

// Reflections (Refleksi Siswa)
export const getRemoteReflections = () => fetchAppData('Reflections');
export const createRemoteReflection = (reflectionData: any) => pushAppData('Reflections', 'create', reflectionData);

// Classes (Kelas)
export const getRemoteClasses = () => fetchAppData('Classes');
export const createRemoteClass = (classData: any) => pushAppData('Classes', 'create', classData);

// Videos (Video Interaktif)
export const getRemoteVideos = () => fetchAppData('Videos');
export const createRemoteVideo = (videoData: any) => pushAppData('Videos', 'create', videoData);
export const updateRemoteVideo = (videoData: any) => pushAppData('Videos', 'update', videoData);

// Coding Challenges
export const getRemoteCodingChallenges = () => fetchAppData('CodingChallenges');
export const createRemoteCodingChallenge = (codingData: any) => pushAppData('CodingChallenges', 'create', codingData);
export const updateRemoteCodingChallenge = (codingData: any) => pushAppData('CodingChallenges', 'update', codingData);

// Questions (Bank Soal)
export const getRemoteQuestions = () => fetchAppData('Questions');
export const createRemoteQuestion = (questionData: any) => pushAppData('Questions', 'create', questionData);
export const updateRemoteQuestion = (questionData: any) => pushAppData('Questions', 'update', questionData);

// Analytics (Analitik Pembelajaran)
export const getRemoteAnalytics = () => fetchAppData('Analytics');
export const createRemoteAnalytics = (analyticsData: any) => pushAppData('Analytics', 'create', analyticsData);

// PRIMA AI Tutor Config (Konfigurasi Pedagogis AI Tutor)
export const getRemoteAITutorConfigs = () => fetchAppData('AITutorConfig');
export const createRemoteAITutorConfig = (configData: any) => pushAppData('AITutorConfig', 'create', configData);
export const updateRemoteAITutorConfig = (configData: any) => pushAppData('AITutorConfig', 'update', configData);

// PRIMA AI Chat Logs (Riwayat Chat & Tanya-Jawab AI Tutor)
export const getRemoteAIChatLogs = () => fetchAppData('AIChatLogs');
export const createRemoteAIChatLog = (logData: any) => pushAppData('AIChatLogs', 'create', logData);

// Leaderboard & Gamifikasi
export const getRemoteLeaderboard = () => fetchAppData('Leaderboard');
export const createRemoteLeaderboard = (leaderboardData: any) => pushAppData('Leaderboard', 'create', leaderboardData);

// App Settings (including global Text-To-Speech)
export const getRemoteSettings = () => fetchAppData('Settings');
export const createRemoteSetting = (settingData: any) => pushAppData('Settings', 'create', settingData);
export const updateRemoteSetting = (settingData: any) => pushAppData('Settings', 'update', settingData);

// Assessments (Asesmen Kuis)
export const updateRemoteAssessment = (assessmentData: any) => pushAppData('Assessments', 'update', assessmentData);
