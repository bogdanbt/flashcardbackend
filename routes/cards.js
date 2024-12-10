const express = require('express');
const router = express.Router();
const axios = require('axios');
const Word = require('../models/Word');

// Route for importing words
// router.post('/import', async (req, res) => {
//     const { email, text, rowDelimiter, columnDelimiter } = req.body;

//     try {
//         const rows = text.split(rowDelimiter).map((row) => row.trim()); // Убираем пробелы
//         console.log('Parsed rows:', rows);

//         const cards = [];

//         for (const row of rows) {
//             if (!row) continue; // Пропускаем пустые строки

//             // Разделяем строку на части
//             const firstDelimiterIndex = row.indexOf(columnDelimiter); // Находим первый разделитель
//             if (firstDelimiterIndex === -1) {
//                 console.warn(`Skipping invalid row: "${row}"`); // Если разделитель не найден
//                 continue;
//             }

//             // Извлекаем английскую часть (до разделителя) и перевод (после разделителя)
//             const word = row.slice(0, firstDelimiterIndex).trim(); // Всё до первого разделителя
//             const translation = row.slice(firstDelimiterIndex + columnDelimiter.length).trim(); // Всё после разделителя

//             console.log(`Processing word: "${word}", translation: "${translation}"`);

//             // Проверяем, что обе части существуют
//             if (!word || !translation) {
//                 console.warn(`Skipping incomplete row: "${row}"`);
//                 continue;
//             }

//             // Генерируем TTS URL
//             const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&q=${encodeURIComponent(
//                 word
//             )}&client=tw-ob`;

//             // Создаём объект карточки
//             const card = new Card({ email, word, translation, audio: ttsUrl });
//             await card.save();
//             cards.push(card);
//         }

//         if (cards.length === 0) {
//             throw new Error('No valid rows found');
//         }

//         res.status(200).json({ message: 'Words imported successfully!', cards });
//     } catch (error) {
//         console.error('Import error:', error);
//         res.status(500).json({ error: error.message });
//     }
// });
router.post('/import', async (req, res) => {
    const { email, lesson, text, rowDelimiter, columnDelimiter } = req.body;

    if (!email || !lesson || !text) {
        return res.status(400).json({ error: 'Email, lesson, and text are required.' });
    }

    try {
        const rows = text.split(rowDelimiter).map((row) => row.trim());
        const words = [];

        for (const row of rows) {
            if (!row) continue;

            const firstDelimiterIndex = row.indexOf(columnDelimiter);
            if (firstDelimiterIndex === -1) continue;

            const word = row.slice(0, firstDelimiterIndex).trim();
            const translation = row.slice(firstDelimiterIndex + columnDelimiter.length).trim();

            if (!word || !translation) continue;

            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&q=${encodeURIComponent(
                word
            )}&client=tw-ob`;

            const wordEntry = new Word({
                email,
                lesson,
                word,
                translation,
                audio: ttsUrl,
            });

            await wordEntry.save();
            words.push(wordEntry);
        }

        res.status(200).json({ message: 'Words imported successfully!', words });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.put('/cards/:id', async (req, res) => {
    const { id } = req.params;
    const { image } = req.body;

    try {
        const card = await Card.findByIdAndUpdate(id, { image }, { new: true });
        res.status(200).json(card);
    } catch (error) {
        console.error('Error updating card:', error);
        res.status(500).json({ error: 'Unable to update card' });
    }
});
router.delete("/delete", async (req, res) => {
    try {
        await Card.deleteMany({});
        res.status(200).json({ message: "Все слова успешно удалены." });
    } catch (error) {
        console.error("Ошибка при удалении слов:", error);
        res.status(500).json({ error: "Ошибка при удалении слов." });
    }
});
// // Route to fetch all cards
// router.get('/', async (req, res) => {
//     try {
//         const cards = await Card.find();
//         res.status(200).json(cards);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
// router.get('/', async (req, res) => {
//     const { email } = req.query;

//     try {
//         if (!email) {
//             return res.status(400).json({ error: 'Email is required' });
//         }

//         const cards = await Card.find({ email });
//         res.status(200).json(cards);
//     } catch (error) {
//         console.error('Error fetching words:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

router.get('/lessons', async (req, res) => {
    try {
        const lessons = await Word.distinct('lesson');
        res.status(200).json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ error: 'Failed to fetch lessons.' });
    }
});
router.get('/', async (req, res) => {
    const { lesson } = req.query;

    try {
        const words = await Word.find({ lesson });
        res.status(200).json(words);
    } catch (error) {
        console.error('Error fetching words:', error);
        res.status(500).json({ error: 'Failed to fetch words.' });
    }
});


module.exports = router;
