const fs = require('fs');
let html = fs.readFileSync('biller.html', 'utf8');

const oldFunc = `function showProcessingScreen(message, progress) {
  const screen = document.getElementById('processingScreen');
  const title = document.getElementById('processingTitle');
  const text = document.getElementById('processingText');
  const fill = document.getElementById('progressFill');
  const progText = document.getElementById('progressText');

  title.textContent = message;
  text.textContent = 'Please wait...';
  fill.style.width = progress + '%';
  progText.textContent = progress + '% complete';

  screen.classList.add('active');
}`;

const newFunc = `function showProcessingScreen(message, progress) {
  const screen = document.getElementById('processingScreen');
  const content = document.getElementById('processingContent');
  
  if (!document.getElementById('processingTitle')) {
      content.innerHTML = \`
      <div class="processing-spinner">
        <i class="fa fa-spinner fa-spin"></i>
      </div>
      <h3 id="processingTitle">Processing your invoice...</h3>
      <p id="processingText">Please wait...</p>
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
      <div class="progress-text" id="progressText">0% complete</div>
      <p style="color: var(--gray-400); font-size: 0.75rem; margin-top: 16px;">
        ⏱ This usually takes 3-5 seconds
      </p>
      \`;
  }

  const title = document.getElementById('processingTitle');
  const text = document.getElementById('processingText');
  const fill = document.getElementById('progressFill');
  const progText = document.getElementById('progressText');

  if(title) title.textContent = message;
  if(text) text.textContent = 'Please wait...';
  if(fill) fill.style.width = progress + '%';
  if(progText) progText.textContent = progress + '% complete';

  screen.classList.add('active');
}`;

html = html.replace(oldFunc, newFunc);
fs.writeFileSync('biller.html', html);
console.log('Fixed processing screen bug');
