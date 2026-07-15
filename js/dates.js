export const formatDate = value => value ? new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium' }).format(new Date(value)) : '未設定';
export const formatDateTime = value => value ? new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '未設定';
export const toLocalInput = value => value ? new Date(value).toISOString().slice(0, 16) : '';
export function calendarItems(state) {
  const items = [];
  state.tasks.forEach(task => { if (!task.completed && task.dueAt) items.push({ date: task.dueAt, applicationId: task.applicationId, type: 'タスク', title: task.title }); });
  state.applications.forEach(application => [['esDeadline', 'ES締切'], ['webTestDeadline', 'Webテスト期限'], ['interviewAt', '面接']].forEach(([key, type]) => { if (application[key]) items.push({ date: application[key], applicationId: application.id, type, title: `${application.companyName}｜${type}` }); }));
  return items.sort((left, right) => new Date(left.date) - new Date(right.date));
}
