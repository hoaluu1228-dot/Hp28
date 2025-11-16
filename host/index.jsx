// ExtendScript for Adobe Premiere Pro
// This script runs in the host application (Premiere Pro)

/**
 * Get all clips from the active sequence
 */
function getTimelineData() {
    try {
        var activeSequence = app.project.activeSequence;

        if (!activeSequence) {
            return JSON.stringify({
                error: "Không có sequence nào đang được mở. Vui lòng mở một sequence."
            });
        }

        var captions = [];
        var images = [];

        // Iterate through all video tracks
        var videoTracks = activeSequence.videoTracks;

        for (var t = 0; t < videoTracks.numTracks; t++) {
            var track = videoTracks[t];
            var clips = track.clips;

            for (var c = 0; c < clips.numItems; c++) {
                var clip = clips[c];
                var clipName = clip.name;
                var projectItem = clip.projectItem;

                if (!projectItem) continue;

                // Get clip timing
                var inPoint = clip.start.seconds;
                var outPoint = clip.end.seconds;

                // Determine if this is a caption or image
                // Captions typically are from text/graphics
                // Images are from image files
                var mediaType = projectItem.type;

                // Check if it's likely a caption based on name pattern (starts with number and dot)
                var isCaptionByName = /^\d+\./.test(clipName);

                // Check file type for images
                var isImage = false;
                if (mediaType === ProjectItemType.FILE) {
                    var mediaPath = projectItem.getMediaPath();
                    isImage = /\.(png|jpg|jpeg|bmp|tiff|gif)$/i.test(mediaPath);
                }

                if (isCaptionByName || mediaType === ProjectItemType.BIN) {
                    // This is likely a caption
                    captions.push({
                        id: generateClipId(clip),
                        text: clipName,
                        trackIndex: t,
                        clipIndex: c,
                        inPoint: inPoint,
                        outPoint: outPoint,
                        duration: outPoint - inPoint
                    });
                } else if (isImage) {
                    // This is an image
                    images.push({
                        id: generateClipId(clip),
                        name: clipName,
                        trackIndex: t,
                        clipIndex: c,
                        inPoint: inPoint,
                        outPoint: outPoint,
                        duration: outPoint - inPoint
                    });
                }
            }
        }

        return JSON.stringify({
            captions: captions,
            images: images,
            sequenceName: activeSequence.name
        });

    } catch (error) {
        return JSON.stringify({
            error: "Lỗi khi đọc timeline: " + error.toString()
        });
    }
}

/**
 * Generate a unique ID for a clip based on its position
 */
function generateClipId(clip) {
    // Use combination of track and clip properties to create unique ID
    return clip.nodeId || (clip.name + "_" + clip.start.seconds + "_" + clip.end.seconds);
}

/**
 * Find clip by ID
 */
function findClipById(clipId, trackIndex, clipIndex) {
    try {
        var activeSequence = app.project.activeSequence;
        if (!activeSequence) return null;

        var track = activeSequence.videoTracks[trackIndex];
        if (!track) return null;

        var clip = track.clips[clipIndex];
        if (!clip) return null;

        var currentId = generateClipId(clip);
        if (currentId === clipId) {
            return clip;
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Sync clips based on matching data
 * @param {Array} syncDataArray - Array of objects with captionId, imageId, and timing info
 */
function syncClips(syncDataArray) {
    try {
        var activeSequence = app.project.activeSequence;

        if (!activeSequence) {
            return JSON.stringify({
                error: "Không có sequence nào đang được mở."
            });
        }

        var syncedCount = 0;
        var errors = [];

        // Parse the sync data
        var syncData;
        if (typeof syncDataArray === 'string') {
            syncData = JSON.parse(syncDataArray);
        } else {
            syncData = syncDataArray;
        }

        // Get all tracks
        var videoTracks = activeSequence.videoTracks;

        // Build a map of all clips for faster lookup
        var clipMap = {};
        for (var t = 0; t < videoTracks.numTracks; t++) {
            var track = videoTracks[t];
            var clips = track.clips;

            for (var c = 0; c < clips.numItems; c++) {
                var clip = clips[c];
                var id = generateClipId(clip);
                clipMap[id] = {
                    clip: clip,
                    trackIndex: t,
                    clipIndex: c
                };
            }
        }

        // Perform synchronization
        for (var i = 0; i < syncData.length; i++) {
            var item = syncData[i];

            var captionClipData = clipMap[item.captionId];
            var imageClipData = clipMap[item.imageId];

            if (!captionClipData || !imageClipData) {
                errors.push("Không tìm thấy clip cho cặp " + (i + 1));
                continue;
            }

            var captionClip = captionClipData.clip;
            var imageClip = imageClipData.clip;

            // Sync: Move image to match caption's timing
            try {
                // Get caption timing
                var captionStart = captionClip.start.seconds;
                var captionEnd = captionClip.end.seconds;
                var captionDuration = captionEnd - captionStart;

                // Get image current position
                var imageStart = imageClip.start.seconds;
                var imageDuration = imageClip.end.seconds - imageStart;

                // Move image to align with caption start
                if (imageStart !== captionStart) {
                    imageClip.start.seconds = captionStart;
                }

                // Optionally adjust duration to match caption
                // Uncomment if you want images to have the same duration as captions
                // imageClip.end.seconds = captionStart + captionDuration;

                syncedCount++;

            } catch (syncError) {
                errors.push("Lỗi đồng bộ cặp " + (i + 1) + ": " + syncError.toString());
            }
        }

        if (errors.length > 0) {
            return JSON.stringify({
                synced: syncedCount,
                error: errors.join("; ")
            });
        }

        return JSON.stringify({
            synced: syncedCount
        });

    } catch (error) {
        return JSON.stringify({
            error: "Lỗi khi đồng bộ: " + error.toString()
        });
    }
}

// Helper function to check if a string matches caption pattern
function isCaptionPattern(text) {
    return /^\d+\./.test(text);
}
