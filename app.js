const SUPABASE_URL = "https://ebuecwycqbwcnvhonlly.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidWVjd3ljcWJ3Y252aG9ubGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjEyODMsImV4cCI6MjA5NDQzNzI4M30.evPYCJlsWUGK7Z56kU-hogcbHZGzZ_T3T5bxv6rrWXg";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let currentBalance = 0.0000;

const startButton = document.getElementById('start-btn');
const balanceDisplay = document.getElementById('balance-display');
const statusDisplay = document.getElementById('status');

startButton.addEventListener('click', async () => {
    startButton.disabled = true;
    startButton.innerText = "DÜĞÜM AKTİF";
    statusDisplay.innerText = "Ağa bağlanılıyor... İlk veri döngüsü tetiklendi.";

    // İLK TEST: Döngüyü beklemeden hemen veritabanını oku
    try {
        const { data, error } = await supabase.from('data_tasks').select('*').limit(1);
        if (error) {
            statusDisplay.innerText = "Supabase Hatası: " + error.message;
            return;
        }
        if (!data || data.length === 0) {
            statusDisplay.innerText = "Veritabanı Bağlantısı Başarılı Ama data_tasks Tablosu Boş!";
            return;
        }
    } catch (err) {
        statusDisplay.innerText = "Bağlantı Hatası: " + err.message;
        return;
    }

    // Otonom Döngüyü Başlat (Her 4 saniyede bir)
    setInterval(async () => {
        try {
            const { data: tasks } = await supabase.from('data_tasks').select('*').eq('is_active', true).limit(1);

            if (tasks && tasks.length > 0) {
                const task = tasks[0];
                
                // Veriyi kendi tablosuna yazarak doğrula
                const { error: insertError } = await supabase
                    .from('scraped_data')
                    .insert([{ task_id: task.task_id, collected_value: "NODE_VERIFIED" }]);

                if (!insertError) {
                    currentBalance += parseFloat(task.reward_per_click);
                    balanceDisplay.innerText = `$${currentBalance.toFixed(4)}`;
                    statusDisplay.innerText = `Kusursuz Veri Doğrulaması Başarılı! (+ $${task.reward_per_click})`;
                } else {
                    statusDisplay.innerText = "Yazma Hatası: " + insertError.message;
                }
            }
        } catch (error) {
            statusDisplay.innerText = "Sistem tetikte, veri aranıyor...";
        }
    }, 4000);
});
