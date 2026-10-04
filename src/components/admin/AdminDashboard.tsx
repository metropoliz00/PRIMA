import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Users, GraduationCap, BookOpen, Layers, ShieldCheck, Activity, Settings, LogOut, Plus, Search, Edit3, Trash2, KeyRound, CheckCircle, XCircle, UserCheck, FileText, Lock, Sliders, Database, Server, BarChart3, X
} from 'lucide-react';
import { User, UserRole } from '../../types/auth';
import { Subject, ClassRoom } from '../../types/learning';
import { createUser, updateUser, deleteUser } from '../../services/authService';

interface AdminDashboardProps {
  currentUser: User;
  usersList: User[];
  subjectsList: Subject[];
  classesList: ClassRoom[];
  onRefreshData: () => void;
  onRequestLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  usersList,
  subjectsList,
  classesList,
  onRefreshData,
  onRequestLogout,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState<UserRole | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Password reset modal state
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Delete confirmation modal state
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Classes & Subjects local state for interactive edit/delete
  const [localClasses, setLocalClasses] = useState<ClassRoom[]>(classesList);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [classForm, setClassForm] = useState({ name: '', grade: 5 });

  const [localSubjects, setLocalSubjects] = useState<Subject[]>(subjectsList);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', grade: 5 });

  // Form states for creating/editing user
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'MURID' as UserRole,
    grade: 5,
    studentNumber: '01',
    nip: '',
  });

  const handleOpenAddUser = (role: UserRole) => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      email: '',
      role: role,
      grade: 5,
      studentNumber: '01',
      nip: '',
    });
    setShowAddUserModal(role);
  };

  const handleStartEditUser = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      username: u.username,
      password: '',
      email: u.email || '',
      role: u.role,
      grade: u.grade || 5,
      studentNumber: u.studentNumber || '01',
      nip: u.nip || '',
    });
    setShowAddUserModal(u.role);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        grade: formData.role === 'MURID' ? Number(formData.grade) : undefined,
        studentNumber: formData.role === 'MURID' ? formData.studentNumber : undefined,
        nip: formData.role === 'GURU' ? formData.nip : undefined,
      });
      setEditingUser(null);
      setShowAddUserModal(null);
      toast.success('Data akun berhasil diperbarui!');
    } else {
      createUser({
        name: formData.name,
        username: formData.username,
        passwordHash: formData.password || '123456',
        email: formData.email,
        role: formData.role,
        status: 'ACTIVE',
        avatar: formData.role === 'GURU'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : formData.role === 'MURID'
          ? '/prima_avatar_1791033365222.jpg'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        grade: formData.role === 'MURID' ? Number(formData.grade) : undefined,
        studentNumber: formData.role === 'MURID' ? formData.studentNumber : undefined,
        nip: formData.role === 'GURU' ? formData.nip : undefined,
      });
      setShowAddUserModal(null);
      toast.success('Akun baru berhasil dibuat!');
    }
    onRefreshData();
  };

  const handleOpenResetPassword = (user: User) => {
    setResettingUser(user);
    setNewPasswordInput('123456');
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resettingUser && newPasswordInput.trim()) {
      updateUser(resettingUser.id, { passwordHash: newPasswordInput.trim() });
      toast.success(`Password akun ${resettingUser.username} telah diperbarui!`);
      setResettingUser(null);
      setNewPasswordInput('');
      onRefreshData();
    }
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateUser(user.id, { status: newStatus });
    toast.success(`Status akun ${user.username} diubah menjadi ${newStatus}.`);
    onRefreshData();
  };

  const handleConfirmDeleteUser = () => {
    if (deletingUser) {
      deleteUser(deletingUser.id);
      toast.success(`Akun ${deletingUser.name} berhasil dihapus.`);
      setDeletingUser(null);
      onRefreshData();
    }
  };

  // Class Management Handlers
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassForm({ name: '', grade: 5 });
    setShowClassModal(true);
  };

  const handleStartEditClass = (c: ClassRoom) => {
    setEditingClass(c);
    setClassForm({ name: c.name, grade: c.grade || 5 });
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      setLocalClasses(localClasses.map((c) => (c.id === editingClass.id ? { ...c, name: classForm.name, grade: Number(classForm.grade) } : c)));
      toast.success(`Kelas ${classForm.name} berhasil diperbarui!`);
    } else {
      const newCls: ClassRoom = {
        id: `cls-${Date.now()}`,
        name: classForm.name,
        grade: Number(classForm.grade),
        academicYear: '2026/2027',
        teacherId: 'usr-guru-1',
        studentIds: [],
        avgProgress: 0,
        avgScore: 0,
        lastActivity: 'Hari ini',
      };
      setLocalClasses([newCls, ...localClasses]);
      toast.success(`Kelas ${classForm.name} berhasil ditambahkan!`);
    }
    setShowClassModal(false);
    setEditingClass(null);
  };

  const handleDeleteClass = (id: string) => {
    setLocalClasses(localClasses.filter((c) => c.id !== id));
    toast.success('Kelas berhasil dihapus.');
  };

  // Subject Management Handlers
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubjectForm({ name: '', description: '', grade: 5 });
    setShowSubjectModal(true);
  };

  const handleStartEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectForm({ name: sub.name, description: sub.description, grade: sub.grade });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      setLocalSubjects(localSubjects.map((s) => (s.id === editingSubject.id ? { ...s, name: subjectForm.name, description: subjectForm.description, grade: Number(subjectForm.grade) } : s)));
      toast.success(`Mata pelajaran ${subjectForm.name} berhasil diperbarui!`);
    } else {
      const newSub: Subject = {
        id: `sub-${Date.now()}`,
        name: subjectForm.name,
        description: subjectForm.description,
        grade: Number(subjectForm.grade),
        icon: 'BookOpen',
        color: 'from-blue-500 to-indigo-600',
        bgGradient: 'from-blue-500 to-indigo-600',
        topics: [],
      };
      setLocalSubjects([newSub, ...localSubjects]);
      toast.success(`Mata pelajaran ${subjectForm.name} berhasil ditambahkan!`);
    }
    setShowSubjectModal(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (id: string) => {
    setLocalSubjects(localSubjects.filter((s) => s.id !== id));
    toast.success('Mata pelajaran berhasil dihapus.');
  };

  const teachersList = usersList.filter((u) => u.role === 'GURU');
  const studentsList = usersList.filter((u) => u.role === 'MURID');

  const filteredUsers = usersList.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adminSidebarMenus = [
    { id: 'dashboard', label: 'Dashboard Admin', icon: Activity },
    { id: 'guru', label: 'Kelola Guru', icon: GraduationCap, badge: teachersList.length },
    { id: 'murid', label: 'Kelola Murid', icon: Users, badge: studentsList.length },
    { id: 'kelas', label: 'Kelola Kelas', icon: Layers, badge: localClasses.length },
    { id: 'subjects', label: 'Mata Pelajaran', icon: BookOpen, badge: localSubjects.length },
    { id: 'konten', label: 'Manajemen Konten', icon: FileText },
    { id: 'roles', label: 'Manajemen Role', icon: ShieldCheck },
    { id: 'aktivitas', label: 'Aktivitas Sistem', icon: Server },
    { id: 'laporan', label: 'Laporan Sistem', icon: BarChart3 },
    { id: 'pengaturan', label: 'Pengaturan System', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-xl flex items-center justify-center">
              A
            </div>
            <div>
              <img
                src="https://www.image2url.com/r2/default/images/1791081003852-29690838-3a1e-4ee9-84af-b9c54ebbfc00.png"
                alt="PRIMA"
                className="h-6 w-auto object-contain select-none filter brightness-110 mb-1"
              />
              <h2 className="font-heading font-black text-white text-xs tracking-tight">ADMIN</h2>
              <p className="text-[10px] font-semibold text-slate-300 leading-tight mt-0.5">
                <span className="text-emerald-400 font-extrabold">P</span>embelajaran{' '}
                <span className="text-cyan-300 font-extrabold">R</span>esponsif{' '}
                <span className="text-amber-300 font-extrabold">I</span>nteraktif berbasis{' '}
                <span className="text-rose-400 font-extrabold">M</span>ultimedia dan{' '}
                <span className="text-indigo-300 font-extrabold">A</span>I
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1 text-xs font-bold max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar">
            {adminSidebarMenus.map((menu) => {
              const Icon = menu.icon;
              const isActive = activeTab === menu.id;
              return (
                <button
                  key={menu.id}
                  onClick={() => setActiveTab(menu.id)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                    isActive ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{menu.label}</span>
                  </div>
                  {menu.badge !== undefined && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {menu.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <img src={currentUser.avatar} alt="Admin" className="w-9 h-9 rounded-xl object-cover ring-2 ring-purple-500" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onRequestLogout}
            className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>KELUAR</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
        
        {/* Top bar search and status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl text-slate-900">
              {adminSidebarMenus.find((m) => m.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-500">Panel Kontrol & Manajemen Basis Data Sistem PRIMA</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari user / data..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-3xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Guru</span>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><GraduationCap className="w-4 h-4" /></div>
                </div>
                <p className="font-heading font-black text-2xl text-slate-900">{teachersList.length}</p>
                <p className="text-[10px] text-emerald-600 font-bold">● Akun Pengajar Aktif</p>
              </div>

              <div className="glass-card p-5 rounded-3xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Siswa</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Users className="w-4 h-4" /></div>
                </div>
                <p className="font-heading font-black text-2xl text-slate-900">{studentsList.length}</p>
                <p className="text-[10px] text-emerald-600 font-bold">● Terdaftar di Kelas</p>
              </div>

              <div className="glass-card p-5 rounded-3xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Ruang Kelas</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600"><Layers className="w-4 h-4" /></div>
                </div>
                <p className="font-heading font-black text-2xl text-slate-900">{localClasses.length}</p>
                <p className="text-[10px] text-purple-600 font-bold">● Ruang Kelas Aktif</p>
              </div>

              <div className="glass-card p-5 rounded-3xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Mata Pelajaran</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><BookOpen className="w-4 h-4" /></div>
                </div>
                <p className="font-heading font-black text-2xl text-slate-900">{localSubjects.length}</p>
                <p className="text-[10px] text-amber-600 font-bold">● Modul Pembelajaran</p>
              </div>
            </div>

            {/* Quick User List */}
            <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-slate-900 text-lg">Daftar Pengguna Sistem Terbaru</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenAddUser('GURU')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Guru</span>
                  </button>
                  <button
                    onClick={() => handleOpenAddUser('MURID')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Murid</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="p-3">Pengguna</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Username</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="p-3 flex items-center gap-2.5">
                          <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email || '-'}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'GURU' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{u.username}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className="cursor-pointer"
                            title="Klik untuk ubah status"
                          >
                            {u.status === 'ACTIVE' ? (
                              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                <CheckCircle className="w-3.5 h-3.5" /> Aktif
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-rose-500 font-bold">
                                <XCircle className="w-3.5 h-3.5" /> Nonaktif
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="p-3 text-right space-x-1">
                          <button
                            onClick={() => handleStartEditUser(u)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer"
                            title="Edit Data User"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenResetPassword(u)}
                            className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 cursor-pointer"
                              title="Hapus User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. KELOLA GURU */}
        {activeTab === 'guru' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-slate-900">Manajemen Akun Guru</h3>
              <button
                onClick={() => handleOpenAddUser('GURU')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Akun Guru</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-3">Nama Guru</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">NIP</th>
                    <th className="p-3">Email</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachersList.map((g) => (
                    <tr key={g.id}>
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <img src={g.avatar} className="w-8 h-8 rounded-full object-cover" />
                        <span>{g.name}</span>
                      </td>
                      <td className="p-3 font-mono">{g.username}</td>
                      <td className="p-3 text-slate-500">{g.nip || '-'}</td>
                      <td className="p-3 text-slate-500">{g.email}</td>
                      <td className="p-3 text-right space-x-1.5">
                        <button onClick={() => handleStartEditUser(g)} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-bold text-[10px] cursor-pointer">Edit</button>
                        <button onClick={() => handleOpenResetPassword(g)} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-bold text-[10px] cursor-pointer">Reset Password</button>
                        <button onClick={() => setDeletingUser(g)} className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold text-[10px] cursor-pointer">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. KELOLA MURID */}
        {activeTab === 'murid' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-slate-900">Manajemen Akun Murid</h3>
              <button
                onClick={() => handleOpenAddUser('MURID')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Akun Murid</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">No. Absen</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsList.map((s) => (
                    <tr key={s.id}>
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <img src={s.avatar} className="w-8 h-8 rounded-full object-cover" />
                        <span>{s.name}</span>
                      </td>
                      <td className="p-3 font-mono">{s.username}</td>
                      <td className="p-3 font-bold text-indigo-600">Kelas {s.grade || 5} SD</td>
                      <td className="p-3 text-slate-500">{s.studentNumber || '-'}</td>
                      <td className="p-3 text-right space-x-1.5">
                        <button onClick={() => handleStartEditUser(s)} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-bold text-[10px] cursor-pointer">Edit</button>
                        <button onClick={() => handleOpenResetPassword(s)} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-bold text-[10px] cursor-pointer">Reset Password</button>
                        <button onClick={() => setDeletingUser(s)} className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold text-[10px] cursor-pointer">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. KELOLA KELAS */}
        {activeTab === 'kelas' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Manajemen Ruang Kelas</h3>
                <p className="text-xs text-slate-500">Kelola daftar rombel dan tingkat kelas aktif.</p>
              </div>
              <button
                onClick={handleOpenAddClass}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Kelas</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {localClasses.map((c) => (
                <div key={c.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative group hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Tingkat {c.grade || 5}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleStartEditClass(c)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer" title="Edit Kelas"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteClass(c.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 cursor-pointer" title="Hapus Kelas"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                  <p className="text-xs text-slate-500">Siswa Terdaftar: {c.studentIds?.length || 0} Murid</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. MATA PELAJARAN */}
        {activeTab === 'subjects' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Mata Pelajaran Sistem</h3>
                <p className="text-xs text-slate-500">Kelola daftar kurikulum dan mata pelajaran aktif.</p>
              </div>
              <button
                onClick={handleOpenAddSubject}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Mata Pelajaran</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {localSubjects.map((sub) => (
                <div key={sub.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative group hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Kelas {sub.grade}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleStartEditSubject(sub)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 cursor-pointer" title="Edit Mapel"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteSubject(sub.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 cursor-pointer" title="Hapus Mapel"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{sub.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{sub.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. MANAJEMEN KONTEN */}
        {activeTab === 'konten' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="font-heading text-lg font-bold text-slate-900">Manajemen Konten Pembelajaran</h3>
            <p className="text-xs text-slate-600">Administrator memiliki wewenang memoderasi seluruh modul materi, video, dan tantangan AI.</p>
          </div>
        )}

        {/* 7. MANAJEMEN ROLE */}
        {activeTab === 'roles' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="font-heading text-lg font-bold text-slate-900">Manajemen Role & Hak Akses</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 font-bold text-purple-900">ADMIN: Akses Penuh Seluruh Sistem</div>
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 font-bold text-sky-900">GURU: Akses Portal Pengajar & Modul Pembelajaran</div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 font-bold text-emerald-900">MURID: Akses Ruang Belajar & Tantangan Interaktif</div>
            </div>
          </div>
        )}

        {/* 8. AKTIVITAS SISTEM */}
        {activeTab === 'aktivitas' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="font-heading text-lg font-bold text-slate-900">System Audit Logs</h3>
            <div className="space-y-2 text-xs font-mono text-slate-600">
              <p className="p-2 bg-slate-50 rounded-lg border">[2026-10-03 14:02] LOGIN: User guru (GURU) berhasil masuk.</p>
              <p className="p-2 bg-slate-50 rounded-lg border">[2026-10-03 13:45] UPDATE: Guru Meyga menambahkan materi baru IPAS.</p>
            </div>
          </div>
        )}

        {/* 9. LAPORAN SISTEM */}
        {activeTab === 'laporan' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="font-heading text-lg font-bold text-slate-900">Laporan Statistik Platform</h3>
            <p className="text-xs text-slate-600">Laporan bulanan penggunaan platform, keaktifan siswa, dan pemanfaatan AI Tutor.</p>
          </div>
        )}

        {/* 10. PENGATURAN SYSTEM */}
        {activeTab === 'pengaturan' && (
          <div className="glass-card p-6 rounded-3xl border border-slate-200 space-y-4 animate-fadeIn">
            <h3 className="font-heading text-lg font-bold text-slate-900">Pengaturan Global Sistem</h3>
            <p className="text-xs text-slate-600">Atur preferensi server, backup basis data, dan konfigurasi API key AI Studio.</p>
          </div>
        )}

      </main>

      {/* Add / Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-md w-full space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-black text-xl text-slate-900">
                {editingUser ? `Edit Data ${editingUser.name}` : `Buat Akun Baru (${showAddUserModal})`}
              </h3>
              <button onClick={() => { setShowAddUserModal(null); setEditingUser(null); }} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 mt-1"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Masukkan username..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@sekolah.sch.id"
                  className="w-full p-2.5 rounded-xl border border-slate-200 mt-1"
                />
              </div>

              {formData.role === 'MURID' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Tingkat Kelas</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 font-bold"
                    >
                      <option value={4}>Kelas 4</option>
                      <option value={5}>Kelas 5</option>
                      <option value={6}>Kelas 6</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">No. Absen</label>
                    <input
                      type="text"
                      value={formData.studentNumber}
                      onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                      placeholder="01"
                      className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 font-mono"
                    />
                  </div>
                </div>
              )}

              {formData.role === 'GURU' && (
                <div>
                  <label className="font-bold text-slate-700">NIP Pengajar</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="19850101..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 font-mono"
                  />
                </div>
              )}

              {!editingUser && (
                <div>
                  <label className="font-bold text-slate-700">Password Awal</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Default: 123456"
                    className="w-full p-2.5 rounded-xl border border-slate-200 mt-1"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowAddUserModal(null); setEditingUser(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow cursor-pointer"
                >
                  {editingUser ? 'Perbarui Akun' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resettingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-sm w-full space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900">Reset Password</h3>
              <button onClick={() => setResettingUser(null)} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Masukkan kata sandi baru untuk akun <strong>{resettingUser.name}</strong> (@{resettingUser.username}):
            </p>
            <form onSubmit={handleConfirmResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Password Baru</label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Ketik password baru..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 font-mono font-bold"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setResettingUser(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer shadow">
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-sm w-full space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-heading font-bold text-lg text-slate-900">Hapus Akun Pengguna</h3>
              <p className="text-xs text-slate-600">
                Apakah Anda yakin ingin menghapus akun <strong>{deletingUser.name}</strong> (@{deletingUser.username})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="button" onClick={() => setDeletingUser(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer">
                Batal
              </button>
              <button type="button" onClick={handleConfirmDeleteUser} className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow">
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-sm w-full space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                {editingClass ? 'Edit Ruang Kelas' : 'Tambah Ruang Kelas'}
              </h3>
              <button onClick={() => setShowClassModal(false)} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveClass} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Nama Kelas</label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="Contoh: Kelas 5A"
                  className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Tingkat Kelas (Grade)</label>
                <select
                  value={classForm.grade}
                  onChange={(e) => setClassForm({ ...classForm, grade: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 font-bold"
                >
                  <option value={4}>Kelas 4</option>
                  <option value={5}>Kelas 5</option>
                  <option value={6}>Kelas 6</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer shadow">
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 sm:p-8 rounded-3xl max-w-sm w-full space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
              </h3>
              <button onClick={() => setShowSubjectModal(false)} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="Contoh: Matematika"
                  className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Tingkat Kelas (Grade)</label>
                <select
                  value={subjectForm.grade}
                  onChange={(e) => setSubjectForm({ ...subjectForm, grade: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 mt-1 font-bold"
                >
                  <option value={4}>Kelas 4</option>
                  <option value={5}>Kelas 5</option>
                  <option value={6}>Kelas 6</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700">Deskripsi Ringkas</label>
                <textarea
                  rows={2}
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  placeholder="Deskripsi mata pelajaran..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 mt-1"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow">
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
