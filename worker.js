// worker.js - Güncellenmiş CORS Bypass Versiyonu
self.onmessage = function(e) {
    const { supabaseUrl, supabaseKey } = e.data;

    setInterval(async () => {
        try {
            // 1. Supabase'den aktif görevi çek
            const response = await fetch(`${supabaseUrl}/rest/v1/data_tasks?is_active=eq.true&limit=1`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            });
            const tasks = await response.json();

            if (tasks && tasks.length > 0) {
                const task = tasks[0];
                
                // HACKER METODU: Tarayıcının CORS engelini aşmak için ücretsiz Cors-Proxy köprüsü kullan
                const proxyUrl = "https://allorigins.win" + encodeURIComponent(task.target_url);
                const targetRes = await fetch(proxyUrl);
                const proxyData = await targetRes.json();
                const htmlText = proxyData.contents; // Hedef sitenin ham HTML içeriği başarıyla elimizde

                // 2. Regex ile veriyi ayıkla
                const regex = new RegExp(task.required_element + '="([^"]+)"|' + task.required_element + '>([^<]+)', 'i');
                const match = htmlText.match(regex);
                
                if (match) {
                    const extractedValue = match[1] || match[2];

                    // 3. Veriyi Supabase'e gönder
                    await fetch(`${supabaseUrl}/rest/v1/scraped_data`, {
                        method: 'POST',
                        headers: {
                            'apikey': supabaseKey,
                            'Authorization': `Bearer ${supabaseKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            task_id: task.task_id,
                            collected_value: extractedValue.trim()
                        })
                    });

                    // 4. Sayacı tetikle
                    self.postMessage({ status: 'success', reward: parseFloat(task.reward_per_click) });
                } else {
                    self.postMessage({ status: 'error', message: 'Element bulunamadı' });
                }
            } else {
                self.postMessage({ status: 'error', message: 'Görev yok' });
            }
        } catch (error) {
            self.postMessage({ status: 'error', message: error.message });
        }
    }, 8000);
};
