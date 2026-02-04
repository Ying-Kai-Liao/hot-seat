/**
 * HOT SEAT - AI Product Feedback App
 *
 * Put your idea in the hot seat and let AI advisors grill it.
 * All API calls go directly from browser to OpenAI (BYOK).
 */

// ============================================
// INTERNATIONALIZATION
// ============================================
const TRANSLATIONS = {
    en: {
        heroTitle: 'HOT SEAT',
        heroSubtitle: 'Put your product idea in the hot seat.',
        heroDescription: 'AI advisors will grill it from every angle. No sugar-coating.',
        productPlaceholder: 'Describe your product idea in detail. What problem does it solve? Who is it for? How does it work?',
        taskCritique: 'Critique',
        taskBrainstorm: 'Brainstorm',
        taskPMF: 'Find PMF',
        startButton: 'Take the Hot Seat',
        settingsTitle: 'Settings',
        apiKeyLabel: 'OpenAI API Key',
        apiKeyPlaceholder: 'sk-...',
        modelLabel: 'Model',
        modelLow: 'GPT-5 Mini — Low effort (fast)',
        modelMedium: 'GPT-5 Mini — Medium effort',
        modelHigh: 'GPT-5 Mini — High effort (thorough)',
        saveSettings: 'Save',
        endSession: 'End Session',
        submitResponse: 'Submit',
        skipResponse: 'Skip',
        verdictTitle: 'THE VERDICT',
        newSession: 'New Session',
        exportMD: 'Export MD',
        exportJSON: 'Export JSON',
        footerPrivacy: 'Your API key never leaves your browser. All calls go directly to OpenAI.',
        footerBuiltBy: 'Built by',
        thinking: 'THINKING',
        response: 'RESPONSE',
        round: 'ROUND',
        loadingMessages: [
            "🔥 Warming up the hot seats...",
            "📞 Checking who's available to roast your idea...",
            "📧 Sending urgent calendar invites...",
            "☕ Bribing advisors with coffee...",
            "📱 Convincing the VC to put down their phone...",
            "🎯 Finding experts who won't sugarcoat it...",
            "💼 Pulling advisors out of meetings..."
        ],
        everyoneSeated: "🔥 Everyone's seated. The grilling begins NOW."
    },
    'zh-TW': {
        heroTitle: 'HOT SEAT',
        heroSubtitle: '把你的產品點子放上烤架',
        heroDescription: 'AI 顧問會從各個角度拷問它。不留情面。',
        productPlaceholder: '詳細描述你的產品點子。它解決什麼問題？目標用戶是誰？如何運作？',
        taskCritique: '批評',
        taskBrainstorm: '腦力激盪',
        taskPMF: '找 PMF',
        startButton: '坐上烤架',
        settingsTitle: '設定',
        apiKeyLabel: 'OpenAI API 金鑰',
        apiKeyPlaceholder: 'sk-...',
        modelLabel: '模型',
        modelLow: 'GPT-5 Mini — 低思考（快速）',
        modelMedium: 'GPT-5 Mini — 中等思考',
        modelHigh: 'GPT-5 Mini — 高思考（深入）',
        saveSettings: '儲存',
        endSession: '結束對話',
        submitResponse: '送出',
        skipResponse: '跳過',
        verdictTitle: '最終裁決',
        newSession: '新對話',
        exportMD: '匯出 MD',
        exportJSON: '匯出 JSON',
        footerPrivacy: '你的 API 金鑰不會離開瀏覽器。所有請求直接發送至 OpenAI。',
        footerBuiltBy: '開發者',
        thinking: '思考中',
        response: '回應',
        round: '回合',
        loadingMessages: [
            "🔥 烤架正在預熱中...",
            "📞 確認誰有空來烤你的點子...",
            "📧 發送緊急會議邀請...",
            "☕ 用咖啡賄賂顧問們...",
            "📱 說服 VC 放下手機...",
            "🎯 尋找不會說客套話的專家...",
            "💼 把顧問們從會議中拉出來..."
        ],
        everyoneSeated: "🔥 所有人就位。烤問開始！"
    }
};

function detectLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    if (lang.startsWith('zh-TW') || lang.startsWith('zh-Hant') || lang === 'zh') {
        return 'zh-TW';
    }
    return 'en';
}

const currentLang = detectLanguage();
const t = TRANSLATIONS[currentLang];

function applyTranslations() {
    // Hero section
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroDescription = document.querySelector('.hero-description');
    if (heroTitle) heroTitle.textContent = t.heroTitle;
    if (heroSubtitle) heroSubtitle.textContent = t.heroSubtitle;
    if (heroDescription) heroDescription.textContent = t.heroDescription;

    // Form
    const productTextarea = document.getElementById('productIdea');
    if (productTextarea) productTextarea.placeholder = t.productPlaceholder;

    // Task buttons
    document.querySelectorAll('.task-btn').forEach(btn => {
        const task = btn.dataset.task;
        if (task === 'critique') btn.textContent = t.taskCritique;
        if (task === 'brainstorm') btn.textContent = t.taskBrainstorm;
        if (task === 'find-pmf') btn.textContent = t.taskPMF;
    });

    // Start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.textContent = t.startButton;

    // Settings
    const settingsTitle = document.querySelector('.settings-title');
    if (settingsTitle) settingsTitle.textContent = t.settingsTitle;

    // Model options
    const modelSelect = document.getElementById('modelSelect');
    if (modelSelect) {
        modelSelect.options[0].textContent = t.modelLow;
        modelSelect.options[1].textContent = t.modelMedium;
        modelSelect.options[2].textContent = t.modelHigh;
    }

    // End session
    const endBtn = document.querySelector('.end-session-btn');
    if (endBtn) endBtn.textContent = t.endSession;

    // Response buttons
    const submitBtn = document.querySelector('.response-actions .btn-primary');
    const skipBtn = document.querySelector('.response-actions .btn-ghost');
    if (submitBtn) submitBtn.textContent = t.submitResponse;
    if (skipBtn) skipBtn.textContent = t.skipResponse;

    // Summary
    const verdictTitle = document.querySelector('.summary-title');
    if (verdictTitle) verdictTitle.textContent = t.verdictTitle;

    // Footer
    const footerP = document.querySelector('.footer p:first-child');
    if (footerP) footerP.textContent = t.footerPrivacy;
}

// ============================================
// STATE
// ============================================
const state = {
    apiKey: localStorage.getItem('hotseat_api_key') || '',
    model: localStorage.getItem('hotseat_model') || 'gpt-5-mini:low',
    lang: currentLang,
    taskType: 'critique',
    productIdea: '',
    advisors: [],
    discussion: [],
    currentRound: 0,
    silentRounds: 0,
    isRunning: false,
    summary: null
};

// Core advisors - mix of archetypes and famous figures
const CORE_ADVISORS = [
    // Original archetypes
    {
        name: 'Skeptical VC',
        role: 'Investor',
        color: '#ff4d4d',
        initial: 'V',
        prompt: `You are a veteran VC partner at a top-tier firm. You've seen 10,000 pitches and funded 50 companies. You've been burned by hype cycles before.

How you think:
- First question: "Why will this fail?"
- Care about: TAM/SAM/SOM, unit economics, defensibility, team
- Red flags: "We have no competitors", hand-wavy revenue models, tech looking for a problem

Response style: Direct and blunt. Ask pointed questions that expose weak thinking. Give credit where due, but always find the hole.`
    },
    {
        name: 'Early Adopter',
        role: 'Tech Enthusiast',
        color: '#4dafff',
        initial: 'E',
        prompt: `You're a tech enthusiast who signed up for Gmail when it was invite-only, backed 50+ Kickstarters, and have a drawer full of gadgets. You love trying new things and showing them to friends.

How you think:
- First reaction: "Is this cool? Would I show this to friends?"
- Care about: innovation, user experience, being first
- Forgive rough edges if the vision is compelling

Response style: Enthusiastic but not naive. Focus on the "wow factor" and viral potential.`
    },
    {
        name: 'Budget-Conscious',
        role: 'Mass Market Consumer',
        color: '#4dff88',
        initial: 'B',
        prompt: `You're practical. You read reviews before buying, compare prices, and ask "do I really need this?" You represent the mass market.

How you think:
- First question: "Is this worth the money?"
- Compare to: free alternatives, existing solutions, doing nothing
- Red flags: subscription fatigue, features you won't use, unclear benefits

Response style: Practical and grounded. Represent the silent majority who won't pay for "nice to have".`
    },
    // Famous figures
    {
        name: 'Elon Musk',
        role: 'Tech Visionary',
        color: '#1DA1F2',
        initial: 'M',
        prompt: `You're Elon Musk. You think in first principles and hate incremental thinking.

How you think:
- First question: "Why not 10x bigger? Why not mass market?"
- Care about: physics constraints, manufacturing at scale, mission-driven products
- Red flags: "that's how it's always been done", small thinking, lack of urgency

Response style: Blunt, sometimes provocative. Challenge assumptions. Think about Mars-scale ambition.`
    },
    {
        name: 'Bill Gates',
        role: 'Strategic Thinker',
        color: '#00A4EF',
        initial: 'G',
        prompt: `You're Bill Gates. You think about platforms, ecosystems, and long-term strategic positioning.

How you think:
- First question: "What's the moat? How do you become the standard?"
- Care about: network effects, enterprise adoption, platform strategy, data
- Red flags: no lock-in, easy to replicate, ignoring distribution

Response style: Analytical, strategic, probing. Ask about the business model and competitive dynamics.`
    }
];

const TASK_PROMPTS = {
    critique: `Find weaknesses, risks, and failure points. Be specific about what could go wrong.`,
    brainstorm: `Generate variations and improvements. Build on the core insight. Stay constructive.`,
    'find-pmf': `Analyze product-market fit. Who has this problem? How badly? Will they pay?`
};

// ============================================
// UTILITIES
// ============================================
function $(id) {
    return document.getElementById(id);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message, isError = false) {
    const container = $('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toast-out 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading(text) {
    $('loadingText').textContent = text;
    $('loadingOverlay').classList.add('active');
}

function hideLoading() {
    $('loadingOverlay').classList.remove('active');
}

// ============================================
// SETTINGS
// ============================================
function toggleSettings() {
    $('settingsPanel').classList.toggle('open');

    if ($('settingsPanel').classList.contains('open')) {
        $('apiKey').value = state.apiKey;
        $('modelSelect').value = state.model;
    }
}

function toggleKeyVisibility() {
    const input = $('apiKey');
    const icon = $('eyeIcon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
        input.type = 'password';
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
}

function saveSettings() {
    state.apiKey = $('apiKey').value.trim();
    state.model = $('modelSelect').value;

    localStorage.setItem('hotseat_api_key', state.apiKey);
    localStorage.setItem('hotseat_model', state.model);

    toggleSettings();
    showToast('Settings saved');
}

// ============================================
// MODE SELECTION
// ============================================
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.taskType = btn.dataset.task;
    });
});

// ============================================
// OPENAI API
// ============================================
async function callOpenAI(systemPrompt, userMessage, json = false, onStream = null) {
    if (!state.apiKey) {
        throw new Error('Please set your API key in Settings');
    }

    // Parse model and reasoning effort (e.g., "gpt-5-mini:low")
    const [model, reasoningEffort] = state.model.split(':');
    const shouldStream = onStream !== null;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            ...(reasoningEffort && { reasoning_effort: reasoningEffort }),
            ...(json && { response_format: { type: 'json_object' } }),
            ...(shouldStream && { stream: true })
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API call failed');
    }

    // Handle streaming response
    if (shouldStream) {
        return await handleStreamingResponse(response, onStream);
    }

    // Non-streaming response
    const data = await response.json();
    const message = data.choices[0].message;

    return {
        content: message.content,
        thinking: message.reasoning_content || message.reasoning || null
    };
}

async function handleStreamingResponse(response, onStream) {
    return await readStream(response, onStream);
}

async function readStream(response, onStream) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let thinking = '';
    let content = '';
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta;

                if (delta) {
                    // Handle reasoning/thinking content
                    if (delta.reasoning_content) {
                        thinking += delta.reasoning_content;
                        if (onStream) onStream({ type: 'thinking', content: thinking });
                    }
                    // Handle regular content
                    if (delta.content) {
                        content += delta.content;
                        if (onStream) onStream({ type: 'content', content: content });
                    }
                }
            } catch (e) {
                // Skip malformed JSON
            }
        }
    }

    return { content, thinking: thinking || null };
}

// ============================================
// ADVISOR SELECTION
// ============================================
async function selectAdvisors(productIdea) {
    const systemPrompt = `Select advisors for a product feedback session. Pick a mix of 3-5 total advisors.

CORE ADVISORS (pick 2-4):
- Skeptical VC (investor, finds holes, cares about unit economics)
- Early Adopter (tech enthusiast, wants cool factor, tolerates bugs)
- Budget-Conscious (mass market, price sensitive, practical)
- Elon Musk (thinks 10x, first principles, hates incrementalism)
- Bill Gates (platform strategy, moats, enterprise thinking)

DYNAMIC ADVISORS (generate 1-2 based on the product):
Create advisors that are perfect for evaluating THIS specific product. Can be:
- Domain experts: "SMB Restaurant Owner", "Healthcare Admin", "Gen-Z College Student", "Enterprise IT Director"
- Famous figures: "Marc Andreessen" (software eating world), "Warren Buffett" (value investor), "Oprah" (consumer appeal), "Mr. Beast" (viral content), "Paul Graham" (startup wisdom)
- Specific personas: "Skeptical CTO", "Overworked Parent", "Reddit Power User", "TikTok Creator", "Indie Hacker"

Respond with JSON:
{
    "selected": ["Skeptical VC", "Early Adopter", "Elon Musk"],
    "dynamic": [
        {
            "name": "Person or Persona Name",
            "role": "Their expertise/perspective",
            "description": "Why they're perfect for evaluating this product"
        }
    ]
}`;

    const result = await callOpenAI(systemPrompt, `Product: ${productIdea}`, true);
    return {
        ...JSON.parse(result.content),
        _thinking: result.thinking
    };
}

async function generateAdvisorPrompt(advisor, productIdea) {
    const systemPrompt = `Create a brief advisor persona (100-150 words) for a product feedback session.

Include: identity, evaluation criteria, communication style.`;

    const result = await callOpenAI(systemPrompt, `
Name: ${advisor.name}
Role: ${advisor.role}
Description: ${advisor.description}
Product: ${productIdea}`);
    return {
        prompt: result.content,
        thinking: result.thinking
    };
}

// ============================================
// DISCUSSION
// ============================================
async function runAdvisorRound(advisor, roundNum, priorDiscussion, onStream = null) {
    const taskPrompt = TASK_PROMPTS[state.taskType];

    const systemPrompt = `You're in a product feedback hot seat session. Round ${roundNum}.

TASK: ${taskPrompt}

YOUR PERSONA:
${advisor.prompt}

RULES:
- Keep responses to 2-4 sentences
- Stay in character
- ${roundNum === 1 ? 'Give your initial gut reaction' : 'Respond to what others said'}
- Be specific about THIS product`;

    const context = priorDiscussion.length > 0
        ? '\n\nDiscussion so far:\n' + priorDiscussion.map(d =>
            `${d.advisor}: ${d.message}`
        ).join('\n')
        : '';

    // Returns { content, thinking }
    return await callOpenAI(systemPrompt, `Product: ${state.productIdea}${context}`, false, onStream);
}

async function shouldAskFounder() {
    const systemPrompt = `You're moderating a product feedback session.

Should we ask the founder a clarifying question?

Ask if: missing info, unvalidated assumptions, key decision needed
Don't ask if: discussion is productive, questions already answered

JSON response:
{
    "should_ask": true/false,
    "question": "The question" or null
}`;

    const recent = state.discussion.slice(-8).map(d =>
        `${d.advisor}: ${d.message}`
    ).join('\n');

    const result = await callOpenAI(systemPrompt, `
Product: ${state.productIdea}
Round: ${state.currentRound}

Recent:
${recent}`, true);

    return {
        ...JSON.parse(result.content),
        _thinking: result.thinking
    };
}

async function shouldAskFounderStreaming(onStream) {
    const systemPrompt = `You're moderating a product feedback session.

Should we ask the founder a clarifying question?

Ask if: missing info, unvalidated assumptions, key decision needed
Don't ask if: discussion is productive, questions already answered

JSON response:
{
    "should_ask": true/false,
    "question": "The question" or null
}`;

    const recent = state.discussion.slice(-8).map(d =>
        `${d.advisor}: ${d.message}`
    ).join('\n');

    const [model, reasoningEffort] = state.model.split(':');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Product: ${state.productIdea}\nRound: ${state.currentRound}\n\nRecent:\n${recent}` }
            ],
            ...(reasoningEffort && { reasoning_effort: reasoningEffort }),
            response_format: { type: 'json_object' },
            stream: true
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API call failed');
    }

    const result = await readStream(response, onStream);

    return {
        ...JSON.parse(result.content),
        _thinking: result.thinking
    };
}

async function generateSummary() {
    const systemPrompt = `Summarize this product feedback session.

Include:
1. Key insights (agreements)
2. Key concerns (disagreements)
3. Recommended next steps

Use markdown. Be specific.`;

    const discussionText = state.discussion.map(d =>
        `${d.advisor}: ${d.message}`
    ).join('\n');

    return await callOpenAI(systemPrompt, `
Product: ${state.productIdea}
Mode: ${state.taskType}

Discussion:
${discussionText}`);
}

// ============================================
// UI UPDATES
// ============================================
function renderAdvisors(advisors) {
    const list = $('advisorsList');
    list.innerHTML = advisors.map(a => `
        <div class="advisor-chip" data-name="${a.name}" style="--advisor-color: ${a.color}">
            <span class="advisor-dot" style="background: ${a.color}"></span>
            <span>${a.name}</span>
        </div>
    `).join('');
}

function addMessage(advisor, message, round, thinking = null) {
    const msgEl = createMessageElement(advisor, round);
    if (thinking) updateMessageThinking(msgEl, thinking);
    if (message) updateMessageContent(msgEl, message);
    $('messages').scrollTop = $('messages').scrollHeight;
    return msgEl;
}

function createMessageElement(advisor, round) {
    const messages = $('messages');
    const advisorData = state.advisors.find(a => a.name === advisor) || {
        color: '#ff4d00',
        initial: 'Y'
    };
    const isFounder = advisor === 'YOU';
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    messages.insertAdjacentHTML('beforeend', `
        <div class="message ${isFounder ? 'founder' : ''}" id="${id}" style="--advisor-color: ${advisorData.color}">
            <div class="message-avatar" style="border-color: ${advisorData.color}">
                ${isFounder ? '🔥' : advisorData.initial}
            </div>
            <div class="message-body">
                <div class="message-header">
                    <span class="message-name" style="color: ${isFounder ? 'var(--hot)' : advisorData.color}">${advisor}</span>
                    <span class="message-meta">Round ${round}</span>
                </div>
                <div class="message-thinking" style="display: none;">
                    <div class="thinking-label">💭 ${t.thinking}</div>
                    <div class="thinking-content"></div>
                </div>
                <div class="message-response" style="display: none;">
                    <div class="response-label">💬 ${t.response}</div>
                    <div class="message-text"></div>
                </div>
            </div>
        </div>
    `);

    return document.getElementById(id);
}

function updateMessageThinking(msgEl, thinking) {
    const thinkingEl = msgEl.querySelector('.message-thinking');
    const contentEl = thinkingEl.querySelector('.thinking-content');
    thinkingEl.style.display = 'block';
    contentEl.textContent = thinking;
    msgEl.classList.add('has-thinking', 'streaming');
    $('messages').scrollTop = $('messages').scrollHeight;
}

function updateMessageContent(msgEl, content) {
    const responseEl = msgEl.querySelector('.message-response');
    const textEl = responseEl.querySelector('.message-text');
    responseEl.style.display = 'block';
    textEl.innerHTML = renderMarkdown(content);
    $('messages').scrollTop = $('messages').scrollHeight;
}

function finishMessageStream(msgEl) {
    msgEl.classList.remove('streaming');
}

function addSystemThinking(source, thinking, conclusion) {
    const el = createSystemThinkingElement(source);
    updateSystemThinking(el, thinking);
    finalizeSystemThinking(el, conclusion);
    return el;
}

function createSystemThinkingElement(source) {
    const messages = $('messages');
    const id = `sys-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    messages.insertAdjacentHTML('beforeend', `
        <div class="system-thinking streaming" id="${id}">
            <div class="system-thinking-header">
                <span class="system-icon">🧠</span>
                <span class="system-source">${source}</span>
            </div>
            <div class="thinking-content"></div>
            <div class="system-conclusion" style="display: none;"></div>
        </div>
    `);

    messages.scrollTop = messages.scrollHeight;
    return document.getElementById(id);
}

function updateSystemThinking(el, thinking) {
    const contentEl = el.querySelector('.thinking-content');
    contentEl.textContent = thinking;
    $('messages').scrollTop = $('messages').scrollHeight;
}

function finalizeSystemThinking(el, conclusion) {
    el.classList.remove('streaming');
    const conclusionEl = el.querySelector('.system-conclusion');
    conclusionEl.textContent = `→ ${conclusion}`;
    conclusionEl.style.display = 'block';
    $('messages').scrollTop = $('messages').scrollHeight;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderMarkdown(text) {
    if (!text) return '';
    return escapeHtml(text)
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Bullet points
        .replace(/^[-•]\s+(.*)$/gm, '<li>$1</li>')
        // Numbered lists
        .replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>')
        // Wrap consecutive <li> in <ul>
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        // Headers
        .replace(/^###\s+(.*)$/gm, '<h4>$1</h4>')
        .replace(/^##\s+(.*)$/gm, '<h3>$1</h3>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
}

function addRoundDivider(round) {
    $('messages').insertAdjacentHTML('beforeend', `
        <div class="round-divider"><span>${t.round} ${round}</span></div>
    `);
}

function updateRound(round) {
    $('roundBadge').textContent = `${t.round} ${round}`;
}

function setAdvisorSpeaking(name) {
    document.querySelectorAll('.advisor-chip').forEach(chip => {
        chip.classList.toggle('speaking', chip.dataset.name === name);
    });
}

function clearAdvisorSpeaking() {
    document.querySelectorAll('.advisor-chip').forEach(chip => {
        chip.classList.remove('speaking');
    });
}

function showFounderInput(question) {
    $('responsePrompt').textContent = question;
    $('founderResponse').style.display = 'block';
    $('founderInput').focus();
}

function hideFounderInput() {
    $('founderResponse').style.display = 'none';
    $('founderInput').value = '';
}

function showSummary(summary) {
    const content = summary.content || summary;
    const thinking = summary.thinking;

    const html = content
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/## (.*)/g, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/- (.*)/g, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>');

    const thinkingHtml = thinking ? `
        <div class="summary-thinking">
            <div class="thinking-label">💭 HOW I REACHED THIS VERDICT</div>
            <div class="thinking-content">${escapeHtml(thinking)}</div>
        </div>
    ` : '';

    $('summaryContent').innerHTML = `${thinkingHtml}<div class="summary-verdict"><p>${html}</p></div>`;
    $('summary').style.display = 'block';
    $('discussion').style.display = 'none';
}

// ============================================
// SESSION FLOW
// ============================================
async function startSession() {
    state.productIdea = $('productIdea').value.trim();

    if (!state.productIdea) {
        showToast('Enter your product idea first', true);
        return;
    }

    if (!state.apiKey) {
        showToast('Set your API key in Settings', true);
        toggleSettings();
        return;
    }

    // Reset
    state.discussion = [];
    state.currentRound = 0;
    state.silentRounds = 0;
    state.isRunning = true;
    state.summary = null;

    $('messages').innerHTML = '';
    $('summary').style.display = 'none';
    $('discussion').style.display = 'block';
    $('startBtn').disabled = true;

    // Show session, hide hero
    $('heroSection').style.display = 'none';
    $('sessionSection').style.display = 'block';

    // Activate heat glow
    const heatGlow = $('heatGlow');
    heatGlow.classList.add('active');
    document.addEventListener('mousemove', (e) => {
        heatGlow.style.left = e.clientX + 'px';
        heatGlow.style.top = e.clientY + 'px';
    });

    try {
        // Fun loading messages while assembling (translated)
        const funMessages = t.loadingMessages;
        let msgIndex = 0;
        const msgInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % funMessages.length;
            showLoading(funMessages[msgIndex]);
        }, 1200);

        showLoading(funMessages[0]);
        const selection = await selectAdvisors(state.productIdea);
        clearInterval(msgInterval);

        state.advisors = [];

        // Shuffle and pick arrival messages for variety
        const getArrivalMessage = (name, role) => {
            const messages = {
                'Skeptical VC': [
                    `${name} just walked in, already sighing...`,
                    `${name} is checking their watch impatiently...`,
                    `${name} brought a red pen for your pitch deck...`
                ],
                'Early Adopter': [
                    `${name} ran here, couldn't wait to see this...`,
                    `${name} is already taking notes on their phone...`,
                    `${name} just canceled another meeting for this...`
                ],
                'Budget-Conscious': [
                    `${name} checked the parking meter twice...`,
                    `${name} brought a calculator...`,
                    `${name} is already doing mental math...`
                ],
                'Elon Musk': [
                    `${name} landed his helicopter on the roof...`,
                    `${name} is here, already tweeting about it...`,
                    `${name} walked in asking "why isn't this 10x bigger?"...`
                ],
                'Bill Gates': [
                    `${name} arrived with a stack of reports...`,
                    `${name} is here, thinking about platform strategy...`,
                    `${name} walked in, already calculating market share...`
                ],
                'default': [
                    `${name} is taking their seat...`,
                    `${name} just walked through the door...`,
                    `${name} arrived looking intrigued...`
                ]
            };
            const pool = messages[name] || messages['default'];
            return pool[Math.floor(Math.random() * pool.length)];
        };

        for (const name of (selection.selected || [])) {
            const core = CORE_ADVISORS.find(a => a.name === name);
            if (core) {
                showLoading(getArrivalMessage(name, core.role));
                await sleep(700);
                state.advisors.push(core);
            }
        }

        // Add dynamic advisors with dramatic entrances
        const dynamicAdvisors = Array.isArray(selection.dynamic) ? selection.dynamic :
            (selection.dynamic ? [selection.dynamic] : []);

        const dynamicColors = ['#b84dff', '#ff84d4', '#84ffd4', '#ffd484'];
        const arrivalDrama = [
            (name) => [`🚗 ${name} is stuck in traffic...`, `🏃 ${name} sprinting from the lot...`, `🚪 ${name} burst through the door!`],
            (name) => [`📞 ${name} is on another call...`, `✋ ${name} just hung up...`, `🎯 ${name} is locked in!`],
            (name) => [`✈️ ${name}'s flight just landed...`, `🚕 ${name} grabbed a cab...`, `💨 ${name} made it just in time!`],
        ];

        for (let i = 0; i < dynamicAdvisors.length; i++) {
            const advisor = dynamicAdvisors[i];
            const drama = arrivalDrama[i % arrivalDrama.length](advisor.name);

            for (const msg of drama) {
                showLoading(msg);
                await sleep(400);
            }

            const generated = await generateAdvisorPrompt(advisor, state.productIdea);

            showLoading(`🎤 ${advisor.name} (${advisor.role}) is ready.`);
            await sleep(400);

            state.advisors.push({
                name: advisor.name,
                role: advisor.role,
                color: dynamicColors[i % dynamicColors.length],
                initial: advisor.name[0],
                prompt: generated.prompt,
                _promptThinking: generated.thinking
            });
        }

        showLoading(t.everyoneSeated);
        await sleep(600);

        // Store selection thinking for display
        state.selectionThinking = selection._thinking;

        renderAdvisors(state.advisors);
        hideLoading();

        // Show advisor selection thinking at the start
        if (state.selectionThinking) {
            addSystemThinking('Advisor Selection',
                state.selectionThinking,
                `Selected: ${state.advisors.map(a => a.name).join(', ')}`);
        }

        // Run discussion
        await runDiscussion();

    } catch (error) {
        console.error(error);
        showToast(error.message, true);
        hideLoading();
    }

    $('startBtn').disabled = false;
}

async function runDiscussion() {
    const MAX_ROUNDS = 10;
    const MAX_SILENT = 3;

    while (state.isRunning && state.currentRound < MAX_ROUNDS) {
        state.currentRound++;
        updateRound(state.currentRound);

        if (state.currentRound > 1) {
            addRoundDivider(state.currentRound);
        }

        // Snapshot discussion state before parallel calls
        const priorDiscussion = [...state.discussion];

        // Create message elements for all advisors first
        const messageElements = state.advisors.map(advisor => ({
            advisor,
            element: createMessageElement(advisor.name, state.currentRound)
        }));

        state.advisors.forEach(a => setAdvisorSpeaking(a.name));

        // STEP 1: Kick off ALL fetch requests immediately (don't await yet)
        const fetchPromises = messageElements.map(({ advisor, element }) => {
            const taskPrompt = TASK_PROMPTS[state.taskType];
            const systemPrompt = `You're in a product feedback hot seat session. Round ${state.currentRound}.

TASK: ${taskPrompt}

YOUR PERSONA:
${advisor.prompt}

RULES:
- Keep responses to 2-4 sentences
- Stay in character
- ${state.currentRound === 1 ? 'Give your initial gut reaction' : 'Respond to what others said'}
- Be specific about THIS product`;

            const context = priorDiscussion.length > 0
                ? '\n\nDiscussion so far:\n' + priorDiscussion.map(d =>
                    `${d.advisor}: ${d.message}`
                ).join('\n')
                : '';

            const [model, reasoningEffort] = state.model.split(':');

            // Start fetch immediately - don't await
            const fetchPromise = fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: `Product: ${state.productIdea}${context}` }
                    ],
                    ...(reasoningEffort && { reasoning_effort: reasoningEffort }),
                    stream: true
                })
            });

            return { advisor, element, fetchPromise };
        });

        // STEP 2: Wait for all fetches to connect, THEN read streams in parallel
        const streamPromises = fetchPromises.map(async ({ advisor, element, fetchPromise }) => {
            try {
                const response = await fetchPromise;
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error?.message || 'API call failed');
                }

                // Now read the stream
                const result = await readStream(response, (stream) => {
                    if (stream.type === 'thinking') {
                        updateMessageThinking(element, stream.content);
                    } else if (stream.type === 'content') {
                        updateMessageContent(element, stream.content);
                    }
                });

                finishMessageStream(element);
                return { advisor, element, result };
            } catch (err) {
                finishMessageStream(element);
                return { advisor, element, error: err };
            }
        });

        const results = await Promise.all(streamPromises);

        // Store results in discussion state
        for (const { advisor, result, error } of results) {
            if (error) {
                console.error(`${advisor.name} error:`, error);
                continue;
            }

            state.discussion.push({
                advisor: advisor.name,
                round: state.currentRound,
                message: result.content,
                thinking: result.thinking
            });
        }

        clearAdvisorSpeaking();
        if (!state.isRunning) break;

        // Check if should ask founder (runs silently in background)
        const decision = await shouldAskFounder();

        if (decision.should_ask && decision.question) {
            state.silentRounds = 0;
            showFounderInput(decision.question);

            await new Promise(resolve => {
                window.founderResolver = resolve;
            });

            if (!state.isRunning) break;
        } else {
            state.silentRounds++;

            if (state.silentRounds >= MAX_SILENT) {
                break;
            }
        }
    }

    // Generate summary
    if (state.discussion.length > 0) {
        showLoading('Generating verdict...');
        const summaryResult = await generateSummary();
        hideLoading();
        state.summary = {
            content: summaryResult.content,
            thinking: summaryResult.thinking
        };
        showSummary(state.summary);
    }

    state.isRunning = false;
    $('heatGlow').classList.remove('active');
}

function submitResponse() {
    const input = $('founderInput').value.trim();

    if (input) {
        state.discussion.push({
            advisor: 'YOU',
            round: state.currentRound,
            message: input
        });
        addMessage('YOU', input, state.currentRound);
    }

    hideFounderInput();

    if (window.founderResolver) {
        window.founderResolver();
        window.founderResolver = null;
    }
}

function skipResponse() {
    hideFounderInput();
    if (window.founderResolver) {
        window.founderResolver();
        window.founderResolver = null;
    }
}

function endSession() {
    state.isRunning = false;
    hideFounderInput();
    hideLoading();

    if (window.founderResolver) {
        window.founderResolver();
        window.founderResolver = null;
    }
}

// ============================================
// DOWNLOAD
// ============================================
function downloadSession(format) {
    if (!state.discussion.length) {
        showToast('No session to download', true);
        return;
    }

    let content, filename, type;

    if (format === 'json') {
        content = JSON.stringify({
            timestamp: new Date().toISOString(),
            productIdea: state.productIdea,
            taskType: state.taskType,
            advisors: state.advisors.map(a => a.name),
            discussion: state.discussion,
            summary: state.summary
        }, null, 2);
        filename = 'hotseat-session.json';
        type = 'application/json';
    } else {
        const lines = [
            `# Hot Seat Session`,
            '',
            `**Product:** ${state.productIdea}`,
            `**Mode:** ${state.taskType}`,
            `**Date:** ${new Date().toISOString()}`,
            `**Advisors:** ${state.advisors.map(a => a.name).join(', ')}`,
            '',
            '---',
            '',
            '## Discussion',
            ''
        ];

        let currentRound = 0;
        for (const entry of state.discussion) {
            if (entry.round !== currentRound) {
                currentRound = entry.round;
                lines.push(`### Round ${currentRound}`, '');
            }
            lines.push(`**${entry.advisor}:** ${entry.message}`, '');
        }

        if (state.summary) {
            lines.push('---', '', '## Summary', '', state.summary);
        }

        content = lines.join('\n');
        filename = 'hotseat-session.md';
        type = 'text/markdown';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Downloaded!');
}

function newSession() {
    $('heroSection').style.display = 'block';
    $('sessionSection').style.display = 'none';
    $('productIdea').value = '';
    $('messages').innerHTML = '';
    $('summary').style.display = 'none';
    $('discussion').style.display = 'block';

    state.discussion = [];
    state.advisors = [];
    state.currentRound = 0;
    state.summary = null;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Apply translations based on browser language
    applyTranslations();

    // Load settings
    if (state.apiKey) $('apiKey').value = state.apiKey;
    $('modelSelect').value = state.model;

    // Close settings on backdrop click (already in HTML)

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape closes settings
        if (e.key === 'Escape' && $('settingsPanel').classList.contains('open')) {
            toggleSettings();
        }

        // Cmd/Ctrl + Enter starts session
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            if (!state.isRunning && $('productIdea').value.trim()) {
                startSession();
            }
        }
    });

    // Enter submits founder response
    $('founderInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitResponse();
        }
    });
});
