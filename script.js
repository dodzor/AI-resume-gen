document.getElementById('resumeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const response = await fetch('generate_resume.php', {
    method: 'POST',
    body: formData
  });
  const result = await response.text();
  document.getElementById('result').innerHTML = result;
});
