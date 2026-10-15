import React, { useState } from "react";
import {
  FolderOpen,
  Trash2,
  Download,
  Calendar,
  Layers,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  X
} from "lucide-react";
import { SavedProject } from "../../types";

interface SavedProjectsModalProps {
  projects: SavedProject[];
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (projectId: number) => Promise<void>;
  onExportReport: (project: SavedProject) => void;
  onClose?: () => void;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  projects,
  onLoadProject,
  onDeleteProject,
  onExportReport,
  onClose
}) => {
  const [deleteCandidate, setDeleteCandidate] = useState<SavedProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await onDeleteProject(deleteCandidate.id);
      setDeleteCandidate(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Saved Architecture Projects (SQLite)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Persistent cloud architecture topologies and cost estimates stored in the database.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          {projects.length} Saved {projects.length === 1 ? "Project" : "Projects"} in Database
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Saved Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Configure your workload in the Architecture Designer and click "Save Project" to store your architecture topology, recommendation, and cost estimate in the SQLite database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(project => (
            <div
              key={project.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      {project.mode} mode
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">{project.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {project.selectedTier}
                  </span>
                </div>

                {project.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{project.description}</p>
                )}

                {/* Sizing & Cost Box */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Estimated Cost</span>
                    <span className="text-lg font-extrabold text-emerald-400">
                      ${project.costEstimate?.totalMonthlyUSD || 0}
                      <small className="text-xs font-normal text-slate-400">/mo</small>
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 space-y-0.5">
                    <div>{project.requirements?.users?.toLocaleString() || "10,000"} MAU</div>
                    <div>{project.architecture?.nodes?.length || 0} Topology Nodes</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Saved on {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onLoadProject(project)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1 transition-all"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Restore & Edit</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => onExportReport(project)}
                    title="Export Project Report"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(project)}
                    title="Delete Project"
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-white">Confirm Project Deletion</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deleteCandidate.name}"</strong> from the SQLite database? This action cannot be undone.
            </p>

            <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Yes, Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
