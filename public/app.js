document.addEventListener('DOMContentLoaded', () => {
  const fetchBtn = document.getElementById('fetch-btn');
  const responseText = document.getElementById('response-output');

  fetchBtn.addEventListener('click', async () => {
    const players = await fetch('./players.json').then(response =>
      response.json()
    );
    const response = await fetch('/.netlify/functions/udisc-scraper', {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(players)
    }).then(response => response.json());

    console.log(response);
  });
});
