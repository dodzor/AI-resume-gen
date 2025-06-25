document.getElementById('resumeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitButton = e.target.querySelector('button[type="submit"]');
    const resultDiv = document.getElementById('result');
    
    // Show loading state
    showLoadingState(submitButton, resultDiv);
    
    try {
      const response = await fetch('generate_resume.php', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.text();
      showResult(submitButton, resultDiv, result);
      
    } catch (error) {
      showError(submitButton, resultDiv, error.message);
    }
  });
  
  function showLoadingState(button, resultDiv) {
    // Disable button and show loading
    button.disabled = true;
    button.innerHTML = `
      <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Generating Resume...</span>
    `;
    button.classList.add('opacity-75', 'cursor-not-allowed');
    button.classList.remove('hover:scale-105');
    
    // Show loading spinner in result area
    resultDiv.innerHTML = `
      <div class="flex flex-col items-center justify-center h-64">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-blue-200 border-solid rounded-full animate-spin"></div>
          <div class="w-16 h-16 border-4 border-blue-600 border-solid rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p class="mt-6 text-lg font-medium text-gray-700">Generating your resume...</p>
        <p class="mt-2 text-sm text-gray-500">This may take a few seconds</p>
      </div>
    `;
  }
  
  function showResult(button, resultDiv, result) {
    // Reset button
    button.disabled = false;
    button.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      <span>Generate Resume</span>
    `;
    button.classList.remove('opacity-75', 'cursor-not-allowed');
    button.classList.add('hover:scale-105');
    
    // Show result with animation
    resultDiv.innerHTML = `
      <div class="prose max-w-none animate-fade-in">
        ${result}
      </div>
    `;
  }
  
  function showError(button, resultDiv, errorMessage) {
    // Reset button
    button.disabled = false;
    button.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      <span>Generate Resume</span>
    `;
    button.classList.remove('opacity-75', 'cursor-not-allowed');
    button.classList.add('hover:scale-105');
    
    // Show error message
    resultDiv.innerHTML = `
      <div class="flex flex-col items-center justify-center h-64 text-center">
        <svg class="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-lg font-medium text-red-600 mb-2">Oops! Something went wrong</p>
        <p class="text-sm text-gray-600">${errorMessage}</p>
        <p class="text-xs text-gray-500 mt-2">Please try again or check your connection</p>
      </div>
    `;
  }
  