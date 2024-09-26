const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

function encrypt(text, key) {
    const hashedKey = crypto.createHash('sha256').update(key).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', hashedKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + encrypted;
}

function decrypt(encryptedText, key) {
    try {
        const hashedKey = crypto.createHash('sha256').update(key).digest();
        const iv = Buffer.from(encryptedText.slice(0, 32), 'hex');
        const encryptedData = encryptedText.slice(32);
        const decipher = crypto.createDecipheriv('aes-256-cbc', hashedKey, iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return { success: true, data: decrypted };
    } catch (error) {
        return { success: false, error: 'Data is corrupted or the Key is wrong!' };
    }
}

app.post('/api/v1/encrypt', (req, res) => {
    const { data, key } = req.body;

    if (!data || !key) {
        return res.status(400).json({ code: 902, data: null, message: 'Invalid input. Data and Key are required.' });
    }

    const encryptedData = encrypt(data, key);
    res.json({ code: 900, data: encryptedData, message: 'OK' });
});

app.post('/api/v1/decrypt', (req, res) => {
    const { data, key } = req.body;

    if (!data || !key) {
        return res.status(400).json({ code: 902, data: null, message: 'Invalid input. Data and Key are required.' });
    }

    const result = decrypt(data, key);

    if (result.success) {
        res.json({ code: 900, data: result.data, message: 'OK' });
    } else {
        res.json({ code: 901, data: null, message: result.error });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
