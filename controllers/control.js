// control.js
const FormSubmission = require('../modelss/BusinessSchema'); 
const bcrypt = require('bcrypt');
const axios = require('axios');
const { logout } = require('../middlewares/auth');
const { Scout, Player } = require('../modelss/Schema');
const TestResult = require('../modelss/FormSubmission');


const indexrout = (req, res) => {
    const userName = req.session.userName || 'تسجيل دخول'; // Ensure userName is defined
    res.render("index", { userName }); // Pass userName to the view
}
// GET Requests
const createGet = (req, res) => {
    res.render("pages/createAccount", {});
}

// Get request form
// Get request form
const MainGet = async (req, res) => {
    try {
        // Fetch external data
        const response = await axios.get('http://localhost:5001/');
        const activities = response.data.activities;
        const neighborhoods = response.data.neighborhoods;
        const userName = req.session.userName;
        const userId = req.session.userId;
        const accountType = req.session.accountType;

        if (!userId) {
            return res.status(401).send('User not authenticated');
        }

        const user = await (accountType === 'player' ? Player.findById(userId) : Scout.findById(userId)).select('email birthdate name').lean();

        let userEmail = user ? user.email : '';
        let userBirthdate = user ? (user.birthdate ? user.birthdate.toISOString().split('T')[0] : '') : '';
        const currentUserName = user ? user.name : userName;

        // Fetch data from FormSubmission collection
        const formSubmissions = await FormSubmission.find({ userId }).lean();

        // Parse step4Result for each form submission and add the location info
        formSubmissions.forEach(item => {
            item.type = 'طلب مدخل';

            // Parse step4Result string into a JavaScript object
            if (item.step4Result) {
                const step4Data = JSON.parse(item.step4Result);

                // Extract relevant location data from step4Result
                if (step4Data[0]) {
                    item.location = {
                        lat: step4Data[0].lat,
                        lng: step4Data[0].lng,
                        nearbyPOIs: step4Data[0].nearby_pois
                    };
                }
            }
        });

        // Combine data from both sources
        const combinedData = [...formSubmissions];

        let players = [];
        if (req.session.accountType === 'scout') {
            players = await Player.find().lean(); 
            for (let player of players) {
                const latestTestResult = await TestResult.findOne({ userId: player._id }).sort({ createdAt: -1 }).lean();
                player.rating = latestTestResult ? latestTestResult.rating : null;
            }
        } else if (req.session.accountType === 'player') {
            const player = await Player.findById(req.session.userId).lean();
            if (player) {
                const latestTestResult = await TestResult.findOne({ userId: player._id }).sort({ createdAt: -1 }).lean();
                player.rating = latestTestResult ? latestTestResult.rating : null;
                players = [player];
            }
        }

        // Pass everything to the EJS view, including combined data and user details
        res.render('pages/Main', {
            activities,
            neighborhoods,
            userName: currentUserName,
            combinedData,
            userEmail,
            userBirthdate,
            accountType,
            players: players
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching data');
    }
};

//Get Recommendations
const GetRecommendations = async (req, res) => {
  const { activity_type, neighborhood, lat, lng } = req.query;  // Include lat and lng

  try {
      const flaskResponse = await axios.get('http://localhost:5001/get_recommendations', {
          params: { activity_type, neighborhood, lat, lng }
      });
      res.json(flaskResponse.data);
  } catch (error) {
      console.error('Error fetching data from Flask:', error);
      res.status(500).json({ error: 'Error fetching recommendations.' });
  }
};

//Get success
    const successGet = async (req, res) => {
            res.render('pages/success');
    };


// Controller function to handle form submission
const submitForm = async (req, res) => {
  try {
      const {
          businessType,
          subBusinessType,
          activityType,
          partOfLargerBuilding,
          buildingType,
          parkingSpaces,
          onCommercialStreet,
          logisticsArea,
          warehouseArea,
          step3Result,
          step3Status, 
          step4Result
      } = req.body;

      if (!req.session.userId) {
          return res.status(401).send('User not authenticated');
      }

      const formSubmission = new FormSubmission({
          userId: req.session.userId,
          businessType,
          subBusinessType,
          activityType,
          partOfLargerBuilding,
          buildingType,
          parkingSpaces: parkingSpaces ? parseInt(parkingSpaces, 10) : null,
          onCommercialStreet,
          logisticsArea,
          warehouseArea,
          step3Result,
          step3Status,  
          step4Result
      });
      console.log('Form submission data:', req.body);
      await formSubmission.save();
      res.redirect('/pages/success.html');
  } catch (error) {
      console.error('Error saving form data:', error);
      res.status(500).send('Internal Server Error');
  }
};



const submitTest = async (req, res) => {
    console.log('تم استدعاء دالة submitTest');
    try {
        console.log('بيانات الطلب (req.body):', req.body);

        const {
              answers,
              goals, assists, rating, matches,
              timeTaken
            } = req.body;
            
            const {
              q1, q2, q3, q4, q5,
              q6, q7, q8, q9, q10,
              q11, q12, q13, q14, q15,
              q16, q17, q18, q19, q20, q21
            } = answers;
            

        console.log('معرف المستخدم في الجلسة:', req.session.userId);

        if (!req.session.userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        let timeTakenInSeconds = 0;

        if (timeTaken && typeof timeTaken === 'string') {
            const parts = timeTaken.split(':');
            if (parts.length === 2) {
                const minutes = parseInt(parts[0], 10);
                const seconds = parseInt(parts[1], 10);
                if (!isNaN(minutes) && !isNaN(seconds)) {
                    timeTakenInSeconds = (minutes * 60) + seconds;
                } else {
                    console.error("فشل في تحويل وقت الاختبار إلى ثواني:", timeTaken);
                    timeTakenInSeconds = 0;
                }
            } else {
                console.error("تنسيق وقت الاختبار غير صالح:", timeTaken);
                timeTakenInSeconds = 0;
            }
        } else if (typeof timeTaken === 'number') {
            timeTakenInSeconds = timeTaken;
        }

        const correctAnswers = {
            q1: 'A',
            q2: 'A',
            q3: 'A',
            q4: 'C',
            q5: 'B',
            q6: 'A',
            q7: 'B',
            q8: 'D',
            q9: 'C',
            q10: 'D',
            q11: 'C',
            q12: 'B',
            q13: 'A',
            q14: 'C',
            q15: 'D',
            q16: 'A',
            q17: 'D',
            q18: 'C',
            q19: 'B',
            q20: 'B',
            q21: 'C',
        };

        let correctCount = 0;
        if (q1 === correctAnswers.q1) correctCount++;
        if (q2 === correctAnswers.q2) correctCount++;
        if (q3 === correctAnswers.q3) correctCount++;
        if (q4 === correctAnswers.q4) correctCount++;
        if (q5 === correctAnswers.q5) correctCount++;
        if (q6 === correctAnswers.q6) correctCount++;
        if (q7 === correctAnswers.q7) correctCount++;
        if (q8 === correctAnswers.q8) correctCount++;
        if (q9 === correctAnswers.q9) correctCount++;
        if (q10 === correctAnswers.q10) correctCount++;
        if (q11 === correctAnswers.q11) correctCount++;
        if (q12 === correctAnswers.q12) correctCount++;
        if (q13 === correctAnswers.q13) correctCount++;
        if (q14 === correctAnswers.q14) correctCount++;
        if (q15 === correctAnswers.q15) correctCount++;
        if (q16 === correctAnswers.q16) correctCount++;
        if (q17 === correctAnswers.q17) correctCount++;
        if (q18 === correctAnswers.q18) correctCount++;
        if (q19 === correctAnswers.q19) correctCount++;
        if (q20 === correctAnswers.q20) correctCount++;
        if (q21 === correctAnswers.q21) correctCount++;

        const totalQuestions = 21;
        const testScore = (correctCount / totalQuestions) * 100;

        const newResult = new TestResult({
            userId: req.session.userId,
            q1, q2, q3, q4, q5,
            q6, q7, q8, q9, q10,
            q11, q12, q13, q14, q15,
            q16, q17, q18, q19, q20, q21,
            timeTaken: timeTakenInSeconds, goals, assists, rating, matches,
            testScore: testScore 
        });
        console.log("إحصائيات اللاعب:", { goals, assists, rating, matches });
        console.log('TestResult قبل الحفظ:', newResult);

        await newResult.save();
        console.log('تم حفظ البيانات بنجاح');
        res.json({ success: true, testScore: Math.round(testScore) }); 
    } catch (err) {
        console.error("فشل الحفظ:", err);
        res.status(500).send(`حدث خطأ أثناء حفظ البيانات: ${err.message}`);
    }
};


const registerUser = async (req, res) => {
    try {
        const { name, phoneNumber, email, password, accountType, birthdate, organization, experience, location } = req.body;

        // تحقق من الحقول الأساسية المشتركة
        if (!name || !phoneNumber || !email || !password || !accountType || !location) {
            return res.status(400).json({ message: 'جميع الحقول الأساسية مطلوبة' });
        }

        const existingScoutByPhone = await Scout.findOne({ phoneNumber });
        const existingScoutByEmail = await Scout.findOne({ email });
        const existingPlayerByPhone = await Player.findOne({ phoneNumber });
        const existingPlayerByEmail = await Player.findOne({ email });

        if ((accountType === 'scout' && (existingScoutByPhone || existingScoutByEmail)) ||
            (accountType === 'player' && (existingPlayerByPhone || existingPlayerByEmail))) {
            return res.status(409).json({ message: `رقم الهاتف أو البريد الإلكتروني مسجل مسبقًا` });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        if (accountType === 'scout') {
            if (!organization || !experience) {
                return res.status(400).json({ message: 'جميع حقول الكشاف مطلوبة' });
            }
            const newScout = new Scout({
                name,
                phoneNumber,
                email,
                password: hashedPassword,
                organization,
                experience: parseInt(experience),
                location,
                accountType
            });
            await newScout.save();
            return res.redirect('/pages/login.html');
        } else if (accountType === 'player') {
            if (!birthdate) {
                return res.status(400).json({ message: 'جميع حقول اللاعب مطلوبة' });
            }
            const newPlayer = new Player({
                name,
                phoneNumber,
                email,
                password: hashedPassword,
                birthdate,
                location,
                accountType
            });
            await newPlayer.save();
            return res.redirect('/pages/login.html');
        } else {
            return res.status(400).json({ message: 'نوع الحساب غير صالح' });
        }

    } catch (error) {
        console.error('Error registering user:', error);
        if (error.errors) {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'حدث خطأ في التحقق من البيانات', errors: validationErrors });
        }
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { indexrout, createGet, MainGet, submitForm,GetRecommendations,successGet,logout, submitTest, registerUser };