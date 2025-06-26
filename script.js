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

    document.getElementById('downloadPdf').classList.add('hidden');
  }

// PDF Download functionality
document.addEventListener('DOMContentLoaded', function() {
  const downloadButton = document.getElementById('downloadPdf');
  
  downloadButton.addEventListener('click', async function() {
    const resumeContent = document.getElementById('resumeContent');
    
    if (!resumeContent) {
      alert('No resume content to download. Please generate a resume first.');
      return;
    }

    // Show loading state on download button
    downloadButton.disabled = true;
    downloadButton.innerHTML = `
      <svg class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Generating PDF...</span>
    `;

    try {
      // Create a temporary container with better styling for PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 800px;
        padding: 40px;
        background: white;
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      `;
      
      // Clone and clean the content
      const clonedContent = resumeContent.cloneNode(true);
      
      // Apply PDF-friendly styles
      clonedContent.style.cssText = `
        max-width: none;
        font-size: 14px;
        line-height: 1.5;
      `;
      
      // Style headings for PDF
      const headings = clonedContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        heading.style.cssText = `
          color: #2563eb;
          margin: 20px 0 10px 0;
          font-weight: bold;
        `;
      });
      
      // Style paragraphs
      const paragraphs = clonedContent.querySelectorAll('p');
      paragraphs.forEach(p => {
        p.style.margin = '10px 0';
      });
      
      // Style lists
      const lists = clonedContent.querySelectorAll('ul, ol');
      lists.forEach(list => {
        list.style.margin = '10px 0';
        list.style.paddingLeft = '20px';
      });
      
      pdfContainer.appendChild(clonedContent);
      document.body.appendChild(pdfContainer);
      
      // Generate PDF using html2canvas and jsPDF
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary container
      document.body.removeChild(pdfContainer);
      
      // Create PDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Get name from form for filename
      const nameInput = document.querySelector('input[name="name"]');
      const fileName = nameInput && nameInput.value 
        ? `${nameInput.value.replace(/\s+/g, '_')}_Resume.pdf`
        : 'Resume.pdf';
      
      // Download the PDF
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // Reset download button
      downloadButton.disabled = false;
      downloadButton.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <span>Download as PDF</span>
      `;
    }
  });
});
  
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

    resultDiv.classList = "";
    
    // Show result with animation
    resultDiv.innerHTML = `
      <div id="resumeContent" class="prose max-w-none animate-fade-in">
        ${result}
      </div>
    `;
    
    // Show download button
    document.getElementById('downloadSection').classList.remove('hidden');
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
  