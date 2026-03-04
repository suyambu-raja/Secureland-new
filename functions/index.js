const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { ApifyClient } = require("apify-client");
const axios = require("axios");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ============================================
// UTILITY: Create location slug for Firestore
// ============================================
const createSlug = (location) => {
    return location
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "_");
};

// ============================================
// UTILITY: Check if cache is still valid (6hrs)
// ============================================
const isCacheValid = (lastUpdated) => {
    if (!lastUpdated) return false;
    const sixHoursMs = 6 * 60 * 60 * 1000;
    const lastTime = lastUpdated.toDate
        ? lastUpdated.toDate().getTime()
        : new Date(lastUpdated).getTime();
    return Date.now() - lastTime < sixHoursMs;
};

// ============================================
// UTILITY: Process Apify results
// ============================================
const processListings = (items, location) => {
    // Filter only land/plot listings
    const landListings = items.filter((item) => {
        const type = (item.propertyType || item.type || item.category || "")
            .toLowerCase();
        const title = (item.title || item.name || "").toLowerCase();
        return (
            type.includes("land") ||
            type.includes("plot") ||
            type.includes("site") ||
            title.includes("land") ||
            title.includes("plot") ||
            title.includes("site") ||
            title.includes("vacant") ||
            // If no type filter matches, include all (for broad results)
            items.length <= 20
        );
    });

    if (landListings.length === 0) {
        return {
            location,
            averagePricePerSqft: 0,
            minPricePerSqft: 0,
            maxPricePerSqft: 0,
            listingsAnalyzed: 0,
        };
    }

    // Extract price per sqft from each listing
    const pricesPerSqft = [];

    for (const listing of landListings) {
        const price =
            listing.price ||
            listing.totalPrice ||
            listing.amount ||
            listing.cost ||
            0;
        const area =
            listing.area ||
            listing.areaInSqft ||
            listing.size ||
            listing.plotArea ||
            listing.builtUpArea ||
            0;

        // Parse numeric values
        const numPrice = typeof price === "string"
            ? parseFloat(price.replace(/[^0-9.]/g, ""))
            : Number(price);
        const numArea = typeof area === "string"
            ? parseFloat(area.replace(/[^0-9.]/g, ""))
            : Number(area);

        if (numPrice > 0 && numArea > 0) {
            pricesPerSqft.push(Math.round(numPrice / numArea));
        }
    }

    if (pricesPerSqft.length === 0) {
        return {
            location,
            averagePricePerSqft: 0,
            minPricePerSqft: 0,
            maxPricePerSqft: 0,
            listingsAnalyzed: landListings.length,
        };
    }

    const avg = Math.round(
        pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length
    );
    const min = Math.min(...pricesPerSqft);
    const max = Math.max(...pricesPerSqft);

    return {
        location,
        averagePricePerSqft: avg,
        minPricePerSqft: min,
        maxPricePerSqft: max,
        listingsAnalyzed: pricesPerSqft.length,
    };
};

// ============================================
// ROUTE: GET /api/land-rate?location=<location>
// ============================================
app.get("/land-rate", async (req, res) => {
    try {
        // 1. Validate location
        const location = req.query.location;

        if (!location || typeof location !== "string" || location.trim() === "") {
            return res.status(400).json({
                success: false,
                error: "Missing or invalid 'location' query parameter.",
            });
        }

        const trimmedLocation = location.trim();
        const slug = createSlug(trimmedLocation);

        functions.logger.info(`Land rate request for: ${trimmedLocation} (slug: ${slug})`);

        // 2. Check Firestore cache
        const cacheRef = db.collection("landRates").doc(slug);
        const cacheDoc = await cacheRef.get();

        if (cacheDoc.exists) {
            const cachedData = cacheDoc.data();

            if (isCacheValid(cachedData.lastUpdated)) {
                functions.logger.info(`Returning cached data for: ${trimmedLocation}`);
                return res.json({
                    success: true,
                    source: "cache",
                    data: {
                        location: cachedData.location,
                        avg_price_per_sqft: cachedData.averagePricePerSqft,
                        min_price_per_sqft: cachedData.minPricePerSqft,
                        max_price_per_sqft: cachedData.maxPricePerSqft,
                        listings_analyzed: cachedData.listingsAnalyzed,
                    },
                });
            }
        }

        // 3. Fetch from Apify
        functions.logger.info(`Fetching fresh data from Apify for: ${trimmedLocation}`);

        const APIFY_TOKEN = functions.config().apify.token;

        if (!APIFY_TOKEN) {
            functions.logger.error("Apify token not configured!");
            return res.status(500).json({
                success: false,
                error: "Server configuration error. Apify token missing.",
            });
        }

        const client = new ApifyClient({ token: APIFY_TOKEN });

        // Run the Apify actor
        const run = await client.actor("tri_angle/real-estate-aggregator").call({
            location: trimmedLocation,
            maxItems: 20,
        });

        // Get dataset results
        const { items } = await client
            .dataset(run.defaultDatasetId)
            .listItems();

        functions.logger.info(`Apify returned ${items.length} items for: ${trimmedLocation}`);

        // 4. Process data
        const processedData = processListings(items, trimmedLocation);

        // 5. Store in Firestore
        await cacheRef.set({
            ...processedData,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info(`Cached results for: ${trimmedLocation}`);

        // 6. Return response
        return res.json({
            success: true,
            source: "apify",
            data: {
                location: processedData.location,
                avg_price_per_sqft: processedData.averagePricePerSqft,
                min_price_per_sqft: processedData.minPricePerSqft,
                max_price_per_sqft: processedData.maxPricePerSqft,
                listings_analyzed: processedData.listingsAnalyzed,
            },
        });
    } catch (error) {
        functions.logger.error("Land rate error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch land rate data. Please try again later.",
        });
    }
});

// ============================================
// ROUTE: GET /api/health
// ============================================
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "SecureLand API",
        timestamp: new Date().toISOString(),
    });
});

// Export the API
exports.api = functions.https.onRequest(app);
