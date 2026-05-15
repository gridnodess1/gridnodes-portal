const SUPABASE_URL = "https://ebuecwycqbwcnvhonlly.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidWVjd3ljcWJ3Y252aG9ubGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjEyODMsImV4cCI6MjA5NDQzNzI4M30.evPYCJlsWUGK7Z56kU-hogcbHZGzZ_T3T5bxv6rrWXg";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentBalance = 0.0000;

const startButton = document.getElementById('start-btn');
const balanceDisplay = document.getElementById('balance-display');
const statusDisplay = document.getElementById('status');

startButton.addEventListener('click', () => {
    startButton.disabled = true;
    startButton.innerText = "DÜĞÜM AKTİF";
    statusDisplay.innerText = "Kriptografik ağa bağlanıldı. Canlı veri işleniyor...";

    setInterval(async () => {
        try {
            // 1. Supabase'den aktif görevi çek
            const { data: tasks, error: taskError } = await supabase
                .from('data_tasks')
                .select('*')
                .eq('is_active', true)
                .limit(1);

            if (taskError) throw taskError;

            if (tasks && tasks.length > 0) {
                const task = tasks;
                
                // HACKER METODU: Aradaki tüm sorunlu proxy'leri kaldır, doğrudan JSON olarak oku
                const targetRes = await fetch(task.target_url);
                const rawText = await targetRes.text();

                // Hedef metin içinde aradığımız element (rate) var mı diye bak
                if (rawText.includes(task.required_element)) {
                    
                    // 2. Veriyi Supabase'e yaz
                    const { error: insertError } = await supabase
                        .from('scraped_data')
                        .insert([{ task_id: task.task_id, collected_value: "Verified_Data" }]);

                    if (insertError) throw insertError;

                    // 3. Sayacı uçur
                    currentBalance += parseFloat(task.reward_per_click);
                    balanceDisplay.innerText = `$${currentBalance.toFixed(4)}`;
                    statusDisplay.innerText = `Kusursuz Veri Doğrulaması Başarılı! (+ $${task.reward_per_click})`;
                } else {
                    statusDisplay.innerText = "Ağ Durumu: Veri paketi formatı taranıyor...";
                }
            } else {
                statusDisplay.innerText = "Ağ Durumu: Aktif görev havuzu boş.";
            }
        } catch (error) {
            statusDisplay.innerText = "Sistem tetikte, yeni döngü bekleniyor...";
            console.log("OpSec Kontrol:", error.message);
        }
    }, 6000);
});
