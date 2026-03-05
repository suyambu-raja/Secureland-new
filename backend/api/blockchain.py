"""
Blockchain Engine — SHA-256 Hash Chain with Proof-of-Work.
Runs server-side in Django, stores blocks in Firestore.
"""

import hashlib
import json
from datetime import datetime
from firebase_admin import firestore


def get_db():
    return firestore.client()


def generate_block_hash(block_data: dict) -> str:
    """Generate SHA-256 hash of a block."""
    data = json.dumps({
        "index": block_data.get("index"),
        "timestamp": block_data.get("timestamp"),
        "landId": block_data.get("landId"),
        "ownerName": block_data.get("ownerName"),
        "mobile": block_data.get("mobile"),
        "state": block_data.get("state"),
        "location": block_data.get("location"),
        "area": block_data.get("area"),
        "coordinates": block_data.get("coordinates"),
        "previousHash": block_data.get("previousHash"),
        "nonce": block_data.get("nonce"),
    }, sort_keys=False)
    return hashlib.sha256(data.encode()).hexdigest()


def mine_block(block_data: dict, difficulty: str = "00") -> tuple:
    """Proof-of-Work: find nonce that produces hash starting with difficulty prefix."""
    nonce = 0
    while nonce < 100000:
        nonce += 1
        block_data["nonce"] = nonce
        hash_val = generate_block_hash(block_data)
        if hash_val.startswith(difficulty):
            return nonce, hash_val
    return nonce, generate_block_hash(block_data)


def ensure_genesis_block():
    """Create genesis block if it doesn't exist."""
    db = get_db()
    genesis_ref = db.collection("blockchain").document("block_0")
    genesis_doc = genesis_ref.get()

    if not genesis_doc.exists:
        genesis_block = {
            "index": 0,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "landId": "GENESIS",
            "ownerName": "SecureLand System",
            "mobile": "0000000000",
            "state": "System",
            "location": "SecureLand Blockchain Network",
            "area": 0,
            "coordinates": [],
            "previousHash": "0" * 64,
            "nonce": 0,
            "hash": "",
            "transactionType": "GENESIS",
        }
        genesis_block["hash"] = generate_block_hash(genesis_block)
        genesis_ref.set(genesis_block)

        db.collection("blockchain").document("_metadata").set({
            "totalBlocks": 1,
            "lastBlockIndex": 0,
            "lastBlockHash": genesis_block["hash"],
            "chainCreated": genesis_block["timestamp"],
            "lastUpdated": genesis_block["timestamp"],
        })
        return genesis_block

    return genesis_doc.to_dict()


def register_on_blockchain(land_data: dict) -> dict:
    """Add a new block to the blockchain for a land registration."""
    db = get_db()
    ensure_genesis_block()

    meta_ref = db.collection("blockchain").document("_metadata")
    meta_doc = meta_ref.get()
    metadata = meta_doc.to_dict()

    new_index = metadata["lastBlockIndex"] + 1

    block_data = {
        "index": new_index,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "landId": land_data["landId"],
        "ownerName": land_data.get("ownerName", ""),
        "mobile": land_data.get("mobile", ""),
        "state": land_data.get("state", ""),
        "location": land_data.get("location", ""),
        "area": land_data.get("area", 0),
        "coordinates": land_data.get("coordinates", []),
        "previousHash": metadata["lastBlockHash"],
        "nonce": 0,
        "transactionType": "LAND_REGISTRATION",
    }

    nonce, hash_val = mine_block(block_data)
    block_data["nonce"] = nonce
    block_data["hash"] = hash_val

    # Store block
    db.collection("blockchain").document(f"block_{new_index}").set(block_data)

    # Update metadata
    meta_ref.update({
        "totalBlocks": new_index + 1,
        "lastBlockIndex": new_index,
        "lastBlockHash": hash_val,
        "lastUpdated": block_data["timestamp"],
    })

    # Update Digital Twin
    twin_ref = db.collection("digitalTwins").document(land_data["landId"])
    twin_ref.update({
        "blockchainHash": hash_val,
        "blockIndex": new_index,
        "previousBlockHash": metadata["lastBlockHash"],
        "blockNonce": nonce,
        "blockchainTimestamp": block_data["timestamp"],
        "blockchainVerified": True,
    })

    return block_data


def verify_land_on_blockchain(land_id: str) -> dict:
    """Verify a land record on the blockchain."""
    db = get_db()
    query = db.collection("blockchain").where("landId", "==", land_id).limit(1).get()

    if not query:
        return {"verified": False, "block": None, "hashValid": False, "chainValid": False}

    block = query[0].to_dict()
    recalculated = generate_block_hash(block)
    hash_valid = recalculated == block.get("hash")

    chain_valid = True
    if block["index"] > 0:
        prev_doc = db.collection("blockchain").document(f"block_{block['index'] - 1}").get()
        if prev_doc.exists:
            chain_valid = block["previousHash"] == prev_doc.to_dict()["hash"]

    return {
        "verified": hash_valid and chain_valid,
        "block": block,
        "hashValid": hash_valid,
        "chainValid": chain_valid,
    }


def get_full_chain() -> list:
    """Get the full blockchain."""
    db = get_db()
    docs = db.collection("blockchain").order_by("index").get()
    blocks = []
    for doc in docs:
        data = doc.to_dict()
        if doc.id != "_metadata" and "index" in data:
            blocks.append(data)
    return blocks


def validate_chain() -> dict:
    """Validate the entire blockchain integrity."""
    db = get_db()
    meta_doc = db.collection("blockchain").document("_metadata").get()
    if not meta_doc.exists:
        return {"valid": False, "totalBlocks": 0, "errors": ["No blockchain found"]}

    metadata = meta_doc.to_dict()
    errors = []

    for i in range(metadata["totalBlocks"]):
        block_doc = db.collection("blockchain").document(f"block_{i}").get()
        if not block_doc.exists:
            errors.append(f"Block #{i} missing")
            continue

        block = block_doc.to_dict()
        recalculated = generate_block_hash(block)
        if recalculated != block.get("hash"):
            errors.append(f"Block #{i}: Hash mismatch — DATA TAMPERED")

        if i > 0:
            prev_doc = db.collection("blockchain").document(f"block_{i - 1}").get()
            if prev_doc.exists:
                if block["previousHash"] != prev_doc.to_dict()["hash"]:
                    errors.append(f"Block #{i}: Chain broken")

    return {
        "valid": len(errors) == 0,
        "totalBlocks": metadata["totalBlocks"],
        "errors": errors,
    }
