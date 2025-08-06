// API Key 저장 및 불러오기
const apiKeyInput = document.getElementById('api-key');
const saveApiKeyBtn = document.getElementById('save-api-key');
const apiKeyStatus = document.getElementById('api-key-status');

// 저장된 API 키 불러오기
window.addEventListener('DOMContentLoaded', () => {
  const savedKey = localStorage.getItem('gemini_api_key');
  if (savedKey) {
    apiKeyInput.value = savedKey;
    apiKeyStatus.textContent = '저장됨';
  }
});

saveApiKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    localStorage.setItem('gemini_api_key', key);
    apiKeyStatus.textContent = '저장됨';
  } else {
    apiKeyStatus.textContent = 'API 키를 입력하세요';
  }
});

// 가사 생성
const topicInput = document.getElementById('topic');
const generateBtn = document.getElementById('generate-lyrics');
const outputLyrics = document.getElementById('output-lyrics');
const outputStyle = document.getElementById('output-style');
const copyBtn = document.getElementById('copy-output');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

function formatForSuno(lyrics, style) {
  return `가사 (SUNO 양식):\n${lyrics}\n\n추천 노래 스타일:\n${style}`;
}

generateBtn.addEventListener('click', async () => {
  const topic = topicInput.value.trim();
  const apiKey = apiKeyInput.value.trim() || localStorage.getItem('gemini_api_key');
  outputLyrics.textContent = '';
  outputStyle.textContent = '';

  if (!apiKey) {
    apiKeyStatus.textContent = 'API 키를 입력하세요';
    apiKeyInput.focus();
    return;
  }
  if (!topic) {
    outputLyrics.textContent = '주제를 입력해주세요.';
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = '생성 중...';

  const prompt = `다음 주제에 맞는 노래 가사와 어울리는 노래 스타일을 SUNO AI 양식에 맞게 출력해줘.\n주제: ${topic}\n\n[출력 예시]\n가사 (SUNO 양식):\n(여기에 가사)\n\n추천 노래 스타일:\n(여기에 스타일)\n\n가사는 1절(4~6줄) + 후렴(2~4줄)로 구성해줘. 스타일은 장르, 분위기, 참고 아티스트 등으로 구체적으로 추천해줘.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    if (!response.ok) {
      throw new Error('API 호출 실패');
    }
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // SUNO 양식 파싱
    const lyricsMatch = text.match(/가사 \(SUNO 양식\):([\s\S]*?)추천 노래 스타일:/);
    const styleMatch = text.match(/추천 노래 스타일:([\s\S]*)/);
    const lyrics = lyricsMatch ? lyricsMatch[1].trim() : '가사를 불러올 수 없습니다.';
    const style = styleMatch ? styleMatch[1].trim() : '스타일 정보를 불러올 수 없습니다.';
    outputLyrics.textContent = lyrics;
    outputStyle.textContent = style;
  } catch (err) {
    outputLyrics.textContent = '가사 생성 중 오류가 발생했습니다.';
    outputStyle.textContent = '';
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = '가사 생성';
  }
});

copyBtn.addEventListener('click', () => {
  const lyrics = outputLyrics.textContent;
  const style = outputStyle.textContent;
  if (!lyrics && !style) return;
  const text = formatForSuno(lyrics, style);
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = '복사됨!';
    setTimeout(() => {
      copyBtn.textContent = '가사 & 스타일 복사';
    }, 1200);
  });
});