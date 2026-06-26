const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'Quiz World Site', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SCORES_FILE = path.join(DATA_DIR, 'scores.json');

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 4), 'utf8');
}
if (!fs.existsSync(SCORES_FILE)) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify([], null, 4), 'utf8');
}

// MIME Types mapping
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    // Enable CORS for development/testing ease
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // API Route: Login
    if (url.pathname === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { name, phone } = JSON.parse(body);
                if (!name || !phone) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Name and phone are required' }));
                    return;
                }

                const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
                const existingUser = users.find(u => u.phone === phone);
                
                if (!existingUser) {
                    users.push({ name, phone, createdAt: new Date().toISOString() });
                    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4), 'utf8');
                } else if (existingUser.name !== name) {
                    // Update name if phone is the same but name changed
                    existingUser.name = name;
                    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4), 'utf8');
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, user: { name, phone } }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        });
        return;
    }

    // API Route: Scores
    if (url.pathname === '/api/scores') {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const { name, phone, topic, score, accuracy, timeTaken } = JSON.parse(body);
                    if (!name || !phone || !topic || score === undefined) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid score submission payload' }));
                        return;
                    }

                    const scores = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
                    scores.push({
                        name,
                        phone,
                        topic,
                        score: Number(score),
                        accuracy: Number(accuracy),
                        timeTaken: Number(timeTaken),
                        createdAt: new Date().toISOString()
                    });

                    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 4), 'utf8');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            });
            return;
        } else if (req.method === 'GET') {
            try {
                const topic = url.searchParams.get('topic');
                const scores = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
                
                // Filter by topic if specified
                let filtered = scores;
                if (topic) {
                    filtered = scores.filter(s => s.topic.toLowerCase() === topic.toLowerCase());
                }

                // Sort scores descending, then accuracy descending, then timeTaken ascending
                filtered.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
                    return a.timeTaken - b.timeTaken;
                });

                // Get top 10 unique users (highest score per user)
                const uniqueTopScores = [];
                const seenPhones = new Set();
                
                for (const item of filtered) {
                    if (!seenPhones.has(item.phone)) {
                        seenPhones.add(item.phone);
                        uniqueTopScores.push({
                            name: item.name,
                            score: item.score,
                            accuracy: item.accuracy,
                            timeTaken: item.timeTaken,
                            createdAt: item.createdAt
                        });
                        if (uniqueTopScores.length >= 10) break;
                    }
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(uniqueTopScores));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
            return;
        }
    }

    // Static Files Server
    let filePath = path.join(__dirname, decodeURIComponent(url.pathname));
    if (url.pathname === '/') {
        filePath = path.join(__dirname, 'index.html');
    }

    // Handle directories safely
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Check if directory index exists
            if (stats && stats.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Quiz World local server running at http://localhost:${PORT}\n`);
    console.log(`📁 Users list: Quiz World Site/data/users.json`);
    console.log(`🏆 Scores list: Quiz World Site/data/scores.json\n`);
});
