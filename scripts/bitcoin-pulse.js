#!/usr/bin/env node
/**
 * Bitcoin Pulse Data Feed
 * Updates public/live-data/bitcoin-pulse.json every 30 minutes
 * Run: node scripts/bitcoin-pulse.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, '..', 'public', 'live-data', 'bitcoin-pulse.json');

// Fetch BTC price from CoinGecko
async function getBTCPrice() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.coingecko.com',
            path: '/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
            method: 'GET',
            headers: {
                'User-Agent': 'Katoa-Bitcoin-Pulse/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({
                        price: json.bitcoin.usd,
                        change_24h: json.bitcoin.usd_24h_change
                    });
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Timeout')));
        req.end();
    });
}

// Fetch Fear & Greed Index
async function getFearGreed() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.alternative.me',
            path: '/fng/',
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({
                        value: json.data[0].value,
                        classification: json.data[0].value_classification
                    });
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Timeout')));
        req.end();
    });
}

// Generate sentiment based on Fear & Greed
function getSentiment(value) {
    const v = parseInt(value);
    if (v <= 20) return 'extreme fear';
    if (v <= 40) return 'fear';
    if (v <= 60) return 'neutral';
    if (v <= 80) return 'greed';
    return 'extreme greed';
}

// Main update function
async function updatePulse() {
    try {
        console.log('🔄 Fetching Bitcoin data...');

        const [btc, fearGreed] = await Promise.all([
            getBTCPrice(),
            getFearGreed()
        ]);

        const pulseData = {
            timestamp: new Date().toISOString(),
            btc_price: btc.price,
            fear_greed: parseInt(fearGreed.value),
            sentiment: getSentiment(fearGreed.value),
            trend_24h: `${btc.change_24h > 0 ? '+' : ''}${btc.change_24h.toFixed(2)}%`,
            source: 'CoinGecko + Alternative.me'
        };

        // Write to file
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(pulseData, null, 2));

        console.log('✅ Pulse updated:', pulseData);
        console.log(`📁 Saved to: ${DATA_FILE}\n`);

    } catch (error) {
        console.error('❌ Error updating pulse:', error.message);
        process.exit(1);
    }
}

// Run immediately
updatePulse();

// Then every 30 minutes
setInterval(updatePulse, 30 * 60 * 1000);
console.log('⏰ Running every 30 minutes. Press Ctrl+C to stop.\n');
