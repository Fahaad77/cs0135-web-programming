async function loadCourse() {
  const response = await fetch('config/course.json');
  if (!response.ok) throw new Error('Unable to load course configuration');
  return response.json();
}

function materialLink(url, text, status) {
  if (!url || status !== 'Ready') return '<span class="disabled-link" aria-disabled="true">Planned</span>';
  return `<a class="material-link" href="${url}">${text}</a>`;
}

function weekStatus(week) {
  return `<span class="status ${week.status === 'Planned' ? 'planned' : ''}">${week.status}</span>`;
}

function assessmentForWeek(course, weekNumber) {
  return course.assessments
    .filter((item) => item.timing.includes(`Week ${weekNumber}`) || item.timing.includes(`Weeks ${weekNumber}`) || (item.timing === 'All semester' && weekNumber <= 14))
    .map((item) => `${item.item} (${item.weight})`)
    .join(', ') || 'No major assessment this week';
}

function cloForWeek(weekNumber) {
  if (weekNumber <= 2) return 'CLO 1.1, CLO 1.2, CLO 2.2';
  if (weekNumber <= 6) return 'CLO 1.2, CLO 2.1, CLO 2.3';
  if (weekNumber <= 11) return 'CLO 2.1, CLO 2.2, CLO 2.3';
  return 'CLO 1.1, CLO 2.1, CLO 3.1';
}

function resourceGrid(week) {
  return `
    <div class="resource-grid">
      <div><span>Slides</span>${materialLink(week.slides, 'Open', week.status)}</div>
      <div><span>Activity</span>${materialLink(week.activity, 'Open', week.status)}</div>
      <div><span>Lab</span>${materialLink(week.lab, 'Open', week.status)}</div>
    </div>
  `;
}

function scrollCurrentWeekIntoView(course) {
  const currentWeek = course.currentWeek || course.current_week;
  if (!currentWeek) return;
  const container = document.querySelector('.progress-scroll');
  const current = document.querySelector(`[data-progress-week="${currentWeek}"]`);
  if (current && container) {
    container.scrollTop = current.offsetTop - container.clientHeight / 2 + current.clientHeight / 2;
  }
}

function renderCourse(course) {
  document.querySelectorAll('[data-course-title]').forEach((el) => { el.textContent = course.title; });
  document.querySelector('[data-course-code]').textContent = course.code;
  document.querySelector('[data-semester]').textContent = course.semester;
  document.querySelector('[data-instructor]').textContent = course.instructor;
  document.querySelector('[data-sections]').textContent = course.sections.join(' and ');
  document.querySelector('[data-contact]').textContent = course.contactHours;
  document.querySelector('[data-environment]').textContent = course.environment;

  const ready = course.weeks.filter((week) => week.status === 'Ready').length;
  document.querySelector('[data-progress-text]').textContent = `${ready} of ${course.weeks.length} weekly modules ready`;
  document.querySelector('[data-progress-bar]').style.width = `${Math.round((ready / course.weeks.length) * 100)}%`;

  const mini = document.querySelector('[data-week-mini-list]');
  mini.innerHTML = course.weeks.map((week) => `
    <li data-progress-week="${week.week}">
      ${week.status === 'Ready' ? `<a href="${week.slides || week.activity || week.lab || '#curriculum'}">Week ${week.week}: ${week.title}</a>` : `<span>Week ${week.week}: ${week.title}</span>`}
      ${weekStatus(week)}
    </li>
  `).join('');
  scrollCurrentWeekIntoView(course);

  document.querySelector('[data-outcomes]').innerHTML = course.learningOutcomes.map((outcome, index) => `
    <article class="tile">
      <h3>CLO ${index + 1}</h3>
      <p>${outcome}</p>
    </article>
  `).join('');

  document.querySelector('[data-assessments]').innerHTML = course.assessments.map((item) => `
    <article class="tile">
      <h3>${item.item}</h3>
      <p><strong>${item.weight}</strong><br>${item.timing}</p>
    </article>
  `).join('');

  document.querySelector('[data-curriculum]').innerHTML = course.weeks.map((week) => `
    <tr class="summary-row">
      <td><strong>${week.week}</strong></td>
      <td><strong>${week.title}</strong><br>${weekStatus(week)}</td>
      <td>${week.learn}</td>
      <td>${week.duration}</td>
      <td>${materialLink(week.slides, 'Open', week.status)}</td>
      <td>${materialLink(week.activity, 'Open', week.status)}</td>
      <td>${materialLink(week.lab, 'Open', week.status)}</td>
      <td>${week.milestone || 'No project checkpoint'}</td>
    </tr>
    <tr class="detail-row">
      <td colspan="8">
        <details>
          <summary>More details for Week ${week.week}</summary>
          <dl class="week-details">
            <div><dt>Module</dt><dd>${week.module}</dd></div>
            <div><dt>Builds on</dt><dd>${week.buildsOn}</dd></div>
            <div><dt>Resources</dt><dd>${week.resources}</dd></div>
            <div><dt>CLO alignment</dt><dd>${cloForWeek(week.week)}</dd></div>
            <div><dt>Assessments</dt><dd>${assessmentForWeek(course, week.week)}</dd></div>
            <div><dt>Project milestone</dt><dd>${week.milestone || 'No project checkpoint'}</dd></div>
          </dl>
        </details>
      </td>
    </tr>
  `).join('');

  document.querySelector('[data-schedule-cards]').innerHTML = course.weeks.map((week) => `
    <article class="week-card">
      <div class="week-card-head">
        <h3>Week ${week.week}: ${week.title}</h3>
        ${weekStatus(week)}
      </div>
      <p>${week.learn}</p>
      <p><strong>Duration:</strong> ${week.duration}</p>
      ${resourceGrid(week)}
      <details>
        <summary>Details</summary>
        <dl class="week-details">
          <div><dt>Module</dt><dd>${week.module}</dd></div>
          <div><dt>Builds on</dt><dd>${week.buildsOn}</dd></div>
          <div><dt>Resources</dt><dd>${week.resources}</dd></div>
          <div><dt>CLO alignment</dt><dd>${cloForWeek(week.week)}</dd></div>
          <div><dt>Assessments</dt><dd>${assessmentForWeek(course, week.week)}</dd></div>
          <div><dt>Project milestone</dt><dd>${week.milestone || 'No project checkpoint'}</dd></div>
        </dl>
      </details>
    </article>
  `).join('');
}

loadCourse().then(renderCourse).catch((error) => {
  document.querySelector('[data-load-error]').hidden = false;
  document.querySelector('[data-load-error]').textContent = error.message;
});
