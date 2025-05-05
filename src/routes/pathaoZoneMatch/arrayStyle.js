require('dotenv').config();
const express = require('express');
const { getToken } = require('../../Pathao/pathaoToken');
const axios = require('axios');



const router = express.Router();

function letterBasedSerialMatch(input, zoneName) {
    const inputLetters = input.replace(/\s+/g, '').toLowerCase().split('');
    const zoneLetters = zoneName.replace(/\s+/g, '').toLowerCase().split('');

    let matchedLetters = 0;
    const minLength = Math.min(inputLetters.length, zoneLetters.length);

    for (let i = 0; i < minLength; i++) {
        if (inputLetters[i] === zoneLetters[i]) {
            matchedLetters++;
        }
    }

    const matchPercentage = (matchedLetters / inputLetters.length) * 100;
    return matchPercentage;
}



function similarText(first, second) {
    if (first === second) return 100;

    const len1 = first.length;
    const len2 = second.length;

    if (len1 === 0 || len2 === 0) return 0;

    let matches = 0;
    let pos1 = 0;
    let pos2 = 0;
    let max = 0;

    // Find the number of matching characters
    for (let i = 0; i < len1; i++) {
        for (let j = Math.max(0, i - max); j < Math.min(len2, i + max + 1); j++) {
            if (first[i] !== second[j] || pos1 !== 0) continue;

            for (pos1 = i, pos2 = j; pos1 < len1 && pos2 < len2 && first[pos1] === second[pos2]; pos1++, pos2++);

            if (pos1 - i > max) {
                max = pos1 - i;
            }

            matches += max;
            break;
        }
    }

    // Calculate similarity percentage
    return (matches * 200) / (len1 + len2);
}

router.post('/match-zone-array', async (req, res) => {
    const { cityId, zoneName } = req.body;

    if (!cityId || !zoneName) {
        return res.status(400).json({
            success: false,
            error: "Both cityId and zoneName are required."
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

        const cleanedInput = zoneName.trim().toLowerCase();

        let bestZone = null;
        let bestScore = 0;

        for (const zone of zones) {
            const zoneNameCleaned = zone.zone_name.trim().toLowerCase();
            const score = similarText(cleanedInput, zoneNameCleaned);

            if (score > bestScore) {
                bestScore = score;
                bestZone = zone;
            }
        }

        if (!bestZone || bestScore < 50) { // set threshold here
            return res.status(404).json({
                success: false,
                error: "No good matching zone found."
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


module.exports = router