const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * MAPPING: Add all your data files here.
 * Format: "Subject Name": require('./path/to/data/file')
 */
const dataFiles = {
    "SFG Test": require('./MCQ_Data/sfgData.js')
    // "Murnal Weekely Test": require('./MCQ_Data/murnalData.js')
    // "Sathvik Bhan Monthly CA Test": require('./MCQ_Data/sathvikBhanCaData.js'),
    // "Year Wise PYQ": require('./MCQ_Data/yearWiseData.js'),
    // "Modern History PYQ": require('./MCQ_Data/modernHistoryData.js'),
    // "Ancient History PYQ": require('./MCQ_Data/ancientHistoryData.js'),
    // "Medieval History PYQ": require('./MCQ_Data/medievalHistoryData.js'),
    // "Art and Culture PYQ": require('./MCQ_Data/artCultureData.js'),
    // "World Geography PYQ": require('./MCQ_Data/worldGeographyData.js'),
    // "Indian Geography PYQ": require('./MCQ_Data/indianGeographyData.js'),
    // "Environment and Ecology PYQ": require('./MCQ_Data/environmentData.js'),
    // "Polity PYQ": require('./MCQ_Data/polityData.js'),
    // "IR PYQ": require('./MCQ_Data/irData.js'),
    // "Economy PYQ": require('./MCQ_Data/economyData.js'),
    // "Science and Tech PYQ": require('./MCQ_Data/scienceTechData.js')

    // Add others: "Modern History PYQ": require('./MCQ_Data/modernHistoryData.js'), etc.
};

async function uploadQuizzes() {
    console.log("🚀 Starting upload to Firestore...");

    for (const [subjectName, subjectData] of Object.entries(dataFiles)) {
        console.log(`\n📂 Processing Subject: ${subjectName}`);

        for (const [chapterId, questions] of Object.entries(subjectData)) {
            // Generate the document ID (e.g., Ancient_History_PYQ_Prehistoric_Period_...)
            const docId = `${subjectName.replace(/\s+/g, '_')}_${chapterId}`;
            
            try {
                // Upload to the 'quizzes' collection
                await db.collection('quizzes').doc(docId).set({
                    questions: questions
                });
                console.log(`✅ Uploaded Chapter: ${chapterId} (Questions: ${questions.length})`);
            } catch (error) {
                console.error(`❌ Failed to upload ${chapterId}:`, error.message);
            }
        }
    }

    console.log("\n✨ All uploads completed!");
}

uploadQuizzes();