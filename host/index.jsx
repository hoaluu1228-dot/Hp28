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
                var startTime = clip.start.seconds;
                var endTime = clip.end.seconds;

                // Generate unique ID for clip
                var clipId = t + "_" + c + "_" + clipName + "_" + startTime;

                // Determine if this is a caption or image based on name pattern
                var isCaptionByName = /^\d+\./.test(clipName);

                // Check if it's an image file
                var mediaPath = projectItem.getMediaPath ? projectItem.getMediaPath() : '';
                var isImage = /\.(png|jpg|jpeg|bmp|tiff|gif|psd)$/i.test(mediaPath) ||
                               /\.(png|jpg|jpeg|bmp|tiff|gif|psd)$/i.test(clipName);

                var clipData = {
                    id: clipId,
                    name: clipName,
                    trackIndex: t,
                    clipIndex: c,
                    startTime: startTime,
                    endTime: endTime,
                    duration: endTime - startTime
                };

                if (isCaptionByName) {
                    captions.push(clipData);
                } else if (isImage) {
                    images.push(clipData);
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
 * Sync clips based on matching data
 * @param {String} syncDataJSON - JSON string of sync data array
 */
function syncClips(syncDataJSON) {
    try {
        var activeSequence = app.project.activeSequence;

        if (!activeSequence) {
            return JSON.stringify({
                error: "Không có sequence nào đang được mở."
            });
        }

        var syncData = JSON.parse(syncDataJSON);
        var syncedCount = 0;
        var errors = [];

        // Get all tracks
        var videoTracks = activeSequence.videoTracks;

        // Build a map of all clips for faster lookup
        var clipMap = {};
        for (var t = 0; t < videoTracks.numTracks; t++) {
            var track = videoTracks[t];
            var clips = track.clips;

            for (var c = 0; c < clips.numItems; c++) {
                var clip = clips[c];
                var startTime = clip.start.seconds;
                var id = t + "_" + c + "_" + clip.name + "_" + startTime;
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

            var imageClipData = clipMap[item.imageId];

            if (!imageClipData) {
                errors.push("Không tìm thấy image clip cho cặp " + (i + 1));
                continue;
            }

            var imageClip = imageClipData.clip;

            try {
                // Sync image to match caption timing exactly
                // Image.start = Caption.start and Image.end = Caption.end
                imageClip.start.seconds = item.captionStartTime;
                imageClip.end.seconds = item.captionEndTime;

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
