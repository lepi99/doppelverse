
/**
 * Converts a File object to a Base64 string for the Gemini API.
 * @param {File} file
 * @returns {Promise<{inlineData: {data: string, mimeType: string}}>}
 */
export const fileToGenerativePart = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (!reader.result) return reject(new Error("File read failed."));
            const base64Data = reader.result.split(',')[1];
            resolve({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Handles API calls with exponential backoff.
 * @param {string} url
 * @param {object} payload
 * @param {number} maxRetries
 * @param {number} delay
 * @returns {Promise<object>}
 */
export async function fetchWithRetry(url, payload, maxRetries = 5, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                if (response.status === 429 && i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                    continue;
                }
                const errorBody = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorBody}`);
            }
            return response.json();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
        }
    }
}
