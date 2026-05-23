async function testSave() {
  const url = 'https://deamirclothingstores--eixora-backend-express-server.modal.run/api/save-lounge-session';
  const payload = {
    userId: 'user_2bgT0p7mF02S8x24F2qE2HlZ7V1',
    videoUrl: 'https://www.tiktok.com/@test/video/123456789',
    dna: {
      metrics: { hook_power: 9.0, retention_score: 8.0, conversion_trigger: 7.0 },
      niche: 'Tech/Gadgets'
    },
    messages: [
      { role: 'assistant', content: 'This hook is a 9/10 scroll-stopper...' },
      { role: 'user', content: 'similar product kind of' }
    ]
  };

  try {
    console.log('Sending save request to Modal production...');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);
  } catch (err) {
    console.error('Error message:', err.message);
  }
}

testSave();
