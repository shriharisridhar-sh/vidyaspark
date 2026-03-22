/**
 * StudentRoster — 5-student status panel for the Tapovan.
 * Shows engagement dots and one-line status for each AI student.
 */

const STUDENTS = [
  { id: 'priya',   name: 'Priya',   age: 13, trait: 'Curious',     colorClass: 'text-student-curious',    bgClass: 'bg-student-curious' },
  { id: 'ravi',    name: 'Ravi',    age: 14, trait: 'Skeptic',     colorClass: 'text-student-skeptic',    bgClass: 'bg-student-skeptic' },
  { id: 'lakshmi', name: 'Lakshmi', age: 12, trait: 'Shy',         colorClass: 'text-student-shy',        bgClass: 'bg-student-shy' },
  { id: 'arjun',   name: 'Arjun',   age: 14, trait: 'Disengaged',  colorClass: 'text-student-disengaged', bgClass: 'bg-student-disengaged' },
  { id: 'meena',   name: 'Meena',   age: 13, trait: 'Rote Learner', colorClass: 'text-student-rote',       bgClass: 'bg-student-rote' },
];

const ENGAGEMENT_DOTS = {
  high:   { color: 'bg-green-500', label: '🟢' },
  medium: { color: 'bg-yellow-500', label: '🟡' },
  low:    { color: 'bg-orange-500', label: '🟠' },
  none:   { color: 'bg-red-500', label: '🔴' },
};

export default function StudentRoster({ studentStates = {}, speakingStudent = null }) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-surface rounded-xl border border-border">
      <p className="text-xs uppercase tracking-wider text-text-muted font-semibold mb-1">Students</p>
      {STUDENTS.map(student => {
        const state = studentStates[student.id] || { engagement: 'medium', status: 'waiting' };
        const dot = ENGAGEMENT_DOTS[state.engagement] || ENGAGEMENT_DOTS.medium;
        const isSpeaking = speakingStudent === student.id;

        return (
          <div
            key={student.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
              isSpeaking ? 'bg-white/[0.06] ring-1 ring-white/10' : 'bg-transparent'
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${dot.color} flex-shrink-0 ${isSpeaking ? 'animate-pulse' : ''}`} />
            <span className={`text-sm font-semibold ${student.colorClass} flex-shrink-0 w-16`}>
              {student.name}
            </span>
            <span className="text-sm text-text-muted truncate">
              {state.status || student.trait}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { STUDENTS };
