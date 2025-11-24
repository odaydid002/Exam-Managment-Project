import React, { useEffect, useState } from "react";

// Admin Settings — Redesigned to match Modules-style visual system
// Visual reference image: /mnt/data/Admin - Modules Managment.png

export default function AdminSettingsRefactor() {
  const [semester, setSemester] = useState("S1");
  const [examPeriod, setExamPeriod] = useState({ start: "", end: "" });
  const [errors, setErrors] = useState({});
  const [notifications, setNotifications] = useState({ examChange: true, roomChange: true, newSurveillance: true });
  const [confirmAction, setConfirmAction] = useState(null); // { type, label }

  // small helper used by export buttons (mock)
  function downloadMock(filename, content = "{}") {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Validation and save for exam period
  function saveExamPeriod() {
    const e = {};
    if (!examPeriod.start) e.start = "Date de début requise";
    if (!examPeriod.end) e.end = "Date de fin requise";
    if (examPeriod.start && examPeriod.end && new Date(examPeriod.start) > new Date(examPeriod.end)) e.range = "La date de début doit être antérieure à la date de fin";
    setErrors(e);
    if (Object.keys(e).length) return;
    // TODO: replace with API call
    toast("Période d'examens enregistrée");
  }

  function saveNotifications() {
    // TODO: API
    toast("Préférences de notification enregistrées");
  }

  // Danger operations
  function performDanger(action) {
    setConfirmAction(null);
    // TODO: call the real destructive action
    toast(`${action} exécuté (mock)`);
  }

  function toast(message) {
    // very small ephemeral toast for demo
    const el = document.createElement("div");
    el.textContent = message;
    el.className = "fixed right-6 bottom-6 bg-black/80 text-white px-4 py-2 rounded shadow-lg z-50";
    document.body.appendChild(el);
    setTimeout(() => { el.classList.add("opacity-0"); }, 1800);
    setTimeout(() => el.remove(), 2300);
  }

  useEffect(() => { /* reset errors when user types */ setErrors({}); }, [examPeriod, notifications, semester]);

  return (
    <div className="min-h-screen bg-[#f3f6f8] p-6 font-sans text-gray-800">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">Main / Settings</div>
            <h1 className="text-2xl font-semibold">Paramètres — Administration</h1>
            <p className="text-sm text-gray-500 mt-1">Gérez les paramètres globaux du système, sauvegardes et actions de maintenance.</p>
          </div>
          <div className="flex items-center gap-3">
            <img src={'/mnt/data/Admin - Modules Managment.png'} alt="reference" className="hidden md:block w-48 rounded-lg shadow-sm border" />
            <div className="flex gap-2">
              <button onClick={() => downloadMock('backup_system.json', '{"mock":"data"}')} className="px-4 py-2 bg-red-500 text-white rounded-lg shadow">Backup now</button>
              <button onClick={() => toast('Open help (mock)')} className="px-4 py-2 bg-white border rounded-lg">Help</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left column: controls */}
          <div className="col-span-8">
            {/* Semester card */}
            <SettingsCard title="Semestre actuel">
              <div className="flex items-center gap-4">
                <select value={semester} onChange={(e) => setSemester(e.target.value)} className="px-3 py-2 border rounded-lg">
                  <option value="S1">Semestre 1</option>
                  <option value="S2">Semestre 2</option>
                  <option value="S3">Semestre 3</option>
                  <option value="S4">Semestre 4</option>
                  <option value="S5">Semestre 5</option>
                  <option value="S6">Semestre 6</option>
                </select>
                <div className="text-sm text-gray-500">Définit le semestre utilisé pour les modules, groupes et examens.</div>
              </div>
            </SettingsCard>

            {/* Exam period */}
            <SettingsCard title="Période d'examens">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col">
                  <span className="text-sm text-gray-700">Début</span>
                  <input type="date" value={examPeriod.start} onChange={(e) => setExamPeriod({ ...examPeriod, start: e.target.value })} className={`mt-1 px-3 py-2 border rounded-lg ${errors.start ? 'border-red-400' : ''}`} />
                  {errors.start && <div className="text-xs text-red-500 mt-1">{errors.start}</div>}
                </label>
                <label className="flex flex-col">
                  <span className="text-sm text-gray-700">Fin</span>
                  <input type="date" value={examPeriod.end} onChange={(e) => setExamPeriod({ ...examPeriod, end: e.target.value })} className={`mt-1 px-3 py-2 border rounded-lg ${errors.end ? 'border-red-400' : ''}`} />
                  {errors.end && <div className="text-xs text-red-500 mt-1">{errors.end}</div>}
                </label>
              </div>
              {errors.range && <div className="text-xs text-red-500 mt-2">{errors.range}</div>}
              <div className="mt-4 flex gap-2">
                <button onClick={saveExamPeriod} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow">Enregistrer</button>
                <button onClick={() => setExamPeriod({ start: '', end: '' })} className="px-4 py-2 bg-white border rounded-lg">Réinitialiser</button>
              </div>
            </SettingsCard>

            {/* Notifications */}
            <SettingsCard title="Notifications">
              <div className="space-y-3">
                <AccessibleToggle label="Modification d'examen" checked={notifications.examChange} onChange={(v) => setNotifications((p) => ({ ...p, examChange: v }))} />
                <AccessibleToggle label="Changement de salle" checked={notifications.roomChange} onChange={(v) => setNotifications((p) => ({ ...p, roomChange: v }))} />
                <AccessibleToggle label="Nouvelle surveillance" checked={notifications.newSurveillance} onChange={(v) => setNotifications((p) => ({ ...p, newSurveillance: v }))} />
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={saveNotifications} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow">Enregistrer</button>
                <button onClick={() => setNotifications({ examChange: true, roomChange: true, newSurveillance: true })} className="px-4 py-2 bg-white border rounded-lg">Rétablir défauts</button>
              </div>
            </SettingsCard>

            {/* System / Maintenance */}
            <SettingsCard title="Maintenance du système">
              <div className="grid gap-3">
                <DangerAction label="Réinitialiser tous les plannings (examens + surveillances)" onConfirm={() => setConfirmAction({ type: 'reset_planning', label: 'Réinitialiser les plannings' })} />
                <DangerAction label="Nettoyer les groupes orphelins" onConfirm={() => setConfirmAction({ type: 'clean_orphan_groups', label: 'Nettoyer les groupes' })} />
                <DangerAction label="Purger les notifications anciennes" onConfirm={() => setConfirmAction({ type: 'purge_notifications', label: 'Purger notifications' })} />
              </div>
              <p className="text-xs text-gray-500 mt-2">⚠️ Ces actions sont irréversibles. Assurez‑vous d'avoir une sauvegarde.</p>
            </SettingsCard>

            {/* Export */}
            <SettingsCard title="Exportation / Sauvegarde">
              <div className="flex flex-wrap gap-3">
                <button onClick={() => downloadMock('system_export.json','{"system":"mock"}')} className="px-4 py-2 bg-white border rounded-lg">Exporter tout le système (JSON)</button>
                <button onClick={() => downloadMock('planning_export.pdf','%PDF-1.4') } className="px-4 py-2 bg-white border rounded-lg">Exporter plannings (PDF)</button>
                <button onClick={() => downloadMock('users_export.xlsx','mock') } className="px-4 py-2 bg-white border rounded-lg">Exporter utilisateurs (Excel)</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Les exports n'incluent pas de données sensibles par défaut. Configurez les filtres côté serveur.</p>
            </SettingsCard>

          </div>

          {/* Right column: summary / quick actions */}
          <aside className="col-span-4">
            <div className="sticky top-6 space-y-4">
              <StatCard title="Next exam" value="2025-06-12" subtitle="Session normale" />
              <StatCard title="Backups" value="Today" subtitle="Dernière sauvegarde" />

              <SettingsCard title="Actions rapides">
                <div className="flex flex-col gap-2">
                  <button onClick={() => downloadMock('quick_backup.json','{}')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Sauvegarde rapide</button>
                  <button onClick={() => toast('Ouvrir logs (mock)')} className="px-4 py-2 bg-white border rounded-lg">Voir logs</button>
                </div>
              </SettingsCard>

              <SettingsCard title="Aide & Documentation">
                <div className="text-sm text-gray-600">Consultez la documentation interne ou contactez l'équipe IT pour obtenir des clés API et informations de déploiement.</div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => toast('Open docs (mock)')} className="px-3 py-2 bg-white border rounded-lg">Docs</button>
                  <button onClick={() => toast('Contact IT (mock)')} className="px-3 py-2 bg-white border rounded-lg">Contact</button>
                </div>
              </SettingsCard>
            </div>
          </aside>
        </div>

        {/* Confirmation modal for dangerous actions */}
        {confirmAction && (
          <Modal onClose={() => setConfirmAction(null)}>
            <div>
              <h3 className="text-lg font-semibold mb-2">Confirmer l'action</h3>
              <p className="text-sm text-gray-600 mb-4">Vous êtes sur le point d'exécuter: <strong>{confirmAction.label}</strong>. Cette opération est irréversible.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setConfirmAction(null)} className="px-3 py-2 border rounded-lg">Annuler</button>
                <button onClick={() => performDanger(confirmAction.label)} className="px-3 py-2 bg-red-600 text-white rounded-lg">Confirmer</button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
}

/* --- Reusable subcomponents --- */
function SettingsCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
        {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
      </div>
      <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">📌</div>
    </div>
  );
}

function AccessibleToggle({ label, checked, onChange }) {
  // keyboard accessible switch
  function handleKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(!checked);
    }
  }
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <div
        role="switch"
        tabIndex={0}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKey}
        className={`w-11 h-6 rounded-full p-0.5 flex items-center transition ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}

function DangerAction({ label, onConfirm }) {
  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg bg-red-50">
      <div className="text-2xl">⚠️</div>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-2">
          <button onClick={onConfirm} className="px-3 py-2 bg-white border text-red-600 rounded-lg">Exécuter</button>
        </div>
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">{children}</div>
    </div>
  );
}

