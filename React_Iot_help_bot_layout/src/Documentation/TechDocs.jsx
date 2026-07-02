import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { LuFileText, LuPlus, LuTrash2, LuPencil, LuEye, LuSave, LuX, LuFilter } from 'react-icons/lu';
import Header from '../UIComponents/Header';
import LabeledInput from '../UIComponents/LabeledInput';
import { getDocs, createDoc, updateDoc, deleteDoc } from './docService';
import { list as listProjects } from '../ProjectManagement/projectService';

const TYPE_CONFIG = {
  requirements:    { label: 'Requirements',    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  work_plan:       { label: 'Work Plan',       badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' },
  engineering_doc: { label: 'Engineering Doc', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
};

const EMPTY_FORM = { title: '', type: 'requirements', content: '', tags: '' };

export default function TechDocs() {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const projs = await listProjects();
        setProjects(projs || []);
        if (projs && projs.length > 0) {
          setSelectedProjectId(projs[0]._id);
        } else {
          setLoading(false);
        }
      } catch (e) {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await getDocs(selectedProjectId);
        setDocs(Array.isArray(data) ? data : data?.docs || []);
      } catch {
        setDocs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedProjectId]);

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  // --- Filter ---
  const filtered = docs.filter(d => filterType === 'all' || d.type === filterType);

  // --- Handlers ---
  const openCreate = () => {
    setSelectedDoc(null);
    setEditForm({ ...EMPTY_FORM });
    setIsCreating(true);
    setIsEditing(true);
  };

  const openDoc = (doc) => {
    setSelectedDoc(doc);
    setEditForm({
      title: doc.title || '',
      type: doc.type || 'requirements',
      content: doc.content || '',
      tags: Array.isArray(doc.tags) ? doc.tags.join(', ') : (doc.tags || ''),
    });
    setIsCreating(false);
    setIsEditing(false);
  };

  const startEdit = () => setIsEditing(true);

  const cancelEdit = () => {
    if (isCreating) {
      setIsCreating(false);
      setIsEditing(false);
      setSelectedDoc(null);
    } else if (selectedDoc) {
      setEditForm({
        title: selectedDoc.title || '',
        type: selectedDoc.type || 'requirements',
        content: selectedDoc.content || '',
        tags: Array.isArray(selectedDoc.tags) ? selectedDoc.tags.join(', ') : (selectedDoc.tags || ''),
      });
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    const tagsArr = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = { ...editForm, tags: tagsArr, projectId: selectedProjectId };

    if (isCreating) {
      try {
        const result = await createDoc(payload);
        const newDoc = result?.doc || result || { ...payload, _id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setDocs(prev => [newDoc, ...prev]);
        setSelectedDoc(newDoc);
      } catch {
        const newDoc = { ...payload, _id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setDocs(prev => [newDoc, ...prev]);
        setSelectedDoc(newDoc);
      }
    } else if (selectedDoc) {
      try {
        const result = await updateDoc(selectedDoc._id, payload);
        const updated = result?.doc || result || { ...selectedDoc, ...payload, updatedAt: new Date().toISOString() };
        setDocs(prev => prev.map(d => d._id === selectedDoc._id ? updated : d));
        setSelectedDoc(updated);
      } catch {
        const updated = { ...selectedDoc, ...payload, updatedAt: new Date().toISOString() };
        setDocs(prev => prev.map(d => d._id === selectedDoc._id ? updated : d));
        setSelectedDoc(updated);
      }
    }
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    try { await deleteDoc(id); } catch { /* proceed locally */ }
    setDocs(prev => prev.filter(d => d._id !== id));
    if (selectedDoc?._id === id) {
      setSelectedDoc(null);
      setIsEditing(false);
    }
  };

  const backToList = () => {
    setSelectedDoc(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'requirements', label: 'Requirements' },
    { key: 'work_plan', label: 'Work Plans' },
    { key: 'engineering_doc', label: 'Engineering Docs' },
  ];

  if (loading) {
    return <div className="p-12 text-center text-slate-500 dark:text-slate-400 dark:text-slate-400">Loading documents...</div>;
  }

  const renderProjectHeader = () => (
    <>
      <Header title="📝 Technical Documentation" subtitle="Shared workspace for requirements, work plans, and engineering docs" />
      <section className="bg-white dark:bg-zinc-900 dark:bg-zinc-800 rounded-3xl border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <LabeledInput label="Select Project">
          <select
            className="border border-slate-300 dark:border-zinc-600 rounded-xl px-4 py-2 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white dark:text-white focus:outline-none"
            value={selectedProjectId || ''}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              backToList(); // exit edit/view mode when changing project
            }}
          >
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
            {projects.length === 0 && <option value="">No projects available</option>}
          </select>
        </LabeledInput>
        
        {selectedProject && (
          <div className="text-sm bg-slate-50 dark:bg-zinc-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 dark:border-zinc-700">
            <span className="font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">Project Team Members (can edit docs):</span>
            <div className="text-slate-600 dark:text-slate-400 dark:text-slate-400 mt-1">
              {(selectedProject.members || []).map(m => m.email || m.username).join(', ') || 'No members'}
            </div>
          </div>
        )}
      </section>
    </>
  );

  // --- Editor / Viewer ---
  if (selectedDoc || isCreating) {
    return (
      <>
        {renderProjectHeader()}

        <div className="mb-6 flex items-center gap-3">
          <button onClick={backToList} className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:text-slate-400 dark:hover:text-white transition-colors">
            ← Back to list
          </button>
          <div className="flex-1" />
          {!isEditing && selectedDoc && (
            <>
              <button onClick={startEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:bg-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-600 transition-colors">
                <LuPencil /> Edit
              </button>
              <button onClick={() => handleDelete(selectedDoc._id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors">
                <LuTrash2 /> Delete
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:bg-zinc-900 dark:text-zinc-900 dark:hover:bg-slate-200 transition-colors">
                <LuSave /> Save
              </button>
              <button onClick={cancelEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:bg-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-600 transition-colors">
                <LuX /> Cancel
              </button>
            </>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 dark:bg-zinc-800 rounded-3xl border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 shadow-sm p-7">
          {isEditing ? (
            <div className="space-y-5">
              {/* Title */}
              <LabeledInput
                label="Title"
                type="text"
                className="w-full border border-slate-300 dark:border-zinc-600 rounded-2xl px-4 py-3 bg-white dark:bg-zinc-900 dark:bg-zinc-900 text-slate-900 dark:text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Document title"
              />

              {/* Type + Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <LabeledInput label="Type">
                  <select
                    className="w-full border border-slate-300 dark:border-zinc-600 rounded-2xl px-4 py-3 bg-white dark:bg-zinc-900 dark:bg-zinc-900 text-slate-900 dark:text-white dark:text-white"
                    value={editForm.type}
                    onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}
                  >
                    <option value="requirements">Requirements</option>
                    <option value="work_plan">Work Plan</option>
                    <option value="engineering_doc">Engineering Doc</option>
                  </select>
                </LabeledInput>
                <LabeledInput
                  label="Tags (comma-separated)"
                  type="text"
                  className="w-full border border-slate-300 dark:border-zinc-600 rounded-2xl px-4 py-3 bg-white dark:bg-zinc-900 dark:bg-zinc-900 text-slate-900 dark:text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={editForm.tags}
                  onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. mqtt, esp32, sensors"
                />
              </div>

              {/* Markdown Editor + Preview */}
              <LabeledInput label="Content (Markdown)">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <textarea
                    className="w-full border border-slate-300 dark:border-zinc-600 rounded-2xl px-4 py-3 bg-white dark:bg-zinc-900 dark:bg-zinc-900 text-slate-900 dark:text-white dark:text-white font-mono text-sm min-h-[400px] resize-y focus:outline-none focus:ring-2 focus:ring-slate-400"
                    value={editForm.content}
                    onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Write your markdown here..."
                  />
                  <div className="border border-slate-200 dark:border-zinc-800 dark:border-zinc-600 rounded-2xl px-5 py-4 bg-slate-50 dark:bg-zinc-900 min-h-[400px] overflow-auto prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Preview</p>
                    <div dangerouslySetInnerHTML={{ __html: marked(editForm.content || '') }} />
                  </div>
                </div>
              </LabeledInput>
            </div>
          ) : (
            /* View mode */
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white dark:text-white">{selectedDoc.title}</h3>
                {TYPE_CONFIG[selectedDoc.type] && (
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${TYPE_CONFIG[selectedDoc.type].badge}`}>
                    {TYPE_CONFIG[selectedDoc.type].label}
                  </span>
                )}
              </div>
              {selectedDoc.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Array.isArray(selectedDoc.tags) ? selectedDoc.tags : []).map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-slate-400 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-6">
                Last updated: {selectedDoc.updatedAt ? new Date(selectedDoc.updatedAt).toLocaleString() : 'N/A'}
              </p>
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked(selectedDoc.content || '') }} />
            </div>
          )}
        </div>
      </>
    );
  }

  // --- Document List ---
  return (
    <>
      {renderProjectHeader()}

      {/* Filter + New Doc */}
      <section className="bg-white dark:bg-zinc-900 dark:bg-zinc-800 rounded-3xl border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <LuFilter className="text-slate-500 dark:text-slate-400 dark:text-slate-400" />
            {filterButtons.map(b => (
              <button
                key={b.key}
                onClick={() => setFilterType(b.key)}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                  filterType === b.key
                    ? 'bg-slate-950 text-white dark:bg-cyan-600 dark:text-white'
                    : 'bg-slate-100 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:bg-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-600'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="sm:ml-auto">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-slate-950 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-800 dark:bg-white dark:bg-zinc-900 dark:text-zinc-900 dark:hover:bg-slate-200 transition-colors"
            >
              <LuPlus className="text-lg" /> New Document
            </button>
          </div>
        </div>
      </section>

      {/* Document Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 dark:bg-zinc-800 rounded-3xl border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 shadow-sm p-12 text-center">
          <LuFileText className="text-5xl text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 mb-2">No documents yet</h3>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-400">
            Click <strong>New Document</strong> to create your first technical document.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(doc => {
            const cfg = TYPE_CONFIG[doc.type] || TYPE_CONFIG.requirements;
            const preview = (doc.content || '').slice(0, 100) + ((doc.content || '').length > 100 ? '...' : '');
            return (
              <div
                key={doc._id}
                onClick={() => openDoc(doc)}
                className="bg-white dark:bg-zinc-900 dark:bg-zinc-800 rounded-3xl border border-slate-200 dark:border-zinc-800 dark:border-zinc-700 shadow-sm p-6 hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-500 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white dark:text-white line-clamp-1">{doc.title}</h4>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shrink-0 ml-2 ${cfg.badge}`}>{cfg.label}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400 line-clamp-2 mb-3">{preview || 'No content'}</p>
                {doc.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(Array.isArray(doc.tags) ? doc.tags : []).slice(0, 4).map(tag => (
                      <span key={tag} className="text-xs bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-slate-400 dark:text-slate-400 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400">
                    {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : ''}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc._id); }}
                    className="text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <LuTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
