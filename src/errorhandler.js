window.addEventListener('error', (event) => {
    console.error("GLOBAL ERROR CAUGHT:", event.error);
    document.body.innerHTML = '<div style="background:red;color:white;padding:20px;font-size:20px;"><h1>Global Error Caught</h1><pre>' + (event.error?.stack || event.error) + '</pre></div>';
});
window.addEventListener('unhandledrejection', (event) => {
    console.error("UNHANDLED PROMISE REJECTION:", event.reason);
    document.body.innerHTML += '<div style="background:orange;color:white;padding:20px;"><h1>Unhandled Promise Rejection</h1><pre>' + (event.reason?.stack || event.reason) + '</pre></div>';
});
console.log("Error handler installed - Debug Mode");
