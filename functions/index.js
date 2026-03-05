const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const { ApifyClient } = require("apify-client");
const axios = require("axios");
const crypto = require("crypto");

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// =============================================
// BLOCKCHAIN ENGINE — SHA-256 Hash Chain
// =============================================

/**
 * Generates SHA-256 hash of a block.
 * The immutable fingerprint of the land record.
 */
const generateBlockHash = (block) => {
    const data = JSON.stringify({
        index: block.index,
        timestamp: block.timestamp,
        landId: block.landId,
        ownerName: block.ownerName,
        mobile: block.mobile,
        state: block.state,
        location: block.location,
        area: block.area,
        coordinates: block.coordinates,
        previousHash: block.previousHash,
        nonce: block.nonce,
    });
    return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * Creates the genesis block (Block #0) if it doesn't exist.
 */
const ensureGenesisBlock = async () => {
    const genesisRef = db.collection("blockchain").doc("block_0");
    const genesisDoc = await genesisRef.get();

    if (!genesisDoc.exists) {
        const genesisBlock = {
            index: 0,
            timestamp: new Date().toISOString(),
            landId: "GENESIS",
            ownerName: "SecureLand System",
            mobile: "0000000000",
            state: "System",
            location: "SecureLand Blockchain Network",
            area: 0,
            coordinates: [],
            previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
            nonce: 0,
            hash: "",
            transactionType: "GENESIS",
        };

        genesisBlock.hash = generateBlockHash(genesisBlock);
        await genesisRef.set(genesisBlock);

        // Set chain metadata
        await db.collection("blockchain").doc("_metadata").set({
            totalBlocks: 1,
            lastBlockIndex: 0,
            lastBlockHash: genesisBlock.hash,
            chainCreated: genesisBlock.timestamp,
            lastUpdated: genesisBlock.timestamp,
        });

        functions.logger.info("Genesis block created:", genesisBlock.hash);
        return genesisBlock;
    }

    return genesisDoc.data();
};

/**
 * Simple Proof-of-Work: Find a nonce that produces a hash starting with "00"
 */
const mineBlock = (blockData) => {
    let nonce = 0;
    let hash = "";
    const difficulty = "00"; // 2 leading zeros

    do {
        nonce++;
        blockData.nonce = nonce;
        hash = generateBlockHash(blockData);
    } while (!hash.startsWith(difficulty) && nonce < 100000);

    return { nonce, hash };
};

/**
 * Adds a new block to the blockchain (land registration)
 */
const addBlockToChain = async (landData) => {
    // Ensure genesis exists
    await ensureGenesisBlock();

    // Get chain metadata
    const metaRef = db.collection("blockchain").doc("_metadata");
    const metaDoc = await metaRef.get();
    const metadata = metaDoc.data();

    const newIndex = metadata.lastBlockIndex + 1;

    // Create new block
    const blockData = {
        index: newIndex,
        timestamp: new Date().toISOString(),
        landId: landData.landId,
        ownerName: landData.ownerName,
        mobile: landData.mobile,
        state: landData.state,
        location: landData.location,
        area: landData.area || 0,
        coordinates: landData.coordinates || [],
        previousHash: metadata.lastBlockHash,
        nonce: 0,
        transactionType: "LAND_REGISTRATION",
    };

    // Mine the block (Proof-of-Work)
    const { nonce, hash } = mineBlock(blockData);
    blockData.nonce = nonce;
    blockData.hash = hash;

    // Store block in Firestore
    const blockRef = db.collection("blockchain").doc(`block_${newIndex}`);
    await blockRef.set(blockData);

    // Update metadata
    await metaRef.update({
        totalBlocks: newIndex + 1,
        lastBlockIndex: newIndex,
        lastBlockHash: hash,
        lastUpdated: blockData.timestamp,
    });

    // Update the Digital Twin with blockchain info
    const twinRef = db.collection("digitalTwins").doc(landData.landId);
    await twinRef.update({
        blockchainHash: hash,
        blockIndex: newIndex,
        previousBlockHash: metadata.lastBlockHash,
        blockNonce: nonce,
        blockchainTimestamp: blockData.timestamp,
        blockchainVerified: true,
    });

    functions.logger.info(`Block #${newIndex} mined: ${hash} (nonce: ${nonce})`);

    return blockData;
};

/**
 * Validates the entire blockchain integrity
 */
const validateChain = async () => {
    const metaDoc = await db.collection("blockchain").doc("_metadata").get();
    if (!metaDoc.exists) return { valid: false, error: "No blockchain found" };

    const metadata = metaDoc.data();
    const totalBlocks = metadata.totalBlocks;
    const errors = [];

    for (let i = 0; i < totalBlocks; i++) {
        const blockDoc = await db.collection("blockchain").doc(`block_${i}`).get();
        if (!blockDoc.exists) {
            errors.push(`Block #${i} missing`);
            continue;
        }

        const block = blockDoc.data();

        // Verify hash integrity
        const recalculatedHash = generateBlockHash(block);
        if (recalculatedHash !== block.hash) {
            errors.push(`Block #${i}: Hash mismatch — DATA TAMPERED`);
        }

        // Verify chain linkage (skip genesis)
        if (i > 0) {
            const prevBlockDoc = await db.collection("blockchain").doc(`block_${i - 1}`).get();
            if (prevBlockDoc.exists) {
                const prevBlock = prevBlockDoc.data();
                if (block.previousHash !== prevBlock.hash) {
                    errors.push(`Block #${i}: Chain broken — previous hash mismatch`);
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        totalBlocks,
        errors,
        lastVerified: new Date().toISOString(),
    };
};

// =============================================
// BLOCKCHAIN API ROUTES
// =============================================

/**
 * POST /api/blockchain/register
 * Registers a land record on the blockchain
 */
app.post("/blockchain/register", async (req, res) => {
    try {
        const { landId, ownerName, mobile, state, location, area, coordinates } = req.body;

        if (!landId || !ownerName) {
            return res.status(400).json({
                success: false,
                error: "landId and ownerName are required.",
            });
        }

        functions.logger.info(`Blockchain registration: ${landId} by ${ownerName}`);

        const block = await addBlockToChain({
            landId, ownerName, mobile, state, location, area, coordinates,
        });

        return res.json({
            success: true,
            message: "Land record added to blockchain",
            block: {
                index: block.index,
                hash: block.hash,
                previousHash: block.previousHash,
                nonce: block.nonce,
                timestamp: block.timestamp,
                transactionType: block.transactionType,
            },
        });
    } catch (error) {
        functions.logger.error("Blockchain register error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Failed to register on blockchain: " + error.message,
        });
    }
});

/**
 * GET /api/blockchain/verify/:landId
 * Verifies a specific land record on the blockchain
 */
app.get("/blockchain/verify/:landId", async (req, res) => {
    try {
        const { landId } = req.params;

        // Find the block with this landId
        const snapshot = await db.collection("blockchain")
            .where("landId", "==", landId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.json({
                success: false,
                verified: false,
                message: "Land record not found on blockchain",
            });
        }

        const block = snapshot.docs[0].data();
        const recalculatedHash = generateBlockHash(block);
        const hashValid = recalculatedHash === block.hash;

        // Check chain link
        let chainValid = true;
        if (block.index > 0) {
            const prevDoc = await db.collection("blockchain").doc(`block_${block.index - 1}`).get();
            if (prevDoc.exists) {
                chainValid = block.previousHash === prevDoc.data().hash;
            }
        }

        return res.json({
            success: true,
            verified: hashValid && chainValid,
            block: {
                index: block.index,
                hash: block.hash,
                previousHash: block.previousHash,
                nonce: block.nonce,
                timestamp: block.timestamp,
                landId: block.landId,
                ownerName: block.ownerName,
                location: block.location,
                area: block.area,
            },
            integrity: {
                hashValid,
                chainValid,
                recalculatedHash,
            },
        });
    } catch (error) {
        functions.logger.error("Blockchain verify error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Verification failed: " + error.message,
        });
    }
});

/**
 * GET /api/blockchain/chain
 * Returns the full blockchain
 */
app.get("/blockchain/chain", async (req, res) => {
    try {
        const snapshot = await db.collection("blockchain")
            .orderBy("index", "asc")
            .get();

        const blocks = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (doc.id !== "_metadata") {
                blocks.push({
                    index: data.index,
                    hash: data.hash,
                    previousHash: data.previousHash,
                    nonce: data.nonce,
                    timestamp: data.timestamp,
                    landId: data.landId,
                    ownerName: data.ownerName,
                    location: data.location,
                    area: data.area,
                    transactionType: data.transactionType,
                });
            }
        });

        return res.json({
            success: true,
            totalBlocks: blocks.length,
            chain: blocks,
        });
    } catch (error) {
        functions.logger.error("Blockchain chain error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch blockchain: " + error.message,
        });
    }
});

/**
 * GET /api/blockchain/validate
 * Validates entire blockchain integrity
 */
app.get("/blockchain/validate", async (req, res) => {
    try {
        const result = await validateChain();
        return res.json({
            success: true,
            ...result,
        });
    } catch (error) {
        functions.logger.error("Blockchain validate error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Validation failed: " + error.message,
        });
    }
});

/**
 * GET /api/blockchain/stats
 * Returns blockchain statistics
 */
app.get("/blockchain/stats", async (req, res) => {
    try {
        const metaDoc = await db.collection("blockchain").doc("_metadata").get();

        if (!metaDoc.exists) {
            await ensureGenesisBlock();
            const newMeta = await db.collection("blockchain").doc("_metadata").get();
            const data = newMeta.data();
            return res.json({ success: true, stats: data });
        }

        return res.json({
            success: true,
            stats: metaDoc.data(),
        });
    } catch (error) {
        functions.logger.error("Blockchain stats error:", error.message);
        return res.status(500).json({
            success: false,
            error: "Failed to fetch stats: " + error.message,
        });
    }
});


// =============================================
// EXISTING ROUTES
// =============================================

// UTILITY: Create location slug for Firestore
const createSlug = (location) => {
    return location
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "_");
};

// UTILITY: Check if cache is still valid (6hrs)
const isCacheValid = (lastUpdated) => {
    if (!lastUpdated) return false;
    const sixHoursMs = 6 * 60 * 60 * 1000;
    const lastTime = lastUpdated.toDate
        ? lastUpdated.toDate().getTime()
        : new Date(lastUpdated).getTime();
    return Date.now() - lastTime < sixHoursMs;
};

// UTILITY: Process Apify results
const processListings = (items, location) => {
    const landListings = items.filter((item) => {
        const type = (item.propertyType || item.type || item.category || "").toLowerCase();
        const title = (item.title || item.name || "").toLowerCase();
        return (
            type.includes("land") || type.includes("plot") || type.includes("site") ||
            title.includes("land") || title.includes("plot") || title.includes("site") ||
            title.includes("vacant") || items.length <= 20
        );
    });

    if (landListings.length === 0) {
        return { location, averagePricePerSqft: 0, minPricePerSqft: 0, maxPricePerSqft: 0, listingsAnalyzed: 0 };
    }

    const pricesPerSqft = [];
    for (const listing of landListings) {
        const price = listing.price || listing.totalPrice || listing.amount || listing.cost || 0;
        const area = listing.area || listing.areaInSqft || listing.size || listing.plotArea || listing.builtUpArea || 0;
        const numPrice = typeof price === "string" ? parseFloat(price.replace(/[^0-9.]/g, "")) : Number(price);
        const numArea = typeof area === "string" ? parseFloat(area.replace(/[^0-9.]/g, "")) : Number(area);
        if (numPrice > 0 && numArea > 0) {
            pricesPerSqft.push(Math.round(numPrice / numArea));
        }
    }

    if (pricesPerSqft.length === 0) {
        return { location, averagePricePerSqft: 0, minPricePerSqft: 0, maxPricePerSqft: 0, listingsAnalyzed: landListings.length };
    }

    return {
        location,
        averagePricePerSqft: Math.round(pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length),
        minPricePerSqft: Math.min(...pricesPerSqft),
        maxPricePerSqft: Math.max(...pricesPerSqft),
        listingsAnalyzed: pricesPerSqft.length,
    };
};

// ROUTE: GET /api/land-rate?location=<location>
app.get("/land-rate", async (req, res) => {
    try {
        const location = req.query.location;
        if (!location || typeof location !== "string" || location.trim() === "") {
            return res.status(400).json({ success: false, error: "Missing or invalid 'location' query parameter." });
        }

        const trimmedLocation = location.trim();
        const slug = createSlug(trimmedLocation);
        functions.logger.info(`Land rate request for: ${trimmedLocation} (slug: ${slug})`);

        const cacheRef = db.collection("landRates").doc(slug);
        const cacheDoc = await cacheRef.get();

        if (cacheDoc.exists) {
            const cachedData = cacheDoc.data();
            if (isCacheValid(cachedData.lastUpdated)) {
                functions.logger.info(`Returning cached data for: ${trimmedLocation}`);
                return res.json({
                    success: true, source: "cache",
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

        functions.logger.info(`Fetching fresh data from Apify for: ${trimmedLocation}`);
        const APIFY_TOKEN = functions.config().apify.token;
        if (!APIFY_TOKEN) {
            functions.logger.error("Apify token not configured!");
            return res.status(500).json({ success: false, error: "Server configuration error. Apify token missing." });
        }

        const client = new ApifyClient({ token: APIFY_TOKEN });
        const run = await client.actor("tri_angle/real-estate-aggregator").call({ location: trimmedLocation, maxItems: 20 });
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        functions.logger.info(`Apify returned ${items.length} items for: ${trimmedLocation}`);
        const processedData = processListings(items, trimmedLocation);

        await cacheRef.set({
            ...processedData,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });

        functions.logger.info(`Cached results for: ${trimmedLocation}`);
        return res.json({
            success: true, source: "apify",
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
        return res.status(500).json({ success: false, error: "Failed to fetch land rate data. Please try again later." });
    }
});

// ROUTE: GET /api/health
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "SecureLand API + Blockchain",
        features: ["land-rate", "blockchain-register", "blockchain-verify", "blockchain-chain", "blockchain-validate"],
        timestamp: new Date().toISOString(),
    });
});

// Export the API
exports.api = functions.https.onRequest(app);
