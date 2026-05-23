async function testChat() {
  const url = 'https://deamirclothingstores--eixora-backend-express-server.modal.run/api/creative-director-chat';
  const payload = {
    userId: 'user_2bgT0p7mF02S8x24F2qE2HlZ7V1',
    isRoastMode: false,
    messages: [
      { role: 'assistant', content: 'This hook is a 9/10 scroll-stopper...' },
      { role: 'user', content: 'similar product kind of' }
    ],
    dna: {
      metrics: { hook_power: 9.0, retention_score: 8.0, conversion_trigger: 7.0 },
      niche: 'Tech/Gadgets',
      big_idea: 'A magnetic charging cable',
      the_secret_sauce: 'Magnetic snapping visuals',
      hook_verdict: {
        what_stops_the_scroll: 'Hands holding a cable',
        visual_hook_grade: 9,
        spoken_hook_grade: 8,
        improvement: 'Add voiceover'
      },
      retention_map: {
        attention_peaks: [],
        dead_zones: [],
        critique: 'Good pacing'
      },
      fatal_flaw: 'No spoken hook',
      steal_worthy: 'UGC raw snap shot',
      psychology_breakdown: {
        primary_trigger: 'Curiosity',
        explanation: 'Snapping magnet action'
      }
    }
  };

  try {
    console.log('Sending chat request using native fetch...');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);
  } catch (err) {
    console.error('Full Error:', err);
  }
}

testChat();
