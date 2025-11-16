/* global CSInterface */

// Initialize CEP interface
const csInterface = new CSInterface();

// DOM elements
let analyzeBtn, syncBtn, logContent;
let statusSection, matchingResults;
let totalCaptions, totalImages, matchedPairs, unmatchedItems, matchList;

// Store analysis results
let analysisData = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
    setupEventListeners();
    log('Extension đã sẵn sàng', 'info');
});

function initializeUI() {
    analyzeBtn = document.getElementById('analyzeBtn');
    syncBtn = document.getElementById('syncBtn');
    logContent = document.getElementById('logContent');
    statusSection = document.getElementById('statusSection');
    matchingResults = document.getElementById('matchingResults');
    totalCaptions = document.getElementById('totalCaptions');
    totalImages = document.getElementById('totalImages');
    matchedPairs = document.getElementById('matchedPairs');
    unmatchedItems = document.getElementById('unmatchedItems');
    matchList = document.getElementById('matchList');
}

function setupEventListeners() {
    analyzeBtn.addEventListener('click', analyzeTimeline);
    syncBtn.addEventListener('click', syncTimeline);
}

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
}

/**
 * Extract number from caption text
 * Format: "XXX. Text..." -> extracts XXX
 */
function extractCaptionNumber(captionText) {
    const match = captionText.match(/^(\d+)\./);
    if (match) {
        return match[1];
    }
    return null;
}

/**
 * Extract number from image filename
 * Gets the last digits before the extension
 * Example: "102.png" -> "02", "image_025.jpg" -> "25"
 */
function extractImageNumber(filename) {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^.]+$/, '');

    // Extract all numbers from the end
    const match = nameWithoutExt.match(/(\d+)$/);
    if (match) {
        const fullNumber = match[1];
        // Get last 2 digits
        return fullNumber.slice(-2);
    }
    return null;
}

/**
 * Match captions with images based on number matching
 * Caption number's last 2 digits should match image number's last 2 digits
 */
function matchCaptionsWithImages(captions, images) {
    const matches = [];
    const unmatchedCaptions = [];
    const usedImages = new Set();

    captions.forEach(caption => {
        const captionNum = extractCaptionNumber(caption.name);

        if (!captionNum) {
            unmatchedCaptions.push({
                type: 'caption',
                item: caption,
                reason: 'Không tìm thấy số trong caption'
            });
            return;
        }

        // Get last 2 digits of caption number
        const captionLastTwo = captionNum.slice(-2);

        // Find matching image
        let matchedImage = null;
        for (const image of images) {
            if (usedImages.has(image.id)) continue;

            const imageNum = extractImageNumber(image.name);
            if (imageNum && imageNum === captionLastTwo) {
                matchedImage = image;
                usedImages.add(image.id);
                break;
            }
        }

        if (matchedImage) {
            matches.push({
                caption: caption,
                image: matchedImage,
                matchNumber: captionLastTwo
            });
        } else {
            unmatchedCaptions.push({
                type: 'caption',
                item: caption,
                reason: `Không tìm thấy ảnh có số cuối là "${captionLastTwo}"`
            });
        }
    });

    // Find unmatched images
    const unmatchedImages = images.filter(img => !usedImages.has(img.id)).map(img => ({
        type: 'image',
        item: img,
        reason: 'Không tìm thấy caption phù hợp'
    }));

    return {
        matches,
        unmatched: [...unmatchedCaptions, ...unmatchedImages]
    };
}

function analyzeTimeline() {
    log('Đang phân tích timeline...', 'info');
    analyzeBtn.disabled = true;

    // Call ExtendScript to get timeline data
    csInterface.evalScript('getTimelineData()', function(result) {
        try {
            const data = JSON.parse(result);

            if (data.error) {
                log(`Lỗi: ${data.error}`, 'error');
                analyzeBtn.disabled = false;
                return;
            }

            log(`Tìm thấy ${data.captions.length} caption và ${data.images.length} ảnh`, 'success');

            // Match captions with images
            const matchResult = matchCaptionsWithImages(data.captions, data.images);

            // Store for later use
            analysisData = {
                ...data,
                matchResult
            };

            // Update UI
            displayAnalysisResults(matchResult, data.captions.length, data.images.length);

            // Enable sync button if there are matches
            syncBtn.disabled = matchResult.matches.length === 0;

            log(`Phân tích hoàn tất: ${matchResult.matches.length} cặp có thể đồng bộ`, 'success');

        } catch (error) {
            log(`Lỗi parse dữ liệu: ${error.message}`, 'error');
        }

        analyzeBtn.disabled = false;
    });
}

function displayAnalysisResults(matchResult, totalCaptionCount, totalImageCount) {
    // Update stats
    totalCaptions.textContent = totalCaptionCount;
    totalImages.textContent = totalImageCount;
    matchedPairs.textContent = matchResult.matches.length;
    unmatchedItems.textContent = matchResult.unmatched.length;

    // Show status section
    statusSection.style.display = 'block';

    // Display matching details
    matchList.innerHTML = '';

    // Display matched pairs
    matchResult.matches.forEach(match => {
        const div = document.createElement('div');
        div.className = 'match-item';
        div.innerHTML = `
            <div class="caption-text">📝 Caption: "${match.caption.name}" (số: ${match.matchNumber})</div>
            <div class="image-text">🖼️ Ảnh: ${match.image.name}</div>
        `;
        matchList.appendChild(div);
    });

    // Display unmatched items
    matchResult.unmatched.forEach(item => {
        const div = document.createElement('div');
        div.className = 'match-item unmatched';
        const icon = item.type === 'caption' ? '📝' : '🖼️';
        const name = item.item.name;
        div.innerHTML = `
            <div class="caption-text">${icon} ${name}</div>
            <div class="no-match">❌ ${item.reason}</div>
        `;
        matchList.appendChild(div);
    });

    matchingResults.style.display = 'block';
}

function syncTimeline() {
    if (!analysisData || !analysisData.matchResult) {
        log('Chưa có dữ liệu phân tích. Vui lòng nhấn "Phân tích Timeline" trước.', 'error');
        return;
    }

    const matches = analysisData.matchResult.matches;
    if (matches.length === 0) {
        log('Không có cặp nào để đồng bộ', 'error');
        return;
    }

    log(`Bắt đầu đồng bộ ${matches.length} cặp...`, 'info');
    log('Logic: Ảnh sẽ có cùng thời gian với Caption (ở track phía dưới)', 'info');
    syncBtn.disabled = true;

    // Prepare data for ExtendScript
    const syncData = matches.map(match => ({
        captionId: match.caption.id,
        imageId: match.image.id,
        captionStartTime: match.caption.startTime,
        captionEndTime: match.caption.endTime
    }));

    // Call ExtendScript to perform sync
    csInterface.evalScript(`syncClips(${JSON.stringify(syncData)})`, function(result) {
        try {
            const response = JSON.parse(result);

            if (response.error) {
                log(`Lỗi đồng bộ: ${response.error}`, 'error');
            } else {
                log(`Hoàn thành! Đã đồng bộ ${response.synced}/${matches.length} cặp với cùng thời gian`, 'success');

                // Reset analysis data
                analysisData = null;
                syncBtn.disabled = true;

                // Clear display
                statusSection.style.display = 'none';
                matchingResults.style.display = 'none';
            }
        } catch (error) {
            log(`Lỗi xử lý kết quả: ${error.message}`, 'error');
        }

        syncBtn.disabled = false;
    });
}
