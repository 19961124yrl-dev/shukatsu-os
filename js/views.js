import { selectionInProgressCount } from './state.js';
export { selectionInProgressCount };
export const dashboardMetrics = state => ({ applications: state.applications.length, selectionInProgress: selectionInProgressCount(state.applications), incompleteTasks: state.tasks.filter(t => !t.completed).length });
