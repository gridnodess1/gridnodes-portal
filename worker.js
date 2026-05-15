// worker.js - 2026 Küresel CORS Bypass ve Kararlı Sürüm
self.onmessage = function(e) {
    const { supabaseUrl, supabaseKey } = e.data;

    setInterval(async () => {
        try {
            // 1. Görevi Supabase'den çek
            const response = await fetch(`${supabaseUrl}/rest/v1/data_tasks?is_active=eq.true&limit=1`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const tasks = await response.json();

            if (tasks && tasks.length > 0) {
                const task = tasks[0];
                
                // HACKER METODU: 2026'nın en kararlı ve hızlı küresel CORS tüneli
                const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(task.target_url);
                const targetRes = await fetch(proxyUrl);
                const htmlText = await targetRes.text();

                // 2. Regex ile veri ayıklama (Büyük/küçük harf duyarsız koruma)
                const regex = new RegExp(task.required_element + '="([^"]+)"|' + task.required_element + '>([^<]+)', 'i');
                const match = htmlText.match(regex);
                
                if (match) {
                    const extractedValue = match[1] || match[2];

                    // 3. Veriyi Supabase'e yazarken güvenlik başlıklarını (headers) sıkılaştır
                    const saveRes = await fetch(`${supabaseUrl}/rest/v1/scraped_data`, {
                        method: 'POST',
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({
                            task_id: task.task_id,
                            collected_value: extractedValue.trim()
                        })
                    });

                    if (saveRes.ok) {
                        // 4. Sayaç için ana ekrana sinyal gönder
                        self.postMessage({ status: 'success', reward: parseFloat(task.reward_per_click) });
                    } else {
                        self.postMessage({ status: 'error', message: 'Supabase yazma hatası' });
                    }
                } else {
                    self.postMessage({ status: 'error', message: 'HTML Elementi bulunamadı' });
                }
            } else {
                self.postMessage({ status: 'error', message: 'Aktif görev bulunamadı' });
            }
        } catch (error) {
            self.postMessage({ status: 'error', message: 'Ağ Bağlantı Hatası: ' + error.message });
        }
    }, 6000); // Testi hızlandırmak için 6 saniyeye çektik
};
