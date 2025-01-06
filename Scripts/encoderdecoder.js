// Constants
const MAX_HISTORY_ITEMS = 10;
const KEY_SIZE = 256; // Increased to 256 bits for AES and 2048 bits for RSA

// Initialize when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
  updateKeyInterface();
});

// History Management
function loadHistory() {
  const history = JSON.parse(localStorage.getItem("encoderHistory") || "[]");
  updateHistoryDisplay(history);
}

function saveToHistory(operation, input, output) {
  let history = JSON.parse(localStorage.getItem("encoderHistory") || "[]");
  const newEntry = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    algorithm: document.getElementById("algorithmSelect").value,
    operation,
    input,
    output,
  };

  history.unshift(newEntry);
  history = history.slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem("encoderHistory", JSON.stringify(history));
  updateHistoryDisplay(history);
}

function updateHistoryDisplay(history) {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = history
    .map(
      (entry) => `
        <div class="history-item">
            <span class="history-close" onclick="deleteHistoryItem(${
              entry.id
            })">×</span>
            <p><strong>${entry.algorithm} - ${entry.operation}</strong> (${
        entry.timestamp
      })</p>
            <p>Input: ${entry.input.substring(0, 50)}${
        entry.input.length > 50 ? "..." : ""
      }</p>
            <p>Output: ${entry.output.substring(0, 50)}${
        entry.output.length > 50 ? "..." : ""
      }</p>
        </div>
    `
    )
    .join("");
}

function deleteHistoryItem(id) {
  let history = JSON.parse(localStorage.getItem("encoderHistory") || "[]");
  history = history.filter((entry) => entry.id !== id);
  localStorage.setItem("encoderHistory", JSON.stringify(history));
  updateHistoryDisplay(history);
}

function clearHistory() {
  localStorage.removeItem("encoderHistory");
  updateHistoryDisplay([]);
}

// UI Management
function updateKeyInterface() {
  const algorithm = document.getElementById("algorithmSelect").value;
  const symmetricKey = document.getElementById("symmetricKey");
  const asymmetricKeys = document.getElementById("asymmetricKeys");

  if (algorithm === "AES") {
    symmetricKey.classList.remove("hidden");
    asymmetricKeys.classList.add("hidden");
  } else {
    symmetricKey.classList.add("hidden");
    asymmetricKeys.classList.remove("hidden");
  }
}

// Cryptographic Operations
async function generateKeys() {
  const algorithm = document.getElementById("algorithmSelect").value;

  try {
    if (algorithm === "AES") {
      const key = await window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: KEY_SIZE,
        },
        true,
        ["encrypt", "decrypt"]
      );
      const exportedKey = await window.crypto.subtle.exportKey("raw", key);
      document.getElementById("aesKey").value = bufferToHex(exportedKey);
    } else {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048, // Standard RSA key size
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );
      const exportedPublicKey = await window.crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
      );
      const exportedPrivateKey = await window.crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
      );

      document.getElementById("publicKey").value =
        bufferToHex(exportedPublicKey);
      document.getElementById("privateKey").value =
        bufferToHex(exportedPrivateKey);
    }
  } catch (error) {
    console.error("Key generation failed:", error);
    alert("Key generation failed: " + error.message);
  }
}

async function encodeMessage() {
  const algorithm = document.getElementById("algorithmSelect").value;
  const input = document.getElementById("inputMessage").value;
  let output = "";

  try {
    if (algorithm === "AES") {
      const keyData = hexToBuffer(document.getElementById("aesKey").value);
      const key = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        "AES-GCM",
        true,
        ["encrypt"]
      );
      output = await encryptAES(input, key);
    } else {
      const publicKeyData = hexToBuffer(
        document.getElementById("publicKey").value
      );
      const publicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyData,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["encrypt"]
      );
      output = await encryptRSA(input, publicKey);
    }

    document.getElementById("outputMessage").value = output;
    saveToHistory("Encode", input, output);
  } catch (error) {
    console.error("Encryption failed:", error);
    alert("Encryption failed: " + error.message);
  }
}

async function decodeMessage() {
  const algorithm = document.getElementById("algorithmSelect").value;
  const input = document.getElementById("inputMessage").value;
  let output = "";

  try {
    if (algorithm === "AES") {
      const keyData = hexToBuffer(document.getElementById("aesKey").value);
      const key = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        "AES-GCM",
        true,
        ["decrypt"]
      );
      output = await decryptAES(input, key);
    } else {
      const privateKeyData = hexToBuffer(
        document.getElementById("privateKey").value
      );
      const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyData,
        {
          name: "RSA-OAEP",
          hash: "SHA-256",
        },
        true,
        ["decrypt"]
      );
      output = await decryptRSA(input, privateKey);
    }

    document.getElementById("outputMessage").value = output;
    saveToHistory("Decode", input, output);
  } catch (error) {
    console.error("Decryption failed:", error);
    alert("Decryption failed: " + error.message);
  }
}

async function encryptAES(text, key) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoded
  );

  return bufferToHex(iv) + bufferToHex(new Uint8Array(encrypted));
}

async function decryptAES(ciphertext, key) {
  const iv = hexToBuffer(ciphertext.slice(0, 24));
  const encrypted = hexToBuffer(ciphertext.slice(24));

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

async function encryptRSA(text, publicKey) {
  const encoded = new TextEncoder().encode(text);
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encoded
  );
  return bufferToHex(new Uint8Array(encrypted));
}

async function decryptRSA(ciphertext, privateKey) {
  const encrypted = hexToBuffer(ciphertext);
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}

// Helper Functions
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(
    hex.match(/.{2}/g).map((byte) => parseInt(byte, 16))
  );
  return bytes;
}
