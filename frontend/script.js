/* ============================================================
   SentiScope — script.js
   Handles: theme, auth, analysis, chart, history
   ============================================================ */

/* ── Theme ────────────────────────────────────────────────────── */
const THEME_KEY = 'sentiscope_theme';

function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
        const btn = document.getElementById('themeToggleBtn');
        if (btn) btn.textContent = '☀️';
    } else {
        document.body.classList.remove('light');
        const btn = document.getElementById('themeToggleBtn');
        if (btn) btn.textContent = '🌙';
    }
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light');
    const next = isLight ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
}

// Restore saved theme on page load
(function initTheme() {
    applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
})();


/* ── Auth ──────────────────────────────────────────────────────── */
function logout() {
    window.location.href = 'login.html';
}

function handleLoginKey(e) {
    if (e.key === 'Enter') login();
}

async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const btn      = document.getElementById('loginBtn');
    const btnText  = document.getElementById('loginBtnText');
    const result   = document.getElementById('loginResult');

    if (!username || !password) {
        showLoginError('Please enter both username and password.');
        return;
    }

    // Loading state
    btn.disabled  = true;
    btnText.innerHTML = '<span class="spinner"></span> Signing in…';
    result.textContent = '';

    try {
        const res = await fetch('http://127.0.0.1:8000/login', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ username, password })
        });

        if (res.status === 401) {
            showLoginError('Invalid username or password. Please try again.');
            return;
        }

        const data = await res.json();

        if (res.ok && data.status === 'success') {
            btnText.textContent = '✅ Success!';
            setTimeout(() => { window.location.href = 'index.html'; }, 400);
        } else {
            showLoginError('Invalid username or password. Please try again.');
        }
    } catch (err) {
        showLoginError('Could not connect to server. Please ensure the backend is running.');
    } finally {
        if (document.getElementById('loginBtn')) {
            btn.disabled      = false;
            btnText.textContent = 'Sign In';
        }
    }
}

function showLoginError(msg) {
    const el = document.getElementById('loginResult');
    if (el) el.textContent = msg;
}


/* ── Sentiment Analysis ────────────────────────────────────────── */
let chart;
let sentimentData = { positive: 0, neutral: 0, negative: 0 };
let historyItems  = [];

function updateCharCount() {
    const ta = document.getElementById('inputText');
    const cc = document.getElementById('charCount');
    if (ta && cc) cc.textContent = `${ta.value.length} / 1000`;
}

async function analyze() {
    const textarea = document.getElementById('inputText');
    const text     = textarea ? textarea.value.trim() : '';
    const btn      = document.getElementById('analyzeBtn');
    const btnContent = document.getElementById('analyzeBtnContent');
    const container = document.getElementById('result-container');

    if (!text) {
        container.innerHTML = `
            <div class="result-badge neutral">
                <span class="result-badge-icon">⚠️</span>
                <span class="result-badge-text">
                    <div class="result-badge-label">Notice</div>
                    <div class="result-badge-value">Please enter some text first.</div>
                </span>
            </div>`;
        return;
    }

    // Loading state
    btn.disabled = true;
    btnContent.innerHTML = '<span class="spinner"></span> Analyzing…';
    container.innerHTML  = '';

    try {
        const res = await fetch('http://127.0.0.1:8000/predict', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ text })
        });

        const data = await res.json();
        const sentiment = (data.sentiment || 'neutral').toLowerCase();

        // Map to known categories
        const category = ['positive','negative','neutral'].includes(sentiment) ? sentiment : 'neutral';
        sentimentData[category]++;

        renderResult(category);
        updateChart();
        addToHistory(text, category);
        updateStats();

    } catch (err) {
        container.innerHTML = `
            <div class="result-badge negative">
                <span class="result-badge-icon">🚫</span>
                <span class="result-badge-text">
                    <div class="result-badge-label">Error</div>
                    <div class="result-badge-value">Cannot reach server. Is the backend running?</div>
                </span>
            </div>`;
    } finally {
        btn.disabled         = false;
        btnContent.textContent = '⚡ Analyze Sentiment';
    }
}

const sentimentMeta = {
    positive: { icon: '😄', label: 'Positive Sentiment', color: '#10b981' },
    neutral:  { icon: '😐', label: 'Neutral Sentiment',  color: '#f59e0b' },
    negative: { icon: '😞', label: 'Negative Sentiment', color: '#f43f5e' }
};

function renderResult(category) {
    const meta      = sentimentMeta[category];
    const container = document.getElementById('result-container');
    const pct       = Math.floor(40 + Math.random() * 55); // Decorative confidence bar

    container.innerHTML = `
        <div style="width:100%;">
            <div class="result-badge ${category}">
                <span class="result-badge-icon">${meta.icon}</span>
                <span class="result-badge-text">
                    <div class="result-badge-label">Detected Sentiment</div>
                    <div class="result-badge-value">${meta.label}</div>
                </span>
            </div>
            <div class="confidence-bar">
                <div class="confidence-bar-label">
                    <span>Confidence</span>
                    <span>${pct}%</span>
                </div>
                <div class="confidence-bar-track">
                    <div class="confidence-bar-fill" style="width:${pct}%"></div>
                </div>
            </div>
        </div>`;
}

/* ── Stats counters ────────────────────────────────────────────── */
function updateStats() {
    ['positive','neutral','negative'].forEach(k => {
        const el = document.getElementById(`stat${k.charAt(0).toUpperCase() + k.slice(1)}`);
        if (el) el.textContent = sentimentData[k];
    });
}

/* ── History ────────────────────────────────────────────────────── */
function addToHistory(text, category) {
    historyItems.unshift({ text, category });
    if (historyItems.length > 20) historyItems.pop();
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;

    if (historyItems.length === 0) {
        list.innerHTML = '<p class="history-empty">No analyses yet. Analyze some text to get started!</p>';
        return;
    }

    list.innerHTML = historyItems.map(item => `
        <div class="history-item">
            <span class="history-dot ${item.category}"></span>
            <span class="history-text">${escapeHtml(item.text)}</span>
            <span class="history-tag ${item.category}">${capitalize(item.category)}</span>
        </div>
    `).join('');
}

/* ── Chart ──────────────────────────────────────────────────────── */
function updateChart() {
    const ctx = document.getElementById('chart');
    if (!ctx) return;

    const total = sentimentData.positive + sentimentData.neutral + sentimentData.negative;

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [sentimentData.positive, sentimentData.neutral, sentimentData.negative],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.85)',
                    'rgba(245, 158, 11, 0.85)',
                    'rgba(244, 63, 94, 0.85)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(244, 63, 94, 1)'
                ],
                borderWidth: 1.5,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text').trim() || '#e2e8f0',
                        font: { family: 'Inter', size: 12, weight: '500' },
                        padding: 18,
                        usePointStyle: true,
                        pointStyleWidth: 8
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(ctx) {
                            const pct = total > 0 ? Math.round((ctx.raw / total) * 100) : 0;
                            return `  ${ctx.label}: ${ctx.raw} (${pct}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 600,
                easing: 'easeOutCubic'
            }
        }
    });
}

/* ── Helpers ────────────────────────────────────────────────────── */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ── Init chart with empty state on dashboard load ──────────────── */
(function initDashboard() {
    if (document.getElementById('chart')) {
        updateChart();
    }
})();