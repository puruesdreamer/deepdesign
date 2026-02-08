'use client';

import { useState, useEffect, useRef } from 'react';
import { Project } from '@/lib/data';
import Image from 'next/image';
import { Trash2, Plus, Upload, Save, X, Edit, Users, MessageSquare, LayoutGrid, GripVertical, Eye, EyeOff } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableProjectItem } from '@/components/admin/SortableProjectItem';
import { SortableTeamItem, TeamMember } from '@/components/admin/SortableTeamItem';
import { SortableImageItem } from '@/components/admin/SortableImageItem';

interface Message {
  id: number;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
}

const CATEGORIES = ["Hotel/酒店", "Villa/别墅", "Apartment/平层", "Other/其他"];

const getCategoryFolder = (category: string) => {
  if (category.includes('Hotel')) return 'projects/hotel';
  if (category.includes('Villa')) return 'projects/villa';
  if (category.includes('Apartment')) return 'projects/apartment';
  return 'projects/other';
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'team' | 'messages'>('projects');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [servicesInput, setServicesInput] = useState('');
  const [isNewProject, setIsNewProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]); 
  const [imagesPendingDeletion, setImagesPendingDeletion] = useState<string[]>([]);

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isNewMember, setIsNewMember] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [showPhotoDeleteConfirm, setShowPhotoDeleteConfirm] = useState(false);
  const [memberImagesPendingDeletion, setMemberImagesPendingDeletion] = useState<string[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleProjectDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            saveProjects(newOrder);
        }, 1000);
        return newOrder;
      });
    }
  };

  const handleTeamDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTeam((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        saveTeam(newOrder);
        return newOrder;
      });
    }
  };

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && editingProject) {
      const oldIndex = editingProject.images.indexOf(active.id as string);
      const newIndex = editingProject.images.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(editingProject.images, oldIndex, newIndex);
        setEditingProject({...editingProject, images: newOrder});
      }
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const savedPassword = localStorage.getItem('admin_password');
      if (savedPassword) {
        setPassword(savedPassword);
        try {
          const res = await fetch('/api/admin/messages', {
            headers: { 'Authorization': savedPassword }
          });
          if (res.ok) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('admin_password');
          }
        } catch (e) {
          // Network error or other issue, keep loading false
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects();
      fetchTeam();
      fetchMessages();
    }
  }, [isAuthenticated]);

  const getHeaders = () => {
    return {
      'Authorization': password,
      'Content-Type': 'application/json'
    };
  };

  const getAuthHeaders = () => {
      return {
          'Authorization': password
      };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
        const res = await fetch('/api/admin/messages', {
            headers: { 'Authorization': password }
        });

        if (res.ok) {
            setIsAuthenticated(true);
            localStorage.setItem('admin_password', password);
        } else {
            setLoginError('Password incorrect/密码错误');
        }
    } catch (e) {
        setLoginError('Login failed/登录失败');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/admin/projects', { headers: getAuthHeaders() });
      setProjects(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/admin/team', { headers: getAuthHeaders() });
      setTeam(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages', { headers: getAuthHeaders() });
      if (res.ok) {
        setMessages(await res.json());
        setSelectedMessages([]); 
      }
    } catch (err) { console.error(err); }
  };

  const handleSelectAllMessages = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map(m => m.id));
    }
  };

  const handleSelectMessage = (id: number) => {
    if (selectedMessages.includes(id)) {
      setSelectedMessages(selectedMessages.filter(mId => mId !== id));
    } else {
      setSelectedMessages([...selectedMessages, id]);
    }
  };

  const handleBulkDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    
    const newMessages = messages.filter(m => !selectedMessages.includes(m.id));
    
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ ids: selectedMessages }),
      });

      if (res.ok) {
        setShowBulkDeleteConfirm(false);
        setMessages(newMessages);
        setSelectedMessages([]);
      } else {
        alert('删除失败');
      }
    } catch (error) {
      alert('删除出错');
    }
  };

  const handleDeleteSingleMessage = async (id: number) => {
    const newMessages = messages.filter(m => m.id !== id);
    try {
        const res = await fetch('/api/admin/messages', {
            method: 'DELETE',
            headers: getHeaders(),
            body: JSON.stringify({ ids: [id] }),
        });
        if (res.ok) {
            setMessages(newMessages);
            setSelectedMessages(selectedMessages.filter(mId => mId !== id));
        } else {
            alert('删除失败');
        }
    } catch (error) {
        alert('删除出错');
    }
  };

  const handleProjectDelete = async (project: Project) => {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ id: project.id, images: project.images }),
      });
      
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== project.id));
        setProjectToDelete(null);
      } else {
        alert('删除失败');
      }
    } catch (error) {
      alert('删除出错');
    }
  };

  const handleProjectSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || isSaving) return;

    setIsSaving(true);
    try {
        const servicesArray = servicesInput.split(',').map(s => s.trim()).filter(s => s !== '');
        const projectToUpdate = { ...editingProject, services: servicesArray };

        let projectId = projectToUpdate.id;
        const isNew = isNewProject;
        
        if (isNew) {
            const maxId = projects.reduce((max, p) => (p.id > max ? p.id : max), 0);
            projectId = maxId + 1;
            projectToUpdate.id = projectId;
        }

        if (pendingFiles.length > 0) {
            const baseFolder = getCategoryFolder(projectToUpdate.category);
            const folderName = `${baseFolder}/${projectId}`;
            const newUrls: string[] = [];
            
            for (const file of pendingFiles) {
                const url = await uploadFile(file, folderName);
                if (url) newUrls.push(`${url}?t=${Date.now()}`);
            }
            
            projectToUpdate.images = [...projectToUpdate.images, ...newUrls];
        }

        let newProjects = [...projects];
        if (isNew) {
          newProjects.unshift(projectToUpdate);
        } else {
          newProjects = newProjects.map(p => (p.id === projectToUpdate.id ? projectToUpdate : p));
        }

        await saveProjects(newProjects);

        if (imagesPendingDeletion.length > 0) {
            await Promise.all(imagesPendingDeletion.map(url => 
                fetch('/api/admin/upload', {
                    method: 'DELETE',
                    headers: getHeaders(),
                    body: JSON.stringify({ url })
                })
            ));
        }

        setEditingProject(null);
        setIsNewProject(false);
        setPendingFiles([]); 
        setImagesPendingDeletion([]);
    } catch (error) {
        alert("Failed to save project. Please try again.");
    } finally {
        setIsSaving(false);
    }
  };

  const saveProjects = async (data: Project[]) => {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) setProjects(data);
      else alert('Failed to save.');
    } catch (error) { alert('Error saving.'); }
  };

  const handleMemberDelete = async (member: TeamMember) => {
    try {
      const res = await fetch('/api/admin/team', {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ id: member.id, image: member.image }),
      });

      if (res.ok) {
        setTeam(team.filter(m => m.id !== member.id));
        setMemberToDelete(null);
      } else {
        alert('删除失败');
      }
    } catch (error) {
      alert('删除出错');
    }
  };

  const handleMemberSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    let newTeam = [...team];
    if (isNewMember) {
      const maxId = team.reduce((max, m) => (m.id > max ? m.id : max), 0);
      newTeam.push({ ...editingMember, id: maxId + 1 });
    } else {
      newTeam = newTeam.map(m => (m.id === editingMember.id ? editingMember : m));
    }

    await saveTeam(newTeam);

    // Process pending deletions
    if (memberImagesPendingDeletion.length > 0) {
        await Promise.all(memberImagesPendingDeletion.map(url => 
            fetch('/api/admin/upload', {
                method: 'DELETE',
                headers: getHeaders(),
                body: JSON.stringify({ url })
            }).catch(e => console.error(e))
        ));
    }

    setEditingMember(null);
    setIsNewMember(false);
    setMemberImagesPendingDeletion([]);
  };

  const saveTeam = async (data: TeamMember[]) => {
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) setTeam(data);
      else alert('Failed to save team.');
    } catch (error) { alert('Error saving team.'); }
  };

  const uploadFile = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    try {
        const res = await fetch('/api/admin/upload', { 
            method: 'POST', 
            headers: { 'Authorization': password },
            body: formData 
        });
        
        const data = await res.json();
        
        if (!res.ok || data.error) {
          const errorDetails = data.details ? `\nDetails:\n${data.details.join('\n')}` : '';
          const cwdInfo = data.cwd ? `\nServer CWD: ${data.cwd}` : '';
          alert(`Upload Failed: ${data.error || 'Unknown error'}${errorDetails}${cwdInfo}`);
          return null;
        }
        
        return data.url;
    } catch (e: any) {
        alert(`Network Error during upload: ${e.message}`);
        return null;
    }
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingProject) return;
    
    // Show loading state if needed, or just process
    const newFiles = Array.from(files);
    setPendingFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMemberImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingMember) return;
    const url = await uploadFile(file, 'team');
    if (url) {
      if (editingMember.image && editingMember.image.startsWith('/images/uploads')) {
         setMemberImagesPendingDeletion(prev => [...prev, editingMember.image]);
      }
      // Add timestamp to prevent caching issues / 添加时间戳防止缓存问题
      setEditingMember({ ...editingMember, image: `${url}?t=${Date.now()}` });
    }
    e.target.value = '';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80 space-y-6">
          <h1 className="text-xl font-bold">Admin Login/管理员登录</h1>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="Enter admin password"
                autoFocus
              />
              <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
            </div>
          </div>
          
          {loginError && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg border border-red-100">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Login / 登录
          </button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r min-h-screen flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-xs text-gray-500 mt-1">Feng Yi Space Design</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left font-medium transition-colors ${activeTab === 'projects' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutGrid size={20} /> Projects/项目管理
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left font-medium transition-colors ${activeTab === 'team' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Users size={20} /> Team/团队管理
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left font-medium transition-colors ${activeTab === 'messages' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <MessageSquare size={20} /> Messages/消息
          </button>
        </nav>
        <div className="p-4 border-t">
          <button onClick={() => { setIsAuthenticated(false); setPassword(''); }} className="text-sm text-gray-500 hover:text-black">Logout/退出登录</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'projects' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">项目管理/Project Management</h2>
              <button
                onClick={() => {
                  setEditingProject({
                    id: 0, title: '', category: 'Hotel/酒店', description: '', year: new Date().getFullYear().toString(),
                    location: '', area: '', services: [], images: []
                  });
                  setServicesInput('');
                  setPendingFiles([]); 
                  setImagesPendingDeletion([]);
                  setIsNewProject(true);
                }}
                className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800"
              >
                <Plus size={18} /> 添加项目/Add Project
              </button>
            </div>

            {editingProject ? (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">{isNewProject ? 'New Project/添加项目' : 'Edit Project/编辑项目'}</h3>
                  <button onClick={() => { setEditingProject(null); setPendingFiles([]); setImagesPendingDeletion([]); }}><X className="text-gray-400 hover:text-black" /></button>
                </div>
                <form onSubmit={handleProjectSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Title/项目标题</label>
                      <input type="text" required value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Category/项目类别</label>
                      <select 
                        required 
                        value={editingProject.category} 
                        onChange={e => setEditingProject({...editingProject, category: e.target.value})} 
                        className="w-full border p-2 rounded"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-bold mb-1">Year/项目年份</label><input type="text" value={editingProject.year} onChange={e => setEditingProject({...editingProject, year: e.target.value})} className="w-full border p-2 rounded" /></div>
                      <div><label className="block text-sm font-bold mb-1">Area/项目面积</label><input type="text" value={editingProject.area} onChange={e => setEditingProject({...editingProject, area: e.target.value})} className="w-full border p-2 rounded" /></div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Services/项目服务</label>
                      <input type="text" value={servicesInput} onChange={e => setServicesInput(e.target.value)} className="w-full border p-2 rounded" placeholder="Interior, Lighting" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Location/项目位置</label>
                        <input type="text" value={editingProject.location} onChange={e => setEditingProject({...editingProject, location: e.target.value})} className="w-full border p-2 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Description/项目描述</label>
                      <textarea required rows={5} value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} className="w-full border p-2 rounded" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Images/项目图片 (Drag to reorder)</label>
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
                        <SortableContext items={editingProject.images} strategy={rectSortingStrategy}>
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            {editingProject.images.map((img) => (
                              <SortableImageItem 
                                key={img} 
                                url={img} 
                                onRemove={(url) => {
                                  const newImages = editingProject.images.filter((image) => image !== url);
                                  setEditingProject({...editingProject, images: newImages});
                                  if (url.startsWith('/images/uploads')) {
                                     setImagesPendingDeletion(prev => [...prev, url]);
                                  }
                                }}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                      <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded inline-flex items-center gap-2 text-sm font-medium">
                        <Upload size={16} /> Upload Images/上传图片
                        <input type="file" accept="image/*" multiple onChange={handleProjectImageUpload} className="hidden" />
                      </label>

                      {pendingFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3 bg-gray-50 p-2 rounded border border-dashed border-gray-300">
                           {pendingFiles.map((file, idx) => (
                             <div key={idx} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                               <span className="max-w-[150px] truncate" title={file.name}>{file.name}</span>
                               <button 
                                 type="button" 
                                 onClick={() => removePendingFile(idx)}
                                 className="hover:text-red-600"
                               >
                                 <X size={12} />
                               </button>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={() => { setEditingProject(null); setPendingFiles([]); setImagesPendingDeletion([]); }} className="px-6 py-2 rounded text-gray-600 hover:bg-gray-100">Cancel/取消</button>
                    <button type="submit" disabled={isSaving} className="px-6 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50">
                        {isSaving ? 'Saving.../保存中' : 'Save Project/保存项目'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
                <SortableContext items={projects} strategy={verticalListSortingStrategy}>
                  <div className="grid gap-4">
                    {projects.map(project => (
                      <SortableProjectItem 
                        key={project.id} 
                        project={project} 
                        onEdit={(p) => {
                          setEditingProject(p);
                          setServicesInput(p.services?.join(', ') || '');
                          setPendingFiles([]);
                          setImagesPendingDeletion([]);
                          setIsNewProject(false);
                        }}
                        onDelete={setProjectToDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            
            {projectToDelete && (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                 <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                   <h3 className="font-bold text-lg mb-2">Delete Project/删除项目?</h3>
                   <p className="text-gray-600 mb-6">Are you sure you want to delete {projectToDelete.title}? This cannot be undone.</p>
                   <div className="flex justify-end gap-3">
                     <button onClick={() => setProjectToDelete(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel/取消</button>
                     <button onClick={() => handleProjectDelete(projectToDelete)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete/删除</button> 
                   </div>
                 </div>
               </div>
            )}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Team Management/团队管理</h2>
              <button
                onClick={() => { setEditingMember({ id: 0, name: '', role: '', image: '' }); setIsNewMember(true); }}
                className="bg-black text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-800"
              >
                <Plus size={18} /> Add Member/添加成员
              </button>
            </div>

            {editingMember ? (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">{isNewMember ? 'New Member/新增成员' : 'Edit Member/编辑成员'}</h3>
                  <button onClick={() => setEditingMember(null)}><X className="text-gray-400 hover:text-black" /></button>
                </div>
                <form onSubmit={handleMemberSave} className="space-y-4">
                  <div><label className="block text-sm font-bold mb-1">Name/姓名</label><input required type="text" value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} className="w-full border p-2 rounded" /></div>
                  <div><label className="block text-sm font-bold mb-1">Role/角色</label><input required type="text" value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value})} className="w-full border p-2 rounded" /></div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Photo/照片</label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden group">
                        {editingMember.image ? (
                          <>
                            {/* Use standard img tag for immediate feedback on new uploads to bypass Next.js optimization cache issues */}
                            <img 
                              src={editingMember.image} 
                              alt="" 
                              className="w-full h-full object-cover" 
                            />
                            <button
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowPhotoDeleteConfirm(true);
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 z-10 transition-opacity"
                              title="Remove Photo"
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-300"><Users /></div>
                        )}
                      </div>
                      <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-medium">
                        Upload Photo/上传照片
                        <input type="file" accept="image/*" onChange={handleMemberImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={async () => {
                      // If we are cancelling, we need to clean up any NEWLY uploaded images that are not being saved.
                      // If isNewMember, editingMember.image is new if it exists.
                      // If existing member, editingMember.image is new if it's different from the original image.
                      
                      let imageToDelete = '';
                      if (isNewMember) {
                          if (editingMember?.image?.startsWith('/images/uploads')) {
                              imageToDelete = editingMember.image;
                          }
                      } else {
                          const original = team.find(m => m.id === editingMember?.id);
                          if (original && editingMember?.image !== original.image && editingMember?.image?.startsWith('/images/uploads')) {
                              imageToDelete = editingMember.image;
                          }
                      }

                      if (imageToDelete) {
                         try {
                           await fetch('/api/admin/upload', {
                             method: 'DELETE',
                             headers: getHeaders(),
                             body: JSON.stringify({ url: imageToDelete })
                           });
                         } catch (e) {}
                      }
                      
                      setEditingMember(null);
                      setMemberImagesPendingDeletion([]); // Discard any pending deletions of original images
                    }} className="px-6 py-2 rounded text-gray-600 hover:bg-gray-100">Cancel/取消</button>
                    <button type="submit" className="px-6 py-2 rounded bg-black text-white">Save Member/保存成员</button>
                  </div>
                </form>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTeamDragEnd}>
                <SortableContext items={team} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.map(member => (
                      <SortableTeamItem 
                        key={member.id} 
                        member={member} 
                        onEdit={(m) => { setEditingMember(m); setIsNewMember(false); }}
                        onDelete={setMemberToDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

             {showPhotoDeleteConfirm && editingMember && (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={(e) => e.stopPropagation()}>
                 <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                   <h3 className="font-bold text-lg mb-2">Delete Photo/删除照片?</h3>
                   <p className="text-gray-600 mb-6">Are you sure you want to remove this photo? / 确定要删除这张照片吗？</p>
                   <div className="flex justify-end gap-3">
                     <button 
                        type="button"
                        onClick={() => setShowPhotoDeleteConfirm(false)} 
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                     >
                        Cancel/取消
                     </button>
                     <button 
                        type="button"
                        onClick={async () => {
                            if (editingMember.image.startsWith('/images/uploads')) {
                                setMemberImagesPendingDeletion(prev => [...prev, editingMember.image]);
                            }
                            setEditingMember({ ...editingMember, image: '' });
                            setShowPhotoDeleteConfirm(false);
                        }} 
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                     >
                        Delete/删除
                     </button>
                   </div>
                 </div>
               </div>
            )}

             {memberToDelete && (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                 <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                   <h3 className="font-bold text-lg mb-2">Delete Member/删除成员?</h3>
                   <p className="text-gray-600 mb-6">Are you sure you want to delete {memberToDelete.name}? This cannot be undone.</p>
                   <div className="flex justify-end gap-3">
                     <button onClick={() => setMemberToDelete(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel/取消</button>
                     <button onClick={() => handleMemberDelete(memberToDelete)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete/删除</button>
                   </div>
                 </div>
               </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="max-w-5xl mx-auto">
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Messages/留言消息</h2>
              {selectedMessages.length > 0 && (
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700"
                >
                  <Trash2 size={18} /> Delete Selected ({selectedMessages.length})/删除选中({selectedMessages.length})
                </button>
              )}
            </div>

            <div className="bg-white rounded shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-sm text-gray-500">
                  <tr>
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={messages.length > 0 && selectedMessages.length === messages.length}
                        onChange={handleSelectAllMessages}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 w-1/3">Message</th>
                    <th className="p-4 w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">No messages found.</td>
                    </tr>
                  ) : (
                    messages.map(msg => (
                      <tr key={msg.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedMessages.includes(msg.id)}
                            onChange={() => handleSelectMessage(msg.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="p-4 font-medium">{msg.name}</td>
                        <td className="p-4 text-gray-600">{msg.phone}</td>
                        <td className="p-4 text-sm text-gray-500">{new Date(msg.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-600 truncate max-w-xs" title={msg.message}>{msg.message}</td>
                        <td className="p-4">
                           <button onClick={() => setMessageToDelete(msg.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
             {messageToDelete && (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                 <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                   <h3 className="font-bold text-lg mb-2">Delete Message/删除消息?</h3>
                   <p className="text-gray-600 mb-6">Are you sure you want to delete this message? This cannot be undone.</p>
                   <div className="flex justify-end gap-3">
                     <button onClick={() => setMessageToDelete(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel/取消</button>
                     <button onClick={() => { handleDeleteSingleMessage(messageToDelete); setMessageToDelete(null); }} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete/删除</button>
                   </div>
                 </div>
               </div>
            )}

             {showBulkDeleteConfirm && (
               <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                 <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                   <h3 className="font-bold text-lg mb-2">Delete Messages/删除消息?</h3>
                   <p className="text-gray-600 mb-6">Are you sure you want to delete {selectedMessages.length} messages? This cannot be undone.</p>
                   <div className="flex justify-end gap-3">
                     <button onClick={() => setShowBulkDeleteConfirm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel/取消</button>
                     <button onClick={handleBulkDeleteMessages} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete All/删除所有</button>
                   </div>
                 </div>
               </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
