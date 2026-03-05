/**
 * SecureLand Blockchain Engine
 * SHA-256 Hash Chain with Proof-of-Work
 * Runs client-side, stores blocks in Firestore
 */

import { db } from "./firebase";
import {
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy,
    updateDoc,
} from "firebase/firestore";

// =============================================
// SHA-256 Helper (Web Crypto API)
// =============================================
async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// =============================================
// Block Interfaces
// =============================================
export interface Block {
    index: number;
    timestamp: string;
    landId: string;
    ownerName: string;
    mobile: string;
    state: string;
    location: string;
    area: number;
    coordinates: { lat: number; lng: number }[];
    previousHash: string;
    nonce: number;
    hash: string;
    transactionType: string;
}

export interface ChainMetadata {
    totalBlocks: number;
    lastBlockIndex: number;
    lastBlockHash: string;
    chainCreated: string;
    lastUpdated: string;
}

// =============================================
// Hash Generation
// =============================================
async function generateBlockHash(block: Partial<Block>): Promise<string> {
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
    return sha256(data);
}

// =============================================
// Proof-of-Work Mining (2 leading zeros)
// =============================================
async function mineBlock(
    blockData: Partial<Block>
): Promise<{ nonce: number; hash: string }> {
    let nonce = 0;
    let hash = "";
    const difficulty = "00";

    do {
        nonce++;
        blockData.nonce = nonce;
        hash = await generateBlockHash(blockData);
    } while (!hash.startsWith(difficulty) && nonce < 100000);

    return { nonce, hash };
}

// =============================================
// Genesis Block
// =============================================
async function ensureGenesisBlock(): Promise<Block> {
    const genesisRef = doc(db, "blockchain", "block_0");
    const genesisDoc = await getDoc(genesisRef);

    if (!genesisDoc.exists()) {
        const genesisBlock: Block = {
            index: 0,
            timestamp: new Date().toISOString(),
            landId: "GENESIS",
            ownerName: "SecureLand System",
            mobile: "0000000000",
            state: "System",
            location: "SecureLand Blockchain Network",
            area: 0,
            coordinates: [],
            previousHash:
                "0000000000000000000000000000000000000000000000000000000000000000",
            nonce: 0,
            hash: "",
            transactionType: "GENESIS",
        };

        genesisBlock.hash = await generateBlockHash(genesisBlock);
        await setDoc(genesisRef, genesisBlock);

        // Set chain metadata
        await setDoc(doc(db, "blockchain", "_metadata"), {
            totalBlocks: 1,
            lastBlockIndex: 0,
            lastBlockHash: genesisBlock.hash,
            chainCreated: genesisBlock.timestamp,
            lastUpdated: genesisBlock.timestamp,
        });

        console.log("⛓️ Genesis block created:", genesisBlock.hash);
        return genesisBlock;
    }

    return genesisDoc.data() as Block;
}

// =============================================
// PUBLIC API: Register Land on Blockchain
// =============================================
export async function registerOnBlockchain(landData: {
    landId: string;
    ownerName: string;
    mobile: string;
    state: string;
    location: string;
    area: number;
    coordinates: { lat: number; lng: number }[];
}): Promise<Block> {
    // 1. Ensure genesis block exists
    await ensureGenesisBlock();

    // 2. Get chain metadata
    const metaRef = doc(db, "blockchain", "_metadata");
    const metaDoc = await getDoc(metaRef);
    const metadata = metaDoc.data() as ChainMetadata;

    const newIndex = metadata.lastBlockIndex + 1;

    // 3. Create block data
    const blockData: Partial<Block> = {
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

    // 4. Mine (Proof-of-Work)
    const { nonce, hash } = await mineBlock(blockData);
    blockData.nonce = nonce;
    blockData.hash = hash;

    // 5. Store block in Firestore
    const blockRef = doc(db, "blockchain", `block_${newIndex}`);
    await setDoc(blockRef, blockData);

    // 6. Update metadata
    await updateDoc(metaRef, {
        totalBlocks: newIndex + 1,
        lastBlockIndex: newIndex,
        lastBlockHash: hash,
        lastUpdated: blockData.timestamp,
    });

    // 7. Update Digital Twin with blockchain info
    const twinRef = doc(db, "digitalTwins", landData.landId);
    await updateDoc(twinRef, {
        blockchainHash: hash,
        blockIndex: newIndex,
        previousBlockHash: metadata.lastBlockHash,
        blockNonce: nonce,
        blockchainTimestamp: blockData.timestamp,
        blockchainVerified: true,
    });

    console.log(`⛏️ Block #${newIndex} mined: ${hash} (nonce: ${nonce})`);
    return blockData as Block;
}

// =============================================
// PUBLIC API: Verify a Land Record
// =============================================
export async function verifyLandOnBlockchain(landId: string): Promise<{
    verified: boolean;
    block: Block | null;
    hashValid: boolean;
    chainValid: boolean;
}> {
    // Find block with this landId
    const q = query(
        collection(db, "blockchain"),
        where("landId", "==", landId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return { verified: false, block: null, hashValid: false, chainValid: false };
    }

    const block = snapshot.docs[0].data() as Block;

    // Verify hash
    const recalculatedHash = await generateBlockHash(block);
    const hashValid = recalculatedHash === block.hash;

    // Verify chain link
    let chainValid = true;
    if (block.index > 0) {
        const prevDoc = await getDoc(
            doc(db, "blockchain", `block_${block.index - 1}`)
        );
        if (prevDoc.exists()) {
            const prevBlock = prevDoc.data() as Block;
            chainValid = block.previousHash === prevBlock.hash;
        }
    }

    return {
        verified: hashValid && chainValid,
        block,
        hashValid,
        chainValid,
    };
}

// =============================================
// PUBLIC API: Get Full Chain
// =============================================
export async function getBlockchain(): Promise<Block[]> {
    const q = query(collection(db, "blockchain"), orderBy("index", "asc"));
    const snapshot = await getDocs(q);

    const blocks: Block[] = [];
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (docSnap.id !== "_metadata" && data.index !== undefined) {
            blocks.push(data as Block);
        }
    });

    return blocks;
}

// =============================================
// PUBLIC API: Get Chain Stats
// =============================================
export async function getBlockchainStats(): Promise<ChainMetadata | null> {
    const metaDoc = await getDoc(doc(db, "blockchain", "_metadata"));
    if (!metaDoc.exists()) {
        await ensureGenesisBlock();
        const newMeta = await getDoc(doc(db, "blockchain", "_metadata"));
        return newMeta.data() as ChainMetadata;
    }
    return metaDoc.data() as ChainMetadata;
}

// =============================================
// PUBLIC API: Validate Entire Chain
// =============================================
export async function validateBlockchain(): Promise<{
    valid: boolean;
    totalBlocks: number;
    errors: string[];
}> {
    const metaDoc = await getDoc(doc(db, "blockchain", "_metadata"));
    if (!metaDoc.exists()) {
        return { valid: false, totalBlocks: 0, errors: ["No blockchain found"] };
    }

    const metadata = metaDoc.data() as ChainMetadata;
    const errors: string[] = [];

    for (let i = 0; i < metadata.totalBlocks; i++) {
        const blockDoc = await getDoc(doc(db, "blockchain", `block_${i}`));
        if (!blockDoc.exists()) {
            errors.push(`Block #${i} missing`);
            continue;
        }

        const block = blockDoc.data() as Block;

        // Verify hash
        const recalculatedHash = await generateBlockHash(block);
        if (recalculatedHash !== block.hash) {
            errors.push(`Block #${i}: Hash mismatch — DATA TAMPERED`);
        }

        // Verify chain (skip genesis)
        if (i > 0) {
            const prevDoc = await getDoc(doc(db, "blockchain", `block_${i - 1}`));
            if (prevDoc.exists()) {
                const prevBlock = prevDoc.data() as Block;
                if (block.previousHash !== prevBlock.hash) {
                    errors.push(`Block #${i}: Chain broken — previous hash mismatch`);
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        totalBlocks: metadata.totalBlocks,
        errors,
    };
}
