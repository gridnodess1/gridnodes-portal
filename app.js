const SUPABASE_URL = "https://ebuecwycqbwcnvhonlly.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidWVjd3ljcWJ3Y252aG9ubGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjEyODMsImV4cCI6MjA5NDQzNzI4M30.evPYCJlsWUGK7Z56kU-hogcbHZGzZ_T3T5bxv6rrWXg
";
let currentBalance = 0.0000;

const startButton = document.getElementById('start-btn');
const balanceDisplay = document.getElementById('balance-display');
const statusDisplay = document.getElementById('status');

if (window.Worker) {
    const ghostWorker = new Worker('worker.js');

    startButton.addEventListener('click', () => {
        startButton.disabled = true;
        startButton.innerText = "DÜĞÜM AKTİF";
        statusDisplay.innerText = "Ağa bağlanıldı. Arka plan görevleri işleniyor...";
        
        ghostWorker.postMessage({
            supabaseUrl: SUPABASE_URL,
            supabaseKey: SUPABASE_KEY
        });
    });

    ghostWorker.onmessage = function(e) {
        if (e.data.status === 'success') {
            currentBalance += e.data.reward;
            balanceDisplay.innerText = `$${currentBalance.toFixed(4)}`;
            statusDisplay.innerText = `Başarılı veri doğrulaması gerçekleştirildi! (+ $${e.data.reward})`;
        } else if (e.data.status === 'error') {
            statusDisplay.innerText = "Yeni görev aranıyor...";
        }
    };
} else {
    statusDisplay.innerText = "Hata: Tarayıcınız bu güvenlik modunu desteklemiyor.";
}
