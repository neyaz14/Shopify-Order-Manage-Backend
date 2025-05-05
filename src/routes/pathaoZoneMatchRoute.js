require('dotenv').config();
const express = require('express');
const { getToken } = require('../Pathao/pathaoToken');
const axios = require('axios');
const Fuse = require('fuse.js');


const router = express.Router();


function similarText(a, b) {
    if (a === b) return 100;
    let max = 0;
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b.length; j++) {
            let k = 0;
            while (i + k < a.length && j + k < b.length && a[i + k] === b[j + k]) k++;
            if (k > max) max = k;
        }
    }
    return (2 * max) / (a.length + b.length) * 100;
}

// Main API
router.post('/match-zone', async (req, res) => {
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

        // Step 1: Filter zones that contain the given word
        const filteredZones = zones.filter(zone =>
            zone.zone_name.toLowerCase().includes(cleanedZoneName)
        );

        let candidateZones = filteredZones.length > 0 ? filteredZones : zones;

        let bestZone = null;
        let bestScore = 0;

        // Step 2: Now find best match among candidates
        for (const zone of candidateZones) {
            const score = similarText(cleanedZoneName, zone.zone_name.trim().toLowerCase());

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

        // Step 3: Response
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


// ! -------- fusejs 
router.post('/match-zone-fuse', async (req, res) => {
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

        // Fuse.js options
        const fuseOptions = {
            keys: ['zone_name'],
            threshold: 0.4, // Adjust this: lower = stricter match, higher = more lenient
            distance: 100,   // Max distance for match
            minMatchCharLength: 2, // Minimum characters to match
            ignoreLocation: true,  // Allow matches anywhere in the string
        };

        const fuse = new Fuse(zones, fuseOptions);

        const searchResults = fuse.search(cleanedZoneName);

        if (searchResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: "No matching zone found."
            });
        }

        const bestMatch = searchResults[0];

        return res.status(200).json({
            success: true,
            matched_zone: {
                zone_id: bestMatch.item.zone_id,
                zone_name: bestMatch.item.zone_name,
                match_quality: Math.round((1 - bestMatch.score) * 100) // Inverting score (0 = perfect match)
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