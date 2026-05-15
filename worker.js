self.onmessage = function(e) {
    const { supabaseUrl, supabaseKey } = e.data;

    setInterval(async () => {
        try {
            // 1. Supabase'den aktif bir veri toplama görevi çek
            const response = await fetch(`${supabaseUrl}/rest/v1/data_tasks?is_active=eq.true&limit=1`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            });
            const tasks = await response.json();

            if (tasks && tasks.length > 0) {
                const task = tasks[0];
                
                // 2. Kullanıcının ev interneti üzerinden hedef siteye yasal istek at
                const targetRes = await fetch(task.target_url, { method: 'GET' });
                const htmlText = await targetRes.text();

                // 3. Basit Regex ile veriyi kod kütüphanesi ve AI olmadan ayıkla
                const regex = new RegExp(task.required_element + '="([^"]+)"|' + task.required_element + '>([^<]+)', 'i');
                const match = htmlText.match(regex);
                
                if (match) {
                    const extractedValue = match[1] || match[2];

                    // 4. Toplanan temiz veriyi Supabase veritabanına otomatik yükle
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

                    // 5. Ana ekrandaki sayacı tetiklemesi için başarılı sinyali gönder
                    self.postMessage({ status: 'success', reward: parseFloat(task.reward_per_click) });
                }
            } else {
                self.postMessage({ status: 'error', message: 'No tasks found' });
            }
        } catch (error) {
            self.postMessage({ status: 'error', message: error.message });
        }
    }, 8000); // Her 8 saniyede bir otonom kontrol sağlar
};
