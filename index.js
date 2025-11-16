// UXP Script for Premiere Pro - Image Caption Sync

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

/**
 * Get timeline data from Premiere Pro
 */
async function getTimelineData() {
    try {
        const app = window.require('premierepro');

        if (!app || !app.project) {
            throw new Error('Không thể truy cập Premiere Pro API');
        }

        const activeSequence = app.project.activeSequence;

        if (!activeSequence) {
            throw new Error('Không có sequence nào đang được mở. Vui lòng mở một sequence.');
        }

        const captions = [];
        const images = [];

        // Get all video tracks
        const videoTracks = activeSequence.videoTracks;

        for (let trackIndex = 0; trackIndex < videoTracks.numTracks; trackIndex++) {
            const track = videoTracks[trackIndex];
            const clips = track.clips;

            for (let clipIndex = 0; clipIndex < clips.numItems; clipIndex++) {
                const clip = clips[clipIndex];
                const clipName = clip.name;

                // Get project item
                const projectItem = clip.projectItem;
                if (!projectItem) continue;

                // Get timing info
                const startTime = clip.start.seconds;
                const endTime = clip.end.seconds;

                // Generate unique ID for clip
                const clipId = `${trackIndex}_${clipIndex}_${clipName}_${startTime}`;

                // Determine if it's a caption or image based on name pattern
                const isCaptionByName = /^\d+\./.test(clipName);

                // Check if it's an image file
                const mediaPath = projectItem.getMediaPath ? projectItem.getMediaPath() : '';
                const isImage = /\.(png|jpg|jpeg|bmp|tiff|gif|psd)$/i.test(mediaPath) ||
                               /\.(png|jpg|jpeg|bmp|tiff|gif|psd)$/i.test(clipName);

                const clipData = {
                    id: clipId,
                    name: clipName,
                    trackIndex: trackIndex,
                    clipIndex: clipIndex,
                    startTime: startTime,
                    endTime: endTime,
                    duration: endTime - startTime,
                    clip: clip // Store reference to actual clip
                };

                if (isCaptionByName) {
                    captions.push(clipData);
                } else if (isImage) {
                    images.push(clipData);
                }
            }
        }

        return {
            captions,
            images,
            sequenceName: activeSequence.name
        };

    } catch (error) {
        throw error;
    }
}

/**
 * Analyze timeline
 */
async function analyzeTimeline() {
    log('Đang phân tích timeline...', 'info');
    analyzeBtn.disabled = true;

    try {
        const data = await getTimelineData();

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
        log(`Lỗi: ${error.message}`, 'error');
        console.error(error);
    }

    analyzeBtn.disabled = false;
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

/**
 * Sync timeline - move images to connect seamlessly after captions
 * Logic: Caption -> Image (nối liền mạch)
 */
async function syncTimeline() {
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
    log('Logic: Ảnh sẽ nối liền mạch ngay sau Caption tương ứng', 'info');
    syncBtn.disabled = true;

    try {
        // Sort matches by caption number to maintain order
        const sortedMatches = matches.sort((a, b) => {
            const numA = parseInt(extractCaptionNumber(a.caption.name));
            const numB = parseInt(extractCaptionNumber(b.caption.name));
            return numA - numB;
        });

        let syncedCount = 0;

        for (const match of sortedMatches) {
            try {
                const captionClip = match.caption.clip;
                const imageClip = match.image.clip;

                // Get caption end time
                const captionEndTime = captionClip.end.seconds;

                // Get image duration (to preserve it)
                const imageDuration = imageClip.end.seconds - imageClip.start.seconds;

                // Move image to start right after caption ends (nối liền mạch)
                imageClip.start.seconds = captionEndTime;

                // Set image end time to maintain its duration
                imageClip.end.seconds = captionEndTime + imageDuration;

                syncedCount++;

                log(`✓ ${match.caption.name} → ${match.image.name} (nối tại ${captionEndTime.toFixed(2)}s)`, 'success');

            } catch (error) {
                log(`✗ Lỗi đồng bộ ${match.caption.name} - ${match.image.name}: ${error.message}`, 'error');
            }
        }

        log(`Hoàn thành! Đã nối liền mạch ${syncedCount}/${matches.length} cặp`, 'success');

        // Reset analysis data
        analysisData = null;
        syncBtn.disabled = true;

        // Clear display
        statusSection.style.display = 'none';
        matchingResults.style.display = 'none';

    } catch (error) {
        log(`Lỗi đồng bộ: ${error.message}`, 'error');
        console.error(error);
    }

    syncBtn.disabled = false;
}
