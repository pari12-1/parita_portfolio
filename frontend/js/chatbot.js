
/* Unique AI Chatbot Digital Twin Controller */
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.chatbot-wrapper');
  const trigger = document.querySelector('.chatbot-trigger');
  const closeBtn = document.querySelector('.chatbot-close-btn');
  const soundBtn = document.querySelector('.chatbot-sound-btn');
  const messagesContainer = document.getElementById('chat-messages');
  const inputEl = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const suggestionsBox = document.getElementById('chat-suggestions');

  if (!wrapper || !trigger || !messagesContainer || !inputEl || !sendBtn) {
    console.warn('Chatbot initialization failed: required elements are missing.');
    return;
  }

  let isAudioEnabled = true;
  let isSending = false;
  const chatHistory = [];

  // --------------------------------------------------
  // Web Audio API sound effects
  // --------------------------------------------------

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
  }

  function playCyberTone(type = 'msg') {
    if (!isAudioEnabled) return;

    try {
      initAudio();

      if (!audioCtx) return;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'send') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'recv') {
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(587, now + 0.18);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.18);

        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'open') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.linearRampToValueAtTime(659.25, now + 0.1);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (error) {
      // Audio is optional; continue without sound.
    }
  }

  window.playSfx = playCyberTone;

  // --------------------------------------------------
  // Open and close chatbot
  // --------------------------------------------------

  function toggleChatbot() {
    wrapper.classList.toggle('open');

    if (wrapper.classList.contains('open')) {
      playCyberTone('open');
      inputEl.focus();
    }
  }

  trigger.addEventListener('click', toggleChatbot);

  if (closeBtn) {
    closeBtn.addEventListener('click', toggleChatbot);
  }

  // --------------------------------------------------
  // Sound toggle
  // --------------------------------------------------

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      isAudioEnabled = !isAudioEnabled;

      soundBtn.style.color = isAudioEnabled
        ? 'var(--neon-cyan)'
        : 'var(--text-dim)';

      soundBtn.title = isAudioEnabled ? 'Sound On' : 'Sound Off';
      soundBtn.setAttribute('aria-pressed', String(isAudioEnabled));
    });
  }

  // Escape key closes the chatbot.
  window.addEventListener('keydown', (event) => {
    if (
      event.key === 'Escape' &&
      wrapper.classList.contains('open')
    ) {
      toggleChatbot();
    }
  });

  // --------------------------------------------------
  // Read actual portfolio JSON
  // --------------------------------------------------

  function getPortfolioData() {
    const dataElement = document.getElementById('portfolio-demo-data');

    if (!dataElement) {
      console.warn('portfolio-demo-data was not found in index.html.');
      return null;
    }

    try {
      const data = JSON.parse(dataElement.textContent);

      if (!data || typeof data !== 'object') {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Could not parse portfolio JSON:', error);
      return null;
    }
  }

  // --------------------------------------------------
  // Client-side fallback
  // Uses actual portfolio data, not invented projects.
  // --------------------------------------------------

  function getClientFallbackReply(query) {
    const q = query.toLowerCase();
    const portfolioData = getPortfolioData();

    const projects = Array.isArray(portfolioData?.projects)
      ? portfolioData.projects
      : [];

    const isContactQuestion =
      /\b(contact|email|hire|resume|cv)\b/i.test(query);

    const isTechnologyQuestion =
      /\b(technolog\w*|tech stack|techstack|tools used|which tools|programming language|frameworks|libraries|database|what stack|what languages)\b/i.test(query);

    const isProjectQuestion =
      /\b(projects?|work|portfolio)\b/i.test(query);

    // Contact information comes only from the portfolio JSON.
    if (isContactQuestion) {
      const lines = [];

      if (
        typeof portfolioData?.email === 'string' &&
        portfolioData.email.trim()
      ) {
        lines.push(`**Email:** ${portfolioData.email.trim()}`);
      }

      if (
        typeof portfolioData?.resumeUrl === 'string' &&
        portfolioData.resumeUrl.trim()
      ) {
        lines.push(`**Resume:** ${portfolioData.resumeUrl.trim()}`);
      }

      return {
        reply: lines.length
          ? lines.join('\n\n')
          : 'Contact details are not available in the portfolio data.',
        action: 'scroll_to_contact',
        suggestions: [
          'Tell me about the portfolio projects',
          'Explain the technologies used'
        ]
      };
    }

    // Match a specific project if its title appears in the question.
    const matchingProjects = projects.filter((project) => {
      return (
        project &&
        typeof project.title === 'string' &&
        q.includes(project.title.toLowerCase())
      );
    });

    // Technology questions use the project's actual tags.
    if (isTechnologyQuestion) {
      const selectedProjects = matchingProjects.length
        ? matchingProjects
        : projects;

      const lines = selectedProjects.map((project) => {
        const tags = Array.isArray(project.tags)
          ? [
              ...new Set(
                project.tags.filter(
                  tag => typeof tag === 'string' && tag.trim()
                )
              )
            ]
          : [];

        return `**${project.title}:** ${
          tags.length ? tags.join(', ') : 'No technologies listed.'
        }`;
      });

      return {
        reply: lines.length
          ? lines.join('\n\n')
          : 'Technology details are not available in the portfolio data.',
        action: 'scroll_to_projects',
        suggestions: [
          'Tell me about the portfolio projects',
          'Tell me about CareVoyage',
          'How can I contact the developer?'
        ]
      };
    }

    // Project questions use actual titles, summaries, types and statuses.
    if (isProjectQuestion) {
      const selectedProjects = matchingProjects.length
        ? matchingProjects
        : projects;

      const lines = selectedProjects.map((project, index) => {
        const details = [
          `**${index + 1}. ${project.title || 'Untitled project'}**`
        ];

        if (project.summary) {
          details.push(project.summary);
        }

        if (project.projectType === 'solo') {
          details.push('Type: Solo project');
        } else if (project.projectType === 'group') {
          details.push('Type: Group project');
        }

        if (project.status) {
          details.push(`Status: ${project.status}`);
        }

        return details.join('\n\n');
      });

      return {
        reply: lines.length
          ? lines.join('\n\n')
          : 'Project information is not available in the portfolio data.',
        action: 'scroll_to_projects',
        suggestions: [
          'Explain the technologies used',
          'Tell me about CareVoyage',
          'How can I contact the developer?'
        ]
      };
    }

    // Do not invent technologies, achievements or project names.
    return {
      reply:
        'I can help you explore the portfolio projects, technologies, and development contributions. What would you like to know?',
      suggestions: [
        'Tell me about the portfolio projects',
        'Explain the technologies used',
        'How can I contact the developer?'
      ]
    };
  }

  // --------------------------------------------------
  // Format Markdown for chatbot messages
  // --------------------------------------------------

  
function formatMarkdown(text) {
  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const lines = String(text ?? '').split('\n');
  const html = [];
  let inList = false;

  function closeList() {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      continue;
    }

    // Headings: #, ##, or ###
    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);

    if (heading) {
      closeList();

      const level = heading[1].length;
      html.push(
        `<h${level} class="chat-heading">${formatInline(heading[2])}</h${level}>`
      );
      continue;
    }

    // Bullet lists
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);

    if (bullet) {
      if (!inList) {
        html.push('<ul class="chat-list">');
        inList = true;
      }

      html.push(`<li>${formatInline(bullet[1])}</li>`);
      continue;
    }

    closeList();

    html.push(`<p>${formatInline(trimmed)}</p>`);
  }

  closeList();

  return html.join('');
}

function formatInline(text) {
  let value = escapeHtml(text);

  // Inline code
  value = value.replace(
    /`([^`]+)`/g,
    '<code class="chat-inline-code">$1</code>'
  );

  // Bold
  value = value.replace(
    /\*\*(.*?)\*\*/g,
    '<strong>$1</strong>'
  );

  // Italic
  value = value.replace(
    /(?<!\*)\*([^*]+)\*(?!\*)/g,
    '<em>$1</em>'
  );

  return value;
}
  // --------------------------------------------------
  // Append chat message
  // --------------------------------------------------

  function appendMessage(role, text) {
    const bubble = document.createElement('div');

    bubble.className = `chat-bubble ${role}`;
    bubble.innerHTML = formatMarkdown(text);

    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return bubble;
  }

  // --------------------------------------------------
  // Typing indicator
  // --------------------------------------------------

  function showTypingIndicator() {
    hideTypingIndicator();

    const typing = document.createElement('div');

    typing.className = 'chat-typing';
    typing.id = 'chat-typing-active';

    typing.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;

    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTypingIndicator() {
    const typing = document.getElementById('chat-typing-active');

    if (typing) {
      typing.remove();
    }
  }

  // --------------------------------------------------
  // Suggestion chips
  // --------------------------------------------------

  function updateSuggestions(suggestions) {
    if (!suggestionsBox) return;

    suggestionsBox.innerHTML = '';

    if (!Array.isArray(suggestions)) return;

    suggestions.forEach((suggestion) => {
      if (typeof suggestion !== 'string' || !suggestion.trim()) {
        return;
      }

      const chip = document.createElement('button');

      chip.type = 'button';
      chip.className = 'chip-btn';
      chip.textContent = suggestion;

      chip.addEventListener('click', () => {
        sendMessage(suggestion);
      });

      suggestionsBox.appendChild(chip);
    });
  }

  // --------------------------------------------------
  // Handle chatbot actions
  // --------------------------------------------------

  function handleChatAction(action) {
    let targetId = null;

    if (action === 'scroll_to_projects') {
      targetId = 'projects';
    } else if (action === 'scroll_to_contact') {
      targetId = 'contact';
    }

    if (targetId) {
      const element = document.getElementById(targetId);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  // --------------------------------------------------
  // Send message to FastAPI + Ollama
  // --------------------------------------------------

  async function sendMessage(text) {
    if (isSending) return;

    const query = String(
      typeof text === 'string' ? text : inputEl.value
    ).trim();

    if (!query) return;

    inputEl.value = '';
    isSending = true;
    sendBtn.disabled = true;

    appendMessage('user', query);
    playCyberTone('send');

    // Store the current user message once.
    chatHistory.push({
      role: 'user',
      content: query
    });

    showTypingIndicator();

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,

          // The backend appends the current message itself,
          // so send only the previous conversation history.
          history: chatHistory.slice(0, -1)
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('The chat API returned an empty reply.');
      }

      hideTypingIndicator();

      appendMessage('assistant', data.reply);
      playCyberTone('recv');

      chatHistory.push({
        role: 'assistant',
        content: data.reply
      });

      if (Array.isArray(data.suggestions) && data.suggestions.length) {
        updateSuggestions(data.suggestions);
      }

      handleChatAction(data.action);

    } catch (error) {
      console.error('Chatbot backend request failed:', error);

      hideTypingIndicator();

      // Use portfolio data if the backend is unavailable.
      const fallback = getClientFallbackReply(query);

      appendMessage('assistant', fallback.reply);
      playCyberTone('recv');

      chatHistory.push({
        role: 'assistant',
        content: fallback.reply
      });

      if (fallback.suggestions) {
        updateSuggestions(fallback.suggestions);
      }

      handleChatAction(fallback.action);

    } finally {
      hideTypingIndicator();
      isSending = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // --------------------------------------------------
  // Event listeners
  // --------------------------------------------------

  sendBtn.addEventListener('click', () => {
    sendMessage();
  });

  inputEl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });

  // --------------------------------------------------
  // Initial suggestions
  // --------------------------------------------------

  updateSuggestions([
    'Tell me about the portfolio projects',
    'Explain the technologies used',
    'How can I contact the developer?'
  ]);
});