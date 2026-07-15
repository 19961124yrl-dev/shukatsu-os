export const STATE_SCHEMA_VERSION = 3;
export const TERMINAL_STATUSES = ['accepted', 'withdrawn', 'rejected'];
export const PRE_SELECTION_STATUSES = ['interested', 'pre_entry'];

export const blankState = () => ({ schemaVersion: STATE_SCHEMA_VERSION, applications: [], tasks: [], events: [], documents: [], settings: { userMode: 'new_grad' } });

export function migrateState(raw, { uid = () => crypto.randomUUID(), now = () => new Date().toISOString(), status = {} } = {}) {
  const state = Object.assign(blankState(), raw || {});
  state.applications = Array.isArray(state.applications) ? state.applications : [];
  state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
  state.events = Array.isArray(state.events) ? state.events : [];
  state.documents = Array.isArray(state.documents) ? state.documents : [];
  const oldMap = { planned: 'pre_entry', es_drafting: 'es_submitted', document_screening: 'screening', aptitude_test: 'web_test', closed: 'rejected' };
  state.applications = state.applications.map(a => ({ ...a, id: a.id || uid(), companyName: a.companyName || a.company || '', jobTitle: a.jobTitle || a.role || '', mode: a.mode || state.settings.userMode || 'new_grad', applicationType: a.applicationType || '', source: a.source || '', status: status[a.status] ? a.status : (oldMap[a.status] || 'interested'), appliedAt: a.appliedAt || '', location: a.location || '', jobUrl: a.jobUrl || '', esDeadline: a.esDeadline || '', webTestDeadline: a.webTestDeadline || '', interviewAt: a.interviewAt || '', motivation: a.motivation || '中', documents: Array.isArray(a.documents) ? a.documents : [], notes: a.notes || a.note || '', modeDetail: a.modeDetail || '', interviews: Array.isArray(a.interviews) ? a.interviews : [], contacts: Array.isArray(a.contacts) ? a.contacts : [], createdAt: a.createdAt || now(), updatedAt: a.updatedAt || now() }));
  state.tasks = state.tasks.map(t => ({ ...t, id: t.id || uid(), applicationId: t.applicationId || t.appId || '', completed: Boolean(t.completed), createdAt: t.createdAt || now() }));
  state.events = state.events.map(e => ({ ...e, id: e.id || uid(), applicationId: e.applicationId || e.appId || '', occurredAt: e.occurredAt || e.at || now() }));
  state.documents = state.documents.map(d => ({ ...d, id: d.id || uid(), companyIds: Array.isArray(d.companyIds) ? d.companyIds : [] }));
  state.schemaVersion = STATE_SCHEMA_VERSION;
  return removeOrphans(state);
}

export function removeApplicationAndRelations(state, applicationId) {
  state.applications = state.applications.filter(a => a.id !== applicationId);
  state.tasks = state.tasks.filter(t => t.applicationId !== applicationId);
  state.events = state.events.filter(e => e.applicationId !== applicationId);
  state.documents.forEach(d => { d.companyIds = (d.companyIds || []).filter(id => id !== applicationId); });
  return state;
}

export function removeOrphans(state) {
  const ids = new Set(state.applications.map(a => a.id));
  state.tasks = state.tasks.filter(t => !t.applicationId || ids.has(t.applicationId));
  state.events = state.events.filter(e => !e.applicationId || ids.has(e.applicationId));
  state.documents.forEach(d => { d.companyIds = (d.companyIds || []).filter(id => ids.has(id)); });
  state.applications.forEach(a => { a.documents = (a.documents || []).filter(id => state.documents.some(d => d.id === id)); });
  return state;
}

export function selectionInProgressCount(applications) {
  return applications.filter(a => !TERMINAL_STATUSES.includes(a.status) && !PRE_SELECTION_STATUSES.includes(a.status)).length;
}

export function parseBackupJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid backup JSON');
  return parsed;
}

export function recordStatusChange(state, applicationId, nextStatus, note = '', { uid = () => crypto.randomUUID(), now = () => new Date().toISOString(), labels = {} } = {}) {
  const application = state.applications.find(item => item.id === applicationId);
  if (!application) throw new Error('Application not found');
  const previousStatus = application.status;
  application.status = nextStatus;
  application.updatedAt = now();
  state.events.unshift({ id: uid(), applicationId, type: 'status', title: `選考状況を「${labels[nextStatus] || nextStatus}」に変更しました`, occurredAt: now(), previousStatus, newStatus: nextStatus, note });
  return application;
}
