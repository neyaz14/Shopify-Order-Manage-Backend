require('dotenv').config();
const express = require('express');
const { getToken } = require('../Pathao/pathaoToken');
const axios = require('axios');

const router = express.Router();

// Helper: Levenshtein Distance
function levenshteinDistance(a, b) {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// Helper: Similarity based on Levenshtein
function similarity(a, b) {
    const distance = levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    if (maxLength === 0) return 100;
    return (1 - distance / maxLength) * 100;
}

// Main Matching Route
router.post('/match-zone-Levenshtein', async (req, res) => {
    const { cityId, zoneName } = req.body;

    if (!cityId || !zoneName) {
        return res.status(400).json({
            success: false,
            error: "Both cityId and zoneName are required in the request body."
        });
    }

    try {
        const token = await getToken();

        const response = await axios.get(`${process.env.BASE_URL}/aladdin/api/v1/cities/${cityId}/zone-list`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const zones = response?.data?.data?.data || [];

        if (zones.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No zones found for the given city."
            });
        }

        const cleanedZoneName = zoneName.trim().toLowerCase();

        // Step 1: Prefer zones where keyword is included
        const filteredZones = zones.filter(zone =>
            zone.zone_name.toLowerCase().includes(cleanedZoneName)
        );

        let candidateZones = filteredZones.length > 0 ? filteredZones : zones;

        let bestZone = null;
        let bestScore = 0;

        // Step 2: Match using Levenshtein similarity
        for (const zone of candidateZones) {
            const score = similarity(cleanedZoneName, zone.zone_name.trim().toLowerCase());
            if (score > bestScore) {
                bestScore = score;
                bestZone = zone;
            }
        }

        if (!bestZone) {
            return res.status(404).json({
                success: false,
                error: "No matching zone found."
            });
        }

        return res.status(200).json({
            success: true,
            matched_zone: {
                zone_id: bestZone.zone_id,
                zone_name: bestZone.zone_name,
                match_quality: Math.round(bestScore * 100) / 100
            }
        });

    } catch (error) {
        console.error('Error matching zone:', error);

        return res.status(500).json({
            success: false,
            error: "Server error occurred while matching zone.",
            details: error?.response?.data || error.message
        });
    }
});

module.exports = router;
