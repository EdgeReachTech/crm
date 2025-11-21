Start-Process pwsh -ArgumentList '-NoExit', '-Command', 'cd backend; npm run dev'
Start-Process pwsh -ArgumentList '-NoExit', '-Command', 'cd front; npm run dev'
