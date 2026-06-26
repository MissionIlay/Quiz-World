/**
 * Quiz World Leaderboard & Login System (Shared Library)
 * Handles student login via phone number, scoreboard persistence, 
 * and leaderboard overlay render.
 */

(function() {
    // Dynamically inject styles for the login overlay and leaderboard modal
    const styles = `
        /* Leaderboard and Login styles */
        .lw-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(6, 7, 19, 0.9);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            font-family: 'Space Grotesk', sans-serif;
            animation: lwFadeIn 0.3s ease-out;
        }

        .lw-card {
            background: rgba(16, 18, 38, 0.85);
            border: 2px solid rgba(255, 255, 255, 0.12);
            padding: 3rem 2.5rem;
            border-radius: 24px;
            max-width: 480px;
            width: 90%;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            color: #fff;
            position: relative;
        }

        .lw-title {
            font-family: 'Outfit', sans-serif;
            font-size: 2rem;
            font-weight: 800;
            text-align: center;
            background: linear-gradient(135deg, #a5b4fc, #6366f1, #34d399);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .lw-desc {
            font-size: 0.95rem;
            color: #9ca3af;
            text-align: center;
            line-height: 1.5;
            margin-bottom: 0.5rem;
        }

        .lw-field {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .lw-label {
            font-size: 0.85rem;
            font-weight: 700;
            color: #c7d2fe;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .lw-input {
            width: 100%;
            padding: 0.9rem 1.2rem;
            border-radius: 12px;
            background: rgba(6, 7, 19, 0.8);
            border: 2px solid rgba(255, 255, 255, 0.15);
            color: #fff;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1rem;
            outline: none;
            transition: all 0.2s ease;
        }

        .lw-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
        }

        .lw-btn {
            width: 100%;
            padding: 1rem;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 700;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #fff;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
            font-family: 'Space Grotesk', sans-serif;
        }

        .lw-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
        }

        .lw-btn:active {
            transform: translateY(0);
        }

        /* Leaderboard Modal specific styles */
        .lw-leaderboard-modal {
            max-width: 650px;
            padding: 2.5rem;
        }

        .lw-table-container {
            max-height: 350px;
            overflow-y: auto;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .lw-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.95rem;
        }

        .lw-table th {
            background: rgba(255, 255, 255, 0.05);
            padding: 1rem;
            font-weight: 700;
            color: #c7d2fe;
            border-bottom: 2px solid rgba(255, 255, 255, 0.1);
            position: sticky;
            top: 0;
            z-index: 1;
        }

        .lw-table td {
            padding: 0.9rem 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #e5e7eb;
        }

        .lw-table tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }

        .lw-table tr.lw-current-user {
            background: rgba(99, 102, 241, 0.15) !important;
            border-left: 4px solid #6366f1;
        }

        .lw-rank {
            font-weight: 700;
            width: 50px;
        }

        .lw-rank-1 { color: #ffd700; }
        .lw-rank-2 { color: #c0c0c0; }
        .lw-rank-3 { color: #cd7f32; }

        .lw-close-btn {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            background: none;
            border: none;
            color: #9ca3af;
            font-size: 1.8rem;
            cursor: pointer;
            transition: color 0.2s ease;
        }

        .lw-close-btn:hover {
            color: #fff;
        }

        /* Profile banner in header */
        .lw-profile-banner {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 0.9rem;
            color: #c7d2fe;
        }

        .lw-logout-link {
            color: #ef4444;
            text-decoration: none;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .lw-logout-link:hover {
            opacity: 0.8;
            text-decoration: underline;
        }

        @keyframes lwFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = styles;
    document.head.appendChild(styleEl);

    // API Config
    const API_BASE = window.location.origin; // e.g. http://localhost:3000 or production domain

    // Helper: Make API calls with timeout fallback
    async function apiRequest(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (data) {
                options.body = JSON.stringify(data);
            }
            const res = await fetch(`${API_BASE}${endpoint}`, options);
            if (!res.ok) throw new Error('API server returned error code');
            return await res.json();
        } catch (err) {
            console.warn(`[Leaderboard API Fallback] Local server unreachable. Falling back to local storage.`);
            return null; // Signals fallback to local storage
        }
    }

    // Determine current quiz topic based on the file name
    function getTopicName() {
        const path = window.location.pathname;
        if (path.includes('electrostats')) return 'Electrostats';
        if (path.includes('optics')) return 'Optics';
        if (path.includes('refraction')) return 'Refraction';
        return 'General';
    }

    // Show Registration/Login Screen Overlay
    window.showLoginModal = function(callback) {
        // Remove existing overlay if any
        const existing = document.getElementById('lw-login-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'lw-login-overlay';
        overlay.className = 'lw-overlay';

        overlay.innerHTML = `
            <div class="lw-card">
                <div class="lw-title">Student Registration</div>
                <div class="lw-desc">Please enter your Name and Phone Number to start your exam. Your scores will be recorded under this profile.</div>
                
                <form id="lw-login-form" onsubmit="event.preventDefault(); return false;" style="display:flex; flex-direction:column; gap:1.25rem;">
                    <div class="lw-field">
                        <label class="lw-label" for="lw-student-name">Student Name</label>
                        <input type="text" id="lw-student-name" class="lw-input" placeholder="e.g. John Doe" required autocomplete="name">
                    </div>
                    <div class="lw-field">
                        <label class="lw-label" for="lw-student-phone">Phone Number</label>
                        <input type="tel" id="lw-student-phone" class="lw-input" placeholder="e.g. 9876543210" required pattern="[0-9]{10,15}" title="Please enter a valid 10-15 digit phone number">
                    </div>
                    <button type="submit" class="lw-btn" style="margin-top:0.5rem;">Join Exam Portal</button>
                </form>
            </div>
        `;

        document.body.appendChild(overlay);

        const form = document.getElementById('lw-login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('lw-student-name').value.trim();
            const phone = document.getElementById('lw-student-phone').value.trim();

            if (!name || !phone) return;

            const userObj = { name, phone };

            // Attempt backend synchronization
            const result = await apiRequest('/api/login', 'POST', userObj);
            
            // Save locally
            localStorage.setItem('student_user', JSON.stringify(userObj));
            
            // Remove overlay
            overlay.remove();
            
            // Update Page Header UI
            updateHeaderProfile();

            if (callback) callback(userObj);
        });
    };

    // Logout
    window.logoutStudent = function() {
        if (confirm("Are you sure you want to log out? This will reset your session.")) {
            localStorage.removeItem('student_user');
            window.location.reload();
        }
    };

    // Update the HTML header to show logged-in user
    function updateHeaderProfile() {
        const userStr = localStorage.getItem('student_user');
        if (!userStr) {
            // If not logged in, but on homepage, show login trigger link
            const isExamPage = window.location.pathname.includes('_exam.html');
            if (!isExamPage) {
                let container = document.querySelector('.portal-header');
                if (container) {
                    let banner = document.getElementById('lw-header-profile');
                    if (!banner) {
                        banner = document.createElement('div');
                        banner.id = 'lw-header-profile';
                        banner.className = 'lw-profile-banner';
                        banner.style.marginTop = '1rem';
                        banner.style.justifyContent = 'center';
                        container.appendChild(banner);
                    }
                    banner.innerHTML = `<span class="lw-logout-link" style="color:#6366f1;" onclick="window.showLoginModal()">👤 Student Login / Register</span>`;
                }
            }
            return;
        }

        const user = JSON.parse(userStr);
        
        // Find the right container to inject profile details
        let container = document.querySelector('header') || document.querySelector('.portal-header');
        if (!container) return;

        // Check if banner already exists
        let banner = document.getElementById('lw-header-profile');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'lw-header-profile';
            banner.className = 'lw-profile-banner';
            
            if (container.classList.contains('portal-header')) {
                banner.style.marginTop = '1rem';
                banner.style.justifyContent = 'center';
                container.appendChild(banner);
            } else {
                const controls = container.querySelector('.presenter-controls') || container.querySelector('.nav-section');
                if (controls) {
                    container.insertBefore(banner, controls);
                } else {
                    container.appendChild(banner);
                }
            }
        }

        banner.innerHTML = `
            <span>👤 <strong>${user.name}</strong> (${user.phone})</span>
            <span class="lw-logout-link" onclick="window.logoutStudent()">Logout</span>
        `;
    }

    // Load and Show High Score Leaderboard modal
    window.showLeaderboardModal = async function() {
        const topic = getTopicName();
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'lw-leaderboard-overlay';
        overlay.className = 'lw-overlay';
        
        overlay.innerHTML = `
            <div class="lw-card lw-leaderboard-modal">
                <button class="lw-close-btn" onclick="document.getElementById('lw-leaderboard-overlay').remove()">&times;</button>
                <div class="lw-title" style="margin-bottom:0.5rem;">🏆 High Scores</div>
                <div class="lw-desc" style="margin-bottom:1.5rem;">Top 10 leaderboard rankings for <strong>${topic} Exam</strong></div>
                
                <div class="lw-table-container">
                    <table class="lw-table">
                        <thead>
                            <tr>
                                <th class="lw-rank">Rank</th>
                                <th>Name</th>
                                <th style="text-align:right;">Score</th>
                                <th style="text-align:right;">Accuracy</th>
                                <th style="text-align:right;">Time</th>
                            </tr>
                        </thead>
                        <tbody id="lw-leaderboard-body">
                            <tr>
                                <td colspan="5" style="text-align:center; padding:2rem; color:#9ca3af;">Loading scores...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <button class="lw-btn" onclick="document.getElementById('lw-leaderboard-overlay').remove()" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:#fff; box-shadow:none;">Close Leaderboard</button>
            </div>
        `;
        
        document.body.appendChild(overlay);

        // Fetch rankings from API
        let scores = await apiRequest(`/api/scores?topic=${topic}`, 'GET');
        
        // Fallback: Read from LocalStorage scores if API unavailable
        if (!scores) {
            const localRaw = localStorage.getItem(`local_scores_${topic.toLowerCase()}`) || '[]';
            const rawScores = JSON.parse(localRaw);
            
            // Sort
            rawScores.sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
                return a.timeTaken - b.timeTaken;
            });
            
            // Filter unique by phone
            scores = [];
            const seen = new Set();
            for (const item of rawScores) {
                if (!seen.has(item.phone)) {
                    seen.add(item.phone);
                    scores.push(item);
                    if (scores.length >= 10) break;
                }
            }
        }

        const tbody = document.getElementById('lw-leaderboard-body');
        if (!scores || scores.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:2rem; color:#9ca3af;">No scores recorded yet. Be the first! 🚀</td>
                </tr>
            `;
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem('student_user') || '{}');
        tbody.innerHTML = '';

        scores.forEach((item, index) => {
            const rank = index + 1;
            let rankClass = `lw-rank-${rank}`;
            const isCurrentUser = item.phone === currentUser.phone || (item.name === currentUser.name && currentUser.phone === undefined);
            
            const tr = document.createElement('tr');
            if (isCurrentUser) tr.className = 'lw-current-user';

            tr.innerHTML = `
                <td class="lw-rank ${rankClass}">#${rank}</td>
                <td><strong>${item.name}</strong></td>
                <td style="text-align:right; font-weight:700; color:#34d399;">${item.score} pts</td>
                <td style="text-align:right;">${item.accuracy}%</td>
                <td style="text-align:right; color:#9ca3af;">${item.timeTaken}s</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Submit student score when they complete the exam
    window.submitExamScore = async function(score, accuracy, timeTaken) {
        const userStr = localStorage.getItem('student_user');
        if (!userStr) return;

        const user = JSON.parse(userStr);
        const topic = getTopicName();

        const scorePayload = {
            name: user.name,
            phone: user.phone,
            topic: topic,
            score: Number(score),
            accuracy: Number(accuracy),
            timeTaken: Number(timeTaken)
        };

        // Try posting to local server
        const success = await apiRequest('/api/scores', 'POST', scorePayload);

        // Always save locally to LocalStorage too, as redundancy and fallback
        const localKey = `local_scores_${topic.toLowerCase()}`;
        const localRaw = localStorage.getItem(localKey) || '[]';
        const localScores = JSON.parse(localRaw);
        localScores.push(scorePayload);
        localStorage.setItem(localKey, JSON.stringify(localScores));
        
        console.log(`[Leaderboard] Score submitted successfully:`, scorePayload);
    };

    // Start selected exam checking if user is logged in
    window.startSelectedExam = function() {
        const dropdown = document.getElementById('exam-dropdown');
        if (!dropdown) return;
        
        const val = dropdown.value;
        const userStr = localStorage.getItem('student_user');
        
        if (!userStr) {
            window.showLoginModal((userObj) => {
                window.location.href = val;
            });
        } else {
            window.location.href = val;
        }
    };

    // Setup function runs immediately on load
    function init() {
        const isExamPage = window.location.pathname.includes('_exam.html');
        const userStr = localStorage.getItem('student_user');
        
        if (isExamPage) {
            // Exam pages strictly require login upfront
            if (!userStr) {
                window.showLoginModal();
            } else {
                updateHeaderProfile();
            }
        } else {
            // Homepage/other pages do not force login, but show status
            updateHeaderProfile();
        }

        // 2. Inject "Leaderboard" button in the header (only on exam pages)
        if (isExamPage) {
            let header = document.querySelector('header');
            if (header) {
                if (!document.getElementById('lw-leaderboard-btn')) {
                    const nav = header.querySelector('.presenter-controls') || header.querySelector('.nav-section') || header;
                    const btn = document.createElement('button');
                    btn.id = 'lw-leaderboard-btn';
                    btn.className = 'btn';
                    btn.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                    btn.innerHTML = '🏆 High Scores';
                    btn.onclick = window.showLeaderboardModal;
                    
                    if (nav !== header) {
                        nav.insertBefore(btn, nav.firstChild);
                    } else {
                        header.appendChild(btn);
                    }
                }
            }
        }
    }

    // Auto-initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
